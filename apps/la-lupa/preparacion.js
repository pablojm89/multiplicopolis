/* ============================================================
   AGENCIA LA LUPA · Preparación de cada caso en la Academia
   Decisión de Pablo (4/11/2026): antes de cada caso (que sirve como evaluación),
   el alumno se prepara en la Academia: descubre la regla, copia en su libreta
   los apuntes (reglas, esquemas, tablas) y practica. Así llega al caso preparado.
   ajustes.preparacion: "obligatoria" (por defecto: el caso se abre al terminar la ruta),
   "opcional" (se recomienda, pero se puede saltar) o "no".
   El estado vive en estadoAca().prep[<unidad>] = [ids de pasos hechos].
   ============================================================ */
"use strict";

const PREP_RAIZ = { apuntes: null };
async function cargarApuntes() {
  if (PREP_RAIZ.apuntes) return PREP_RAIZ.apuntes;
  try { PREP_RAIZ.apuntes = await leerJSON("datos/academia/apuntes.json"); } catch { PREP_RAIZ.apuntes = {}; }
  return PREP_RAIZ.apuntes;
}

/* Ejercicios de práctica de la Academia y los dos que mejor funcionan con cada regla (comprobado con cada regla) */
const EJERCICIO = {
  documento: { sala: "pupitre", act: "documento", icono: "📝", nombre: "Corrige el documento", desc: "En el Pupitre: encuentra y corrige las faltas que ha colado el Simulador." },
  parte: { sala: "pupitre", act: "parte", icono: "🗒️", nombre: "Rellena el parte", desc: "En el Pupitre: completa el parte de la agencia con las palabras de las pistas." },
  sintilde: { sala: "pupitre", act: "sintilde", icono: "⌨️", nombre: "La máquina sin tilde", desc: "En el Pupitre: devuelve las tildes que se ha comido la máquina de escribir." },
  sismografo: { sala: "laboratorio", act: "sismografo", icono: "📈", nombre: "El sismógrafo de sílabas", desc: "En el Laboratorio: separa en sílabas, busca la tónica y decide la tilde." },
  homofonos: { sala: "laboratorio", act: "homofonos", icono: "🔬", nombre: "El microscopio de homófonos", desc: "En el Laboratorio: palabras que suenan igual y se escriben distinto." },
  familias: { sala: "laboratorio", act: "familias", icono: "🌀", nombre: "La centrifugadora de palabras", desc: "En el Laboratorio: las familias de palabras heredan la letra… casi siempre." },
  deletreo: { sala: "centralita", act: "deletreo", icono: "📟", nombre: "El deletreo", desc: "En la Centralita: Lola deletrea por el walkie y tú escribes." },
  coma: { sala: "pizarra", act: "coma", icono: "✏️", nombre: "La coma que cambia el culpable", desc: "En la Pizarra: un signo mal puesto y acusamos a quien no es." },
};
const PRACTICAS = {
  "tildes-generales": ["sismografo", "sintilde"],
  "b-v-1": ["homofonos", "documento"],
  "h-1": ["homofonos", "deletreo"],
  "c-z-s": ["familias", "parte"],
  "ll-y": ["homofonos", "deletreo"],
  "g-j-dieresis": ["familias", "parte"],
  "diptongo-monosilabos": ["sintilde", "parte"],
  "d-z-finales": ["familias", "parte"],
  "mayusculas-puntuacion-1": ["coma", "parte"],
};

/* Sin sonido (por defecto), el dictado es «relámpago»: el mensaje se ve unos segundos y se escribe de memoria */
const pasoDictado = () => (ajustes.sonido === true
  ? { icono: "📻", nombre: "Dictado por radio", desc: "Escribe los mensajes de Lola sin perder una letra." }
  : { icono: "⚡", nombre: "Dictado relámpago", desc: "El télex enseña el mensaje unos segundos: memorízalo y escríbelo sin perder una letra." });

/* Los pasos de la ruta según las reglas del caso */
function pasosPreparacion(u) {
  const caso = u.caso && D.casos[u.caso];
  if (!caso || caso.diagnostico || !u.reglas?.length) return [];   // el piloto es la evaluación inicial: sin preparación
  if (u.reglas.length > 3) return [
    { id: "imprenta", sala: "imprenta", act: "pruebas", regla: "mezcla", icono: "🗞️", nombre: "Pruebas de imprenta", desc: "Galeradas con todas las reglas de la temporada mezcladas." },
    { id: "dictado", sala: "centralita", act: "dictado", regla: "mezcla", ...pasoDictado(), desc: "Mensajes con palabras de todas las reglas." },
    { id: "archivo", sala: "archivo", act: "fichas", regla: null, icono: "🗂️", nombre: "Tus fichas pendientes", desc: "Las palabras que más te han costado en la temporada." },
  ];
  const r = u.reglas[0];
  const [a, b] = PRACTICAS[r] || ["parte", "documento"];
  return [
    { id: "descubre", sala: "pizarra", act: "descubre-regla", regla: r, icono: "🧑‍🏫", nombre: "Descubre la regla", desc: "En la Pizarra, con don Anselmo: observa, formula la hipótesis y busca el contraejemplo." },
    { id: "apuntes", tipo: "apuntes", regla: r, icono: "📓", nombre: "Apuntes en tu libreta", desc: "Copia y completa el esquema de la regla. Te servirá para estudiar y para el caso." },
    { id: "practica", regla: r, ...EJERCICIO[a] },
    { id: "practica2", regla: r, ...EJERCICIO[b] },
    { id: "dictado", sala: "centralita", act: "dictado", regla: r, ...pasoDictado() },
  ];
}
const modoPreparacion = () => (ajustes.revision === true && ajustes.preparacion !== "no" ? "opcional" : ajustes.preparacion || "obligatoria");
const pasosHechos = u => (estadoAca().prep || {})[u.id] || [];
function preparacionLista(u) {
  const pasos = pasosPreparacion(u);
  const hechos = pasosHechos(u);
  return pasos.every(p => hechos.includes(p.id));
}
function marcarPaso(u, id) {
  const s = estadoAca();
  s.prep ??= {};
  s.prep[u.id] ??= [];
  if (!s.prep[u.id].includes(id)) s.prep[u.id].push(id);
  guardarAca(s);
}
/* ¿Hay que pasar por la ruta antes de abrir este caso? */
const debePrepararse = (u, mios) => modoPreparacion() !== "no" && pasosPreparacion(u).length && !mios.some(r => r.unidad === u.id) && !preparacionLista(u);
function etiquetaPreparacion(u, mios) {
  const pasos = pasosPreparacion(u);
  if (!pasos.length || modoPreparacion() === "no" || mios.some(r => r.unidad === u.id)) return "";
  const n = pasos.filter(p => pasosHechos(u).includes(p.id)).length;
  return n === pasos.length ? `<span class="prep-mini lista">🎓 Preparado</span>` : `<span class="prep-mini">🎓 Prepárate ${n}/${pasos.length}</span>`;
}

function vistaPreparacion(u) {
  P = null;
  ACA.alTerminar = null;
  const caso = D.casos[u.caso];
  const pasos = pasosPreparacion(u);
  const hechos = pasosHechos(u);
  const lista = pasos.every(p => hechos.includes(p.id));
  const puede = lista || modoPreparacion() === "opcional";
  pintarEscena(`
    <div class="tablon-cabecera">
      <h1 class="cartel">Preparación</h1>
      <span class="placa">Expediente ${esc(caso.numero)} · <b>${esc(caso.titulo)}</b></span>
      <button class="boton-papel" id="prepVolver">◂ Tablón</button>
    </div>
    ${htmlPersonaje({ id: "mateo", expresion: lista ? "contento" : "neutral", lado: "izq" }, "pequeno")}
    <div class="prep-panel">
      <p class="maquina-fija">${lista ? "¡Ya estás preparado! Repasa tus apuntes de la libreta si quieres… y abre el expediente." : `Antes de abrir este expediente, prepárate en la Academia: ${esc(u.reglas.length > 3 ? "repaso de toda la temporada" : D.reglas[u.reglas[0]]?.nombre || u.reglas[0])}. Haz los pasos en orden y apunta en tu libreta.`}</p>
      <ol class="prep-pasos">${pasos.map((p, k) => {
        const hecho = hechos.includes(p.id);
        const abierto = hecho || k === 0 || hechos.includes(pasos[k - 1].id);
        return `<li><button class="prep-paso ${hecho ? "hecho" : ""}" data-paso="${esc(p.id)}" ${abierto ? "" : "disabled"}>
          <span class="prep-icono">${hecho ? "✔" : p.icono}</span><span><b>${esc(p.nombre)}</b><small>${esc(p.desc)}</small></span><span class="prep-estado">${hecho ? "Hecho · repetir" : abierto ? "Empezar ▸" : "🔒"}</span></button></li>`;
      }).join("")}</ol>
      <div class="acciones">
        <button class="boton-sello" id="prepCaso" ${puede ? "" : "disabled"}>${lista ? "Abrir el expediente ▸" : modoPreparacion() === "opcional" ? "Saltar y abrir el expediente ▸" : "Termina la preparación para abrirlo"}</button>
      </div>
    </div>`, { fondo: "patio-academia", clase: "oscurecido" });
  $("#prepVolver").onclick = vistaTablon;
  $("#prepCaso").onclick = () => iniciarCaso(u);
  $$(".prep-paso:not([disabled])").forEach(b => b.onclick = () => lanzarPaso(u, pasos.find(p => p.id === b.dataset.paso)));
}

function lanzarPaso(u, paso) {
  if (paso.tipo === "apuntes") return vistaApuntes(u, paso);
  const sl = sala(paso.sala);
  if (sl.actividades) usarActividad(sl, paso.act);
  else sl.actividad = paso.act;
  ACA.nivel = nivelMaximo(paso.act);   // la ruta usa la lupa más alta que tenga el alumno en ese ejercicio
  ACA.alTerminar = { boton: "Volver a la preparación", ir: () => vistaPreparacion(u), marcar: () => marcarPaso(u, paso.id) };
  ACTIVIDADES[paso.act](sl, paso.regla, `prep:${u.id}:${paso.id}`);
}

/* Los apuntes de la regla, para copiarlos y completarlos en la libreta de papel */
function htmlEsquema(x) {
  if (x.tipo === "tabla") return `<table class="apunte-tabla"><thead><tr>${x.columnas.map(c => `<th>${esc(c)}</th>`).join("")}</tr></thead>
    <tbody>${x.filas.map(f => `<tr>${f.map(c => `<td class="${c ? "" : "hueco-apunte"}">${c ? esc(c) : "✎ completa"}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  if (x.tipo === "pasos") return `<ol class="apunte-pasos">${x.pasos.map(p => `<li>${esc(p)}</li>`).join("")}</ol>`;
  return `<ul class="apunte-lista">${(x.puntos || []).map(p => `<li>${esc(p)}</li>`).join("")}</ul>`;
}
async function vistaApuntes(u, paso) {
  const ap = (await cargarApuntes())[paso.regla];
  const ficha = D.reglas[paso.regla]?.ficha;
  const esquemas = ap?.esquemas || (ficha ? [{ tipo: "lista", titulo: ficha.titulo, puntos: ficha.puntos }] : []);
  const digital = ajustes.libreta === "digital";
  pintarEscena(`
    <h1 class="cartel titulo-escena">${esc(ap?.titulo || `Apuntes · ${D.reglas[paso.regla]?.nombre || paso.regla}`)}</h1>
    <div class="apuntes-hoja">
      <p class="apuntalo">📓 ${digital ? "Lee los apuntes con calma." : "Copia estos apuntes en tu libreta y completa los huecos ✎ con ejemplos tuyos."}</p>
      ${ap?.intro ? `<p class="apunte-intro">Mateo: «${esc(ap.intro)}»</p>` : ""}
      ${esquemas.map(x => `<section class="apunte"><h3>${esc(x.titulo || "")}</h3>${htmlEsquema(x)}</section>`).join("")}
      ${ap?.completar ? `<p class="apunte-completar">✎ ${esc(ap.completar)}</p>` : ""}
    </div>
    <div class="acciones abajo-centro"><button class="boton-papel" id="apVolver">◂ Preparación</button><button class="boton-sello" id="apHecho">${digital ? "Ya me lo sé" : "Ya lo he copiado en mi libreta"} ▸</button></div>`,
    { fondo: "sala-pupitre", clase: "oscurecido" });
  $("#apVolver").onclick = () => vistaPreparacion(u);
  $("#apHecho").onclick = () => { marcarPaso(u, paso.id); vistaPreparacion(u); };
}
