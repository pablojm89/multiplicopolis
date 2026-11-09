/* ============================================================
   AGENCIA LA LUPA · motor
   Escenario 16:9 escalado, arte (o huecos marcados), texto que se escribe,
   HUD de objetos, ventanas dentro del escenario, registro y notas por criterio,
   y los componentes de reto que comparten varias escenas.
   ============================================================ */
"use strict";

/* ── Utilidades ─────────────────────────────────────────────── */
const PREFIJO = "lalupa-";
const ANCHO = 1280, ALTO = 720;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const norm = s => String(s ?? "").normalize("NFC").trim().toLowerCase();
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const guardar = (k, v) => { try { localStorage.setItem(PREFIJO + k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } };
const cargar = (k, f) => { try { return JSON.parse(localStorage.getItem(PREFIJO + k)) ?? f; } catch { return f; } };
const movimientoReducido = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
async function leerJSON(ruta) {
  const r = await fetch(ruta, { cache: "no-cache" });
  if (!r.ok) throw new Error(`No se pudo leer ${ruta}`);
  return r.json();
}

/* ── Estado ─────────────────────────────────────────────────── */
const D = { reglas: {}, prog: null, casos: {}, arte: {} };
let perfiles = cargar("perfiles", []);
let resultados = cargar("resultados", []);
let ajustes = { libreta: "papel", codigoSello: "LUPA", ...cargar("ajustes", {}) };  // los cambia el maestro
let perfil = null;   // detective con la sesión abierta
let P = null;        // partida en curso

const NOMBRE_CRITERIO = {
  "1.2": "Respeto las lenguas y sus hablantes",
  "1.3": "Conozco el habla andaluza",
  "4.1": "Leo y comprendo textos",
  "4.2": "Analizo cómo está hecho un texto",
  "5.1": "Escribo con corrección",
  "6.1": "Busco y contrasto información",
  "6.3": "Uso internet con cabeza",
  "8.1": "Leo y disfruto la literatura",
  "8.3": "Conozco la cultura popular andaluza",
  "9.1": "Descubro y aplico reglas",
  "9.2": "Reviso textos y encuentro errores",
};

/* ── Escenario ──────────────────────────────────────────────── */
function ajustarEscenario() {
  const e = $("#escenario");
  const s = Math.min(innerWidth / ANCHO, innerHeight / ALTO);
  e.style.transform = `translate(-50%, -50%) scale(${s})`;
}
addEventListener("resize", ajustarEscenario);
/* El escenario nunca se desplaza: al dar el foco a un campo, el navegador puede hacer scroll dentro de un overflow:hidden */
document.addEventListener("scroll", ev => { const e = ev.target; if (e?.id === "escenario" && (e.scrollTop || e.scrollLeft)) { e.scrollTop = 0; e.scrollLeft = 0; } }, true);

/* Pinta una escena completa: fondo + contenido + capas de ventana y aviso */
function pintarEscena(html, { fondo = null, clase = "" } = {}) {
  $("#pagina").hidden = true;
  $("#marco").hidden = false;
  const e = $("#escenario");
  e.className = `escenario ${clase}`;
  e.innerHTML = `${capaFondo(fondo)}<div class="capa">${html}</div><div id="capaModal" class="capa-modal"></div><div id="toast" class="toast" role="status" aria-live="polite"></div>`;
  ajustarEscenario();
}

/* ── Arte (imagen real o hueco marcado) ─────────────────────── */
const arte = id => D.arte[id] || { nombre: id };
const SILUETA = `<svg class="silueta" viewBox="0 0 200 300" aria-hidden="true"><circle cx="100" cy="78" r="50"/><path d="M14 300 C14 185 56 140 100 140 C144 140 186 185 186 300 Z"/></svg>`;

function capaFondo(id) {
  if (!id) return `<div class="fondo fondo-papel"></div>`;
  const a = arte(id);
  if (a.listo) return `<div class="fondo" style="background-image:url('arte/${esc(id)}.webp')"></div>`;
  return `<div class="fondo pendiente" style="--c:${esc(a.color || "#c9a46a")}"><span class="etiqueta-arte">Fondo pendiente · ${esc(a.nombre)}</span></div>`;
}

/* Personaje: usa la expresión pedida, o la neutral si aún no existe; lo voltea para que mire al centro */
function htmlPersonaje(pj, extra = "") {
  if (!pj) return "";
  const a = arte(pj.id);
  const expr = pj.expresion || "neutral";
  const lado = pj.lado || "der";
  const listas = a.listas || [];
  const usar = listas.includes(expr) ? expr : listas.includes("neutral") ? "neutral" : null;
  // no_voltear: personajes con pistas asimétricas (la pulsera de Bruno va en la muñeca IZQUIERDA)
  const espejo = !a.no_voltear && ((lado === "der" && a.mira === "der") || (lado === "izq" && a.mira === "izq")) ? "espejo" : "";
  if (usar) return `<img class="personaje ${lado} ${espejo} ${extra}" src="arte/${esc(pj.id)}-${esc(usar)}.webp" alt="${esc(a.nombre)}">`;
  return `<div class="personaje pendiente ${lado} ${extra}" style="--c:${esc(a.color || "#8a6d4a")}">${SILUETA}<span class="etiqueta-arte">${esc(a.nombre)} · ${esc(expr)}</span></div>`;
}

/* Imagen de un objeto solo si ya está dibujado (para tarjetas y aparatos, sin hueco de «pendiente») */
const imgArte = (id, clase = "") => (id && arte(id).listo ? `<img class="${clase}" src="arte/${esc(id)}.webp" alt="" aria-hidden="true">` : "");

function htmlObjeto(id, clase = "") {
  if (!id) return "";
  const a = arte(id);
  if (a.listo) return `<img class="objeto ${clase}" src="arte/${esc(id)}.webp" alt="${esc(a.nombre)}">`;
  return `<div class="objeto pendiente ${clase}"><span class="emoji-obj">${esc(a.emoji || "📦")}</span><span class="etiqueta-arte">${esc(a.nombre)}</span></div>`;
}

/* ── Texto que se escribe solo (toca para completarlo) ──────── */
function maquina(el, texto, alFinal) {
  let terminado = false;
  let i = 0;
  const fin = () => {
    if (terminado) return;
    terminado = true;
    clearInterval(t);
    el.textContent = texto;
    el.classList.add("completo");
    alFinal?.();
  };
  if (movimientoReducido()) { el.textContent = texto; terminado = true; alFinal?.(); return; }
  el.textContent = "";
  const t = setInterval(() => {
    if (!el.isConnected) { terminado = true; clearInterval(t); return; }   // se ha cambiado de escena a medias
    i += 2; el.textContent = texto.slice(0, i); if (i >= texto.length) fin();
  }, 30);
  el.addEventListener("click", fin);
  el.title = "Toca para leerlo entero";
}

/* ── Marcado de faltas: {mal|bien} o {mal|bien|etiqueta} ───────
   La etiqueta es una regla de reglas.json (para la evaluación por regla)
   o, en los careos, la carta que demuestra la falta. */
const SEMILLA = /\{([^{}|]+)\|([^{}|]+)(?:\|([^{}|]+))?\}/g;
const visible = t => String(t ?? "").replace(SEMILLA, (_, mal) => mal);
const tieneFaltas = t => /\{[^{}|]+\|[^{}|]+/.test(String(t ?? ""));
function tokenizar(texto) {
  const out = [];
  let ultimo = 0;
  const plano = s => s.split(/(\p{L}+)/u).forEach(parte => { if (parte) out.push({ t: parte, palabra: /^\p{L}+$/u.test(parte) }); });
  for (const m of String(texto).matchAll(SEMILLA)) {
    plano(texto.slice(ultimo, m.index));
    const esRegla = m[3] && D.reglas[m[3]];
    const carta = esRegla ? null : m[3] || null;
    // Si la etiqueta es una carta, la regla es la que tiene esa carta
    const regla = esRegla ? m[3] : carta ? Object.keys(D.reglas).find(r => D.reglas[r].cartas?.some(c => c.id === carta)) || null : null;
    out.push({ t: m[1], palabra: true, error: true, bien: m[2], carta, regla });
    ultimo = m.index + m[0].length;
  }
  plano(texto.slice(ultimo));
  return out;
}
const quitarTilde = ch => ch.normalize("NFD").replace(/́/g, "").normalize("NFC");
const llevaTilde = (p, pos) => quitarTilde(p[pos]) !== p[pos];

/* ── Registro y notas ───────────────────────────────────────── */
/* La regla sale del elemento (si la trae), de la escena o de la única regla del caso */
function registrar(criterio, ok, palabra, detalle, regla) {
  const e = P.caso.escenas[P.i];
  regla = regla || e.regla || (P.caso.reglas.length === 1 ? P.caso.reglas[0] : null);
  P.eventos.push({ escena: P.i, tipo: e.tipo, criterio, ok, palabra: palabra || null, detalle, regla, at: new Date().toISOString() });
  if (!ok && palabra && detalle !== "falsa alarma") P.repasar.add(palabra);
}
/* Diagnóstico por regla (evaluación inicial): solo cuentan las correcciones escritas */
function diagnosticoPorRegla(eventos) {
  const por = {};
  eventos.filter(e => e.regla && e.criterio === "5.1").forEach(e => { por[e.regla] ??= { ok: 0, total: 0 }; por[e.regla].total++; if (e.ok) por[e.regla].ok++; });
  return Object.entries(por).map(([regla, v]) => ({ regla, aciertos: v.ok, intentos: v.total, porcentaje: Math.round(v.ok / v.total * 100) }));
}

/* ── Puntos y rangos de detective (juego + libreta sellada) ── */
const RANGOS = [
  { min: 0, nombre: "Novato" }, { min: 300, nombre: "Agente" }, { min: 800, nombre: "Detective" },
  { min: 1500, nombre: "Inspector/a" }, { min: 2500, nombre: "Detective de élite" },
];
function puntosResultado(r) {
  const juego = Math.round(r.notas.reduce((a, n) => a + n.nota, 0) / Math.max(1, r.notas.length) * 20);  // hasta 200
  const aura = r.pistas === 0 ? 50 : 0;                         // +aura por no pedir pistas
  const libreta = r.libreta ? r.libreta.puntos * 25 + 50 : 0;   // rúbrica (0-4) + sello
  return juego + aura + libreta;
}
const rangoDe = puntos => [...RANGOS].reverse().find(r => puntos >= r.min);
const calificacion = n => (n < 5 ? "IN" : n < 6 ? "SU" : n < 7 ? "BI" : n < 9 ? "NT" : "SB");
function calcularNotas(eventos) {
  const por = {};
  eventos.forEach(e => { por[e.criterio] ??= { ok: 0, total: 0 }; por[e.criterio].total++; if (e.ok) por[e.criterio].ok++; });
  return Object.entries(por).sort().map(([criterio, v]) => {
    const nota = Math.max(1, Math.round(v.ok / v.total * 100) / 10);
    return { criterio, aciertos: v.ok, intentos: v.total, nota, calificacion: calificacion(nota) };
  });
}
const letraCurso = curso => (curso === "5" ? "a" : "b");

/* ── Ventanas y avisos dentro del escenario ─────────────────── */
function aviso(msg, tipo = "") {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.className = `toast visible ${tipo}`;
  clearTimeout(aviso.temporizador);
  aviso.temporizador = setTimeout(() => (t.className = "toast"), 2800);
}
function abrirModal(html, clase = "") {
  const m = $("#capaModal");
  m.innerHTML = `<div class="ventana ${clase}" role="dialog" aria-modal="true">${html}<button class="cerrar" aria-label="Cerrar">✕</button></div>`;
  m.classList.add("visible");
  $(".cerrar", m).onclick = cerrarModal;
  m.onclick = e => { if (e.target === m) cerrarModal(); };
}
function cerrarModal() { const m = $("#capaModal"); if (m) { m.classList.remove("visible"); m.innerHTML = ""; } }
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#capaModal .momento")) cerrarModal(); });
function confirmar(mensaje, siAcepta, textoSi = "Sí") {
  abrirModal(`<h3>${esc(mensaje)}</h3><div class="acciones"><button class="boton-papel" id="cNo">Cancelar</button><button class="boton-sello" id="cSi">${esc(textoSi)}</button></div>`, "ventana-libreta");
  $("#cNo").onclick = cerrarModal;
  $("#cSi").onclick = () => { cerrarModal(); siAcepta(); };
}

/* ── HUD: objetos del detective ─────────────────────────────── */
const cartasCaso = () => P.caso.reglas.flatMap(r => D.reglas[r]?.cartas || []);
function htmlHUD() {
  const e = P.caso.escenas[P.i];
  const pistas = e.pistas || [];
  const usadas = P.pistas[P.i] || 0;
  return `
    <button class="hud-volver" id="hudVolver" aria-label="Volver al tablón">◂ Tablón</button>
    <div class="hud-expediente">EXPEDIENTE ${esc(P.caso.numero)} · ${P.i + 1}/${P.caso.escenas.length}</div>
    <div class="hud-objetos">
      <button class="hud-obj libreta" id="hudLibreta" aria-label="Libreta"><span class="ico">📓</span><span>Libreta</span>${P.piezas.length ? `<b class="globo">${P.piezas.length}</b>` : ""}</button>
      <button class="hud-obj carpeta" id="hudCarpeta" aria-label="Archivo de Mateo"><span class="ico">🗂️</span><span>Archivo</span></button>
      ${pistas.length ? `<button class="hud-obj lupa" id="hudLupa" aria-label="Pedir pista" ${usadas >= pistas.length ? "disabled" : ""}><span class="ico">🔍</span><span>Pista ${usadas}/${pistas.length}</span></button>` : ""}
    </div>`;
}
function activarHUD() {
  $("#hudVolver").onclick = () => confirmar("¿Volver al tablón? El caso se queda guardado: podrás continuarlo cuando quieras.", vistaTablon, "Volver al tablón");
  $("#hudLibreta").onclick = verLibreta;
  $("#hudCarpeta").onclick = verArchivo;
  $("#hudLupa")?.addEventListener("click", pedirPista);
}
function refrescarHUD() {
  const viejo = $(".hud");
  if (!viejo) return;
  viejo.innerHTML = htmlHUD();
  activarHUD();
}
function verLibreta() {
  if (ajustes.libreta === "papel" && !P.libretaAbierta) {
    abrirModal(`
      <h3>📓 Tu libreta es la de papel</h3>
      <p>Los detectives de La Lupa apuntan sus pistas en su libreta. Mírala ahí.</p>
      <p>¿Se te olvidó apuntar algo? Puedes verlo otra vez, pero quedará anotado en tu informe.</p>
      <div class="acciones"><button class="boton-sello" id="verIgual">Ver mis pistas</button></div>`, "ventana-libreta");
    $("#verIgual").onclick = () => { P.consultas++; guardarPartida(); P.libretaAbierta = true; verLibreta(); P.libretaAbierta = false; };
    return;
  }
  abrirModal(`
    <h3>Mi libreta</h3>
    <p class="etiqueta">Cifras encontradas</p>
    <div class="cifras">${P.piezas.length ? P.piezas.map(d => `<span class="cifra">${esc(d)}</span>`).join("") : `<em>Ninguna todavía</em>`}</div>
    ${P.cartas ? `<p class="etiqueta">Cartas de reglas</p><div class="cartas mini">${cartasCaso().map(c => `<div class="carta"><strong>${esc(c.titulo)}</strong><span>${esc(c.texto)}</span></div>`).join("")}</div>` : ""}
    ${Object.keys(P.pistas).length ? `<p class="etiqueta">Pistas pedidas</p>${P.caso.escenas.flatMap((e, i) => (e.pistas || []).slice(0, P.pistas[i] || 0)).map(p => `<p class="pista">🔍 ${esc(p)}</p>`).join("")}` : ""}`, "ventana-libreta");
}
function verArchivo() {
  const fichas = P.caso.reglas.map(r => D.reglas[r]?.ficha).filter(Boolean);
  abrirModal(`<div class="sello-archivo">ARCHIVO DE MATEO</div>${fichas.map(f => `<h3>${esc(f.titulo)}</h3><ul class="ficha">${f.puntos.map(p => `<li>${esc(p)}</li>`).join("")}</ul>`).join("")}`, "ventana-archivo");
}
function pedirPista() {
  const e = P.caso.escenas[P.i];
  const usadas = P.pistas[P.i] || 0;
  if (usadas >= (e.pistas || []).length) return;
  P.pistas[P.i] = usadas + 1;
  guardarPartida();
  abrirModal(`<h3>🔍 Pista ${usadas + 1}</h3><p class="pista grande">${esc(e.pistas[usadas])}</p>`, "ventana-libreta");
  refrescarHUD();
}

/* ── Pantallas de momento: pista conseguida / pista falsa ───── */
function momento({ titulo, texto, digito, personaje, tipo = "exito", boton = "Seguir", alSeguir }) {
  const apunta = ajustes.libreta === "papel" ? `<p class="apuntalo">📓 ¡Apúntalo en tu libreta!</p>` : `<p class="anotado">Anotado en tu libreta</p>`;
  const m = $("#capaModal");
  $("#toast")?.classList.remove("visible");
  m.innerHTML = `
    <div class="momento ${tipo}">
      ${htmlPersonaje(personaje, "momento-pj")}
      <div class="momento-texto">
        <h2 class="cartel">${esc(titulo)}</h2>
        ${digito ? `<div class="digito-grande">${esc(digito)}</div>${apunta}` : ""}
        ${texto ? `<p class="momento-p">${esc(texto)}</p>` : ""}
        <button class="flecha" id="momentoSeguir">${esc(boton)} ▸</button>
      </div>
    </div>`;
  m.classList.add("visible");
  m.onclick = null;
  $("#momentoSeguir").onclick = () => { cerrarModal(); alSeguir?.(); };
}
function recompensa(e) {
  const r = e.recompensa || {};
  if (r.digito) P.piezas.push(r.digito);
  refrescarHUD();
  momento({ titulo: "¡Pista conseguida!", texto: r.texto, digito: r.digito, personaje: { id: "lola", expresion: "contento", lado: "izq" }, alSeguir: siguiente });
}
function pistaFalsa(texto) {
  momento({ titulo: "¡Pista falsa!", texto, tipo: "fallo", personaje: { id: "lola", expresion: "pensativo", lado: "izq" }, boton: "Volver a mirar" });
}

/* ── Componentes de reto compartidos ────────────────────────── */
/* Palabra pulsable: ctx = { pendientes, conCarta, onCambio(), onCompleto() } */
function botonPalabra(tk, ctx, clase = "w") {
  const b = document.createElement("button");
  b.type = "button";
  b.className = clase;
  b.textContent = tk.t;
  b.onclick = () => pulsarPalabra(tk, b, ctx);
  return b;
}
/* Agrupa cada palabra con su puntuación pegada («¡Era», «canción.») para que no se separen al cambiar de línea */
function textoInteractivo(tokens, ctx) {
  const p = document.createElement("p");
  p.className = "texto-pistas";
  let grupo = null;
  const cerrar = () => { if (grupo) p.append(grupo); grupo = null; };
  const meter = nodo => { grupo ??= Object.assign(document.createElement("span"), { className: "nw" }); grupo.append(nodo); };
  tokens.forEach(tk => {
    if (tk.palabra) return meter(botonPalabra(tk, ctx));
    tk.t.split(/(\s+)/).forEach(parte => {
      if (!parte) return;
      if (/^\s+$/.test(parte)) { cerrar(); p.append(document.createTextNode(parte)); }
      else meter(document.createTextNode(parte));
    });
  });
  cerrar();
  return p;
}
function pulsarPalabra(tk, b, ctx) {
  if (tk.resuelta) return;
  if (!tk.error) {
    if (!tk.falsa) { tk.falsa = true; registrar("9.2", false, tk.t, "falsa alarma", tk.regla); }
    b.classList.remove("falsa"); void b.offsetWidth; b.classList.add("falsa");
    aviso(`«${tk.t}» está bien escrita. ¡Sigue buscando!`);
    return;
  }
  if (!tk.detectada) { tk.detectada = true; registrar("9.2", true, tk.bien, "detectada", tk.regla); }
  b.classList.add("sospechosa");
  const escribir = () => pedirCorreccion(tk, () => {
    tk.resuelta = true;
    b.textContent = tk.bien;
    b.classList.remove("sospechosa");
    b.classList.add("resuelta");
    ctx.pendientes--;
    ctx.onCambio?.(tk);
    if (ctx.pendientes === 0) ctx.onCompleto();
  });
  if (ctx.conCarta && tk.carta && !tk.cartaOk) elegirCarta(tk, escribir); else escribir();
}
/* Con muchas cartas (casos de repaso), se agrupan por regla en fichas compactas */
function htmlCartasElegibles() {
  const boton = c => `<button class="carta" data-id="${esc(c.id)}"><strong>${esc(c.titulo)}</strong><span>${esc(c.texto)}</span></button>`;
  if (cartasCaso().length <= 9) return `<div class="cartas grandes">${cartasCaso().map(boton).join("")}</div>`;
  return P.caso.reglas.filter(r => D.reglas[r]?.cartas?.length).map(r => `
    <section class="grupo-cartas"><h4>${esc(D.reglas[r].nombre)}</h4>
      <div class="cartas grandes compactas">${D.reglas[r].cartas.map(boton).join("")}</div></section>`).join("");
}
function elegirCarta(tk, despues) {
  abrirModal(`
    <h3>¿Qué carta lo demuestra?</h3>
    <p>¿Por qué <strong class="tachada">${esc(tk.t)}</strong> está mal escrita? Presenta tu prueba.</p>
    ${htmlCartasElegibles()}
    <p id="cartaMsg" class="msg"></p>`, "ventana-cartas");
  $$("#capaModal .carta").forEach(btn => btn.onclick = () => {
    const ok = btn.dataset.id === tk.carta;
    if (!tk.cartaIntentada) { tk.cartaIntentada = true; registrar("9.1", ok, tk.bien, "carta", tk.regla); }
    if (ok) { tk.cartaOk = true; despues(); return; }
    btn.classList.add("mal");
    btn.disabled = true;
    $("#cartaMsg").textContent = `Esa carta no lo demuestra. ${PISTA_REGLA[tk.regla || reglaActual()] || "Lee bien lo que dice cada carta."}`;
  });
}
/* Consejo tras un fallo, según la regla de la falta (o de la escena, o la única del caso) */
const reglaActual = () => P.caso.escenas[P.i].regla || (P.caso.reglas.length === 1 ? P.caso.reglas[0] : "");
const PISTA_REGLA = {
  "tildes-generales": "Busca la sílaba fuerte y mira cómo termina la palabra.",
  "b-v-1": "¿b o v? Piensa en la regla o en palabras de su familia.",
  "h-1": "¿No le faltará una letra que no suena?",
  "c-z-s": "Aunque suene igual, ¿va con c, con z o con s?",
  "ll-y": "¿ll o y? Piensa en otras palabras de su familia.",
  "g-j-dieresis": "¿g o j? ¿Y necesita diéresis (ü) para que suene la u?",
  "diptongo-monosilabos": "Las palabras de una sola sílaba, por regla general, no llevan tilde.",
  "d-z-finales": "Piensa en su plural: ¿termina en -des o en -ces?",
  "mayusculas-puntuacion-1": "Mira las mayúsculas: los nombres propios sí; los días de la semana, no.",
};
function pedirCorreccion(tk, hecho) {
  let fallos = 0;
  abrirModal(`
    <h3>¡Falta encontrada!</h3>
    <p>Escribe bien la palabra <strong class="tachada">${esc(tk.t)}</strong>:</p>
    <input id="corr" class="entrada" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Palabra corregida">
    <p id="corrMsg" class="msg"></p>
    <div class="acciones"><button class="boton-sello" id="corrOk">Comprobar</button></div>`, "ventana-libreta");
  const inp = $("#corr");
  inp.focus();
  const comprobar = () => {
    if (!inp.value.trim()) return;
    // Si la falta es solo de mayúsculas (andalucía → Andalucía), se compara exacto
    const soloMayus = tk.t.toLowerCase() === tk.bien.toLowerCase();
    const ok = soloMayus ? inp.value.normalize("NFC").trim() === tk.bien : norm(inp.value) === norm(tk.bien);
    if (!tk.intentada) { tk.intentada = true; registrar("5.1", ok, tk.bien, "corrección", tk.regla); }
    if (ok) { cerrarModal(); aviso(`¡Bien! Se escribe «${tk.bien}».`, "bien"); hecho(); return; }
    fallos++;
    $("#corrMsg").innerHTML = fallos >= 2
      ? `Se escribe <strong>${esc(tk.bien)}</strong>. Escríbela tú.`
      : `Todavía no. ${PISTA_REGLA[tk.regla || reglaActual()] || "Fíjate bien en cada letra."}`;
    inp.select();
  };
  $("#corrOk").onclick = comprobar;
  inp.onkeydown = ev => { if (ev.key === "Enter") comprobar(); };
}
