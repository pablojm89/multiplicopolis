/* ============================================================
   AGENCIA LA LUPA · Academia · Sala 2: El Pupitre (ejercicios extra)
   P2 «Rellena el parte» (id parte): sobre la hoja del pupitre, un formulario de
   la agencia con casillas que se rellenan escribiendo la palabra que pide cada
   pista (definición, contrario, frase con hueco). Se corrige al momento (5.1), con
   la explicación de la regla en la nota de Don Anselmo. Si el alumno escribe otra
   palabra (no la buscada, pero bien escrita), no cuenta como fallo: recibe una pista.
   P4 «La máquina sin tilde» (id sintilde): la vieja Tipógrafa 62 no tiene tecla de
   tilde. El alumno toca las palabras que deberían llevarla (9.2) y las escribe bien
   (5.1); tocar una que no la lleva (fue, dio, ti…) es falsa alarma y se explica por qué.
   Al terminar, la hoja se reescribe correcta: es lo último que se ve.
   Niveles (lupas, NIVELES_ACA de academia.js):
     P2 · 🥉 3 casillas con pistas fáciles (nivel 1) y el número de letras a la vista;
          🥈 4 casillas (nivel ≤ 2), con el número de letras; 🥇 5 casillas con pistas por
          definición (nivel ≥ 2), el número de letras solo como pista si se falla;
          💎 6 casillas con las pistas más difíciles (nivel 3) y sin el número de letras.
     P4 · cada hoja tiene su nivel (1-4) en sintilde.json: 🥉 3 tildes, agudas y llanas claras;
          🥈 4-5; 🥇 6, con esdrújulas y palabras que no la llevan aunque lo parezcan
          (examen, joven…); 💎 7-8, con mayúsculas con tilde, monosílabos y diptongos.
   Datos: datos/academia/partes.json y sintilde.json
   (validadores: herramientas/validar_partes.py y validar_sintilde.py). Prefijo CSS: .pup-
   ============================================================ */
"use strict";

const PUP = { datos: {} };
const PUP_REGLAS = ["tildes-generales", "b-v-1", "h-1", "c-z-s", "ll-y", "g-j-dieresis", "diptongo-monosilabos", "d-z-finales", "mayusculas-puntuacion-1"];
const PUP_TILDES = ["tildes-generales", "diptongo-monosilabos"];
const PUP_BIEN = ["¡Bien escrita!", "¡Eso es!", "Impecable.", "Así se escribe.", "¡Ojo de detective!"];
const PUP_FALSA = ["Esa la dejamos como está.", "Falsa alarma: esa no la necesita.", "Quieto ese lápiz: esa está bien."];

async function pupCargar(nombre) {
  PUP.datos[nombre] ??= await leerJSON(`datos/academia/${nombre}.json`);
  return PUP.datos[nombre];
}
function pupFecha() {
  try { return new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }); } catch { return ""; }
}

/* ── Análisis de la palabra: núcleos vocálicos (sílabas) y sílaba tónica ──
   Diptongo: abierta + cerrada o dos cerradas; dos abiertas, o una cerrada con tilde, hacen hiato.
   La h entre vocales no rompe el diptongo; la u de que/qui/gue/gui no suena; la y final suena como i.
   Lo usa también herramientas/validar_sintilde.py (misma lógica en Python). */
function pupAnalisis(w) {
  let s = w.toLowerCase().normalize("NFC").replace(/qu(?=[eiéí])/g, "q").replace(/gu(?=[eiéí])/g, "g").replace(/ü/g, "u");
  s = s === "y" ? "i" : s.replace(/([aeiouáéíóú])y$/, "$1i");
  const VOCAL = /[aeiouáéíóú]/, FUERTE = /[aeoáéóíú]/;
  const nucleos = [];
  let pegado = false;
  for (const c of s) {
    if (VOCAL.test(c)) {
      const cur = nucleos.at(-1);
      if (cur && pegado && !(FUERTE.test(cur.at(-1)) && FUERTE.test(c))) nucleos[nucleos.length - 1] += c;
      else nucleos.push(c);
      pegado = true;
    } else if (!(c === "h" && pegado)) pegado = false;
  }
  const ultima = [...w.toLowerCase()].at(-1);
  return {
    n: nucleos.length, nucleos,
    tonica: nucleos.findIndex(x => /[áéíóú]/.test(x)),
    fin: /[aeiouáéíóú]/.test(ultima) ? "vocal" : `-${ultima}`,
    enVocalNS: /[aeiouáéíóúns]/.test(ultima),
  };
}
/* Sílabas del banco con la tónica en mayúsculas: «ca-MIÓN» */
function pupSilabas(w) {
  const b = enBanco(w);
  return b?.silabas ? b.silabas.map((x, i) => (i === b.tonica ? x.toUpperCase() : x)).join("-") : "";
}
/* Por qué lleva tilde una palabra (agudas, llanas, esdrújulas y diptongos) */
function pupPorQueTilde(w) {
  const a = pupAnalisis(w);
  const sil = pupSilabas(w) ? ` (${pupSilabas(w)})` : "";
  const desde = a.n - 1 - a.tonica;
  let t;
  const mayus = /^[ÁÉÍÓÚ]/.test(w) ? " Y fíjate: las mayúsculas también llevan tilde." : "";
  if (desde <= 0) t = `Es aguda${sil}: suena fuerte la última sílaba y termina en ${a.fin}. Las agudas que terminan en vocal, -n o -s llevan tilde.`;
  else if (desde === 1) t = `Es llana${sil}: suena fuerte la penúltima sílaba y termina en ${a.fin}. Las llanas que no terminan en vocal, -n ni -s llevan tilde.`;
  else if (desde === 2) t = `Es esdrújula${sil}: suena fuerte la antepenúltima sílaba. Las esdrújulas llevan tilde siempre.`;
  else t = `Es sobresdrújula: la fuerza va antes de la antepenúltima sílaba. Llevan tilde siempre, como las esdrújulas.`;
  const nuc = a.nucleos[a.tonica] || "";
  if (nuc.length > 1) t += /[áéó]/.test(nuc)
    ? ` Tiene diptongo (${nuc}) en la sílaba fuerte: la tilde va en la vocal abierta.`
    : ` Tiene diptongo de dos vocales cerradas (${nuc}): la tilde va en la segunda.`;
  return t + mayus;
}
/* Por qué NO lleva tilde una palabra bien escrita sin ella */
function pupPorQueSin(w) {
  const a = pupAnalisis(w);
  if (a.n <= 1) return `Tiene una sola sílaba${a.nucleos[0]?.length > 1 ? ` (el diptongo ${a.nucleos[0]} no se separa)` : ""}. Los monosílabos no llevan tilde.`;
  if (a.enVocalNS) return `Es llana: suena fuerte la penúltima sílaba y termina en ${a.fin}. Las llanas que terminan en vocal, -n o -s no llevan tilde.`;
  return `Es aguda: suena fuerte la última sílaba y termina en ${a.fin}. Las agudas que no terminan en vocal, -n o -s no llevan tilde.`;
}
const pupReglaDe = (w, activas) => {
  if (activas.length === 1) return activas[0];
  const a = pupAnalisis(w);
  const nuc = a.tonica >= 0 ? a.nucleos[a.tonica] : a.nucleos.find(x => x.length > 1);
  return a.n <= 1 || nuc?.length > 1 ? "diptongo-monosilabos" : "tildes-generales";
};

/* ── ¿Es la misma palabra con una falta de ortografía, o es otra palabra? ──
   Se «neutralizan» las letras que suenan igual (b/v, h, c/z/s, ll/y, g/j, -d/-z, tildes, mayúsculas)
   y se admite una letra de diferencia (erratas). */
function pupNeutro(s, finalD) {
  s = norm(s).normalize("NFD").replace(/́/g, "").normalize("NFC").replace(/ü/g, "u");
  s = s.replace(/n(?=[bpv])/g, "m").replace(/h/g, "").replace(/v/g, "b").replace(/ll/g, "y").replace(/y$/, "i");
  if (finalD) s = s.replace(/[dz]$/, "D");
  s = s.replace(/gu(?=[ei])/g, "G").replace(/g(?=[ei])/g, "j").replace(/G/g, "g");
  return s.replace(/qu(?=[ei])/g, "k").replace(/c(?=[ei])/g, "s").replace(/z/g, "s").replace(/[cq]/g, "k");
}
function pupDistancia(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
function pupVariante(escrita, buena) {
  if (pupNeutro(escrita, true) === pupNeutro(buena, true) || pupNeutro(escrita, false) === pupNeutro(buena, false)) return true;
  return buena.length >= 4 && pupDistancia(pupNeutro(escrita, false), pupNeutro(buena, false)) <= 1;
}

/* ── Piezas comunes de la mesa ──────────────────────────────── */
const PUP_LUPA = `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="20" cy="20" r="13" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="20" cy="20" r="8" fill="currentColor" opacity=".12"/><path d="M30 30 L43 43" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>`;
function pupHTMLNota() {
  return `<aside class="pup-nota" id="pupNota" aria-live="polite">
    <div class="pup-nota-cab"><span class="pup-retrato" id="pupRetrato" style="background-image:url('arte/anselmo-neutral.webp')"></span><b>Don Anselmo</b></div>
    <p id="pupNotaTxt"></p></aside>`;
}
/* Nota de Don Anselmo; «palabra» sale arriba, en grande, como en una ficha de diccionario */
function pupNota(texto, expr = "neutral", palabra = "") {
  const t = $("#pupNotaTxt");
  if (!t) return;
  // «-n», «-s»… no se parten al final de la línea
  t.innerHTML = `${palabra ? `<b class="pup-nota-pal">${esc(palabra)}</b>` : ""}${esc(texto).replace(/(^|[\s(])-(\p{L}+)/gu, '$1<span class="pup-nw">-$2</span>')}`;
  const listas = arte("anselmo").listas || [];
  $("#pupRetrato").style.backgroundImage = listas.includes(expr) ? `url('arte/anselmo-${expr}.webp')` : listas.includes("neutral") ? "url('arte/anselmo-neutral.webp')" : "none";
  const n = $("#pupNota");
  n.classList.remove("pup-nueva"); void n.offsetWidth; n.classList.add("pup-nueva");
}
/* Teclas de repuesto: escriben letras con tilde, diéresis y eñe en el último campo usado */
function pupTeclas(cont, campo, extra = []) {
  cont.innerHTML = ["á", "é", "í", "ó", "ú", "ü", "ñ", ...extra].map(l => `<button type="button" class="pup-tecla" data-l="${l}" aria-label="Escribir ${l}">${l}</button>`).join("");
  $$(".pup-tecla", cont).forEach(b => {
    b.onmousedown = ev => ev.preventDefault();   // que el campo no pierda el foco
    b.onclick = () => {
      const inp = campo();
      if (!inp || inp.disabled) return;
      const i = inp.selectionStart ?? inp.value.length, f = inp.selectionEnd ?? i;
      inp.value = inp.value.slice(0, i) + b.dataset.l + inp.value.slice(f);
      inp.focus();
      inp.setSelectionRange(i + 1, i + 1);
    };
  });
}
/* «camión es aguda…» / «cantaba: el pasado…» → «Es aguda…» / «El pasado…» (la palabra va de título) */
function pupExplica(x) {
  const resto = x.porque.startsWith(x.p) ? x.porque.slice(x.p.length).replace(/^[\s:]+/, "") : x.porque;
  return resto.charAt(0).toUpperCase() + resto.slice(1);
}
const pupLupa = () => { const l = NIVELES_ACA[nivelAca() - 1]; return `<span class="pup-nivel" title="${esc(l.nombre)}">${l.icono} ${esc(l.corto)}</span>`; };
const pupSalir = () => confirmar("¿Volver al patio? Se perderá esta ronda.", vistaPatio, "Volver");

/* ============================================================
   P2 · Rellena el parte
   ============================================================ */
/* Coloca las pistas en los apartados de la plantilla según su campo; las que no encajan van a «otros» */
function pupMontarParte(pl, orden, usadas, n) {
  const libres = pl.apartados.map((ap, i) => ({ ...ap, i }));
  const lineas = [];
  let otros = 0;
  for (const x of orden) {
    if (lineas.length >= n) break;
    if (usadas.has(x)) continue;
    const k = libres.findIndex(ap => [].concat(ap.campo).includes(x.campo));
    if (k >= 0) { lineas.push({ etiqueta: libres[k].etiqueta, pos: libres[k].i, x }); libres.splice(k, 1); usadas.add(x); }
    else if (!otros) { otros++; lineas.push({ etiqueta: pl.otros, pos: 100, x }); usadas.add(x); }
  }
  for (const x of orden) {
    if (lineas.length >= n) break;
    if (!usadas.has(x)) { lineas.push({ etiqueta: pl.otros, pos: 100 + lineas.length, x }); usadas.add(x); }
  }
  return lineas.sort((a, b) => a.pos - b.pos);
}

/* Ayudas cuando se escribe otra palabra. El número de letras solo hasta oro (en bronce y plata ya se ve
   en la casilla); la inicial, solo en bronce y plata y si no es justo la letra de la regla (h, b/v, g/j…) */
function pupAyudas(L, w, nivel) {
  const frase = enBanco(w.p)?.frase, ini = [...w.p][0];
  const l = [];
  if (nivel === 3) l.push(`tiene ${[...w.p].length} letras.`);
  if (frase) l.push(`«${frase}»`);
  if (nivel <= 2 && !/[hbvgjczsyl]/i.test(ini) && w.regla !== "mayusculas-puntuacion-1") l.push(`empieza por «${ini}».`);
  l.push(`vuelve a leer la pista despacio y piensa en el apartado «${L.etiqueta}».`);
  return l;
}

nuevaActividad("pupitre", {
  id: "parte", nombre: "Rellena el parte",
  desc: "Un parte de la agencia con casillas en blanco: adivina cada palabra por su pista y escríbela bien.",
  reglas: PUP_REGLAS,
}, async function (sl, regla, turno) {
  let datos;
  try { datos = await pupCargar("partes"); } catch { aviso("No se ha podido abrir el archivador de partes. Inténtalo otra vez.", "mal"); return vistaPatio(); }
  const activas = PUP_REGLAS.includes(regla) ? [regla] : PUP_REGLAS;   // null, «mezcla» u otra regla: todo mezclado
  const mezcla = activas.length > 1;
  const enCola = new Set(Object.keys(estadoAca().cola).map(norm));
  const nivel = nivelAca();
  const RONDAS = 2, CASILLAS = segunNivel([3, 4, 5, 6]);
  // Las pistas de la lupa (si en una regla hay pocas, porNivel amplía); en diamante, primero las de nivel 3
  const pool = porNivel(datos.pistas.filter(x => activas.includes(x.regla)), RONDAS * CASILLAS);
  const dificultad = x => (nivel >= 4 ? -(x.nivel || 1) : 0);
  // Orden de preferencia: primero las palabras de la cola de repaso; en mezcla, las reglas se alternan
  const rango = new Map();
  barajar(activas).forEach(r => barajar(pool.filter(x => x.regla === r)).forEach((x, i) => rango.set(x, i + Math.random() * .5)));
  const orden = [...pool].sort((a, b) => (enCola.has(norm(b.p)) - enCola.has(norm(a.p))) || dificultad(a) - dificultad(b) || rango.get(a) - rango.get(b));
  const usadas = new Set();
  const partes = barajar(datos.partes).slice(0, RONDAS).map(pl => ({ pl, lineas: pupMontarParte(pl, orden, usadas, CASILLAS) }));
  partidaAca(sl, [...new Set(partes.flatMap(x => x.lineas.map(l => l.x.regla)))]);
  P.caso.escenas[0].tipo = "parte";
  let r = 0;

  const pintar = () => {
    if (r >= partes.length) return terminarActividad(sl, turno);
    const { pl, lineas } = partes[r];
    const num = `${String(Math.floor(1000 + Math.random() * 9000))}-${pl.codigo}`;
    const declarante = azarElem(datos.declarantes);
    pintarEscena(`
      <p class="pup-instr">Lee cada pista y escribe la palabra en su casilla. Pulsa <b>Intro</b> o ✓ para comprobarla.</p>
      <article class="pup-hoja pup-parte pup-c${lineas.length}" id="pupHoja">
        <header class="pup-membrete">
          <span class="pup-logo">${PUP_LUPA}</span>
          <div class="pup-agencia"><b>Agencia La Lupa</b><small>${esc(pl.negociado)}</small></div>
          <div class="pup-num"><small>Parte ${r + 1} de ${partes.length} · ${pupLupa()}</small>N.º ${esc(num)}</div>
        </header>
        <h2 class="pup-titulo">${esc(pl.titulo)}</h2>
        <div class="pup-datos">
          <div><small>Fecha</small><span>${esc(pupFecha())}</span></div>
          <div><small>Declarante</small><span>${esc(declarante)}</span></div>
          <div><small>Agente</small><span class="pup-firma">${esc(perfil?.nombre || "Detective")}</span></div>
        </div>
        <ol class="pup-lineas">${lineas.map((l, k) => `
          <li class="pup-linea" data-k="${k}">
            <span class="pup-n">${k + 1}</span>
            <div class="pup-campo"><small>${esc(l.etiqueta)}</small><span>${esc(l.x.pista)}</span></div>
            <div class="pup-hueco"><input class="pup-entrada" data-k="${k}" ${nivel <= 2 ? `placeholder="${[...l.x.p].length} letras"` : ""} autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="${esc(l.etiqueta)}: ${esc(l.x.pista)}"><button type="button" class="pup-ok" data-k="${k}" aria-label="Comprobar la casilla ${k + 1}">✓</button></div>
          </li>`).join("")}
        </ol>
        <footer class="pup-pie"><span class="pup-teclas" id="pupTeclas"></span><span class="pup-letra">${esc(pl.letra_pequena)}</span></footer>
        <div class="pup-sello" aria-hidden="true"><b>Tramitado</b><span>Agencia La Lupa</span></div>
      </article>
      ${pupHTMLNota()}
      <svg class="pup-tampon" viewBox="0 0 220 200" aria-hidden="true">
        <rect x="18" y="128" width="150" height="58" rx="8" fill="#3b2a1c"/><rect x="28" y="136" width="130" height="40" rx="5" fill="#7a1d19"/><rect x="28" y="136" width="130" height="12" rx="5" fill="#a3302a" opacity=".7"/>
        <g transform="rotate(-14 150 90)"><rect x="104" y="96" width="92" height="26" rx="4" fill="#5a3b22"/><rect x="108" y="116" width="84" height="10" rx="2" fill="#c8261f"/>
        <rect x="140" y="58" width="20" height="40" rx="6" fill="#8a5a33"/><ellipse cx="150" cy="48" rx="26" ry="20" fill="#a06a3a"/><ellipse cx="144" cy="42" rx="10" ry="6" fill="#c98f58" opacity=".7"/></g>
      </svg>
      <button class="hud-volver" id="acaVolver">◂ Patio</button>`, { fondo: sl.fondo, clase: "sala-pup" });
    $("#acaVolver").onclick = pupSalir;
    let ultimo = null;
    $$(".pup-entrada").forEach(inp => inp.addEventListener("focus", () => (ultimo = inp)));
    pupTeclas($("#pupTeclas"), () => ultimo);
    const nombreRegla = D.reglas[activas[0]]?.nombre || activas[0];
    pupNota(r === 0
      ? (mezcla ? "Modo inspector: cada casilla puede ser de una regla distinta. Un parte mal escrito acaba en el cajón de los misterios sin resolver." : `Hoy entrenamos «${nombreRegla}». Lee la pista de cada casilla y escribe la palabra. Un parte bien escrito se tramita a la primera.`)
      : "Otro parte. Este viene con prisa: lo espera la directora.");

    const estado = lineas.map(() => ({ intentada: false, otras: 0, hecha: false }));
    const siguienteLibre = k => { for (let i = 1; i <= lineas.length; i++) { const j = (k + i) % lineas.length; if (!estado[j].hecha) return j; } return -1; };
    $(".pup-entrada")?.focus();

    const comprobar = k => {
      const L = lineas[k], st = estado[k], w = L.x;
      const li = $(`.pup-linea[data-k="${k}"]`), inp = $("input", li);
      const val = inp.value.normalize("NFC").trim();
      if (!val || st.hecha) return;
      const ok = w.regla === "mayusculas-puntuacion-1" ? val === w.p : norm(val) === norm(w.p);
      if (ok) {
        if (!st.intentada) { st.intentada = true; registrar("5.1", true, w.p, "parte", w.regla); }
        st.hecha = true;
        li.classList.add("hecha");
        $(".pup-hueco", li).innerHTML = `<span class="pup-tinta">${esc(w.p)}</span><span class="pup-visto" aria-label="Correcta">✔</span>`;
        pupNota(`${li.classList.contains("pup-repaso") ? "Ahora sí." : azarElem(PUP_BIEN)} ${pupExplica(w)}`, "contento", w.p);
        aviso(`¡Bien! «${w.p}»`, "bien");
        const sig = siguienteLibre(k);
        if (sig >= 0) { $(`.pup-entrada[data-k="${sig}"]`).focus(); return; }
        return tramitar();
      }
      // Otra palabra (bien escrita o no, pero no la que se busca): pistas antes de contarlo como fallo
      if (!pupVariante(val, w.p) && !st.intentada && st.otras < 2) {
        st.otras++;
        const ayudas = pupAyudas(L, w, nivel);
        pupNota(st.otras === 1
          ? `Esa no es la palabra que pide el parte. Pista: ${ayudas[0]}`
          : `Tampoco. Otra pista: ${ayudas[1] || ayudas[0]}`, "pensativo");
        inp.select();
        return;
      }
      if (!st.intentada) { st.intentada = true; registrar("5.1", false, w.p, "parte", w.regla); }
      li.classList.add("pup-repaso");
      li.classList.remove("pup-sacude"); void li.offsetWidth; li.classList.add("pup-sacude");
      pupNota(`Se escribe así. ${pupExplica(w)} Escríbela tú en la casilla para tramitar el parte.`, "pensativo", w.p);
      inp.value = "";
      inp.focus();
    };
    $$(".pup-entrada").forEach(inp => inp.onkeydown = ev => { if (ev.key === "Enter") comprobar(Number(inp.dataset.k)); });
    $$(".pup-ok").forEach(b => b.onclick = () => comprobar(Number(b.dataset.k)));

    function tramitar() {
      const hoja = $("#pupHoja");
      hoja.classList.add("tramitada");
      const repasos = $$(".pup-linea.pup-repaso").length;
      pupNota(repasos ? `Parte tramitado. ${repasos === 1 ? "La palabra marcada vuelve" : `Las ${repasos} palabras marcadas vuelven`} a tus fichas de repaso.` : "¡Parte tramitado a la primera! La directora no tendrá nada que tachar.", "contento");
      const ultimo = r + 1 >= partes.length;
      setTimeout(() => {
        if (!hoja.isConnected) return;
        $("#escenario .capa").insertAdjacentHTML("beforeend", `<button class="flecha pup-sig" id="pupSig">${ultimo ? "Entregar los partes" : "Siguiente parte"} ▸</button>`);
        $("#pupSig").onclick = () => { r++; pintar(); };
      }, movimientoReducido() ? 100 : 700);
    }
  };
  pintar();
});

/* ============================================================
   P4 · La máquina sin tilde
   ============================================================ */
/* Las hojas largas (oro y diamante) bajan la letra hasta que caben en el papel */
function pupAjustar(cont) {
  if (!cont) return;
  const ajustar = () => {
    if (!cont.isConnected) return;
    cont.style.removeProperty("--pup-fs"); cont.style.removeProperty("--pup-lh");
    for (let fs = 26; fs >= 17 && cont.scrollHeight > cont.clientHeight + 1; fs--) {
      cont.style.setProperty("--pup-fs", `${fs - 1}px`);
      cont.style.setProperty("--pup-lh", fs - 1 > 22 ? "1.85" : "1.7");
    }
  };
  ajustar();
  document.fonts?.ready.then(ajustar).catch(() => {});
}
const pupSinTildes = t => [...t].map(quitarTilde).join("");
const pupConTildeHTML = w => [...w].map(ch => (quitarTilde(ch) !== ch ? `<span class="pup-acento">${esc(ch)}</span>` : esc(ch))).join("");
const PUP_MAQUINA = `<svg class="pup-maquina" viewBox="0 0 270 230" aria-hidden="true">
  <rect x="82" y="2" width="112" height="56" fill="#fbf4e2" stroke="#c9b48a"/><path d="M92 16 H180 M92 26 H170 M92 36 H176" stroke="#9a8b70" stroke-width="2"/>
  <rect x="28" y="52" width="214" height="24" rx="12" fill="#1d1d1d"/><rect x="28" y="56" width="214" height="6" rx="3" fill="#4a4a4a"/>
  <circle cx="22" cy="64" r="14" fill="#2b2b2b" stroke="#777" stroke-width="2"/><circle cx="248" cy="64" r="14" fill="#2b2b2b" stroke="#777" stroke-width="2"/>
  <path d="M16 78 H254 L266 192 Q268 214 246 214 H24 Q2 214 4 192 Z" fill="#2f4f3e"/><path d="M16 78 H254 L257 104 H13 Z" fill="#3d6650"/>
  <rect x="86" y="86" width="98" height="14" rx="3" fill="#1c3226"/><text x="135" y="97" text-anchor="middle" font-family="Georgia, serif" font-size="10" fill="#e3c06a" letter-spacing="1.5">TIPÓGRAFA 62</text>
  <g fill="#f1e6cc" stroke="#111" stroke-width="2">
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (i === 7 ? "" : `<circle cx="${34 + i * 22}" cy="122" r="8.5"/>`)).join("")}
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<circle cx="${45 + i * 22}" cy="146" r="8.5"/>`).join("")}
    ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<circle cx="${56 + i * 22}" cy="170" r="8.5"/>`).join("")}
  </g>
  <circle cx="188" cy="122" r="8.5" fill="#1c3226" stroke="#e3c06a" stroke-width="1.5" stroke-dasharray="3 3"/>
  <rect x="80" y="188" width="110" height="14" rx="7" fill="#f1e6cc" stroke="#111" stroke-width="2"/>
  <path d="M188 113 C 200 90, 222 92, 232 100" fill="none" stroke="#c9b48a" stroke-width="1.5"/>
  <g transform="rotate(10 236 112)"><rect x="214" y="98" width="52" height="30" rx="3" fill="#fff6bf" stroke="#c9b48a"/><circle cx="220" cy="104" r="2.5" fill="#c9b48a"/>
  <text x="241" y="111" text-anchor="middle" font-family="Patrick Hand, cursive" font-size="10" fill="#7a1d19">¡Se busca!</text><text x="241" y="125" text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="#2a2118">´</text></g>
</svg>`;

nuevaActividad("pupitre", {
  id: "sintilde", nombre: "La máquina sin tilde",
  desc: "La vieja máquina de escribir de la agencia ha perdido la tecla de la tilde. ¡Devuélveselas!",
  reglas: PUP_TILDES,
}, async function (sl, regla, turno) {
  let datos;
  try { datos = await pupCargar("sintilde"); } catch { aviso("La máquina de escribir no arranca. Inténtalo otra vez.", "mal"); return vistaPatio(); }
  const activas = PUP_TILDES.includes(regla) ? [regla] : PUP_TILDES;   // otra regla o «mezcla»: las dos mezcladas
  const enCola = new Set(Object.keys(estadoAca().cola).map(norm));
  const claveVistas = `pupitre-sintilde-${perfil?.id}`;
  const vistas = cargar(claveVistas, []);
  const objetivosDe = h => h.frases.join(" ").match(/\p{L}+/gu).filter(w => pupSinTildes(w) !== w);
  // Primero las hojas con palabras de la cola; las de la ronda anterior, al final
  const puntuar = h => objetivosDe(h).filter(w => enCola.has(norm(w))).length * 10 - (vistas.includes(h.id) ? 5 : 0) + Math.random();
  const elegir = lista => [...lista].sort((a, b) => puntuar(b) - puntuar(a));
  // Cada hoja tiene su nivel (1-4), que es el de la lupa; si de una regla hay pocas, se toman las del nivel vecino
  const nivel = nivelAca();
  const deNivel = (rg, n) => {
    const de = d => datos.hojas.filter(h => h.regla === rg && Math.abs((h.nivel || 1) - nivel) <= d);
    return [0, 1, 3].map(de).find(l => l.length >= n) || de(3);
  };
  const hojas = activas.length === 1
    ? elegir(deNivel(activas[0], 2)).sort((a, b) => Math.abs((a.nivel || 1) - nivel) - Math.abs((b.nivel || 1) - nivel)).slice(0, 2)
    : barajar(activas.map(rg => elegir(deNivel(rg, 1)).sort((a, b) => Math.abs((a.nivel || 1) - nivel) - Math.abs((b.nivel || 1) - nivel))[0]));
  guardar(claveVistas, hojas.map(h => h.id));
  const propios = new Set(datos.nombres_propios || []);
  partidaAca(sl, activas);
  P.caso.escenas[0].tipo = "sintilde";
  let r = 0;

  const pintar = () => {
    if (r >= hojas.length) return terminarActividad(sl, turno);
    const h = hojas[r];
    const texto = h.frases.join(" ");
    const tokens = [];
    texto.split(/(\p{L}+)/u).forEach(parte => {
      if (!parte) return;
      if (!/^\p{L}+$/u.test(parte)) return tokens.push({ t: parte, palabra: false });
      const sin = pupSinTildes(parte);
      tokens.push({ t: sin, palabra: true, error: sin !== parte, bien: parte });
    });
    const total = tokens.filter(t => t.error).length;
    pintarEscena(`
      <p class="pup-instr">La máquina no tiene tecla de tilde. Toca las <b>${total}</b> palabras que la necesitan y escríbelas bien.</p>
      <article class="pup-hoja pup-maq" id="pupHoja">
        <header class="pup-tira"><span>Agencia La Lupa · mecanografiado en la Tipógrafa 62</span><span>Hoja ${r + 1} de ${hojas.length} · ${pupLupa()}</span></header>
        <h2 class="pup-maq-titulo">${esc(pupSinTildes(h.titulo).toUpperCase())}</h2>
        <div class="pup-maq-texto" id="pupTexto"></div>
        <footer class="pup-cuenta" id="pupCuenta"></footer>
        <div class="pup-sello" aria-hidden="true"><b>Corregido</b><span>con todas sus tildes</span></div>
      </article>
      ${pupHTMLNota()}
      ${PUP_MAQUINA}
      <button class="hud-volver" id="acaVolver">◂ Patio</button>`, { fondo: sl.fondo, clase: "sala-pup" });
    $("#acaVolver").onclick = pupSalir;
    pupNota(r === 0
      ? ["Esta vieja Tipógrafa perdió la tecla de la tilde en 1987 y nadie la ha encontrado. Ojo: no todas las palabras la necesitan. Las de una sola sílaba, como «fue» o «dio», no la llevan.",
         "Esta vieja Tipógrafa perdió la tecla de la tilde en 1987 y nadie la ha encontrado. Ojo: no todas las palabras la necesitan. Las de una sola sílaba, como «fue» o «dio», no la llevan.",
         "Hoja de oro: hay esdrújulas, y también palabras que parecen llevar tilde y no la llevan, como «examen» o «joven». No piques.",
         "Hoja de diamante: las mayúsculas también llevan tilde (Ángel, Úbeda), los monosílabos como «fue» o «pie» no la llevan y hay diptongos por todas partes."][nivel - 1]
      : "Otra hoja de la Tipógrafa. Lee despacio y escucha qué sílaba suena más fuerte.");

    let hechas = 0, falsas = 0;
    const contar = () => ($("#pupCuenta").innerHTML = `Tildes devueltas: <b>${hechas}</b> de ${total}${falsas ? ` · Falsas alarmas: ${falsas}` : ""}`);
    contar();
    const ctx = { pendientes: total, conCarta: false };
    const p = textoInteractivo(tokens, ctx);
    $("#pupTexto").append(p);
    pupAjustar($("#pupTexto"));
    const botones = $$("button.w", p);
    tokens.filter(t => t.palabra).forEach((tk, i) => { botones[i].onclick = () => pulsar(tk, botones[i]); });

    function pulsar(tk, b) {
      if (tk.resuelta || $("#capaModal.visible")) return;
      if (!tk.error) {
        if (!tk.falsa) { tk.falsa = true; falsas++; registrar("9.2", false, tk.t, "falsa alarma", pupReglaDe(tk.t, activas)); contar(); }
        b.classList.remove("falsa"); void b.offsetWidth; b.classList.add("falsa");
        pupNota(`${azarElem(PUP_FALSA)} ${pupPorQueSin(tk.t)}`, "sorprendido", tk.t);
        return;
      }
      tk.regla ??= pupReglaDe(tk.bien, activas);
      if (!tk.detectada) { tk.detectada = true; registrar("9.2", true, tk.bien, "detectada", tk.regla); }
      b.classList.add("sospechosa");
      escribir(tk, b);
    }

    function escribir(tk, b) {
      let fallos = 0;
      abrirModal(`
        <h3>Esta palabra necesita su tilde</h3>
        <p>La máquina escribió <strong class="pup-maq-pal">${esc(tk.t)}</strong>. Escríbela bien, con su tilde:</p>
        <input id="pupCorr" class="entrada" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Palabra con su tilde">
        <p class="pup-repuesto">Teclas de repuesto: <span class="pup-teclas" id="pupTeclasM"></span></p>
        <p id="pupCorrMsg" class="msg"></p>
        <div class="acciones"><button class="boton-sello" id="pupCorrOk">Comprobar</button></div>`, "ventana-libreta pup-ventana");
      const inp = $("#pupCorr");
      // En diamante hay mayúsculas con tilde (Ángel, Úbeda…): se exige la mayúscula y hay teclas para ellas
      const mayus = nivel >= 4 && /^[ÁÉÍÓÚ]/.test(tk.bien);
      pupTeclas($("#pupTeclasM"), () => inp, mayus ? ["Á", "É", "Í", "Ó", "Ú"] : []);
      const cerrarSinResolver = () => b.classList.remove("sospechosa");
      $("#capaModal .cerrar").addEventListener("click", cerrarSinResolver);
      inp.focus();
      const comprobar = () => {
        const v = inp.value.normalize("NFC").trim();
        if (!v) return;
        const ok = norm(v) === norm(tk.bien) && (!mayus || v[0] === tk.bien[0]);
        // En la cola de repaso, en minúscula salvo los nombres propios (Julián, Ramón…)
        if (!tk.intentada) { tk.intentada = true; registrar("5.1", ok, propios.has(tk.bien) ? tk.bien : tk.bien.toLowerCase(), "sin tilde", tk.regla); }
        if (ok) {
          cerrarModal();
          tk.resuelta = true; hechas++;
          b.innerHTML = pupConTildeHTML(tk.bien);
          b.classList.remove("sospechosa");
          b.classList.add("resuelta");
          contar();
          pupNota(pupPorQueTilde(tk.bien), "contento", tk.bien);
          aviso(`${azarElem(PUP_BIEN)} «${tk.bien}»`, "bien");
          if (hechas === total) setTimeout(reescribir, movimientoReducido() ? 200 : 900);
          return;
        }
        fallos++;
        const sinT = pupSinTildes(v) === v;
        $("#pupCorrMsg").innerHTML = fallos >= 2
          ? `Se escribe <strong>${esc(tk.bien)}</strong>. Escríbela tú.`
          : mayus && norm(v) === norm(tk.bien)
            ? "Casi: va con mayúscula. Y la mayúscula también lleva tilde (Á, É, Í, Ó, Ú)."
          : norm(pupSinTildes(v)) === norm(tk.t)
            ? (sinT ? "Le falta la tilde. ¿Qué sílaba suena más fuerte?" : "La tilde no va en esa vocal. Di la palabra en voz alta y busca la sílaba fuerte.")
            : "Fíjate bien en cada letra: solo hay que añadir la tilde.";
        inp.select();
      };
      $("#pupCorrOk").onclick = comprobar;
      inp.onkeydown = ev => { if (ev.key === "Enter") comprobar(); };
    }

    // La hoja sale de la máquina otra vez, ya correcta: es lo último que se ve
    function reescribir() {
      const hoja = $("#pupHoja");
      if (!hoja?.isConnected) return;
      cerrarModal();
      const limpio = esc(texto).replace(/\p{L}+/gu, w => (pupSinTildes(w) !== w ? `<b class="pup-devuelta">${pupConTildeHTML(w)}</b>` : w));
      $(".pup-maq-titulo", hoja).textContent = h.titulo.toUpperCase();
      $("#pupTexto").innerHTML = `<p class="pup-limpio">${limpio}</p>`;
      pupAjustar($("#pupTexto"));
      $("#pupCuenta").innerHTML = `Hoja corregida: <b>${total}</b> tildes devueltas${falsas ? ` · ${falsas} falsa${falsas > 1 ? "s" : ""} alarma${falsas > 1 ? "s" : ""}` : " · sin falsas alarmas"}`;
      hoja.classList.add("reescrita");
      pupNota(falsas ? "Así queda la hoja, con todas sus tildes. Y recuerda: una tilde de más también es una falta." : "¡Ni una tilde de más ni una de menos! Así queda la hoja.", "contento");
      const ultima = r + 1 >= hojas.length;
      setTimeout(() => {
        if (!hoja.isConnected) return;
        $("#escenario .capa").insertAdjacentHTML("beforeend", `<button class="flecha pup-sig" id="pupSig">${ultima ? "Entregar las hojas" : "Siguiente hoja"} ▸</button>`);
        $("#pupSig").onclick = () => { r++; pintar(); };
      }, movimientoReducido() ? 100 : 1500);
    }
  };
  pintar();
});
