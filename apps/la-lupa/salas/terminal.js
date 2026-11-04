/* ============================================================
   AGENCIA LA LUPA · Academia · Sala «terminal»: la Terminal ORTO-3000
   T2 · La máquina del tiempo verbal (9.1). Cuando la forma tiene una regla
   ortográfica de la temporada (cantaba → b, tuve → v, dije → j, cantó → tilde…),
   además cuenta para 5.1 con esa regla y entra en la cola de repaso si se falla.
   Datos: datos/academia/verbos.json · Validador: herramientas/validar_terminal.py
   Todo va dentro de una función para no chocar con las otras salas.
   ============================================================ */
"use strict";

(() => {
  Object.assign(sala("terminal"), {
    activa: true,
    instructor: "mateo",
    actividad: "conjugar",
    gancho: "Viaja al pasado o al futuro: conjuga la coartada.",
    leccionFija: "ORTO-3000 es más viejo que mi abuelo, pero no perdona una desinencia. Cada verbo tiene dos piezas: la raíz, que dice qué pasa (cant-), y la desinencia, que es su huella dactilar (-aban). La desinencia chiva tres cosas: la persona (1.ª yo, 2.ª tú, 3.ª él o ella), el número (singular si es uno; plural si son varios) y el tiempo (presente, pasado o futuro). Teclea la forma que te pida la máquina. Si fallas, te enseña la buena y la copias. Y vigila el dial: a veces toca viajar en el tiempo.",
  });

  let banco = null;        // caché de verbos.json
  let tecleo = null;       // texto que se está escribiendo en la pantalla (para poder terminarlo)
  let alIntro = null;      // qué hace la tecla INTRO en cada momento
  let nivel = 1;

  const ORDEN_DIAL = ["perfecto-simple", "imperfecto", "perfecto-compuesto", "presente", "futuro", "condicional"];
  const CORTO_PRON = ["yo", "tú", "él, ella", "nosotros", "vosotros", "ellos"];
  const PRONOMBRES = /^(yo|tú|él|ella|nosotros|nosotras|vosotros|vosotras|ellos|ellas)\s+/;
  const MONOSILABOS = ["fui", "fue", "di", "dio", "vi", "vio", "veis", "dais", "vais", "sois"];
  // Desinencias de repuesto para separar los irregulares (tuv|e, dij|eron, le|yó, tendr|é…)
  const OTRAS = {
    presente: [["oy", "o"], ["es", "as", "s"], ["e", "a"], ["emos", "imos", "amos"], ["éis", "áis", "ís", "is"], ["en", "an", "n"]],
    imperfecto: [["ía", "aba"], ["ías", "abas"], ["ía", "aba"], ["íamos", "ábamos"], ["íais", "abais"], ["ían", "aban"]],
    "perfecto-simple": [["é", "í", "e", "i"], ["aste", "iste", "íste"], ["ió", "yó", "ó", "io", "o"], ["amos", "imos", "ímos"], ["asteis", "isteis", "ísteis"], ["aron", "ieron", "yeron", "eron"]],
    futuro: [["é"], ["ás"], ["á"], ["emos"], ["éis"], ["án"]],
    condicional: [["ía"], ["ías"], ["ía"], ["íamos"], ["íais"], ["ían"]],
  };

  /* ── Formas ─────────────────────────────────────────────── */
  const conj = inf => (/(ir|ír)$/.test(inf) ? "ir" : inf.slice(-2));
  const verbo = inf => banco.verbos.find(v => v.inf === inf);
  const tiempo = id => banco.tiempos.find(t => t.id === id);
  const participio = v => v.participio || v.inf.slice(0, -2) + (conj(v.inf) === "ar" ? "ado" : "ido");
  function formaDe(v, t, p) {
    if (t === "perfecto-compuesto") return `${banco.haber[p]} ${participio(v)}`;
    if (v.formas?.[t]) return v.formas[t][p];
    return v.inf.slice(0, -2) + banco.desinencias[conj(v.inf)][t][p];
  }
  const regularDe = (v, t, p) => v.inf.slice(0, -2) + banco.desinencias[conj(v.inf)][t][p];

  /* Raíz | desinencia. Ser e ir no se separan (cambian por completo) */
  function partir(v, t, p, forma) {
    if (t === "perfecto-compuesto") {
      const [aux, part] = forma.split(" ");
      const m = part.match(/^(.+?)(ado|ido|ído)$/);   // los participios irregulares (hecho, dicho, puesto…) no se separan
      return { aux, raiz: m ? m[1] : part, des: m ? m[2] : "" };
    }
    if (v.total) return { raiz: forma, des: "" };
    const cands = [banco.desinencias[conj(v.inf)][t][p], ...(OTRAS[t]?.[p] || [])];
    for (const d of cands) if (forma.endsWith(d) && forma.length > d.length) return { raiz: forma.slice(0, -d.length), des: d };
    return { raiz: forma, des: "" };
  }
  const htmlPartido = (pt, clase = "") => `<span class="ter-partido ${clase}">${pt.aux ? `<span class="ter-aux">${esc(pt.aux)}</span> ` : ""}<span class="ter-raiz">${esc(pt.raiz)}</span>${pt.des ? `<span class="ter-sep">|</span><span class="ter-des">${esc(pt.des)}</span>` : ""}</span>`;

  /* ── Reglas ortográficas de la temporada que tiene la forma ── */
  function explicaTilde(w) {
    const i = w.search(/[áéíóú]/);
    if (i < 0) return null;
    const ch = w[i], antes = w[i - 1] || "", despues = w[i + 1] || "";
    if (/[íú]/.test(ch) && (/[aeo]/.test(antes) || /[aeo]/.test(despues))) {
      const otra = /[aeo]/.test(antes) ? antes : despues;
      return `En «${w}», la ${ch} suena fuerte junto a la ${otra} (hiato): la í y la ú fuertes junto a a, e, o llevan tilde.`;
    }
    const grupos = (w.slice(i + 1).replace(/^[iuü]/, "").match(/[aeiouü]+/g) || []).length;
    if (grupos === 0) return `«${w}» es aguda y termina en ${/[aeiouáéíóú]$/.test(w) ? "vocal" : `-${w.at(-1)}`}: lleva tilde.`;
    if (grupos >= 2) return `«${w}» es esdrújula: lleva tilde siempre.`;
    return `«${w}» es llana y no termina en vocal, -n ni -s: lleva tilde.`;
  }
  function reglasDe(v, t, forma) {
    if (t === "perfecto-compuesto") return [];
    const inf = v.inf, R = [];
    const add = (regla, texto) => R.push({ regla, texto });
    if (t === "imperfecto" && conj(inf) === "ar") add("b-v-1", "Imperfecto de los verbos en -ar: siempre con b (-aba, -abas, -ábamos…).");
    if (t === "imperfecto" && inf === "ir") add("b-v-1", "El imperfecto de ir también va con b: iba, ibas, íbamos.");
    if (t === "perfecto-simple" && ["estar", "andar", "tener"].includes(inf)) add("b-v-1", "Estar, andar y tener llevan v en este tiempo: estuve, anduve, tuve.");
    if (/bir$/.test(inf)) add("b-v-1", `Los verbos en -bir van con b, como ${inf} (salvo hervir, servir y vivir).`);
    if (inf === "vivir") add("b-v-1", "Vivir es una excepción de -bir: va con v, como hervir y servir.");
    if (t === "perfecto-simple" && ["decir", "traer", "conducir"].includes(inf)) add("g-j-dieresis", "Decir, traer y conducir no tienen g ni j: sus formas con je, ji van con j.");
    if (/gar$/.test(inf) && /gu[eé]/.test(forma)) add("g-j-dieresis", "Delante de e, la g suave se escribe gu, y esa u no suena: llegué, investigué.");
    if (/ü/.test(forma)) add("g-j-dieresis", "Aquí la u sí suena delante de la e: por eso lleva diéresis (averigüé).");
    if (/y/.test(forma) && !/(y|ll)/.test(inf)) {
      if (/oy$/.test(forma)) add("ll-y", `La i final tras vocal que no suena fuerte se escribe y: ${forma}, como hoy o muy.`);
      else add("ll-y", "Caer, oír y leer no tienen ll ni y: sus formas con ese sonido van con y.");
    }
    if (/car$/.test(inf) && /qu[eé]/.test(forma)) add("c-z-s", "El sonido /k/ delante de e se escribe qu: busqué, expliqué.");
    if (/zar$/.test(inf) && /c[eé]/.test(forma)) add("c-z-s", "Los verbos en -zar cambian la z por c delante de e: crucé.");
    if (inf === "hacer" && /z/.test(forma)) add("c-z-s", "Hizo va con z (za, zo, zu), pero hice e hicimos, con c (ce, ci).");
    if (inf === "conducir" && /zc/.test(forma)) add("c-z-s", "Conduzco lleva z delante de la c, como conozco o parezco.");
    if (["hablar", "hacer"].includes(inf)) add("h-1", `Todas las formas de ${inf} llevan h, aunque no suene.`);
    if (MONOSILABOS.includes(forma)) add("diptongo-monosilabos", `«${forma}» tiene una sola sílaba: los monosílabos no llevan tilde.`);
    if (forma === "sé") R.push({ regla: null, texto: "Sé (de saber) lleva tilde para no confundirse con se (se fue): es una tilde diacrítica." });
    else if (/[áéíóú]/.test(forma)) {
      // -ía, -íais, -íamos…: la tilde es de hiato (regla de 6.º), no de las reglas generales
      const texto = explicaTilde(forma);
      add(/\(hiato\)/.test(texto) ? "hiato" : "tildes-generales", texto);
    }
    return R;
  }

  /* Por qué es irregular (o qué pasa con la raíz) */
  function notaIrregular(v, t, p, forma, pt) {
    if (t === "perfecto-compuesto") {
      return v.participio && !/(ado|ido|ído)$/.test(v.participio) ? `El participio de ${v.inf} es irregular: ${v.participio}.` : `Tiempo compuesto: haber (${banco.haber[p]}) + participio (${participio(v)}).`;
    }
    if (!v.irregular) {
      if (v.nota && forma !== regularDe(v, t, p)) return `Regular, con cambio ortográfico (${v.nota}) para conservar el sonido.`;
      return `Verbo regular de la ${{ ar: "1.ª", er: "2.ª", ir: "3.ª" }[conj(v.inf)]} conjugación: la raíz ${v.inf.slice(0, -2)}- no cambia.`;
    }
    if (v.total) return `${v.inf === "ser" ? "Ser" : "Ir"} es tan irregular que cambia de raíz (${v.inf === "ser" ? "soy, era, fui" : "voy, iba, fui"}).${/^fu/.test(forma) ? ` Ojo: «${forma}» vale para ser y para ir.` : ""}`;
    const base = v.inf.slice(0, -2);
    if (!pt.des) return `«${forma}» es irregular: no se separa como las regulares.`;
    if (pt.raiz !== base) return `Irregular: la raíz cambia (${base}- → ${pt.raiz}-).`;
    if (forma !== regularDe(v, t, p)) return `Irregular: la raíz se queda (${base}-), pero la desinencia cambia (-${pt.des}).`;
    return `En este tiempo, ${v.inf} se conjuga como un verbo regular.`;
  }

  /* ── Generación de la ronda: 6 preguntas, 1 o 2 de «viaje en el tiempo» ── */
  const azar6 = () => Math.floor(Math.random() * 6);
  function pregunta(v, t, p, frase = null) {
    const forma = formaDe(v, t, p);
    return { v, t, p, forma, frase, pt: partir(v, t, p, forma), reglas: reglasDe(v, t, forma) };
  }
  function generar() {
    const V = banco.verbos;
    const regulares = V.filter(v => v.nivel === 1), irregulares = V.filter(v => v.irregular), cambios = V.filter(v => v.nota);
    const nViaje = Math.random() < .5 ? 1 : 2;
    const nConj = 6 - nViaje;
    const lista = [];
    if (nivel === 1) {
      const ts = barajar(["presente", "imperfecto", "futuro", "presente", "imperfecto", "futuro"]).slice(0, nConj);
      const vs = barajar(regulares);
      ts.forEach((t, i) => lista.push(pregunta(vs[i], t, azar6())));
    } else {
      const vs = barajar([...barajar(irregulares).slice(0, nConj - 2), azarElem(cambios), azarElem(regulares.filter(v => !v.nota))]);
      const ts = barajar(["perfecto-simple", "perfecto-simple", "condicional", "perfecto-compuesto", azarElem(["presente", "futuro", "imperfecto", "perfecto-simple"])]);
      vs.forEach((v, i) => {
        if (v.nota) return lista.push(pregunta(v, "perfecto-simple", Math.random() < .75 ? 0 : azar6()));
        lista.push(pregunta(v, ts[i % ts.length], azar6()));
      });
    }
    const usados = new Set(lista.map(q => q.v.inf));
    const frases = barajar(banco.frases.filter(f => !usados.has(f.verbo) && (nivel === 1 ? verbo(f.verbo).nivel === 1 : true)));
    if (nivel === 2) frases.sort((a, b) => (verbo(b.verbo).irregular ? 1 : 0) - (verbo(a.verbo).irregular ? 1 : 0));
    const destinos = nivel === 1 ? barajar(["imperfecto", "futuro"]) : barajar(["perfecto-simple", "condicional", "futuro", "imperfecto"]);
    frases.slice(0, nViaje).forEach((f, i) => {
      const q = pregunta(verbo(f.verbo), destinos[i], f.persona, f);
      lista.splice(i ? 5 : 1 + Math.floor(Math.random() * 3), 0, q);
    });
    return lista.slice(0, 6);
  }

  /* ── Pantalla ───────────────────────────────────────────── */
  function htmlSala() {
    const filas = [
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "|", "á", "é", "í", "ó", "ú"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ñ", "|", "ü", "Backspace"],
      ["z", "x", "c", "v", "b", "n", "m", "|", " ", "Enter"],
    ];
    const etiqueta = { Backspace: "◂ BORRAR", Enter: "INTRO ↵", " ": "ESPACIO" };
    const tecla = k => (k === "|" ? `<span class="ter-hueco-tecla"></span>`
      : `<button type="button" class="ter-tecla ${/[áéíóúü]/.test(k) ? "acento" : ""} ${etiqueta[k] ? "ancha" : ""} ${k === "Enter" ? "intro" : ""}" data-k="${esc(k)}" tabindex="-1">${esc(etiqueta[k] || k.toUpperCase())}</button>`);
    return `
      <div class="ter-mini" aria-hidden="true"><span>ORTO</span></div>
      ${htmlPersonaje({ id: "mateo", expresion: "neutral", lado: "izq" }, "ter-mateo")}
      <div class="ter-crt">
        <div class="ter-pantalla" id="terPantalla"><div class="ter-salida" id="terSalida" aria-live="polite"></div></div>
        <div class="ter-bisel">
          <div class="ter-dial" aria-label="Dial temporal">
            <small>◂ PASADO · DIAL TEMPORAL · FUTURO ▸</small>
            <div class="ter-escala">${ORDEN_DIAL.map(id => `<span data-t="${id}">${esc(tiempo(id).corto)}</span>`).join("")}<i class="ter-aguja" id="terAguja"></i></div>
          </div>
          <div class="ter-nivel" role="group" aria-label="Nivel">
            <small>NIVEL</small>
            <div class="ter-interruptor" id="terInterruptor"><button type="button" data-n="1">N1</button><button type="button" data-n="2">N2</button></div>
          </div>
          <div class="ter-marca"><b>ORTO-3000</b><i></i><span class="ter-led"></span></div>
        </div>
      </div>
      <div class="ter-teclado" aria-hidden="true">${filas.map(f => `<div class="ter-fila">${f.map(tecla).join("")}</div>`).join("")}</div>
      <button class="hud-volver" id="acaVolver">◂ Patio</button>`;
  }

  /* Escribe el texto de la pantalla poco a poco (sin tocar la línea de entrada) */
  function teclear(raiz) {
    tecleo?.();
    if (movimientoReducido()) return;
    const nodos = [];
    const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) if (!w.currentNode.parentElement.closest(".ter-entrada") && w.currentNode.textContent.trim()) nodos.push([w.currentNode, w.currentNode.textContent]);
    nodos.forEach(([n]) => (n.textContent = ""));
    let i = 0, j = 0;
    const id = setInterval(() => {
      for (let paso = 0; paso < 5 && i < nodos.length; paso++) {
        const [n, t] = nodos[i];
        n.textContent = t.slice(0, ++j);
        if (j >= t.length) { i++; j = 0; }
      }
      if (i >= nodos.length) fin();
    }, 16);
    const fin = () => { clearInterval(id); nodos.slice(i).forEach(([n, t]) => (n.textContent = t)); tecleo = null; };
    tecleo = fin;
  }
  function escribirPantalla(html, efecto = "") {
    const s = $("#terSalida");
    if (!s) return;
    s.innerHTML = html;
    teclear(s);
    if (efecto) pulso(efecto);
  }
  function anadir(html, efecto = "") {
    const caja = $("#terRes");
    if (!caja) return;
    caja.innerHTML = html;
    teclear(caja);
    if (efecto) pulso(efecto);
  }
  function pulso(clase) {
    const p = $("#terPantalla");
    p.classList.remove("ter-destello", "ter-fallo");
    void p.offsetWidth;
    p.classList.add(clase);
  }
  function mover(t) {
    const i = ORDEN_DIAL.indexOf(t);
    const ag = $("#terAguja");
    if (ag) ag.style.left = `${(i + .5) / ORDEN_DIAL.length * 100}%`;
    $$(".ter-escala span").forEach(s => s.classList.toggle("activo", s.dataset.t === t));
  }
  function caraMateo(expresion) {
    const viejo = $(".ter-mateo");
    if (!viejo) return;
    const tmp = document.createElement("div");
    tmp.innerHTML = htmlPersonaje({ id: "mateo", expresion, lado: "izq" }, "ter-mateo");
    viejo.replaceWith(tmp.firstElementChild);
  }
  function pintarNivel(bloqueado) {
    $$("#terInterruptor button").forEach(b => { b.classList.toggle("activo", Number(b.dataset.n) === nivel); b.disabled = bloqueado; });
    $$(".ter-opcion-nivel").forEach(b => b.classList.toggle("activo", Number(b.dataset.n) === nivel));
  }
  const htmlEntrada = () => `<div class="ter-linea ter-entrada"><span class="ter-prompt">&gt;</span><label class="ter-campo"><input id="terResp" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Escribe la forma del verbo"><span class="ter-espejo" id="terEspejo"></span><span class="ter-cursor">█</span><span class="ter-pista-copia">◂ ESCRÍBELA TÚ PARA SEGUIR</span></label></div>`;
  function activarEntrada() {
    const inp = $("#terResp");
    if (!inp) return;
    inp.oninput = () => { $("#terEspejo").textContent = inp.value; inp.parentElement.classList.toggle("lleno", !!inp.value); };
    inp.focus({ preventScroll: true });
  }
  const limpiar = s => norm(s).replace(/\s+/g, " ");
  const sinTildes = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

  /* ── La actividad ───────────────────────────────────────── */
  ACTIVIDADES.conjugar = async function (sl, _regla, turno) {
    pintarEscena(`<div class="ter-sala">${banco ? htmlSala() : ""}</div>`, { fondo: sl.fondo, clase: "oscurecido ter-escena" });
    try { banco ??= await leerJSON("datos/academia/verbos.json"); } catch {
      $(".ter-sala").innerHTML = `<p class="instruccion">ORTO-3000 no encuentra su disco de verbos. Vuelve a intentarlo dentro de un rato.</p><button class="hud-volver" id="acaVolver">◂ Patio</button>`;
      $("#acaVolver").onclick = vistaPatio;
      return;
    }
    if (!$(".ter-pantalla")) $(".ter-sala").innerHTML = htmlSala();
    nivel = cargar(`terminal-nivel-${perfil.id}`, 1) === 2 ? 2 : 1;
    let enRonda = false;
    $("#acaVolver").onclick = () => (enRonda ? confirmar("¿Volver al patio? Se perderá esta ronda.", vistaPatio, "Volver") : vistaPatio());
    $("#terPantalla").onclick = () => $("#terResp")?.focus({ preventScroll: true });

    // Teclado de la pantalla: escribe en la entrada sin quitarle el foco
    $$(".ter-tecla").forEach(b => {
      b.onpointerdown = ev => ev.preventDefault();
      b.onclick = () => {
        const k = b.dataset.k;
        if (k === "Enter") return alIntro?.();
        const inp = $("#terResp");
        if (!inp || inp.disabled) return;
        inp.value = k === "Backspace" ? inp.value.slice(0, -1) : inp.value + k;
        inp.oninput?.();
      };
    });
    const cambiarNivel = n => { if (enRonda) return; nivel = n; guardar(`terminal-nivel-${perfil.id}`, n); pintarNivel(false); };
    $$("#terInterruptor button").forEach(b => (b.onclick = () => cambiarNivel(Number(b.dataset.n))));

    /* Arranque: el alumno elige el nivel con el interruptor */
    const arranque = () => {
      mover("presente");
      escribirPantalla(`
        <p class="ter-linea">ORTO-3000 · BIOS 3.0 · (C) 1986 AGENCIA LA LUPA</p>
        <p class="ter-linea">MEMORIA 64 K ........................................ OK</p>
        <p class="ter-linea">MÓDULO «MÁQUINA DEL TIEMPO VERBAL» ................. OK</p>
        <p class="ter-linea">${banco.verbos.length} VERBOS EN MEMORIA · ${banco.tiempos.length} TIEMPOS · MODO INDICATIVO</p>
        <p class="ter-linea">GATO DORMIDO SOBRE EL TECLADO ................. RETIRADO</p>
        <p class="ter-linea ter-hueco-linea"></p>
        <p class="ter-linea">ELIGE NIVEL CON EL INTERRUPTOR:</p>
        <button type="button" class="ter-opcion-nivel" data-n="1"><b>[N1]</b> presente, imperfecto y futuro · verbos regulares</button>
        <button type="button" class="ter-opcion-nivel" data-n="2"><b>[N2]</b> perfecto simple, condicional y compuesto · irregulares</button>
        <p class="ter-linea ter-hueco-linea"></p>
        <button type="button" class="ter-boton" id="terEmpezar">&gt; PULSA INTRO PARA EMPEZAR<span class="ter-cursor">█</span></button>`);
      pintarNivel(false);
      $$(".ter-opcion-nivel").forEach(b => (b.onclick = ev => { ev.stopPropagation(); cambiarNivel(Number(b.dataset.n)); }));
      $("#terEmpezar").onclick = empezar;
      alIntro = empezar;
      atajos.nivel = cambiarNivel;
    };

    let preguntas = [], k = 0, bien = 0;
    const empezar = () => {
      tecleo?.();
      atajos.nivel = null;
      preguntas = generar();
      partidaAca(sl, []);   // sin regla fija: cada intento lleva la suya (o ninguna)
      enRonda = true; k = 0; bien = 0;
      pintarNivel(true);
      mostrar();
    };

    const mostrar = () => {
      const q = preguntas[k];
      if (!q) return terminar();
      const per = banco.personas[q.p], tm = tiempo(q.t);
      mover(q.t);
      caraMateo("neutral");
      const cab = `<div class="ter-cab"><span>ORTO-3000 · MÁQUINA DEL TIEMPO VERBAL</span><span>N${nivel} · ${k + 1}/6 · OK ${bien}</span></div>`;
      let izq, der;
      if (q.frase) {
        const [antes, despues] = q.frase.texto.split(/\{[^}]+\}/);
        const marca = q.frase.texto.match(/\{([^}]+)\}/)[1];
        izq = `
          <p class="ter-linea">&gt; VIAJE EN EL TIEMPO</p>
          <p class="ter-linea ter-dato">HOY ...... ${esc(antes)}<u>${esc(marca)}</u>${esc(despues)}</p>
          <p class="ter-linea ter-dato">DESTINO .. ${esc(tm.nombre)}</p>
          <p class="ter-linea ter-frase">${esc(antes)}<span class="ter-hueco" id="terHueco">________</span>${esc(despues)}</p>
          ${htmlEntrada()}`;
        der = `<div class="ter-salto"><b>SALTO TEMPORAL</b><span>PRESENTE ──▸ ${esc(tm.corto)}</span><i class="ter-barra"><i></i></i><small>Reescribe el verbo en el tiempo que marca el dial.</small></div>`;
      } else {
        izq = `
          <p class="ter-linea">&gt; CONJUGAR: <b class="ter-verbo">${esc(q.v.inf)}</b></p>
          <p class="ter-linea ter-dato">PERSONA .. ${esc(per.persona)}</p>
          <p class="ter-linea ter-dato">NÚMERO ... ${esc(per.numero)}</p>
          <p class="ter-linea ter-dato">TIEMPO ... ${esc(tm.nombre)}</p>
          <p class="ter-linea ter-dato">MODO ..... indicativo</p>
          ${htmlEntrada()}`;
        const visibles = new Set(barajar([0, 1, 2, 3, 4, 5].filter(i => i !== q.p)).slice(0, nivel === 1 ? 5 : 2));
        der = `<div class="ter-tabla"><p class="ter-tabla-tit">${esc(tm.nombre.toUpperCase())} · ${esc(q.v.inf)}</p>
          ${CORTO_PRON.map((pr, i) => `<p class="ter-fila-tabla ${i === q.p ? "objetivo" : ""}"><span>${esc(pr)}</span><span ${i === q.p ? `id="terCasilla"` : ""}>${i === q.p ? "?????" : visibles.has(i) ? esc(formaDe(q.v, q.t, i)) : "·······"}</span></p>`).join("")}</div>`;
      }
      escribirPantalla(`${cab}<div class="ter-cuerpo ${q.frase ? "viaje" : ""}"><div class="ter-izq">${izq}</div><div class="ter-der">${der}</div></div><div class="ter-res" id="terRes"></div>`);
      activarEntrada();
      let intentada = false, copiando = false;
      const reglaOrto = q.reglas.find(r => r.regla)?.regla || null;
      const explicaciones = () => {
        const nota = notaIrregular(q.v, q.t, q.p, q.forma, q.pt);
        const importante = nota && (q.v.irregular || q.t === "perfecto-compuesto" || q.forma !== regularDe(q.v, q.t, q.p));
        const lineas = q.reglas.map(r => r.texto);
        if (importante) lineas.splice(1, 0, nota); else if (!lineas.length && nota) lineas.push(nota);
        return lineas.slice(0, 2).map(t => `<p class="ter-linea ter-mateo-dice">MATEO&gt; ${esc(t)}</p>`).join("");
      };
      const comprobar = () => {
        const inp = $("#terResp");
        const valor = limpiar(inp.value);
        if (!valor) return;
        const ok = valor === q.forma || valor.replace(PRONOMBRES, "") === q.forma;
        if (!intentada) {
          intentada = true;
          registrar("9.1", ok, q.forma, "conjugación", reglaOrto);
          if (reglaOrto) registrar("5.1", ok, q.forma, "conjugación", reglaOrto);
          if (ok) bien++;
        }
        const per = banco.personas[q.p];
        if (ok) {
          inp.disabled = true;
          $("#terEspejo").textContent = q.forma;
          $(".ter-entrada").classList.add("hecha");
          if ($("#terCasilla")) $("#terCasilla").innerHTML = htmlPartido(q.pt);
          if ($("#terHueco")) $("#terHueco").innerHTML = htmlPartido(q.pt);
          caraMateo(copiando ? "neutral" : "contento");
          anadir(`
            <p class="ter-linea ter-ok">${copiando ? "COPIADA ✔" : "OK ✔"} ${htmlPartido(q.pt, "grande")} <span class="ter-leyenda">${q.pt.des ? `RAÍZ <span class="ter-raiz">${esc(q.pt.raiz)}-</span> + DESINENCIA <span class="ter-des">-${esc(q.pt.des)}</span>` : ""}${q.frase ? ` · ${esc(per.persona)} persona del ${esc(per.numero)}` : ""}</span></p>
            ${explicaciones()}
            <button type="button" class="ter-boton" id="terSig">&gt; ${k < preguntas.length - 1 ? "INTRO: SIGUIENTE" : "INTRO: CERRAR SESIÓN"}<span class="ter-cursor">█</span></button>`, "ter-destello");
          const seguir = () => { k++; mostrar(); };
          $("#terSig").onclick = seguir;
          alIntro = seguir;
          return;
        }
        copiando = true;
        caraMateo("pensativo");
        const casi = sinTildes(valor.replace(PRONOMBRES, "")) === sinTildes(q.forma);
        anadir(`
          <p class="ter-linea ter-error"><span class="ter-inverso">ERROR</span> ¿QUIZÁ QUISISTE DECIR… ${htmlPartido(q.pt, "grande")}?${casi ? ` <span class="ter-aviso">¡CASI! REVISA LA TILDE.</span>` : ""}</p>
          ${explicaciones()}`, "ter-fallo");
        $(".ter-entrada").classList.add("copiar");
        inp.value = ""; inp.oninput();
        inp.focus({ preventScroll: true });
      };
      alIntro = comprobar;
    };

    const terminar = () => {
      tecleo?.();
      alIntro = null;
      enRonda = false;
      P.caso.reglas = [...new Set(P.eventos.map(e => e.regla).filter(Boolean))];
      caraMateo(bien === preguntas.length ? "sorprendido" : "contento");
      escribirPantalla(`
        <p class="ter-linea">&gt; CERRANDO SESIÓN…</p>
        <p class="ter-linea">VERBOS BIEN A LA PRIMERA: ${bien} DE ${preguntas.length}</p>
        <p class="ter-linea">${bien === preguntas.length ? "ORTO-3000 NO ENCUENTRA NI UN ERROR. ESTO NO PASABA DESDE 1986." : "DATOS GUARDADOS. LA PRÁCTICA HACE AL DETECTIVE."}</p>`, "ter-destello");
      setTimeout(() => { $(".ter-mateo")?.remove(); terminarActividad(sl, turno); }, movimientoReducido() ? 300 : 1600);
    };

    arranque();
  };

  /* INTRO, los números 1 y 2 (nivel) y las teclas que se iluminan al escribir */
  const atajos = { nivel: null };
  document.addEventListener("keydown", ev => {
    if (!$(".ter-teclado") || $("#capaModal.visible")) return;
    const k = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key;
    const t = $$(".ter-tecla").find(b => b.dataset.k === k);
    if (t) { t.classList.add("pulsada"); setTimeout(() => t.classList.remove("pulsada"), 140); }
    if (ev.key === "Enter" && (ev.target.tagName !== "BUTTON" || (ev.target.closest(".ter-sala") && ev.target.id !== "acaVolver"))) { ev.preventDefault(); alIntro?.(); }
    if ((ev.key === "1" || ev.key === "2") && atajos.nivel && ev.target.tagName !== "INPUT") atajos.nivel(Number(ev.key));
  });
})();
