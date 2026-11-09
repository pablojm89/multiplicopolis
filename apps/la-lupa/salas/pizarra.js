/* ============================================================
   AGENCIA LA LUPA · Academia · Sala «La Pizarra»
   Z1 · Descubre la regla (9.1). Don Anselmo escribe pruebas con tiza y el
   alumno hace de detective: 1) observa y rodea las cuatro que se parecen;
   2) elige la hipótesis buena (las otras se tachan: demasiado amplia o
   demasiado estrecha); 3) pone la regla a prueba con palabras nuevas
   (la excepción o la que la confirma); 4) escribe un ejemplo propio.
   Al final, la ficha de Mateo confirma la regla descubierta.
   Niveles (lupas, ver PIZ_NIVELES): bronce, 6 pruebas y hipótesis muy distintas;
   plata, 8 pruebas y hipótesis parecidas; oro, «reglas rivales» (dos subreglas
   a la vez y dos círculos de tiza); diamante, sin pistas, dos contraejemplos
   y un ejemplo propio difícil. Cada subregla y cada ejemplo tienen «nivel» (1-3).
   Datos: datos/academia/pizarra.json (validador: herramientas/validar_pizarra.py)

   Por qué leccionFija y no «reglas» en la sala: la lección normal enseña la
   ficha ANTES de practicar, y aquí la gracia es descubrirla. Don Anselmo
   presenta la sala sin destripar nada y la regla se elige dentro de la
   actividad; la ficha llega al final, como confirmación.
   ============================================================ */
"use strict";

const PIZ = { datos: null };
const PIZ_REGLAS = ["tildes-generales", "b-v-1", "h-1", "c-z-s", "ll-y", "g-j-dieresis", "diptongo-monosilabos", "d-z-finales", "mayusculas-puntuacion-1"];
const PIZ_PASOS = ["Observa", "Hipótesis", "Contraejemplo", "Tu ejemplo"];
/* Qué cambia en cada lupa: pruebas en la pizarra, cuántas cumplen la regla (por círculo),
   qué hipótesis salen y cuántos contraejemplos hay que encontrar */
const PIZ_NIVELES = {
  1: { pruebas: 6, cumplen: 4, hipotesis: ["buena", "amplia", "otra"], buscar: 1 },
  2: { pruebas: 8, cumplen: 5, hipotesis: ["buena", "amplia", "estrecha"], buscar: 1 },
  3: { pruebas: 8, cumplen: 3, rivales: true, buscar: 1 },
  4: { pruebas: 8, cumplen: 5, hipotesis: ["buena", "amplia", "estrecha"], buscar: 2, sinPista: true, propioDificil: true },
};
const PIZ_NUM = ["ninguna", "una", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho"];
const PIZ_COLOR = [{ clase: "", nombre: "blanco" }, { clase: "amarilla", nombre: "amarillo" }];
/* Los ejemplos del banco son {p, nivel}; el resto de listas, palabras sueltas */
const pizP = x => (typeof x === "string" ? x : x.p);
const pizNv = x => (typeof x === "string" ? 1 : x.nivel || 1);
const pizMay = t => t.charAt(0).toUpperCase() + t.slice(1);

Object.assign(sala("pizarra"), {
  activa: true,
  instructor: "anselmo",
  actividad: "descubre-regla",
  gancho: "Seis pruebas en la pizarra. La regla, la descubres tú.",
  leccionFija: "En mis tiempos, las reglas no se copiaban: se descubrían. Yo escribo unas pruebas en la pizarra y tú haces de detective: observas, sospechas, formulas una hipótesis… y la pones a prueba. Al final, comprobaremos si coincide con el Archivo de Mateo. Prohibido mirar antes.",
});

/* Lo que ya ha descubierto cada detective (para no repetir subregla) */
const clavePiz = () => `pizarra-${perfil.id}`;
const estadoPiz = () => ({ vistas: {}, ...cargar(clavePiz(), {}) });

ACTIVIDADES["descubre-regla"] = async function (sl, regla, turno) {
  try { PIZ.datos ??= (await leerJSON("datos/academia/pizarra.json")).reglas; }
  catch { aviso("No se ha podido abrir la pizarra. Prueba otra vez.", "mal"); return vistaPatio(); }
  if (regla && PIZ.datos[regla]) return pizRonda(sl, regla, turno);
  pizElegir(sl, turno);
};

/* ── Escena común: pizarra, borrador, Anselmo y bocadillo ────── */
const PIZ_FILTRO = `<svg class="piz-defs" aria-hidden="true" focusable="false"><defs>
  <filter id="piz-tiza" x="-6%" y="-12%" width="112%" height="124%">
    <feTurbulence type="fractalNoise" baseFrequency="1.15" numOctaves="2" seed="7" result="ruido"/>
    <feColorMatrix in="ruido" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.6 0 0 0 2.05" result="grano"/>
    <feComposite in="SourceGraphic" in2="grano" operator="in" result="tiza"/>
    <feDisplacementMap in="tiza" in2="ruido" scale="2.4" xChannelSelector="R" yChannelSelector="G"/>
  </filter></defs></svg>`;

function pizEscena(sl, tema, { volver }) {
  const lupa = NIVELES_ACA[nivelAca() - 1];
  pintarEscena(`
    ${PIZ_FILTRO}
    <button class="hud-volver" id="acaVolver">◂ Patio</button>
    <h1 class="cartel piz-titulo">${esc(sl.nombre)}</h1>
    <p class="piz-tema">${esc(tema)}</p>
    <div class="piz-tablero" id="pizTablero">
      <div class="piz-pasos" id="pizPasos"></div>
      <div class="piz-contenido" id="pizCont"></div>
      <div class="piz-polvo" aria-hidden="true"></div>
    </div>
    <span class="piz-nivel" title="${esc(lupa.nombre)}">${lupa.icono} ${esc(lupa.corto)}</span>
    <div class="piz-tizas" aria-hidden="true"><i></i><i class="amarilla"></i></div>
    <div class="piz-borrador" id="pizBorrador" aria-hidden="true"></div>
    ${htmlPersonaje({ id: "anselmo", expresion: "neutral", lado: "izq" }, "pequeno piz-anselmo")}
    <div class="piz-bocadillo"><span class="quien">${esc(nombreInstructor(sl))}</span><p id="pizDice" aria-live="polite"></p></div>
    <div class="piz-acciones" id="pizAcc"></div>
    <div class="piz-zona" id="pizZona"></div>`, { fondo: sl.fondo });
  $("#acaVolver").onclick = volver;
}

/* Escapa y evita que «-avo», «-bir»… se partan al cambiar de línea */
const pizTxt = t => esc(t).replace(/(^|[\s(«])(-\p{L}+)/gu, '$1<span class="piz-nw">$2</span>');

function pizDecir(texto, cara = "neutral") {
  const p = $("#pizDice");
  if (!p) return;
  p.innerHTML = pizTxt(texto);
  p.classList.remove("nuevo"); void p.offsetWidth; p.classList.add("nuevo");
  const img = $("img.piz-anselmo");
  if (img && (arte("anselmo").listas || []).includes(cara)) img.src = `arte/anselmo-${cara}.webp`;
}

function pizPasos(n) {
  $("#pizPasos").innerHTML = PIZ_PASOS.map((t, i) =>
    `<span class="${i + 1 < n ? "hecho" : i + 1 === n ? "actual" : ""}">${i + 1 < n ? "✓" : i + 1}. ${t}</span>`).join("");
}

/* El borrador pasa por la pizarra; a mitad de pasada se escribe lo nuevo */
function pizBorrar(despues) {
  const t = $("#pizTablero"), b = $("#pizBorrador");
  if (movimientoReducido()) return despues();
  t.classList.remove("escribiendo");
  b.classList.add("borrando"); t.classList.add("borrando", "polvo");
  setTimeout(() => {
    if (!t.isConnected) return;
    despues();
    t.classList.remove("borrando"); void t.offsetWidth; t.classList.add("escribiendo");
  }, 950);
  setTimeout(() => b.classList.remove("borrando"), 1000);
  setTimeout(() => t.classList.remove("polvo", "escribiendo"), 2600);
}

/* Si las pruebas no caben en la pizarra (palabras largas), la tiza se hace más pequeña */
function pizAjustar() {
  const c = $("#pizCont"), pr = $$("#pizCont .piz-pruebas").at(-1);
  if (!c || !pr) return;
  let tam = parseFloat(getComputedStyle(pr.querySelector(".piz-p")).fontSize);
  // alto real de lo escrito, dejando sitio para los círculos de tiza (sobresalen unos 12 px por arriba y por abajo)
  const alto = () => [...c.children].reduce((h, el) => h + el.offsetHeight + parseFloat(getComputedStyle(el).marginTop) + parseFloat(getComputedStyle(el).marginBottom), 0);
  while (alto() > c.clientHeight - 22 && tam > 20) { tam -= 2; pr.style.setProperty("--tam", `${tam}px`); }
}

/* ── Trazos de tiza a mano alzada (SVG) ──────────────────────── */
const pizAzar = (a, b) => a + Math.random() * (b - a);
function pizTrazoCirculo(w, h) {
  const cx = w / 2, cy = h / 2, rx = w / 2 - 5, ry = h / 2 - 5;
  const a0 = -Math.PI * pizAzar(0.55, 0.85), vuelta = Math.PI * 2 * pizAzar(1.06, 1.13), fase = pizAzar(0, 6);
  let d = "";
  for (let i = 0; i <= 56; i++) {
    const t = i / 56, a = a0 + vuelta * t;
    const k = 1 + 0.035 * Math.sin(a * 3 + fase) + 0.03 - 0.07 * t;   // empieza por fuera y acaba por dentro: no cierra perfecto
    d += `${i ? "L" : "M"}${(cx + rx * k * Math.cos(a)).toFixed(1)},${(cy + ry * k * Math.sin(a) + (t - 0.5) * 4).toFixed(1)}`;
  }
  return d;
}
function pizTrazoTachon(w, h) {
  const j = () => pizAzar(-6, 6);
  return `M${10 + j()},${h * 0.22 + j()} Q${w / 2 + j()},${h / 2 + j() * 2} ${w - 10 + j()},${h * 0.8 + j()}`
       + ` M${w - 12 + j()},${h * 0.2 + j()} Q${w / 2 + j()},${h / 2 + j() * 2} ${12 + j()},${h * 0.84 + j()}`;
}
function pizTrazoSubrayado(w, h) {
  const j = () => pizAzar(-2.5, 2.5);
  return `M4,${h - 6 + j()} Q${w * 0.3},${h - 2 + j()} ${w * 0.55},${h - 6 + j()} T${w - 4},${h - 5 + j()}`;
}
function pizTrazoVisto(w, h) {
  return `M${w * 0.12},${h * 0.55} Q${w * 0.28},${h * 0.7} ${w * 0.38},${h * 0.88} Q${w * 0.6},${h * 0.4} ${w * 0.92},${h * 0.1}`;
}
/* Dibuja un trazo encima de un elemento. margen: cuánto se sale por cada lado */
function pizDibujar(el, trazo, clase = "", margen = [20, 12]) {
  const [mx, my] = margen;
  const w = el.offsetWidth + mx * 2, h = el.offsetHeight + my * 2;
  el.insertAdjacentHTML("beforeend", `<svg class="piz-trazo ${clase}" viewBox="0 0 ${w} ${h}" style="width:${w}px;height:${h}px;left:${-mx}px;top:${-my}px" aria-hidden="true"><path d="${trazo(w, h)}" pathLength="1"/></svg>`);
  return el.lastElementChild;
}

/* ── Elegir la regla (o una al azar) ─────────────────────────── */
function pizElegir(sl, turno) {
  const st = estadoPiz();
  pizEscena(sl, "Elige una regla", { volver: vistaPatio });
  pizPasos(0);
  $("#pizCont").innerHTML = `<div class="piz-portada">
      <p class="piz-grande">¿Qué regla investigamos hoy?</p>
      <svg class="piz-lupa" viewBox="0 0 120 120" aria-hidden="true"><circle cx="48" cy="48" r="32"/><path d="M72 72 L108 108"/><path d="M30 40 Q36 28 50 26"/></svg>
      <p class="piz-nota">★ = misterios ya resueltos de esa regla</p></div>`;
  pizDecir("Elige una regla. No te voy a decir cómo funciona: eso lo vas a descubrir tú. Cada una esconde varios misterios.");
  const reglas = PIZ_REGLAS.filter(r => PIZ.datos[r] && D.reglas[r]);
  $("#pizZona").classList.add("elegir");
  $("#pizZona").innerHTML = `<div class="piz-reglas">${reglas.map(r => {
    const hechos = (st.vistas[r] || []).length, total = PIZ.datos[r].length;
    return `<button class="piz-pizarrin" data-regla="${esc(r)}"><span>${esc(D.reglas[r].nombre)}</span><small>${hechos ? `${"★".repeat(Math.min(hechos, 6))} ${hechos}/${total}` : `${total} misterios`}</small></button>`;
  }).join("")}</div>`;
  $("#pizAcc").innerHTML = `<button class="boton-sello" id="pizAzar">Una al azar 🎲</button>`;
  $$(".piz-reglas .piz-pizarrin").forEach(b => b.onclick = () => pizRonda(sl, b.dataset.regla, turno));
  $("#pizAzar").onclick = () => {
    const pendientes = reglas.filter(r => (st.vistas[r] || []).length < PIZ.datos[r].length);
    pizRonda(sl, azarElem(pendientes.length ? pendientes : reglas), turno);
  };
}

/* ── Una ronda: una subregla entera (o dos rivales, en oro), en cuatro pasos ── */
function pizRonda(sl, regla, turno) {
  const nv = nivelAca();
  let cfg = PIZ_NIVELES[nv];
  const st = estadoPiz();
  const vistas = st.vistas[regla] || [];
  const todas = PIZ.datos[regla];
  const sinVer = l => { const n = l.filter(s => !vistas.includes(s.id)); return n.length ? n : l; };
  const deId = id => todas.find(s => s.id === id);

  /* Oro: dos subreglas rivales a la vez. El resto: una subregla del nivel */
  let subs;
  const conRival = todas.filter(s => (s.rivales || []).some(deId));
  if (cfg.rivales && conRival.length) {
    const a = azarElem(sinVer(conRival));
    subs = barajar([a, azarElem(sinVer(a.rivales.map(deId).filter(Boolean)))]);
  } else {
    if (cfg.rivales) cfg = { ...PIZ_NIVELES[2] };
    subs = [azarElem(sinVer(porNivel(todas, 2, nv)))];
  }
  const rivales = subs.length === 2;
  const sub = subs[0];
  const C = cfg.cumplen, N = cfg.pruebas, total = C * subs.length;
  const frases = !!sub.frases;
  const clave = x => (frases ? String(x).trim().replace(/\s+/g, " ") : norm(x));
  const prep = x => (frases ? String(x).trim() : norm(x));
  const rxs = subs.map(s => (s.patron ? new RegExp(s.patron) : null));
  const hipDe = (s, v) => s.hipotesis.find(h => h.valor === v);
  const color = g => PIZ_COLOR[colorDe[g]];
  let colorDe = [0, 1];   // círculo (color) de cada subregla; en oro se decide al comprobar el paso 1

  /* Ejemplos de cada subregla según la lupa (en diamante, primero los más difíciles) */
  const ejs = subs.map(s => barajar(porNivel(s.ejemplos, C + 4)).sort((a, b) => (nv === 4 ? pizNv(b) - pizNv(a) : 0)).map(pizP));
  const enEj = subs.map(s => new Set(s.ejemplos.map(x => clave(pizP(x)))));
  const enCon = subs.map(s => new Set((s.contraejemplos || []).map(clave)));
  /* De relleno, palabras correctas que no cumplen ninguna de las reglas en juego */
  const cumpleAlguna = x => subs.some((s, g) => enEj[g].has(clave(x)) || enCon[g].has(clave(x)) || rxs[g]?.test(prep(x)));
  const relPool = barajar([...new Set(subs.flatMap(s => s.relleno))].filter(x => !cumpleAlguna(x)));

  /* Hipótesis: bronce, muy distintas (buena, amplia y otra que habla de otra cosa); plata y diamante, parecidas;
     oro, las dos buenas y una mala de cada subregla */
  let hips;
  if (rivales) {
    const malas = barajar(["amplia", "estrecha"]);
    hips = barajar([...subs.map((s, g) => ({ ...hipDe(s, "buena"), g })), ...subs.map((s, g) => ({ ...(hipDe(s, malas[g]) || hipDe(s, "amplia")), g }))]);
  } else {
    hips = barajar(cfg.hipotesis.map(v => hipDe(sub, v) || hipDe(sub, "estrecha")).filter(Boolean).map(h => ({ ...h, g: 0 })));
  }
  const pruebaDe = (g, v) => hips.find(h => h.g === g && h.valor === v)?.prueba || [];

  /* Paso 1: la pizarra. Siempre hay alguna prueba que tumba cada hipótesis mala */
  const usados = new Set();
  const tomar = (lista, n, prueba = []) => {
    const libres = lista.filter(x => x && !usados.has(clave(x)));
    const una = libres.find(x => prueba.includes(x));
    const res = (una ? [una, ...libres.filter(x => x !== una)] : libres).slice(0, n);
    res.forEach(x => usados.add(clave(x)));
    return res;
  };
  const pruebas = barajar([
    ...subs.flatMap((s, g) => tomar(ejs[g], C, pruebaDe(g, "estrecha")).map(p => ({ p, g }))),
    ...tomar(relPool, N - total, subs.flatMap((s, g) => pruebaDe(g, "amplia"))).map(p => ({ p, g: -1 })),
  ]);

  /* Paso 3: pruebas nuevas. objetivo: las que hay que encontrar */
  const restoEj = ejs.map(l => l.filter(x => !usados.has(clave(x))));
  const restoRel = relPool.filter(x => !usados.has(clave(x)));
  let modo, nuevas;
  if (rivales) {
    // Excepciones que no cumplen el patrón del rival (si no, no se sabría en qué círculo van)
    const exc = [0, 1].map(g => (subs[g].contraejemplos || []).filter(x => !rxs[1 - g]?.test(prep(x))));
    const conExc = [0, 1].filter(g => exc[g].length);
    const gx = conExc.length && Math.random() < 0.65 ? azarElem(conExc) : -1;
    modo = gx >= 0 ? "excepcion" : "intrusa";
    nuevas = [{ p: gx >= 0 ? azarElem(exc[gx]) : restoRel[0], ok: true, g: gx }, ...[0, 1].map(g => ({ p: restoEj[g][0], ok: false, g }))];
  } else if (cfg.buscar === 2) {
    const con = barajar(sub.contraejemplos || []);
    modo = con.length >= 2 && Math.random() < 0.75 ? "excepcion" : "intrusa";
    nuevas = [...(modo === "excepcion" ? con.slice(0, 2).map(p => ({ p, ok: true, g: 0 })) : restoRel.slice(0, 2).map(p => ({ p, ok: true, g: -1 }))),
              ...restoEj[0].slice(0, 3).map(p => ({ p, ok: false, g: 0 }))];
  } else {
    modo = sub.contraejemplos?.length && Math.random() < 0.65 ? "excepcion" : "confirma";
    nuevas = modo === "excepcion"
      ? [{ p: azarElem(sub.contraejemplos), ok: true, g: 0 }, ...restoEj[0].slice(0, 2).map(p => ({ p, ok: false, g: 0 }))]
      : [{ p: restoEj[0][0], ok: true, g: 0 }, ...restoRel.slice(0, 2).map(p => ({ p, ok: false, g: -1 }))];
  }
  nuevas = barajar(nuevas.filter(x => x.p));
  nuevas.forEach(x => usados.add(clave(x.p)));
  const objetivos = nuevas.filter(x => x.ok).length;
  const enPizarra = new Set([...pruebas, ...nuevas].map(x => clave(x.p)));
  const plural = w => (w.endsWith("z") ? `${w.slice(0, -1)}ces` : `${w}es`);
  const conPlural = (texto, w) => String(texto || "").replace("{plural}", plural(w));

  partidaAca(sl, [regla]);
  // Aquí las palabras pulsadas por error están bien escritas: no van a la lista de «repasar» (que es de ortografía)
  const anotar9 = (ok, palabra, detalle) => { registrar("9.1", ok, palabra, detalle, regla); if (!ok && palabra) P.repasar.delete(palabra); };
  const salir = () => confirmar("¿Volver al patio? Se perderá esta ronda.", vistaPatio, "Volver");
  pizEscena(sl, rivales ? `${D.reglas[regla]?.nombre || regla} · reglas rivales` : D.reglas[regla]?.nombre || regla, { volver: salir });

  const htmlPrueba = (x, i, extra = "") =>
    `<button class="piz-p ${frases ? "frase" : ""} ${extra}" data-i="${i}" style="--g:${pizAzar(-2.5, 2.5).toFixed(1)}deg">${esc(x.p)}</button>`;
  const htmlHipotesis = () => rivales
    ? `<div class="piz-reglas-dos">${[0, 1].sort((a, b) => colorDe[a] - colorDe[b]).map(g =>
        `<p class="piz-regla c${colorDe[g]}"><small>Círculo ${color(g).nombre}</small>${pizTxt(hipDe(subs[g], "buena").texto)}</p>`).join("")}</div>`
    : `<p class="piz-regla"><small>Hipótesis</small>${pizTxt(hipDe(sub, "buena").texto)}</p>`;

  /* Paso 1 · Observar: rodear las que tienen algo en común (en oro, dos grupos con dos tizas) */
  const paso1 = () => {
    pizPasos(1);
    $("#pizCont").innerHTML = `<div class="piz-pruebas ${frases ? "frases" : ""} ${N > 6 ? "muchas" : ""}">${pruebas.map((x, i) => htmlPrueba(x, i)).join("")}</div>`;
    pizAjustar();
    pizDecir(rivales
      ? `${pizMay(PIZ_NUM[N])} pruebas y dos reglas rivales. Tres van juntas por una razón, otras tres por otra… y ${PIZ_NUM[N - total]} se han colado. Toca una vez para el círculo blanco y otra vez para el amarillo.`
      : `${pizMay(PIZ_NUM[N])} pruebas. ${pizMay(PIZ_NUM[C])} tienen algo en común… y ${PIZ_NUM[N - C]} se han colado. Rodea con la tiza las ${PIZ_NUM[C]} que se parecen.`);
    $("#pizAcc").innerHTML = `<p class="piz-cuenta" id="pizCuenta"></p><button class="boton-sello" id="pizOk" disabled>Comprobar</button>`;
    const marca = pruebas.map(() => null);   // círculo de cada prueba: 0 blanco, 1 amarillo
    let intentos = 0, cerrado = false;
    const cuenta = c => marca.filter(m => m === c).length;
    const contar = () => {
      $("#pizCuenta").innerHTML = rivales
        ? `<span class="c0">◯ ${cuenta(0)} de ${C}</span> <span class="c1">◯ ${cuenta(1)} de ${C}</span>`
        : `Rodeadas: ${cuenta(0)} de ${C}`;
      $("#pizOk").disabled = rivales ? cuenta(0) !== C || cuenta(1) !== C : cuenta(0) !== C;
    };
    const rodear = (b, c) => { b.querySelector(".circulo")?.remove(); b.classList.add("rodeada"); pizDibujar(b, pizTrazoCirculo, `circulo ${PIZ_COLOR[c].clase}`); };
    const desrodear = b => { b.classList.remove("rodeada"); b.querySelector(".circulo")?.remove(); };
    contar();
    $$(".piz-p").forEach(b => b.onclick = () => {
      if (cerrado) return;
      const i = Number(b.dataset.i), cur = marca[i];
      // Ciclo: sin círculo → blanco → amarillo (en oro) → sin círculo, saltando los círculos llenos
      const ciclo = rivales ? [null, 0, 1] : [null, 0];
      let k = ciclo.indexOf(cur), sig = null;
      for (let t = 0; t < ciclo.length; t++) { k = (k + 1) % ciclo.length; if (ciclo[k] === null || cuenta(ciclo[k]) < C) { sig = ciclo[k]; break; } }
      if (sig === null && cur === null) return aviso(rivales ? "Los dos círculos están llenos. Toca una rodeada para cambiarla." : `Ya tienes ${PIZ_NUM[C]} rodeadas. Toca una para borrar su círculo.`);
      marca[i] = sig;
      sig === null ? desrodear(b) : rodear(b, sig);
      contar();
    });
    $("#pizOk").onclick = () => {
      // En oro, los colores pueden ir al revés: el círculo blanco puede ser de cualquiera de las dos reglas
      const bienCon = m => pruebas.filter((x, i) => x.g >= 0 && marca[i] === m[x.g]).length;
      const mejor = (rivales ? [[0, 1], [1, 0]] : [[0, 1]]).reduce((a, m) => (bienCon(m) > bienCon(a) ? m : a));
      const bien = bienCon(mejor), ok = bien === total;
      if (!intentos) registrar("9.1", ok, null, rivales ? "observar (rivales)" : "observar", regla);
      intentos++;
      if (!ok && intentos < 2) {
        const pista = cfg.sinPista ? "Mira cada una con lupa de diamante." : `Pista: ${subs.map(s => s.pista).join(" ")}`;
        pizDecir(`Tienes ${bien} de ${total} bien ${rivales ? "colocadas" : "rodeadas"}. ${rivales ? "Alguna está en el círculo que no es, o se ha colado." : "Entre tus círculos hay alguna intrusa."} ${pista}`, "pensativo");
        return;
      }
      cerrado = true;
      colorDe = mejor;
      $$(".piz-p").forEach(b => {
        const i = Number(b.dataset.i), x = pruebas[i];
        if (x.g < 0) { desrodear(b); b.classList.add("fuera"); return; }
        if (rivales) { if (marca[i] !== colorDe[x.g]) { rodear(b, colorDe[x.g]); b.classList.add("corregida"); } }
        else if (marca[i] === null) rodear(b, 1);   // las que faltaban, en tiza amarilla
      });
      pizDecir(ok
        ? (rivales ? "¡Buen ojo! Dos grupos, cada uno en su círculo. Ahora, la pregunta de detective: ¿qué regla explica cada círculo?" : `¡Buen ojo! Esas ${PIZ_NUM[C]} tienen algo en común. Ahora, la pregunta de detective: ¿qué regla lo explica?`)
        : (rivales ? `Te lo enseño: cada una en su círculo (las que he cambiado parpadean). ${cfg.sinPista ? "" : subs.map(s => s.pista).join(" ")}`
                   : `Te lo enseño: son estas ${PIZ_NUM[C]} (las de tiza amarilla, también). ${sub.pista}`), ok ? "contento" : "neutral");
      $("#pizAcc").innerHTML = `<button class="flecha" id="pizSig">Formular la hipótesis ▸</button>`;
      $("#pizSig").onclick = paso2;
    };
  };

  /* Paso 2 · Hipótesis: la buena (o las dos buenas, en oro); las malas se tachan y se dice por qué */
  const paso2 = () => {
    pizPasos(2);
    $("#pizAcc").innerHTML = "";
    pizDecir(rivales
      ? "Dos círculos, dos reglas. Entre estas cuatro hipótesis hay dos buenas: una explica el círculo blanco y la otra, el amarillo. Encuéntralas."
      : `¿Qué regla explica las ${PIZ_NUM[C]} rodeadas y deja fuera a las otras ${PIZ_NUM[N - C]}? Elige la hipótesis buena.`);
    $("#pizZona").innerHTML = `<div class="piz-hipotesis ${hips.length > 3 ? "cuatro" : ""}">${hips.map((h, k) => `<button class="piz-pizarrin" data-k="${k}"><span>${pizTxt(h.texto)}</span><i class="piz-marca"></i></button>`).join("")}</div>`;
    let primera = true;
    const halladas = new Set();
    $$(".piz-hipotesis .piz-pizarrin").forEach(b => b.onclick = () => {
      const h = hips[Number(b.dataset.k)];
      if (b.classList.contains("tachada") || b.classList.contains("buena")) return;
      if (primera) { registrar("9.1", h.valor === "buena", null, `hipótesis ${h.valor}`, regla); primera = false; }
      if (h.valor !== "buena") {
        b.classList.add("tachada");
        pizDibujar(b.querySelector("span"), pizTrazoTachon, "tachon", [6, 4]);
        b.insertAdjacentHTML("beforeend", `<em class="piz-veredicto">${h.valor === "otra" ? "no encaja" : `demasiado ${h.valor}`}</em>`);
        const testigo = (h.prueba || []).find(p => pruebas.some(x => x.p === p)) || h.prueba?.[0] || "";
        pizDecir(String(h.porque || "").replace("{p}", testigo), "pensativo");
        const i = pruebas.findIndex(x => x.p === testigo);
        if (i >= 0) {
          const pb = $(`.piz-p[data-i="${i}"]`);
          pb.querySelector(".subrayado")?.remove();
          pizDibujar(pb, pizTrazoSubrayado, "subrayado rosa", [6, 4]);
          pb.classList.remove("aviso"); void pb.offsetWidth; pb.classList.add("aviso");
        }
        return;
      }
      halladas.add(h.g);
      b.classList.add("buena");
      if (rivales) { b.classList.add(`c${colorDe[h.g]}`); b.insertAdjacentHTML("beforeend", `<em class="piz-veredicto circulo">círculo ${color(h.g).nombre}</em>`); }
      pizDibujar(b.querySelector(".piz-marca"), pizTrazoVisto, "visto", [0, 0]);
      if (halladas.size < subs.length) {
        primera = true;   // la búsqueda de la segunda buena también cuenta
        pizDecir(`¡Eso es! Esa explica el círculo ${color(h.g).nombre}. ${h.porque || ""} Ahora busca la del otro círculo.`, "contento");
        return;
      }
      $$(".piz-hipotesis .piz-pizarrin").forEach(x => (x.disabled = true));
      pizDecir(rivales
        ? `¡Las dos! ${h.porque || "Cada hipótesis explica su círculo y deja fuera a las coladas."} Pero un buen detective no se fía hasta ponerlas a prueba.`
        : `¡Eso es! ${h.porque || `Explica las ${PIZ_NUM[C]} pruebas rodeadas y deja fuera a las otras ${PIZ_NUM[N - C]}.`} Pero un buen detective no se fía de una hipótesis hasta ponerla a prueba.`, "contento");
      $("#pizAcc").innerHTML = `<button class="flecha" id="pizSig">Ponerla${rivales ? "s" : ""} a prueba ▸</button>`;
      $("#pizSig").onclick = paso3;
    });
  };

  /* Paso 3 · Contraejemplo: la excepción que rompe la regla, la que la confirma o la que no va en ningún círculo */
  const explicar = x => {
    const s = subs[Math.max(0, x.g)];
    if (modo === "excepcion") return `«${x.p}» es la excepción: ${conPlural(s.excepcion, x.p)}`;
    if (modo === "intrusa") return `«${x.p}» está bien escrita, pero no cumple ${rivales ? "ninguna de las dos reglas" : "la regla"}.`;
    return `«${x.p}» cumple la regla: ${conPlural(s.si, x.p)}`;
  };
  const paso3 = () => {
    $("#pizAcc").innerHTML = "";
    $("#pizZona").innerHTML = "";
    pizBorrar(() => {
      pizPasos(3);
      $("#pizCont").innerHTML = `${htmlHipotesis()}<div class="piz-pruebas nuevas ${frases ? "frases" : ""} ${nuevas.length > 3 ? "muchas" : ""}">${nuevas.map((x, i) => htmlPrueba(x, i, "nueva")).join("")}</div>`;
      pizAjustar();
      const n = pizMay(PIZ_NUM[nuevas.length]);
      pizDecir(rivales
        ? (modo === "excepcion" ? `${n} pruebas nuevas. Dos van cada una a su círculo, pero hay una que rompe su regla: es la excepción. ¿Cuál es?`
                                : `${n} pruebas nuevas. Dos van cada una a su círculo, pero hay una que no va en ninguno. ¿Cuál es?`)
        : objetivos === 2
          ? (modo === "excepcion" ? `${n} pruebas nuevas. Dos de ellas rompen la regla: son excepciones. Encuentra las dos.`
                                  : `${n} pruebas nuevas. Dos no cumplen la regla, aunque lo parezca: son los contraejemplos. Encuentra los dos.`)
          : modo === "excepcion" ? `${n} pruebas nuevas. Una de ellas rompe la regla: es la excepción. ¿Cuál es?`
                                 : `${n} pruebas nuevas. Solo una cumple la regla. ¿Cuál la confirma?`);
      let primera = true, halladas = 0, hecho = false;
      $$(".piz-p.nueva").forEach(b => b.onclick = () => {
        if (hecho || b.classList.contains("tachada") || b.classList.contains("rodeada")) return;
        const x = nuevas[Number(b.dataset.i)];
        if (primera) { anotar9(x.ok, x.p, { excepcion: "contraejemplo", intrusa: "contraejemplo", confirma: "confirmación" }[modo]); primera = false; }
        if (!x.ok) {
          b.classList.add("tachada");
          pizDibujar(b, pizTrazoTachon, "tachon rosa", [6, 2]);
          pizDecir(modo === "confirma"
            ? `«${x.p}» no cumple la regla. Vuelve a leer la hipótesis de la pizarra.`
            : rivales ? `«${x.p}» va en el círculo ${color(x.g).nombre}: ${conPlural(subs[x.g].si, x.p)} Busca otra.`
                      : `«${x.p}» cumple la regla: ${conPlural(sub.si, x.p)} Busca ${objetivos === 2 ? "las que no la cumplen" : "la que no la cumple"}.`, "pensativo");
          return;
        }
        halladas++;
        b.classList.add("rodeada");
        pizDibujar(b, pizTrazoCirculo, "circulo amarilla");
        if (halladas < objetivos) {
          primera = true;   // el segundo contraejemplo también cuenta
          pizDecir(`¡Una! ${explicar(x)} Te queda otra.`, "contento");
          return;
        }
        hecho = true;
        pizDecir(`${modo === "confirma" ? "¡Confirmada!" : "¡Pillada!"} ${explicar(x)}`, modo === "confirma" ? "contento" : "sorprendido");
        $("#pizAcc").innerHTML = `<button class="flecha" id="pizSig">Tu ejemplo ▸</button>`;
        $("#pizSig").onclick = paso4;
      });
    });
  };

  /* Paso 4 · Tu ejemplo: si está en el banco, «¡en el archivo!»; si no, se acepta y lo revisa el maestro.
     En oro se pide para uno de los dos círculos; en diamante tiene que ser difícil (nivel 2-3) */
  const gObj = rivales ? Math.floor(Math.random() * 2) : 0;
  const obj = subs[gObj];
  const paso4 = () => {
    $("#pizAcc").innerHTML = "";
    pizBorrar(() => {
      pizPasos(4);
      $("#pizCont").innerHTML = `${htmlHipotesis()}
        <label class="piz-tuyo"><span>${rivales ? `Para el círculo ${color(gObj).nombre}:` : "Tu ejemplo:"}</span>
          <input id="pizResp" class="piz-entrada ${frases ? "frase" : ""}" maxlength="${frases ? 40 : 24}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Escribe tu ejemplo"></label>`;
      const que = frases ? "una frase tuya" : "un ejemplo tuyo";
      pizDecir(rivales
        ? `Y ahora lo más difícil: ${que} para el círculo ${color(gObj).nombre}, que no esté en la pizarra. Escríbelo con tu mejor letra.`
        : cfg.propioDificil
          ? `Y ahora, la prueba de maestro detective: ${que} que cumpla la regla, que no esté en la pizarra… y que no sea de los fáciles. Nada de ${frases ? "frases cortitas" : "palabras cortitas"}.`
          : `Y ahora lo más difícil: ${que} que cumpla la regla y que no esté en la pizarra. Escríbel${frases ? "a" : "o"} con tu mejor letra.`);
      $("#pizAcc").innerHTML = `<button class="boton-sello" id="pizOk">Escribir en la pizarra</button>`;
      const inp = $("#pizResp");
      inp.focus();
      const rx = rxs[gObj], rxOtra = rivales ? rxs[1 - gObj] : null;
      const otra = rivales ? subs[1 - gObj] : null;
      const delBanco = new Set([...obj.ejemplos.map(pizP), ...ACA.palabras.filter(w => w.regla === regla && (!rx || rx.test(norm(w.p))) && !(rxOtra && rxOtra.test(norm(w.p)))).map(w => w.p)].map(clave));
      // Lo difícil (diamante): nivel del banco; si no está, por su largo (como los ejemplos de nivel 3 de la subregla)
      const largo = x => (frases ? x.split(" ").length : [...norm(x)].length);
      const largoDificil = Math.min(frases ? 5 : 7, ...obj.ejemplos.filter(x => pizNv(x) === 3).map(x => largo(pizP(x))));
      const nivelDe = (v, k) => {
        const e = obj.ejemplos.find(x => clave(pizP(x)) === k) || ACA.palabras.find(w => clave(w.p) === k && w.nivel);
        return e ? pizNv(e) : largo(v) >= largoDificil ? 2 : 1;
      };
      const ideas = restoEj[gObj].filter(x => !enPizarra.has(clave(x)) && (!cfg.propioDificil || nivelDe(x, clave(x)) >= 2));
      let registrado = false, dudas = 0, hecho = false, ideaDada = null;
      const anotar = (ok, v, detalle) => { if (!registrado) { registrado = true; anotar9(ok, v, detalle); } };
      // Un ejemplo propio que no está en el banco se guarda siempre para el maestro, aunque antes hubiera un fallo
      const paraRevisar = v => {
        if (!registrado) anotar(true, v, "ejemplo propio (revisar)");
        const e = P.eventos.findLast(x => x.detalle?.startsWith("ejemplo propio"));
        if (e && e.palabra !== v) { e.fallo = e.palabra; e.palabra = v; e.detalle = "ejemplo propio (revisar)"; }   // el primer intento sigue contando para la nota
      };
      const darIdea = () => {
        if (dudas < 2 || $("#pizAyuda")) return;
        $("#pizAcc").insertAdjacentHTML("afterbegin", `<button class="boton-papel" id="pizAyuda">Dame una idea</button>`);
        $("#pizAyuda").onclick = () => {
          anotar(false, null, "ejemplo propio (ayuda)");
          const idea = ideas[0] || pizP(obj.ejemplos.find(x => !enPizarra.has(clave(pizP(x)))) || obj.ejemplos[0]);
          ideaDada = idea;   // la idea que da Anselmo se acepta siempre (aunque sea corta o fácil)
          pizDecir(`Te doy una del archivo: «${idea}». Escríbela tú en la pizarra.`, "neutral");
          inp.value = ""; inp.focus();
        };
      };
      const comprobar = () => {
        if (hecho) return;
        const v = inp.value.trim().replace(/\s+/g, " ");
        if (!v) return;
        const k = clave(v);
        const esIdea = ideaDada !== null && k === clave(ideaDada);
        const enArchivo = esIdea || delBanco.has(k);
        if (!esIdea) {
          if (!frases && v.includes(" ")) return pizDecir("Una sola palabra, por favor. La pizarra no es tan grande.", "pensativo");
          // Los ejemplos del archivo valen aunque sean cortos («¡Socorro!»)
          if (frases && !enArchivo && v.split(" ").length < 3) return pizDecir("Escribe una frase entera, con al menos tres palabras.", "pensativo");
          if (enPizarra.has(k)) return pizDecir(`«${v}» ya ha salido en la pizarra. Piensa en ${frases ? "una frase tuya" : "una palabra tuya"}.`, "pensativo");
          if ((obj.contraejemplos || []).map(clave).includes(k)) { anotar(false, v, "ejemplo propio"); return pizDecir(`¡Cuidado! «${v}» es justo una excepción: no sirve como ejemplo de la regla. Prueba con otro.`, "sorprendido"); }
          if (otra && (otra.ejemplos.some(x => clave(pizP(x)) === k) || (rxOtra && rxOtra.test(prep(v))))) {
            anotar(false, v, "ejemplo propio");
            return pizDecir(`«${v}» va en el otro círculo, el ${color(1 - gObj).nombre}. Para el ${color(gObj).nombre}, prueba con otro.`, "pensativo");
          }
          if (obj.relleno.map(clave).includes(k)) { anotar(false, v, "ejemplo propio"); return pizDecir(`«${v}» está bien escrita, pero no cumple la regla. Prueba con otro.`, "pensativo"); }
          if (!enArchivo && rx && !rx.test(prep(v))) {
            dudas++;
            pizDecir(`Mmm… no me cuadra con la regla. Léela otra vez y prueba con otro.${cfg.sinPista ? "" : ` Pista: ${obj.pista}`}`, "pensativo");
            return darIdea();
          }
          if (cfg.propioDificil && nivelDe(v, k) < 2) {
            dudas++;
            pizDecir(`«${v}» cumple la regla, pero es demasiado fácil para un maestro detective. Busca ${frases ? "una frase más larga" : "una palabra más larga o menos corriente"}.`, "pensativo");
            return darIdea();
          }
        }
        hecho = true;
        if (enArchivo) anotar(true, v, "ejemplo propio"); else paraRevisar(v);
        inp.replaceWith(Object.assign(document.createElement("span"), { className: `piz-escrito ${frases ? "frase" : ""}`, textContent: v }));
        const caja = $(".piz-escrito");
        pizDibujar(caja, pizTrazoCirculo, `circulo ${rivales ? color(gObj).clase : "amarilla"}`, [16, 8]);
        caja.insertAdjacentHTML("beforeend", enArchivo
          ? `<em class="piz-sello">★ ¡en el archivo!</em>`
          : `<em class="piz-sello revisar">? lo revisará tu maestro</em>`);
        pizDecir(enArchivo
          ? `¡En el archivo! «${v}» cumple la regla. Ya tienes tu propio ejemplo.`
          : `No lo tengo en mi archivo, pero me lo apunto: tu maestro lo revisará. Me parece un buen ejemplo.`, "contento");
        $("#pizAcc").innerHTML = `<button class="flecha" id="pizSig">Ver la confirmación ▸</button>`;
        $("#pizSig").onclick = final;
      };
      $("#pizOk").onclick = comprobar;
      inp.onkeydown = ev => { if (ev.key === "Enter") comprobar(); };
    });
  };

  /* Final · La ficha de Mateo confirma la regla (o las dos) descubierta */
  const final = () => {
    pizPasos(5);
    const ficha = D.reglas[regla]?.ficha;
    const puntos = [...new Set(subs.map(s => s.punto))];
    pizDecir(`Caso cerrado. Lo que has descubierto con tiza coincide con el Archivo de Mateo. Míralo:`, "contento");
    $("#pizZona").innerHTML = ficha ? `<div class="piz-ficha ${puntos.length > 1 ? "doble" : ""}">
        <span class="piz-ficha-sello">Confirmado</span>
        <small>${esc(ficha.titulo)} · ${subs.map(s => esc(s.nombre)).join(" · ")}</small>
        ${puntos.map(i => `<p>${esc(ficha.puntos[i] || ficha.puntos[0])}</p>`).join(" ")}
        <button class="boton-papel" id="pizFicha">Ver la ficha completa</button></div>` : "";
    $("#pizFicha")?.addEventListener("click", () => abrirModal(`<div class="sello-archivo">ARCHIVO DE MATEO</div><h3>${esc(ficha.titulo)}</h3><ul class="ficha">${ficha.puntos.map((x, i) => `<li${puntos.includes(i) ? ` class="piz-destacado"` : ""}>${esc(x)}</li>`).join("")}</ul>`, "ventana-archivo"));
    $("#pizAcc").innerHTML = `<button class="flecha" id="pizFin">Terminar ▸</button>`;
    $("#pizFin").onclick = () => {
      const st2 = estadoPiz();
      st2.vistas[regla] = [...new Set([...(st2.vistas[regla] || []), ...subs.map(s => s.id)])];
      guardar(clavePiz(), st2);
      const s = estadoAca(); s.leccionVista[regla] = s.sesion; guardarAca(s);   // ya ha visto la ficha hoy
      const volver = ACA.alTerminar;   // si se vino de la preparación de un caso, «Otra regla» conserva el camino de vuelta
      terminarActividad(sl, turno);
      const seguir = $("#momentoSeguir");
      if (seguir) {
        seguir.insertAdjacentHTML("afterend", `<button class="boton-papel piz-otra" id="pizOtra">Otra regla ▸</button>`);
        $("#pizOtra").onclick = () => {
          cerrarModal();
          ACA.alTerminar = volver ? { boton: volver.boton, ir: volver.ir } : null;   // el paso ya está marcado: no se vuelve a marcar
          pizElegir(sl, null);
        };
      }
    };
  };

  paso1();
}
