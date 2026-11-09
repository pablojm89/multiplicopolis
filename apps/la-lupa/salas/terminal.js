/* ============================================================
   AGENCIA LA LUPA · Academia · Sala «terminal»: la Terminal ORTO-3000
   T2 · La máquina del tiempo verbal (9.1). Cuando la forma tiene una regla
   ortográfica de la temporada (cantaba → b, tuve → v, dije → j, cantó → tilde…),
   además cuenta para 5.1 con esa regla y entra en la cola de repaso si se falla.
   Niveles (lupas del motor, nivelAca()): 🥉 presente, imperfecto y futuro de regulares, tabla con 5
   casillas, 6 preguntas · 🥈 + perfecto simple, condicional e irregulares frecuentes, tabla con 2, 8 ·
   🥇 todo el indicativo y el compuesto, sin tabla, más viajes, 8 · 💎 + presente de subjuntivo e
   imperativo, frases con dos verbos y sin ayudas, 10.
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
  let nivel = 1;           // lupa de la ronda (1-4), de nivelAca()

  const ORDEN_DIAL = ["perfecto-simple", "imperfecto", "perfecto-compuesto", "presente", "futuro", "condicional"];
  const CORTO_PRON = ["yo", "tú", "él, ella", "nosotros", "vosotros", "ellos"];
  const PRONOMBRES = /^(yo|tú|él|ella|nosotros|nosotras|vosotros|vosotras|ellos|ellas)\s+/;
  const MONOSILABOS = ["fui", "fue", "di", "dio", "vi", "vio", "veis", "dais", "vais", "sois", "ve", "deis"];
  const MODOS = ["subjuntivo", "imperativo"];
  const INDICATIVO = ["presente", "imperfecto", "futuro", "perfecto-simple", "condicional", "perfecto-compuesto"];
  /* Qué pide cada lupa: preguntas, viajes en el tiempo, casillas de ayuda en la tabla y tiempos */
  const LUPAS = {
    1: { total: 6, viajes: () => (Math.random() < .5 ? 1 : 2), casillas: 5, tiempos: ["presente", "imperfecto", "futuro"], destinos: ["imperfecto", "futuro"],
         texto: "presente, imperfecto y futuro · regulares · tabla con 5 casillas" },
    2: { total: 8, viajes: () => 2, casillas: 2, tiempos: ["presente", "imperfecto", "futuro", "perfecto-simple", "condicional"], destinos: ["perfecto-simple", "condicional", "futuro", "imperfecto"],
         texto: "+ p. simple y condicional · irregulares · tabla con 2 casillas" },
    3: { total: 8, viajes: () => (Math.random() < .5 ? 3 : 4), casillas: 0, tiempos: INDICATIVO, destinos: ["perfecto-simple", "condicional", "perfecto-compuesto", "futuro", "imperfecto"],
         texto: "todo el indicativo y el compuesto · sin tabla · más viajes" },
    4: { total: 10, viajes: () => 3, casillas: 0, tiempos: [...INDICATIVO, ...MODOS], destinos: ["perfecto-simple", "perfecto-compuesto", "condicional", "imperfecto", "futuro"],
         texto: "+ subjuntivo e imperativo · dos verbos por frase · sin ayudas" },
  };
  // Desinencias de repuesto para separar los irregulares (tuv|e, dij|eron, le|yó, tendr|é…)
  const OTRAS = {
    presente: [["oy", "o"], ["es", "as", "s"], ["e", "a"], ["emos", "imos", "amos"], ["éis", "áis", "ís", "is"], ["en", "an", "n"]],
    imperfecto: [["ía", "aba"], ["ías", "abas"], ["ía", "aba"], ["íamos", "ábamos"], ["íais", "abais"], ["ían", "aban"]],
    "perfecto-simple": [["é", "í", "e", "i"], ["aste", "iste", "íste"], ["ió", "yó", "ó", "io", "o"], ["amos", "imos", "ímos"], ["asteis", "isteis", "ísteis"], ["aron", "ieron", "yeron", "eron"]],
    futuro: [["é"], ["ás"], ["á"], ["emos"], ["éis"], ["án"]],
    condicional: [["ía"], ["ías"], ["ía"], ["íamos"], ["íais"], ["ían"]],
    subjuntivo: [["é", "a", "e"], ["és", "as", "es"], ["é", "a", "e"], ["emos", "amos"], ["éis", "áis"], ["én", "an", "en"]],
    imperativo: [[], ["a", "e"], [], [], ["ad", "ed", "id", "íd"], []],
  };

  /* ── Formas ─────────────────────────────────────────────── */
  const conj = inf => (/(ir|ír)$/.test(inf) ? "ir" : inf.slice(-2));
  const verbo = inf => banco.verbos.find(v => v.inf === inf);
  const tiempo = id => banco.tiempos.find(t => t.id === id);
  const participio = v => v.participio || v.inf.slice(0, -2) + (conj(v.inf) === "ar" ? "ado" : "ido");
  /* null si la casilla no existe (el imperativo solo tiene tú y vosotros; algunos irregulares no lo traen) */
  function formaDe(v, t, p) {
    if (t === "perfecto-compuesto") return `${banco.haber[p]} ${participio(v)}`;
    if (v.formas?.[t]) return v.formas[t][p];
    if (v.irregular && MODOS.includes(t)) return null;
    const d = banco.desinencias[conj(v.inf)][t][p];
    return d == null ? null : v.inf.slice(0, -2) + d;
  }
  const regularDe = (v, t, p) => v.inf.slice(0, -2) + (banco.desinencias[conj(v.inf)][t][p] ?? "");
  const tiene = (v, t) => formaDe(v, t, t === "imperativo" ? 1 : 0) != null;
  /* Solo cambia la letra para conservar el sonido delante de e (jugué, empecé, busque) */
  const sonido = f => f.replace(/qu(?=[eé])/g, "c").replace(/gu(?=[eé])/g, "g").replace(/gü/g, "gu").replace(/c(?=[eé])/g, "z");

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
    if (t === "perfecto-simple" && ["decir", "traer", "conducir"].includes(inf) && /j/.test(forma)) add("g-j-dieresis", "Decir, traer y conducir no tienen g ni j: sus formas con je, ji van con j.");
    if (/gar$/.test(inf) && /gu[eé]/.test(forma)) add("g-j-dieresis", "Delante de e, la g suave se escribe gu, y esa u no suena: llegué, investigué.");
    if (/ü/.test(forma)) add("g-j-dieresis", "Aquí la u sí suena delante de la e: por eso lleva diéresis (averigüé).");
    if (/y/.test(forma) && !/(y|ll)/.test(inf)) {
      if (/oy$/.test(forma)) add("ll-y", `La i final tras vocal que no suena fuerte se escribe y: ${forma}, como hoy o muy.`);
      else add("ll-y", `«${inf}» no tiene ll ni y, pero sus formas con ese sonido van con y: cayó, oyó, leyó, construyó, vaya.`);
    }
    if (/car$/.test(inf) && /qu[eé]/.test(forma)) add("c-z-s", "El sonido /k/ delante de e se escribe qu: busqué, expliqué.");
    if (/zar$/.test(inf) && /c[eé]/.test(forma)) add("c-z-s", "Los verbos en -zar cambian la z por c delante de e: crucé.");
    if (inf === "hacer" && forma === "haz") add("c-z-s", "Haz termina en z, como luz o voz: la z va con a, o, u y al final de palabra.");
    else if (inf === "hacer" && /z/.test(forma)) add("c-z-s", "Hizo va con z (za, zo, zu), pero hice e hicimos, con c (ce, ci).");
    if (/zc/.test(forma)) add("c-z-s", `«${forma}» lleva z delante de la c, como conozco, conduzco o parezco.`);
    if (["hablar", "hacer"].includes(inf)) add("h-1", `Todas las formas de ${inf} llevan h, aunque no suene.`);
    if (MONOSILABOS.includes(forma)) add("diptongo-monosilabos", `«${forma}» tiene una sola sílaba: los monosílabos no llevan tilde.`);
    if (forma === "sé") R.push({ regla: null, texto: `Sé (de ${inf}) lleva tilde para no confundirse con se (se fue): es una tilde diacrítica.` });
    else if (forma === "dé") R.push({ regla: null, texto: "Dé (de dar) lleva tilde para no confundirse con de (la casa de Lola): es una tilde diacrítica." });
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
    if (forma !== regularDe(v, t, p) && sonido(forma) === sonido(regularDe(v, t, p))) return `Aquí solo cambia una letra para conservar el sonido delante de e (${forma}).`;
    if (v.total) return `${v.inf === "ser" ? "Ser" : "Ir"} es tan irregular que cambia de raíz (${v.inf === "ser" ? "soy, era, fui" : "voy, iba, fui"}).${/^fu/.test(forma) ? ` Ojo: «${forma}» vale para ser y para ir.` : ""}`;
    const base = v.inf.slice(0, -2);
    if (!pt.des) return `«${forma}» es irregular: no se separa como las regulares.`;
    if (pt.raiz !== base) return `Irregular: la raíz cambia (${base}- → ${pt.raiz}-).`;
    if (forma !== regularDe(v, t, p)) return `Irregular: la raíz se queda (${base}-), pero la desinencia cambia (-${pt.des}).`;
    return `En este tiempo, ${v.inf} se conjuga como un verbo regular.`;
  }

  /* ── Generación de la ronda según la lupa ─────────────────
     Cada pregunta tiene una o dos «partes» (las frases de diamante traen dos verbos). */
  const azar6 = () => Math.floor(Math.random() * 6);
  function parte(v, t, p) {
    const forma = formaDe(v, t, p);
    return { v, t, p, forma, pt: partir(v, t, p, forma), reglas: reglasDe(v, t, forma) };
  }
  const pregunta = (v, t, p) => ({ t, partes: [parte(v, t, t === "imperativo" ? azarElem([1, 1, 4]) : p)] });
  function viaje(f, t) {
    const pares = f.verbos || [[f.verbo, f.persona]];
    return { t, frase: f, partes: pares.map(([inf, p]) => parte(verbo(inf), t, p)) };
  }
  /* Lo último que salió va al final de la cola (para que no se repita de una ronda a otra) */
  const claveVistas = () => `terminal-vistas-${perfil?.id}`;
  function frescos(lista, clave) {
    const vistos = cargar(claveVistas(), {})[clave] || [];
    return barajar(lista).sort((a, b) => vistos.includes(a.inf || a.texto) - vistos.includes(b.inf || b.texto));
  }
  function apuntarVistos(preguntas) {
    const v = cargar(claveVistas(), {});
    const infs = preguntas.flatMap(q => q.partes.map(x => x.v.inf)), frs = preguntas.filter(q => q.frase).map(q => q.frase.texto);
    v.verbos = [...new Set([...infs, ...(v.verbos || [])])].slice(0, 30);
    v.frases = [...new Set([...frs, ...(v.frases || [])])].slice(0, 40);
    guardar(claveVistas(), v);
  }
  function generar() {
    const L = LUPAS[nivel], V = banco.verbos;
    const reg = V.filter(v => !v.irregular), cambios = V.filter(v => v.nota), frec = V.filter(v => v.nivel === 2), dificiles = V.filter(v => v.nivel === 3);
    const nViaje = L.viajes(), nConj = L.total - nViaje;
    const usados = new Set();
    const tomar = (lista, cond = () => true) => {
      const v = frescos(lista, "verbos").find(x => !usados.has(x.inf) && cond(x));
      if (v) usados.add(v.inf);
      return v;
    };
    // Tiempos de las preguntas de conjugar: los nuevos de cada lupa salen seguro; el resto, al azar
    const tiempos = {
      1: () => barajar([...L.tiempos, ...L.tiempos]),
      2: () => [...barajar(["perfecto-simple", "perfecto-simple", "condicional", ...barajar(["presente", "imperfecto", "futuro"])])],
      3: () => [...barajar(["perfecto-simple", "perfecto-compuesto", "condicional", "perfecto-simple", azarElem(["presente", "imperfecto", "futuro"])])],
      4: () => [...barajar(["subjuntivo", "subjuntivo", "imperativo", "imperativo", azarElem(["perfecto-simple", "perfecto-compuesto"]), "condicional", azarElem(["presente", "futuro", "perfecto-simple"])])],
    }[nivel]().slice(0, nConj);
    // Verbos: bronce, solo regulares; plata, irregulares frecuentes y algún regular; oro y diamante, sobre todo irregulares
    // Un verbo con cambio ortográfico se luce en el perfecto simple (busqué, crucé) o en el subjuntivo (busque)
    const iCambio = nivel === 1 ? -1 : tiempos.findIndex(t => t === "perfecto-simple" || t === "subjuntivo");
    const iRegular = nivel === 2 ? tiempos.findIndex((t, i) => i !== iCambio) : -1;
    const lista = tiempos.map((t, i) => {
      let v;
      if (i === iCambio) v = tomar(cambios, x => tiene(x, t));
      else if (nivel === 1 || i === iRegular) v = tomar(reg, x => !x.nota || nivel === 1);
      else if (nivel === 2) v = tomar(frec);
      else if (nivel === 3) v = tomar(Math.random() < .5 ? dificiles : frec);
      else v = tomar(Math.random() < .25 && t !== "imperativo" ? reg : [...frec, ...dificiles], x => tiene(x, t));
      v ??= tomar(V, x => tiene(x, t));
      return pregunta(v, t, i === iCambio && t === "perfecto-simple" && Math.random() < .7 ? 0 : azar6());
    });
    // Viajes en el tiempo: frases en presente que hay que llevar al destino del dial
    const dobles = f => !!f.verbos;
    const vs = f => (f.verbos || [[f.verbo]]).map(([inf]) => verbo(inf));
    const sirve = {
      1: f => !dobles(f) && vs(f).every(v => v.nivel === 1),
      2: f => !dobles(f) && vs(f).every(v => v.nivel <= 2),
      3: f => !dobles(f),
      4: f => true,
    }[nivel];
    const libres = frescos(banco.frases.filter(f => sirve(f) && vs(f).every(v => !usados.has(v.inf))), "frases");
    let frases;
    if (nivel === 4) frases = [...libres.filter(dobles).slice(0, 2), ...libres.filter(f => !dobles(f) && vs(f).some(v => v.irregular)).slice(0, nViaje - 2)];
    else if (nivel >= 2) frases = [...libres.filter(f => vs(f).some(v => v.irregular)), ...libres.filter(f => !vs(f).some(v => v.irregular))].slice(0, nViaje);
    else frases = libres.slice(0, nViaje);
    const destinos = barajar(L.destinos);
    // Si en el destino el verbo se escribe igual que el que ya se ve en la frase (nosotros miramos → miramos),
    // no hay nada que conjugar: se salta al siguiente destino en el que cambie
    const vistas = f => [...f.texto.matchAll(/\{([^}]+)\}/g)].map(m => norm(m[1]));
    const repite = q => q.partes.some((x, i) => norm(x.forma) === vistas(q.frase)[i] || x.forma === formaDe(x.v, "presente", x.p));
    const viajes = frases.map((f, i) => {
      const opciones = destinos.map((_, d) => viaje(f, destinos[(i + d) % destinos.length]));
      return opciones.find(q => !repite(q)) || opciones[0];
    });
    // Los viajes se reparten por la ronda (nunca el primero: primero se calienta)
    const ronda = [...lista];
    viajes.forEach(q => ronda.splice(1 + Math.floor(Math.random() * ronda.length), 0, q));
    apuntarVistos(ronda);
    return ronda.slice(0, L.total);
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
            <small id="terDialTxt">◂ PASADO · DIAL TEMPORAL · FUTURO ▸</small>
            <div class="ter-escala">${ORDEN_DIAL.map(id => `<span data-t="${id}">${esc(tiempo(id).corto)}</span>`).join("")}<i class="ter-aguja" id="terAguja"></i></div>
          </div>
          <div class="ter-nivel" aria-label="Nivel: ${esc(NIVELES_ACA[nivel - 1].nombre)}">
            <small>LUPA</small>
            <div class="ter-lupa n${nivel}"><span>${NIVELES_ACA[nivel - 1].icono}</span><b>${esc(NIVELES_ACA[nivel - 1].corto)}</b></div>
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
  /* El subjuntivo y el imperativo no son tiempos del dial: la aguja se aparca y se enciende el modo */
  function mover(t) {
    const i = ORDEN_DIAL.indexOf(t);
    const ag = $("#terAguja"), txt = $("#terDialTxt");
    if (ag) { ag.classList.toggle("aparcada", i < 0); if (i >= 0) ag.style.left = `${(i + .5) / ORDEN_DIAL.length * 100}%`; }
    if (txt) txt.textContent = i < 0 ? `MODO ${tiempo(t).modo.toUpperCase()} · FUERA DEL DIAL` : "◂ PASADO · DIAL TEMPORAL · FUTURO ▸";
    $(".ter-escala")?.classList.toggle("apagada", i < 0);
    $$(".ter-escala span").forEach(s => s.classList.toggle("activo", s.dataset.t === t));
  }
  function caraMateo(expresion) {
    const viejo = $(".ter-mateo");
    if (!viejo) return;
    const tmp = document.createElement("div");
    tmp.innerHTML = htmlPersonaje({ id: "mateo", expresion, lado: "izq" }, "ter-mateo");
    viejo.replaceWith(tmp.firstElementChild);
  }
  const htmlEntrada = () => `<div class="ter-linea ter-entrada"><span class="ter-prompt">&gt;</span><label class="ter-campo"><input id="terResp" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Escribe la forma del verbo"><span class="ter-espejo" id="terEspejo"></span><span class="ter-cursor">█</span><span class="ter-pista-copia">◂ ESCRÍBELA TÚ PARA SEGUIR</span></label></div>`;
  function activarEntrada() {
    const inp = $("#terResp");
    if (!inp) return;
    inp.oninput = () => { $("#terEspejo").textContent = inp.value; inp.parentElement.classList.toggle("lleno", !!inp.value); };
    inp.focus({ preventScroll: true });
  }
  const limpiar = s => norm(s).replace(/[¡!¿?.,]/g, "").replace(/\s+/g, " ").trim();
  /* Se aceptan el pronombre delante (yo canto) y, en subjuntivo, el «que» (que yo cante) */
  const sinAyudas = valor => valor.replace(/^que\s+/, "").replace(PRONOMBRES, "");
  const sinTildes = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

  /* ── La actividad ───────────────────────────────────────── */
  /* Notas de modo para el subjuntivo y el imperativo */
  function notaModo(x) {
    if (x.t === "imperativo") return x.p === 4 ? "Imperativo de vosotros: termina en -d (cantad, comed, vivid)." : "Imperativo: es el modo de las órdenes y solo tiene tú y vosotros (¡canta!, ¡cantad!).";
    if (x.t === "subjuntivo") return "Presente de subjuntivo (deseos y dudas: «que yo…», «ojalá…»): las de -ar toman -e; las de -er e -ir, -a.";
    return null;
  }
  const htmlMateo = lineas => lineas.slice(0, 2).map(t => `<p class="ter-linea ter-mateo-dice">MATEO&gt; ${esc(t)}</p>`).join("");
  function explicaciones(x) {
    const nota = notaIrregular(x.v, x.t, x.p, x.forma, x.pt);
    const importante = nota && (x.v.irregular || x.t === "perfecto-compuesto" || x.forma !== regularDe(x.v, x.t, x.p));
    const lineas = x.reglas.map(r => r.texto);
    if (importante) lineas.splice(1, 0, nota);
    else if (!lineas.length) lineas.push(notaModo(x) || nota);
    if (lineas.length < 2 && importante && notaModo(x)) lineas.push(notaModo(x));
    return htmlMateo(lineas.filter(Boolean));
  }

  /* ── La actividad ───────────────────────────────────────── */
  ACTIVIDADES.conjugar = async function (sl, _regla, turno) {
    nivel = nivelAca();
    const lupa = NIVELES_ACA[nivel - 1];
    pintarEscena(`<div class="ter-sala">${banco ? htmlSala() : ""}</div>`, { fondo: sl.fondo, clase: "oscurecido ter-escena" });
    try { banco ??= await leerJSON("datos/academia/verbos.json"); } catch {
      $(".ter-sala").innerHTML = `<p class="instruccion">ORTO-3000 no encuentra su disco de verbos. Vuelve a intentarlo dentro de un rato.</p><button class="hud-volver" id="acaVolver">◂ Patio</button>`;
      $("#acaVolver").onclick = vistaPatio;
      return;
    }
    if (!$(".ter-pantalla")) $(".ter-sala").innerHTML = htmlSala();
    let enRonda = false;
    let cierre = null;   // la pantalla de «CERRANDO SESIÓN» espera un momento antes de guardar: si se sale antes, se guarda ya
    const cerrar = () => {
      if (cierre === null) return;
      clearTimeout(cierre); cierre = null;
      $(".ter-mateo")?.remove();
      terminarActividad(sl, turno);
    };
    $("#acaVolver").onclick = () => (cierre !== null ? cerrar() : enRonda ? confirmar("¿Volver al patio? Se perderá esta ronda.", vistaPatio, "Volver") : vistaPatio());
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

    /* Arranque: la máquina dice qué trae la lupa elegida (se elige antes, en la lección) */
    const arranque = () => {
      mover("presente");
      escribirPantalla(`
        <p class="ter-linea">ORTO-3000 · BIOS 3.0 · (C) 1986 AGENCIA LA LUPA</p>
        <p class="ter-linea">MEMORIA 64 K ........................................ OK</p>
        <p class="ter-linea">MÓDULO «MÁQUINA DEL TIEMPO VERBAL» ................. OK</p>
        <p class="ter-linea">${banco.verbos.length} VERBOS · ${banco.frases.length} FRASES · INDICATIVO, SUBJUNTIVO E IMPERATIVO</p>
        <p class="ter-linea">GATO DORMIDO SOBRE EL TECLADO ................. RETIRADO</p>
        <p class="ter-linea ter-hueco-linea"></p>
        <p class="ter-linea">LUPA INSERTADA:</p>
        ${NIVELES_ACA.map(l => `<p class="ter-opcion-nivel ${l.n === nivel ? "activo" : "apagada"}"><b>${l.icono} ${esc(l.corto.toUpperCase())}</b> · ${esc(LUPAS[l.n].texto)} · ${LUPAS[l.n].total} preguntas</p>`).join("")}
        <p class="ter-linea ter-hueco-linea"></p>
        <button type="button" class="ter-boton" id="terEmpezar">&gt; PULSA INTRO PARA EMPEZAR<span class="ter-cursor">█</span></button>`);
      $("#terEmpezar").onclick = empezar;
      alIntro = empezar;
    };

    let preguntas = [], k = 0, j = 0, bien = 0, intentos = 0;
    const empezar = () => {
      tecleo?.();
      preguntas = generar();
      partidaAca(sl, []);   // sin regla fija: cada intento lleva la suya (o ninguna)
      enRonda = true; k = 0; j = 0; bien = 0; intentos = 0;
      mostrar();
    };

    /* Pantalla de la pregunta k, parte j (las frases de dos verbos se hacen de uno en uno) */
    const mostrar = () => {
      const q = preguntas[k];
      if (!q) return terminar();
      const x = q.partes[j];
      const per = banco.personas[x.p], tm = tiempo(q.t);
      mover(q.t);
      caraMateo("neutral");
      const cab = `<div class="ter-cab"><span>ORTO-3000 · MÁQUINA DEL TIEMPO VERBAL</span><span>${lupa.icono} ${esc(lupa.corto.toUpperCase())} · ${k + 1}/${preguntas.length} · OK ${bien}</span></div>`;
      let izq, der;
      if (q.frase) {
        const trozos = q.frase.texto.split(/\{[^}]+\}/);
        const marcas = [...q.frase.texto.matchAll(/\{([^}]+)\}/g)].map(m => m[1]);
        const hoy = trozos.map((tz, i) => esc(tz) + (i < marcas.length ? `<u>${esc(marcas[i])}</u>` : "")).join("");
        const destino = trozos.map((tz, i) => esc(tz) + (i < marcas.length
          ? (i < j ? htmlPartido(q.partes[i].pt) : `<span class="ter-hueco ${i === j ? "activo" : ""}" ${i === j ? `id="terHueco"` : ""}>${q.partes.length > 1 ? `[${i + 1}]` : ""}________</span>`) : "")).join("");
        izq = `
          <p class="ter-linea">&gt; VIAJE EN EL TIEMPO${q.partes.length > 1 ? ` · VERBO ${j + 1} DE ${q.partes.length}` : ""}</p>
          <p class="ter-linea ter-dato">HOY ...... ${hoy}</p>
          <p class="ter-linea ter-dato">DESTINO .. ${esc(tm.nombre)}</p>
          <p class="ter-linea ter-frase">${destino}</p>
          ${htmlEntrada()}`;
        der = `<div class="ter-salto"><b>SALTO TEMPORAL</b><span>PRESENTE ──▸ ${esc(tm.corto)}</span><i class="ter-barra"><i></i></i><small>${q.partes.length > 1 ? "Dos verbos, el mismo viaje: reescríbelos de uno en uno." : "Reescribe el verbo en el tiempo que marca el dial."}</small></div>`;
      } else {
        const modo = tm.modo;
        const lineaModo = modo === "subjuntivo" ? `subjuntivo · «que ${CORTO_PRON[x.p].split(",")[0]}…»` : modo === "imperativo" ? "imperativo · ¡una orden!" : "indicativo";
        izq = `
          <p class="ter-linea">&gt; CONJUGAR: <b class="ter-verbo">${esc(x.v.inf)}</b></p>
          <p class="ter-linea ter-dato">PERSONA .. ${esc(per.persona)}</p>
          <p class="ter-linea ter-dato">NÚMERO ... ${esc(per.numero)}</p>
          ${modo === "imperativo" ? "" : `<p class="ter-linea ter-dato">TIEMPO ... ${esc(tm.nombre)}</p>`}
          <p class="ter-linea ter-dato">MODO ..... ${esc(lineaModo)}</p>
          ${htmlEntrada()}`;
        const casillas = LUPAS[nivel].casillas;
        if (casillas) {
          const visibles = new Set(barajar([0, 1, 2, 3, 4, 5].filter(i => i !== x.p)).slice(0, casillas));
          der = `<div class="ter-tabla"><p class="ter-tabla-tit">${esc(tm.nombre.toUpperCase())} · ${esc(x.v.inf)}</p>
            ${CORTO_PRON.map((pr, i) => `<p class="ter-fila-tabla ${i === x.p ? "objetivo" : ""}"><span>${esc(pr)}</span><span ${i === x.p ? `id="terCasilla"` : ""}>${i === x.p ? "?????" : visibles.has(i) ? esc(formaDe(x.v, q.t, i)) : "·······"}</span></p>`).join("")}</div>`;
        } else {
          der = `<div class="ter-sin-tabla"><b>TABLA DE AYUDA</b><span class="ter-parpadea">DESCONECTADA</span><small>${nivel === 4 ? "Maestro detective: ni tabla ni pistas. Solo tu memoria." : "Lupa de oro: la tabla la llevas tú en la cabeza."}</small><p class="ter-casilla-sola" id="terCasilla">?????</p></div>`;
        }
      }
      escribirPantalla(`${cab}<div class="ter-cuerpo ${q.frase ? "viaje" : ""}"><div class="ter-izq">${izq}</div><div class="ter-der">${der}</div></div><div class="ter-res" id="terRes"></div>`);
      activarEntrada();
      let intentada = false, copiando = false;
      const reglaOrto = x.reglas.find(r => r.regla)?.regla || null;
      const comprobar = () => {
        const inp = $("#terResp");
        const valor = limpiar(inp.value);
        if (!valor) return;
        const ok = valor === x.forma || sinAyudas(valor) === x.forma;
        if (!intentada) {
          intentada = true;
          intentos++;
          registrar("9.1", ok, x.forma, "conjugación", reglaOrto);
          if (reglaOrto) {
            registrar("5.1", ok, x.forma, "conjugación", reglaOrto);
            // Si falla, la forma vuelve en una ficha del Archivo: su pista dice qué forma es, sin escribirla
            const nombreTiempo = `${tm.nombre}${tm.modo === "subjuntivo" ? " de subjuntivo" : ""}`;
            pistaFicha(ok, `${nombreTiempo.charAt(0).toUpperCase()}${nombreTiempo.slice(1)} de «${x.v.inf}» · ${per.pronombre}`, x.reglas.find(r => r.regla)?.texto);
          }
          if (ok) bien++;
        }
        if (ok) {
          inp.disabled = true;
          $("#terEspejo").textContent = x.forma;
          $(".ter-entrada").classList.add("hecha");
          if ($("#terCasilla")) $("#terCasilla").innerHTML = htmlPartido(x.pt);
          if ($("#terHueco")) $("#terHueco").outerHTML = htmlPartido(x.pt);
          caraMateo(copiando ? "neutral" : "contento");
          const otraParte = j < q.partes.length - 1;
          anadir(`
            <p class="ter-linea ter-ok">${copiando ? "COPIADA ✔" : "OK ✔"} ${htmlPartido(x.pt, "grande")} <span class="ter-leyenda">${x.pt.des ? `RAÍZ <span class="ter-raiz">${esc(x.pt.raiz)}-</span> + DESINENCIA <span class="ter-des">-${esc(x.pt.des)}</span>` : ""}${q.frase ? ` · ${esc(per.persona)} persona del ${esc(per.numero)}` : ""}</span></p>
            ${explicaciones(x)}
            <button type="button" class="ter-boton" id="terSig">&gt; ${otraParte ? "INTRO: SEGUNDO VERBO" : k < preguntas.length - 1 ? "INTRO: SIGUIENTE" : "INTRO: CERRAR SESIÓN"}<span class="ter-cursor">█</span></button>`, "ter-destello");
          const seguir = () => { if (otraParte) j++; else { k++; j = 0; } mostrar(); };
          $("#terSig").onclick = seguir;
          alIntro = seguir;
          return;
        }
        copiando = true;
        caraMateo("pensativo");
        // Con la lupa de diamante no hay ayudas: ni el «¡casi!» de la tilde
        const casi = nivel < 4 && sinTildes(sinAyudas(valor)) === sinTildes(x.forma);
        anadir(`
          <p class="ter-linea ter-error"><span class="ter-inverso">ERROR</span> ¿QUIZÁ QUISISTE DECIR… ${htmlPartido(x.pt, "grande")}?${casi ? ` <span class="ter-aviso">¡CASI! REVISA LA TILDE.</span>` : ""}</p>
          ${explicaciones(x)}`, "ter-fallo");
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
      caraMateo(bien === intentos ? "sorprendido" : "contento");
      escribirPantalla(`
        <p class="ter-linea">&gt; CERRANDO SESIÓN…</p>
        <p class="ter-linea">${lupa.icono} ${esc(lupa.nombre.toUpperCase())}</p>
        <p class="ter-linea">VERBOS BIEN A LA PRIMERA: ${bien} DE ${intentos}</p>
        <p class="ter-linea">${bien === intentos ? "ORTO-3000 NO ENCUENTRA NI UN ERROR. ESTO NO PASABA DESDE 1986." : "DATOS GUARDADOS. LA PRÁCTICA HACE AL DETECTIVE."}</p>`, "ter-destello");
      const mia = P;
      cierre = setTimeout(() => { if (P === mia) cerrar(); }, movimientoReducido() ? 300 : 1600);
    };

    arranque();
  };

  /* INTRO y las teclas que se iluminan al escribir */
  document.addEventListener("keydown", ev => {
    if (!$(".ter-teclado") || $("#capaModal.visible")) return;
    const k = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key;
    const t = $$(".ter-tecla").find(b => b.dataset.k === k);
    if (t) { t.classList.add("pulsada"); setTimeout(() => t.classList.remove("pulsada"), 140); }
    if (ev.key === "Enter" && (ev.target.tagName !== "BUTTON" || (ev.target.closest(".ter-sala") && ev.target.id !== "acaVolver"))) { ev.preventDefault(); alIntro?.(); }
  });
})();
