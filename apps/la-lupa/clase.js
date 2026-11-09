/* ============================================================
   AGENCIA LA LUPA · paquete de clase (avatares del alumnado)
   Los avatares son datos de menores: NUNCA van al repo ni a la web.
   El maestro importa el paquete (<clase>.lalupa-clase.json) desde la zona
   del maestro y queda guardado solo en ese dispositivo (IndexedDB).
   Sin paquete, el juego funciona igual (ficha con 🕵️).
   Formato: { tipo: "lalupa-clase", version: 1, clase, curso, alumnos: [{ alias, avatar: "data:image/webp;base64,…" }] }
   Se genera con herramientas/paquete_clase.py.
   ============================================================ */
"use strict";

const CLASE = { paquete: null };
const IDB_CLASE = { nombre: "lalupa-clase", almacen: "paquete", clave: "actual" };

function abrirIdbClase() {
  return new Promise((ok, mal) => {
    const r = indexedDB.open(IDB_CLASE.nombre, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(IDB_CLASE.almacen);
    r.onsuccess = () => ok(r.result);
    r.onerror = () => mal(r.error);
  });
}
async function idbClase(modo, accion) {
  const db = await abrirIdbClase();
  return new Promise((ok, mal) => {
    const tx = db.transaction(IDB_CLASE.almacen, modo);
    const req = accion(tx.objectStore(IDB_CLASE.almacen));
    tx.oncomplete = () => ok(req.result);
    tx.onerror = () => mal(tx.error);
  });
}
async function cargarPaquete() {
  try { CLASE.paquete = (await idbClase("readonly", s => s.get(IDB_CLASE.clave))) || null; } catch { CLASE.paquete = null; }
}
async function guardarPaquete(p) { await idbClase("readwrite", s => s.put(p, IDB_CLASE.clave)); CLASE.paquete = p; }
async function quitarPaquete() { await idbClase("readwrite", s => s.delete(IDB_CLASE.clave)); CLASE.paquete = null; }

const IMAGEN_SEGURA = /^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/;
function validarPaquete(p) {
  if (p?.tipo !== "lalupa-clase" || !Array.isArray(p.alumnos) || !p.alumnos.length) throw new Error("No es un paquete de clase de La Lupa.");
  const vistos = new Set();
  p.alumnos.forEach((a, i) => {
    if (typeof a.alias !== "string" || !a.alias.trim()) throw new Error(`Al avatar n.º ${i + 1} le falta el alias.`);
    if (vistos.has(a.alias)) throw new Error(`El alias «${a.alias}» está repetido.`);
    if (!IMAGEN_SEGURA.test(a.avatar || "")) throw new Error(`El avatar de «${a.alias}» no es una imagen válida.`);
    vistos.add(a.alias);
  });
  return p;
}

/* El perfil guarda el alias de su avatar (perfil.avatar) */
const avatarDe = alias => CLASE.paquete?.alumnos.find(a => a.alias === alias)?.avatar || null;
const avatarPerfil = pf => (pf ? avatarDe(pf.avatar || pf.nombre) : null);
function htmlAvatar(pf, clase = "") {
  const src = avatarPerfil(pf);
  return src ? `<img class="avatar-alumno ${clase}" src="${src}" alt="Avatar de ${esc(pf.nombre)}">` : "";
}
/* Alias del paquete que todavía no tienen perfil en este dispositivo */
const aliasLibres = () => (CLASE.paquete?.alumnos || []).filter(a => !perfiles.some(p => (p.avatar || p.nombre) === a.alias));

/* Sección de la zona del maestro */
function htmlPaqueteMaestro() {
  const p = CLASE.paquete;
  return `
    <h2>Paquete de clase (avatares del alumnado)</h2>
    <p class="aviso-maestro">Los avatares se guardan <strong>solo en este dispositivo</strong>: no se suben a internet ni al repositorio. Impórtalo en cada dispositivo del aula. Al crear su ficha, cada alumno elige su avatar por su alias de detective.</p>
    <div class="fila">
      <label class="boton-papel">Importar paquete… <input type="file" id="pqArchivo" accept=".json,application/json" hidden></label>
      ${p ? `<button class="boton-papel peligro" id="pqQuitar">Quitar paquete de este dispositivo</button>` : ""}
    </div>
    <p id="pqEstado">${p ? `Paquete cargado: <b>${esc(p.clase || "clase")}</b>, ${p.alumnos.length} avatares (${aliasLibres().length} sin ficha todavía).` : "No hay ningún paquete cargado."}</p>
    ${p ? `<div class="pq-lista">${p.alumnos.map(a => `<figure><img src="${a.avatar}" alt=""><figcaption>${esc(a.alias)}</figcaption></figure>`).join("")}</div>` : ""}`;
}
function activarPaqueteMaestro(repintar) {
  $("#pqArchivo").onchange = async ev => {
    const f = ev.target.files[0];
    if (!f) return;
    try {
      await guardarPaquete(validarPaquete(JSON.parse(await f.text())));
      repintar();
    } catch (e) { $("#pqEstado").textContent = `No se ha podido importar: ${e.message}`; }
  };
  if ($("#pqQuitar")) $("#pqQuitar").onclick = async () => { await quitarPaquete(); repintar(); };
}
