/* ============================================================
   AGENCIA LA LUPA · Órdenes del director: cuestionarios de Wayground
   El maestro asigna un cuestionario en Wayground (antes Quizizz) y lo apunta en
   datos/wayground.json. Mientras no llegue la fecha de cierre, el tablón muestra una
   «orden del director Robles» con el enlace del alumno (wayground.com/join?gc=CÓDIGO),
   que se abre en otra pestaña. Decisión de Pablo (24/11/2026): en el tablón y
   configurado desde el archivo del repo, para que se vea en todos los dispositivos.
   El código caduca cuando termina la asignación en Wayground: por eso va en datos,
   con su fecha, y nunca fijo en el código. En el repo solo va el código, nunca
   nombres ni notas del alumnado.
   ============================================================ */
"use strict";

D.wayground = [];
const URL_WAYGROUND = "https://wayground.com/join?gc=";
/* Fecha de hoy en hora local (AAAA-MM-DD): la orden se ve hasta el final del día de cierre */
const hoyLocal = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

/* Lo que llega del archivo se valida: una orden mal escrita se ignora (y se avisa en la consola y en la zona del maestro) */
function sanearOrdenWayground(o) {
  if (!o || typeof o !== "object") return null;
  const codigo = String(o.codigo ?? "").replace(/\s/g, "");
  if (!/^\d{6,8}$/.test(codigo)) return null;
  if (typeof o.hasta !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(o.hasta)) return null;
  return {
    titulo: typeof o.titulo === "string" && o.titulo.trim() ? o.titulo.trim() : "Cuestionario de Wayground",
    codigo,
    hasta: o.hasta,
    curso: o.curso == null ? null : String(o.curso),
    reglas: Array.isArray(o.reglas) ? o.reglas.filter(r => typeof r === "string") : [],
    mensaje: typeof o.mensaje === "string" ? o.mensaje.trim() : "",
  };
}
let ordenesMalEscritas = 0;
async function cargarWayground() {
  try {
    const datos = await leerJSON("datos/wayground.json");
    const lista = Array.isArray(datos.ordenes) ? datos.ordenes : [];
    D.wayground = lista.map(sanearOrdenWayground).filter(Boolean);
    ordenesMalEscritas = lista.length - D.wayground.length;
    if (ordenesMalEscritas) console.warn(`datos/wayground.json: órdenes mal escritas: ${ordenesMalEscritas} (código de 6 a 8 cifras y «hasta» AAAA-MM-DD)`);
  } catch { D.wayground = []; /* sin archivo o sin red y sin copia: no hay órdenes */ }
}

const ordenVigente = o => o.hasta >= hoyLocal();
const ordenesWayground = curso => D.wayground.filter(o => ordenVigente(o) && (!o.curso || o.curso === String(curso)));

function cuandoCierra(hasta) {
  const hoy = hoyLocal();
  if (hasta === hoy) return "Se cierra <b>hoy</b>";
  const [a, m, d] = hasta.split("-").map(Number);
  const fecha = new Date(a, m - 1, d);
  const manana = new Date(); manana.setDate(manana.getDate() + 1);
  if (fecha.toDateString() === manana.toDateString()) return "Se cierra <b>mañana</b>";
  return `Abierto hasta el <b>${esc(fecha.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }))}</b>`;
}

/* Botón o aviso según haya conexión. El enlace solo funciona con internet: se dice con tacto */
function htmlSalidaWayground(o) {
  if (navigator.onLine === false) return `
      <span class="wg-sin-red">📡 Ahora mismo no hay conexión. El archivo de Wayground está fuera de la agencia: cuando vuelva el wifi, aquí aparecerá la puerta.</span>`;
  return `
      <a class="boton-sello wg-ir" href="${URL_WAYGROUND}${esc(o.codigo)}" target="_blank" rel="noopener">Ir al archivo de Wayground ↗</a>
      <small class="wg-nota">Se abre en otra pestaña y necesita internet. Pon el nombre que te indique tu maestro/a y, al terminar, vuelve aquí.</small>`;
}

function htmlOrdenesWayground(curso) {
  return ordenesWayground(curso).map((o, i) => {
    const reglas = o.reglas.map(r => D.reglas[r]?.nombre).filter(Boolean);
    const cara = arte("robles").listas?.includes("neutral") ? `<span class="wg-cara"><img src="arte/robles-neutral.webp" alt="El director Robles"></span>` : "";
    return `
    <article class="orden-wayground" data-wg="${i}"><span class="chincheta"></span>
      ${cara}
      <div class="wg-texto">
        <span class="wg-sello">ORDEN DEL DIRECTOR</span>
        <p class="wg-mensaje">${o.mensaje ? esc(o.mensaje) : "Detective, te espera una prueba en el archivo de Wayground. Demuestra lo que has aprendido en la agencia."}</p>
        <h3>${esc(o.titulo)}</h3>
        <p class="wg-datos">${cuandoCierra(o.hasta)}${reglas.length ? ` · ${esc(reglas.join(" · "))}` : ""}</p>
      </div>
      <div class="wg-salida">${htmlSalidaWayground(o)}</div>
    </article>`;
  }).join("");
}

/* Si cambia la conexión con el tablón abierto, la orden se actualiza sola */
function refrescarSalidasWayground() {
  if (!perfil) return;
  const ordenes = ordenesWayground(perfil.curso);
  $$(".orden-wayground").forEach(el => { const o = ordenes[Number(el.dataset.wg)]; if (o) el.querySelector(".wg-salida").innerHTML = htmlSalidaWayground(o); });
}
window.addEventListener("online", refrescarSalidasWayground);
window.addEventListener("offline", refrescarSalidasWayground);

/* Zona del maestro: qué órdenes hay y cómo se cambian */
function htmlWaygroundMaestro() {
  const filas = D.wayground.slice().sort((a, b) => b.hasta.localeCompare(a.hasta)).map(o => `<tr>
      <td>${esc(o.titulo)}</td><td>${o.curso ? `${esc(o.curso)}.º` : "Todos"}</td>
      <td><a href="${URL_WAYGROUND}${esc(o.codigo)}" target="_blank" rel="noopener">${esc(o.codigo)}</a></td>
      <td>${esc(new Date(o.hasta + "T12:00").toLocaleDateString("es-ES"))}</td>
      <td class="${ordenVigente(o) ? "celda-bien" : "celda-mal"}">${ordenVigente(o) ? "En el tablón" : "Caducada"}</td></tr>`).join("");
  return `
      <h2>Wayground en el tablón</h2>
      <p class="aviso-maestro">Las órdenes del director con un cuestionario de Wayground salen en el tablón hasta su fecha de cierre (incluida) y se abren en otra pestaña. Se cambian en <code>datos/wayground.json</code> (título, código, fecha de cierre y, si quieres, curso, reglas y mensaje); al publicarlo en GitHub llega a todos los dispositivos. Pon la misma fecha de cierre que la asignación de Wayground: después el código deja de funcionar.</p>
      ${ordenesMalEscritas ? `<p class="aviso-maestro"><b>Ojo:</b> ${ordenesMalEscritas === 1 ? "una orden del archivo está mal escrita y no sale" : `${ordenesMalEscritas} órdenes del archivo están mal escritas y no salen`} (el código lleva de 6 a 8 cifras y la fecha va como AAAA-MM-DD).</p>` : ""}
      ${filas ? `<div class="tabla-scroll"><table><thead><tr><th>Cuestionario</th><th>Curso</th><th>Código</th><th>Cierre</th><th>Estado</th></tr></thead><tbody>${filas}</tbody></table></div>` : `<p>Ahora mismo no hay ningún cuestionario de Wayground en el tablón.</p>`}`;
}
