/* ============================================================
   AGENCIA LA LUPA · Encargos (misiones secundarias)
   Encargos cortos que llegan a la agencia de los vecinos del barrio.
   Se abren según el RANGO de detective (decisión de Pablo, 4/11/2026):
   cuanto más alto, más encargos y más difíciles.
   Datos: datos/encargos.json (índice) + datos/encargos/<id>.json (mismo formato
   que un caso, con "encargo": { cliente, rango (0-4, índice de RANGOS), contenido, dificultad }).
   Se registran como resultados con encargo: true (sin libreta ni sello).
   ============================================================ */
"use strict";

D.encargos = {};
async function cargarEncargos() {
  try {
    const ind = await leerJSON("datos/encargos.json");
    await Promise.all(ind.encargos.map(async x => {
      try { D.encargos[x.id] = await leerJSON(`datos/encargos/${x.id}.json`); } catch { console.warn(`Falta el encargo ${x.id}`); }
    }));
  } catch { /* sin encargos */ }
}

const nivelRango = puntos => (ajustes.revision === true ? RANGOS.length - 1 : RANGOS.indexOf(rangoDe(puntos)));
const listaEncargos = () => Object.values(D.encargos).sort((a, b) => (a.encargo.rango - b.encargo.rango) || a.numero.localeCompare(b.numero));
function encargosAbiertos(puntos) {
  const n = nivelRango(puntos);
  return listaEncargos().filter(c => c.encargo.rango <= n);
}
function encargosNuevos(mios, puntos) {
  return encargosAbiertos(puntos).filter(c => !mios.some(r => r.unidad === c.id)).length;
}

function vistaEncargos() {
  P = null;
  const mios = resultados.filter(r => r.perfilId === perfil.id);
  const puntos = puntosDetective(mios);
  const n = nivelRango(puntos);
  const siguiente = RANGOS[n + 1];
  const tarjeta = c => {
    const abierto = c.encargo.rango <= n;
    const hecho = mios.filter(r => r.unidad === c.id).at(-1);
    const medias = abierto && partidaAMedias(c.id, c);
    const estrellas = "★".repeat(c.encargo.dificultad || c.encargo.rango + 1) + "☆".repeat(Math.max(0, 5 - (c.encargo.dificultad || c.encargo.rango + 1)));
    if (!abierto) return `<article class="encargo cerrado"><span class="lacre">🔒</span><small>Sobre cerrado</small><h3>Se abre con el rango</h3><p>${esc(RANGOS[c.encargo.rango].nombre)}</p></article>`;
    return `<button class="encargo ${hecho ? "hecho" : ""}" data-encargo="${esc(c.id)}">
      <span class="sello-correo">${medias ? "A MEDIAS" : hecho ? "RESUELTO" : "NUEVO"}</span>
      <small>De: ${esc(c.encargo.cliente)}</small>
      <h3>${esc(c.titulo)}</h3>
      <p>${esc(c.encargo.contenido)}</p>
      <span class="estrellas" title="Dificultad">${estrellas}</span>
    </button>`;
  };
  pintarEscena(`
    <div class="tablon-cabecera">
      <h1 class="cartel">Encargos</h1>
      <span class="placa">${htmlAvatar(perfil, "mini")}${placaRango(puntos)}Detective <b>${esc(perfil.nombre)}</b> · ${esc(rangoDe(puntos).nombre)} · ${puntos} pts</span>
      <button class="boton-papel" id="volverTablon">◂ Tablón</button>
    </div>
    <p class="aviso-encargos">${siguiente ? `Con el rango <b>${esc(siguiente.nombre)}</b> (${siguiente.min} pts) llegarán encargos nuevos, y más difíciles.` : "Rango máximo: tienes todos los encargos de la agencia."}</p>
    <div class="buzon">${listaEncargos().map(tarjeta).join("") || `<p class="vacio">El buzón está vacío… de momento.</p>`}</div>`, { fondo: arte("buzon-agencia").listo ? "buzon-agencia" : "agencia", clase: "oscurecido" });
  $("#volverTablon").onclick = vistaTablon;
  $$("[data-encargo]").forEach(b => b.onclick = () => {
    const id = b.dataset.encargo, medias = partidaAMedias(id, D.encargos[id]);
    if (medias) ofrecerContinuar(D.encargos[id], medias, () => reanudarPartida(id, D.encargos[id], medias), () => iniciarEncargo(id));
    else iniciarEncargo(id);
  });
}

function iniciarEncargo(id) {
  P = { caso: D.encargos[id], unidad: id, encargo: true, i: 0, eventos: [], piezas: [], cartas: false, pistas: {}, repasar: new Set(), consultas: 0, notas: [], inicio: Date.now() };
  renderEscena();
}
