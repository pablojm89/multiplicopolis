/**
 * Agencia La Lupa · servidor en Google Apps Script (Hojas de Google)
 *
 * Proyecto PROPIO de La Lupa: no sustituye al Apps Script de Multiplicópolis.
 * Pasos para ponerlo en marcha: apps/la-lupa/NUBE.md
 *
 * Protocolo (el mismo que describe backend/README.md):
 *   POST (no-cors, text/plain) { app: "lalupa", classCode, type: "batch", items: [{ type, payload, app, at }] }
 *        tipos de item: student | grade | progress | ping
 *   GET  ?app=lalupa&classCode=…&type=progress&studentId=…  → { ok, progress: { snapshot, updatedAt } }
 *   GET  ?app=lalupa&classCode=…&type=ping                  → { ok: true }
 *
 * Hojas que crea solas: «Alumnos», «Notas» (una fila por criterio) y «Progreso» (una fila por alumno).
 * Solo se guardan alias, nunca nombres reales.
 */

const HOJAS = {
  Alumnos: ["fecha", "aula", "studentId", "alias", "curso"],
  Notas: ["fecha", "aula", "studentId", "alias", "curso", "tipo", "unidad", "titulo", "nivel", "criterio", "nota", "calificacion", "aciertos", "intentos", "libreta", "diagnostico"],
  Progreso: ["aula", "studentId", "alias", "actualizado", "datos"],
};
const TROZO = 45000; // límite de caracteres por celda (~50.000)

function hoja_(nombre) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let h = ss.getSheetByName(nombre);
  if (!h) { h = ss.insertSheet(nombre); h.appendRow(HOJAS[nombre]); h.setFrozenRows(1); }
  return h;
}
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.app !== "lalupa" || !body.classCode) return json_({ ok: false, error: "app o aula" });
    const aula = String(body.classCode).slice(0, 30);
    (body.items || []).forEach(it => {
      const p = it.payload || {};
      if (it.type === "student") hoja_("Alumnos").appendRow([it.at, aula, p.studentId, p.alias, p.curso]);
      if (it.type === "grade") (p.notas || []).forEach(n => hoja_("Notas").appendRow([
        p.fecha || it.at, aula, p.studentId, p.alias, p.curso, p.tipo, p.unidad, p.titulo, p.nivel, n.criterio, n.nota, n.calificacion, n.aciertos, n.intentos, p.libreta, p.diagnostico]));
      if (it.type === "progress") guardarProgreso_(aula, p);
    });
    return json_({ ok: true });
  } finally { lock.releaseLock(); }
}

function guardarProgreso_(aula, p) {
  const h = hoja_("Progreso");
  const datos = JSON.stringify(p.snapshot || {});
  const trozos = [];
  for (let i = 0; i < datos.length; i += TROZO) trozos.push(datos.slice(i, i + TROZO));
  const fila = [aula, p.studentId, p.alias, p.updatedAt].concat(trozos);
  const valores = h.getDataRange().getValues();
  for (let r = 1; r < valores.length; r++) {
    if (valores[r][0] === aula && valores[r][1] === p.studentId) {
      h.getRange(r + 1, 1, 1, h.getLastColumn()).clearContent();
      h.getRange(r + 1, 1, 1, fila.length).setValues([fila]);
      return;
    }
  }
  h.appendRow(fila);
}

function doGet(e) {
  const q = e.parameter || {};
  if (q.app !== "lalupa" || !q.classCode) return json_({ ok: false, error: "app o aula" });
  if (q.type === "ping") return json_({ ok: true });
  if (q.type === "progress") {
    const valores = hoja_("Progreso").getDataRange().getValues();
    for (let r = 1; r < valores.length; r++) {
      if (valores[r][0] === q.classCode && valores[r][1] === q.studentId) {
        const datos = valores[r].slice(4).filter(String).join("");
        return json_({ ok: true, progress: { snapshot: JSON.parse(datos || "{}"), updatedAt: valores[r][3] } });
      }
    }
    return json_({ ok: false, error: "no encontrado" });
  }
  return json_({ ok: false, error: "tipo" });
}
