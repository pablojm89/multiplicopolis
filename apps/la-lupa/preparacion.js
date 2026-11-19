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
  try { return PREP_RAIZ.apuntes = await leerJSON("datos/academia/apuntes.json"); }
  catch { return {}; }
}

/* Ejercicios de práctica de la Academia y los dos que mejor funcionan con cada regla (comprobado con cada regla) */
const EJERCICIO = {
  documento: { sala: "pupitre", act: "documento", icono: "📝", nombre: "Corrige el documento", desc: "En el Pupitre: encuentra y corrige las faltas que ha colado el Simulador." },
  parte: { sala: "pupitre", act: "parte", icono: "🗒️", nombre: "Rellena el parte", desc: "En el Pupitre: completa el parte de la agencia con las palabras de las pistas." },
  sintilde: { sala: "pupitre", act: "sintilde", icono: "⌨️", nombre: "La máquina sin tilde", desc: "En el Pupitre: devuelve las tildes que se ha comido la máquina de escribir." },
  sismografo: { sala: "laboratorio", act: "sismografo", icono: "📈", nombre: "El sismógrafo de sílabas", desc: "En el Laboratorio: toca la sílaba que suena más fuerte y escribe la palabra con tilde o sin ella." },
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
    { id: "descubre", sala: "pizarra", act: "descubre-regla", regla: r, icono: "🧑‍🏫", nombre: "Descubre la regla", desc: "En la Pizarra, con don Anselmo: agrupa las palabras que se parecen y pon a prueba la regla que las une." },
    { id: "apuntes", tipo: "apuntes", regla: r, icono: "📓", nombre: "Apuntes en tu libreta", desc: "Abre la ficha para ver qué escribir en tu cuaderno. Usa los esquemas para consultar." },
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
  const siguientePaso = pasos.find(p => !hechos.includes(p.id));
  const lista = !siguientePaso;
  const opcional = modoPreparacion() === "opcional";
  const repaso = u.reglas.length > 3;
  const tema = repaso ? "Repaso de la temporada" : D.reglas[u.reglas[0]]?.nombre;
  pintarEscena(`
    <div class="tablon-cabecera">
      <h1 class="cartel">Preparación</h1>
      <span class="placa">Expediente ${esc(caso.numero)} · <b>${esc(caso.titulo)}</b></span>
      <button class="boton-papel" id="prepVolver">◂ Tablón</button>
    </div>
    ${htmlPersonaje({ id: "mateo", expresion: lista ? "contento" : "neutral", lado: "izq" }, "pequeno")}
    <div class="prep-panel">
      <p class="maquina-fija">${lista ? "¡Ya estás preparado! Abre el expediente cuando quieras." : `${pasos.filter(p => hechos.includes(p.id)).length} de ${pasos.length} pasos hechos${tema ? ` · ${esc(tema)}` : ""}`}</p>
      <ol class="prep-pasos">${pasos.map((p, k) => {
        const hecho = hechos.includes(p.id);
        const abierto = hecho || k === 0 || hechos.includes(pasos[k - 1].id);
        return `<li><button class="prep-paso ${hecho ? "hecho" : ""}" data-paso="${esc(p.id)}" ${p === siguientePaso ? 'aria-current="step"' : ""} ${abierto ? "" : "disabled"}>
          <span class="prep-icono">${hecho ? "✔" : p.icono}</span><span><b>${esc(p.nombre)}</b><small>${esc(p.desc)}</small></span><span class="prep-estado">${hecho ? "Hecho · repetir" : p === siguientePaso ? "Ahora ▸" : abierto ? "Empezar ▸" : "🔒 Después"}</span></button></li>`;
      }).join("")}</ol>
      <div class="acciones">
        ${!lista && opcional ? '<button class="boton-papel" id="prepCaso">Saltar y abrir el expediente</button>' : ""}
        ${lista ? '<button class="boton-sello" id="prepCaso">Abrir el expediente ▸</button>' : '<button class="boton-sello" id="prepSiguiente">Seguir con la preparación ▸</button>'}
      </div>
    </div>`, { fondo: "patio-academia", clase: "oscurecido", ayuda: repaso ? "repasoCaso" : "preparacion" });
  $("#prepVolver").onclick = vistaTablon;
  $("#prepCaso")?.addEventListener("click", () => iniciarCaso(u));
  $("#prepSiguiente")?.addEventListener("click", () => lanzarPaso(u, siguientePaso));
  $$(".prep-paso:not([disabled])").forEach(b => b.onclick = () => lanzarPaso(u, pasos.find(p => p.id === b.dataset.paso)));
}

function lanzarPaso(u, paso) {
  if (paso.tipo === "apuntes") return vistaApuntes(u, paso);
  const sl = sala(paso.sala);
  if (sl.actividades) usarActividad(sl, paso.act);
  else sl.actividad = paso.act;
  ACA.nivel = nivelMaximo(paso.act);   // la ruta usa la lupa más alta que tenga el alumno en ese ejercicio
  ACA.alTerminar = { boton: "Volver a la preparación", ir: () => vistaPreparacion(u), marcar: () => marcarPaso(u, paso.id) };
  lanzarActividadAca(sl, paso.regla, `prep:${u.id}:${paso.id}`);
}

/* Esquemas de consulta en la preparación y en el repaso libre */
function htmlEsquema(x) {
  if (x.tipo === "tabla") return `<table class="apunte-tabla"><thead><tr>${x.columnas.map(c => `<th>${esc(c)}</th>`).join("")}</tr></thead>
    <tbody>${x.filas.map(f => `<tr>${f.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  if (x.tipo === "pasos") return `<ol class="apunte-pasos">${x.pasos.map(p => `<li>${esc(p)}</li>`).join("")}</ol>`;
  return `<ul class="apunte-lista">${(x.puntos || []).map(p => `<li>${esc(p)}</li>`).join("")}</ul>`;
}
async function vistaApuntes(u, paso) {
  const escena = $("#escenario .capa");
  const ap = (await cargarApuntes())[paso.regla];
  if (escena.isConnected) pintarFichaApuntes(paso.regla, ap, { u, paso });
}

async function vistaIndiceApuntes() {
  const escena = $("#escenario .capa");
  const apuntes = await cargarApuntes();
  if (!escena.isConnected) return;
  const reglas = Object.keys(apuntes);
  if (!reglas.length) return aviso("No se han podido abrir los apuntes. Inténtalo otra vez.", "mal");
  pintarEscena(`
    <h1 class="cartel titulo-escena">Apuntes para estudiar</h1>
    <div class="apuntes-hoja opciones">
      ${reglas.map(id => `<button class="opcion" data-apunte="${esc(id)}">${esc(D.reglas[id]?.nombre || apuntes[id].titulo)}</button>`).join("")}
    </div>
    <div class="acciones abajo-centro"><button class="boton-papel" id="apVolver">◂ Patio</button></div>`,
    { fondo: "sala-archivo", clase: "oscurecido", ayuda: "estudio" });
  $("#apVolver").onclick = vistaPatio;
  $$("[data-apunte]").forEach(b => b.onclick = () => pintarFichaApuntes(b.dataset.apunte, apuntes[b.dataset.apunte]));
}

function pintarFichaApuntes(regla, ap, preparacion) {
  const ficha = D.reglas[regla]?.ficha;
  const esquemas = ap?.esquemas || (ficha ? [{ tipo: "lista", titulo: ficha.titulo, puntos: ficha.puntos }] : []);
  const papel = preparacion && ajustes.libreta !== "digital";
  const cuaderno = papel && ap?.cuaderno;
  pintarEscena(`
    <h1 class="cartel titulo-escena">${preparacion ? "Apuntes en tu libreta" : "Apuntes para estudiar"}</h1>
    <div class="apuntes-hoja">
      <h2>${esc(D.reglas[regla]?.nombre || regla)}</h2>
      ${cuaderno ? `<section class="apunte-cuaderno">
        <h3>Qué escribir en tu cuaderno</h3>
        <ol class="apunte-pasos">${cuaderno.map(tarea => `<li>${esc(tarea)}</li>`).join("")}</ol>
      </section><p class="apunte-intro">Consulta los esquemas de abajo cuando tengas dudas.</p>`
        : papel ? '<p class="apuntalo">📓 Escribe la regla con tus palabras y añade un ejemplo en tu cuaderno.</p>' : ""}
      ${ap?.intro ? `<p class="apunte-intro">Mateo: «${esc(ap.intro)}»</p>` : ""}
      ${esquemas.map(x => `<section class="apunte"><h3>${esc(x.titulo || "")}</h3>${htmlEsquema(x)}</section>`).join("")}
    </div>
    <div class="acciones abajo-centro">
      <button class="boton-papel" id="apVolver">◂ ${preparacion ? "Preparación" : "Todas las reglas"}</button>
      ${preparacion ? `<button class="boton-sello" id="apHecho">${papel ? "Ya lo he escrito en mi cuaderno" : "Ya me lo sé"} ▸</button>` : ""}
    </div>`,
    { fondo: "sala-pupitre", clase: "oscurecido", ayuda: preparacion ? (papel ? "apuntes" : "apuntesDigital") : "estudio" });
  if (!preparacion) {
    $("#apVolver").onclick = vistaIndiceApuntes;
    return;
  }
  const { u, paso } = preparacion;
  $("#apVolver").onclick = () => vistaPreparacion(u);
  $("#apHecho").onclick = () => { marcarPaso(u, paso.id); vistaPreparacion(u); };
}
