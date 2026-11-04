/* ============================================================
   AGENCIA LA LUPA · guardar en la nube (Google Apps Script + Hojas de Google)
   Opcional: solo funciona si el maestro pone la URL del Apps Script y el código de aula
   en la zona del maestro (ajustes.nube = { url, aula }). Sin eso, no se envía nada.
   - Cada resultado (caso, encargo, Academia) y el progreso del alumno se guardan en una cola
     local (lalupa-nube-cola) y se envían cuando hay conexión, en lotes (protocolo de backend/README.md).
   - «Recuperar mi detective»: en otro dispositivo, el alumno escribe su alias y se baja su progreso.
   Se usa el ALIAS como identificador: nunca el nombre real (datos de menores).
   Código del servidor y pasos para ponerlo en marcha: apps/la-lupa/NUBE.md y backend/apps-script/la-lupa.gs
   ============================================================ */
"use strict";

const NUBE = { cola: cargar("nube-cola", []), ultimoEnvio: cargar("nube-ultimo", null), enviando: false };
const nubeConf = () => ajustes.nube || {};
const nubeActiva = () => !!(nubeConf().url && nubeConf().aula);
const idAlumno = pf => norm(pf.avatar || pf.nombre).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ]+/g, "-").replace(/^-|-$/g, "");

function nubeEncolar(type, payload) {
  if (!nubeActiva()) return;
  NUBE.cola.push({ type, payload, app: "lalupa", at: new Date().toISOString() });
  NUBE.cola = NUBE.cola.slice(-800);
  guardar("nube-cola", NUBE.cola);
  setTimeout(nubeEnviar, 50);
}
async function nubeEnviar() {
  if (!nubeActiva() || NUBE.enviando || !NUBE.cola.length || navigator.onLine === false) return;
  NUBE.enviando = true;
  const items = NUBE.cola.slice(0, 40);
  try {
    // no-cors: el Apps Script no devuelve CORS al POST; no se puede leer la respuesta (ver backend/README.md)
    await fetch(nubeConf().url, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ app: "lalupa", classCode: nubeConf().aula, type: "batch", items }) });
    NUBE.cola = NUBE.cola.slice(items.length);
    guardar("nube-cola", NUBE.cola);
    NUBE.ultimoEnvio = new Date().toISOString();
    guardar("nube-ultimo", NUBE.ultimoEnvio);
  } catch { /* sin conexión: se reintenta luego */ }
  NUBE.enviando = false;
  if (NUBE.cola.length && navigator.onLine !== false) setTimeout(nubeEnviar, 1500);
}
addEventListener("online", () => nubeEnviar());
setInterval(() => nubeEnviar(), 60000);

/* Lo que se sube: sin los eventos detallados (pesan mucho); las notas por criterio sí */
const sinEventos = r => { const { eventos, notasLibreta, ...resto } = r; return resto; };
function resumenNota(r) {
  return {
    studentId: idAlumno({ nombre: r.nombre, avatar: perfiles.find(p => p.id === r.perfilId)?.avatar }), alias: r.nombre, curso: r.curso,
    tipo: r.contexto === "academia" ? "academia" : r.encargo ? "encargo" : "caso", unidad: r.unidad || r.sala, titulo: r.titulo || `Academia · ${r.sala}${r.actividad ? ` · ${r.actividad}` : ""}`,
    nivel: r.nivel || null, fecha: r.fecha, libreta: r.libreta ? r.libreta.puntos : null, diagnostico: !!r.diagnostico,
    notas: r.notas.map(n => ({ criterio: n.codigo || `${n.criterio}.${letraCurso(r.curso)}`, nota: n.nota, calificacion: n.calificacion, aciertos: n.aciertos, intentos: n.intentos })),
  };
}
function instantanea(pf) {
  return {
    studentId: idAlumno(pf), alias: pf.nombre, updatedAt: new Date().toISOString(),
    snapshot: { perfil: pf, resultados: resultados.filter(r => r.perfilId === pf.id).map(sinEventos), academia: cargar(`academia-${pf.id}`, {}), registrosAca: registrosAca.filter(r => r.perfilId === pf.id).map(sinEventos) },
  };
}
/* Enganches: los llaman app.js (informe, sello, perfil nuevo) y academia.js (fin de actividad) */
function nubeTrasResultado(r) {
  if (!nubeActiva()) return;
  nubeEncolar("grade", resumenNota(r));
  const pf = perfiles.find(p => p.id === r.perfilId);
  if (pf) nubeEncolar("progress", instantanea(pf));
}
function nubeNuevoAlumno(pf) { if (nubeActiva()) nubeEncolar("student", { studentId: idAlumno(pf), alias: pf.nombre, curso: pf.curso }); }

/* Recuperar el progreso en otro dispositivo */
async function nubeRecuperar(alias) {
  const id = idAlumno({ nombre: alias });
  const u = new URL(nubeConf().url);
  Object.entries({ app: "lalupa", classCode: nubeConf().aula, type: "progress", studentId: id }).forEach(([k, v]) => u.searchParams.set(k, v));
  const r = await fetch(u, { method: "GET" });
  const j = await r.json();
  const s = j?.progress?.snapshot;
  if (!j.ok || !s?.perfil) throw new Error("No hay ningún detective con ese alias en esta aula.");
  const yaEsta = perfiles.find(p => p.id === s.perfil.id) || perfiles.find(p => idAlumno(p) === id);
  const pf = yaEsta || s.perfil;
  if (!yaEsta) { perfiles.push(pf); guardar("perfiles", perfiles); }
  const ids = new Set(resultados.map(x => x.id));
  (s.resultados || []).forEach(x => { if (!ids.has(x.id)) resultados.push({ ...x, perfilId: pf.id, eventos: [] }); });
  guardar("resultados", resultados);
  const local = cargar(`academia-${pf.id}`, null);
  if (!local || (s.academia?.sesion || 0) >= (local.sesion || 0)) guardar(`academia-${pf.id}`, s.academia || {});
  const idsAca = new Set(registrosAca.map(x => x.id));
  (s.registrosAca || []).forEach(x => { if (!idsAca.has(x.id)) registrosAca.push({ ...x, perfilId: pf.id, eventos: [] }); });
  guardar("academia-registros", registrosAca);
  return pf;
}
function pedirRecuperar() {
  abrirModal(`
    <h3>☁️ Recuperar mi detective</h3>
    <p>Escribe tu alias de detective tal como lo pusiste en el otro dispositivo.</p>
    <input id="recAlias" class="entrada" autocomplete="off" aria-label="Alias">
    <p id="recMsg" class="msg"></p>
    <div class="acciones"><button class="boton-sello" id="recOk">Recuperar</button></div>`, "ventana-libreta");
  const inp = $("#recAlias");
  inp.focus();
  const ir = async () => {
    if (!inp.value.trim()) return;
    $("#recMsg").textContent = "Buscando en el archivo de la agencia…";
    try { const pf = await nubeRecuperar(inp.value.trim()); cerrarModal(); perfil = pf; vistaTablon(); aviso("¡Detective recuperado!", "bien"); }
    catch (e) { $("#recMsg").textContent = e.message.includes("alias") ? e.message : "No se ha podido conectar con la nube. Prueba más tarde."; }
  };
  $("#recOk").onclick = ir;
  inp.onkeydown = ev => { if (ev.key === "Enter") ir(); };
}

/* Sección de la zona del maestro */
function htmlNubeMaestro() {
  const c = nubeConf();
  return `
      <h2>Guardar en la nube (opcional)</h2>
      <p class="aviso-maestro">Con un Apps Script de Google (los pasos están en <code>apps/la-lupa/NUBE.md</code>), las notas y el progreso de cada detective se guardan en tu hoja de cálculo y el alumno puede seguir en otro dispositivo. Se envía el <b>alias</b>, nunca el nombre. Sin URL, no se envía nada.</p>
      <div class="fila">
        <label>URL del Apps Script: <input id="nubeUrl" value="${esc(c.url || "")}" placeholder="https://script.google.com/macros/s/…/exec" size="44"></label>
        <label>Código de aula: <input id="nubeAula" value="${esc(c.aula || "")}" maxlength="20" placeholder="5A-2027"></label>
        <button class="boton-papel" id="nubeGuardar">Guardar</button>
        <button class="boton-papel" id="nubeEnviar" ${nubeActiva() ? "" : "disabled"}>Enviar ahora</button>
      </div>
      <p id="nubeEstado">${nubeActiva() ? `Pendientes de enviar: <b>${NUBE.cola.length}</b>${NUBE.ultimoEnvio ? ` · último envío: ${esc(new Date(NUBE.ultimoEnvio).toLocaleString("es-ES"))}` : ""}` : "La nube no está configurada."}</p>`;
}
function activarNubeMaestro(repintar) {
  $("#nubeGuardar").onclick = () => {
    const url = $("#nubeUrl").value.trim(), aula = $("#nubeAula").value.trim();
    if (url && !/^https:\/\/script\.google\.com\/|^http:\/\/localhost/.test(url)) { $("#nubeEstado").textContent = "La URL tiene que ser la de un Apps Script (https://script.google.com/…)."; return; }
    ajustes = { ...ajustes, nube: url && aula ? { url, aula } : null };
    guardar("ajustes", ajustes);
    if (nubeActiva()) { perfiles.forEach(pf => { nubeNuevoAlumno(pf); nubeEncolar("progress", instantanea(pf)); }); nubeEncolar("ping", {}); }
    repintar();
  };
  $("#nubeEnviar").onclick = async () => { await nubeEnviar(); repintar(); };
}
