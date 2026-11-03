/* ============================================================
   AGENCIA LA LUPA · pantallas fuera del caso y arranque
   Entrada de la agencia, tablón de casos, partida, informe,
   zona maestro/a (página normal, fuera del escenario) y CSV.
   Depende de motor.js y escenas.js (se cargan antes).
   ============================================================ */
"use strict";

/* ── Entrada: puerta de la agencia y fichas de detective ────── */
function vistaInicio() {
  const cursos = D.prog.cursos;
  pintarEscena(`
    <div class="rotulo-agencia"><span class="lupa-rotulo">🔍</span> AGENCIA <b>LA LUPA</b><small>Detectives de la lengua · Barrio de La Alameda</small></div>
    <div class="panel-fichas">
      <h2 class="cartel">¿Quién investiga hoy?</h2>
      <div class="fichas-detective">
        ${perfiles.map(p => `<button class="ficha-detective" data-id="${esc(p.id)}"><span class="foto">🕵️</span><span><b>${esc(p.nombre)}</b><small>${esc(cursos[p.curso]?.nombre || p.curso)}</small></span></button>`).join("")
          || `<p class="vacio">Todavía no hay detectives en el equipo. ¡Crea tu ficha!</p>`}
      </div>
      <form id="nuevo" class="nueva-ficha">
        <input id="nNombre" placeholder="Tu nombre de detective" maxlength="30" required autocomplete="off">
        <select id="nCurso">${Object.entries(cursos).map(([k, c]) => `<option value="${esc(k)}">${esc(c.nombre)}</option>`).join("")}</select>
        <button class="boton-sello">Crear ficha</button>
      </form>
    </div>
    <button class="enlace-maestro" id="irMaestro">Zona maestro/a</button>`, { fondo: "fachada-agencia", clase: "oscurecido" });
  $$(".ficha-detective").forEach(b => b.onclick = () => { perfil = perfiles.find(p => p.id === b.dataset.id); vistaTablon(); });
  $("#nuevo").onsubmit = ev => {
    ev.preventDefault();
    const nombre = $("#nNombre").value.trim();
    if (!nombre) return;
    perfil = { id: uid(), nombre, curso: $("#nCurso").value, creado: new Date().toISOString() };
    perfiles.push(perfil);
    guardar("perfiles", perfiles);
    vistaTablon();
  };
  $("#irMaestro").onclick = vistaMaestro;
}

/* ── Tablón de corcho con los casos del curso ───────────────── */
function vistaTablon() {
  P = null;
  const curso = D.prog.cursos[perfil.curso];
  const mios = resultados.filter(r => r.perfilId === perfil.id);
  pintarEscena(`
    <div class="tablon-cabecera">
      <h1 class="cartel">Tablón de casos</h1>
      <span class="placa">Detective <b>${esc(perfil.nombre)}</b> · ${esc(curso.nombre)}</span>
      <button class="boton-papel" id="salir">Salir</button>
    </div>
    <div class="corcho tablon">${curso.unidades.map(u => tarjetaUnidad(u, mios)).join("")}</div>`, { fondo: "agencia" });
  $("#salir").onclick = () => { perfil = null; vistaInicio(); };
  $$("[data-unidad]").forEach(b => b.onclick = () => iniciarCaso(curso.unidades.find(u => u.id === b.dataset.unidad)));
}

function tarjetaUnidad(u, mios) {
  const reglas = u.reglas.length > 3 ? `Repaso de ${u.reglas.length} reglas` : u.reglas.map(r => D.reglas[r]?.nombre || r).join(" · ");
  const caso = u.caso && D.casos[u.caso];
  const tri = `<span class="trimestre">${u.trimestre}.º trim.</span>`;
  if (!caso) return `<article class="tarjeta-caso bloqueada">${tri}<span class="chincheta"></span><h3>${esc(u.titulo)}</h3>${reglas !== u.titulo ? `<p>${esc(reglas)}</p>` : ""}<span class="sello-mini">PRÓXIMAMENTE</span></article>`;
  const resuelto = mios.some(r => r.unidad === u.id);
  return `
    <button class="tarjeta-caso" data-unidad="${esc(u.id)}">${tri}<span class="chincheta"></span>
      <small>Expediente ${esc(caso.numero)}</small>
      <h3>${esc(caso.titulo)}</h3>
      <p>${esc(u.titulo)}</p>
      <span class="sello-mini ${resuelto ? "resuelto" : "nuevo"}">${resuelto ? "RESUELTO" : "NUEVO"}</span>
    </button>`;
}

/* ── Partida ────────────────────────────────────────────────── */
function iniciarCaso(unidad) {
  P = { caso: D.casos[unidad.caso], unidad: unidad.id, i: 0, eventos: [], piezas: [], cartas: false, pistas: {}, repasar: new Set(), inicio: Date.now() };
  renderEscena();
}
function renderEscena() {
  const e = P.caso.escenas[P.i];
  if (!e) return vistaInforme();
  (ESCENAS[e.tipo] || escenaDesconocida)(e);
}
function siguiente() { P.i++; renderEscena(); }

/* ── Informe del detective al cerrar el caso ────────────────── */
function vistaInforme() {
  const letra = letraCurso(perfil.curso);
  const notas = calcularNotas(P.eventos).map(n => ({ ...n, codigo: `${n.criterio}.${letra}` }));
  const res = {
    id: uid(), app: "lalupa", perfilId: perfil.id, nombre: perfil.nombre, curso: perfil.curso,
    unidad: P.unidad, caso: P.caso.id, titulo: P.caso.titulo, reglas: P.caso.reglas,
    fecha: new Date().toISOString(), minutos: Math.max(1, Math.round((Date.now() - P.inicio) / 60000)),
    pistas: Object.values(P.pistas).reduce((a, b) => a + b, 0), notas, repasar: [...P.repasar], eventos: P.eventos,
  };
  resultados.push(res);
  guardar("resultados", resultados);
  pintarEscena(`
    <div class="informe-doc">
      <div class="sello-informe">ARCHIVADO</div>
      <small>AGENCIA LA LUPA · INFORME DEL DETECTIVE</small>
      <h1 class="cartel">${esc(P.caso.titulo)}</h1>
      <p class="maquina-fija">Detective: ${esc(perfil.nombre)} · Pistas pedidas: ${res.pistas} · Tiempo: ${res.minutos} min</p>
      <div class="notas">${notas.map(n => `
        <div class="nota"><span>${esc(NOMBRE_CRITERIO[n.criterio] || n.criterio)}</span>
          <div class="barra-nota"><i style="width:${n.nota * 10}%"></i></div>
          <small>${n.aciertos} de ${n.intentos} a la primera</small></div>`).join("")}</div>
      ${res.repasar.length ? `<p class="etiqueta">Palabras para repasar</p><div class="repasar">${res.repasar.map(w => `<span class="palabra-ficha">${esc(w)}</span>`).join("")}</div>` : `<p class="maquina-fija">Ni una sola palabra para repasar. ¡Impecable!</p>`}
      <button class="boton-sello" id="volver">Volver al tablón ▸</button>
    </div>`, { fondo: "agencia", clase: "oscurecido" });
  P = null;
  $("#volver").onclick = vistaTablon;
}

/* ── Zona maestro/a: página normal fuera del escenario ──────── */
function vistaMaestro() {
  $("#marco").hidden = true;
  const pag = $("#pagina");
  pag.hidden = false;
  const filas = resultados.slice().reverse();
  const criterios = [...new Set(resultados.flatMap(r => r.notas.map(n => n.criterio)))].sort();
  pag.innerHTML = `
    <header class="pag-cabecera"><strong>Agencia La Lupa · Zona maestro/a</strong><button class="boton-papel" id="volver">◂ Volver al juego</button></header>
    <main class="pag-cuerpo">
      <p class="aviso-maestro">Prototipo: aquí se ven solo los datos guardados <strong>en este dispositivo</strong>. La sincronización con la hoja de cálculo y el PIN llegarán más adelante.</p>
      <div class="fila">
        <button class="boton-sello" id="csv">Exportar notas por criterio (CSV)</button>
        <button class="boton-papel peligro" id="borrar">Borrar datos de este dispositivo</button>
      </div>
      <div id="confirmacion"></div>
      ${filas.length ? `
      <div class="tabla-scroll"><table>
        <thead><tr><th>Detective</th><th>Curso</th><th>Caso</th><th>Fecha</th>${criterios.map(c => `<th title="${esc(NOMBRE_CRITERIO[c] || "")}">${esc(c)}</th>`).join("")}<th>Pistas</th><th>Repasar</th></tr></thead>
        <tbody>${filas.map(r => `<tr>
          <td>${esc(r.nombre)}</td><td>${esc(r.curso)}.º</td><td>${esc(r.titulo)}</td>
          <td>${esc(new Date(r.fecha).toLocaleDateString("es-ES"))}</td>
          ${criterios.map(c => { const n = r.notas.find(x => x.criterio === c); return `<td>${n ? `${n.nota} <small>${n.calificacion}</small><br><small>${esc(n.codigo)}</small>` : "—"}</td>`; }).join("")}
          <td>${r.pistas}</td><td>${esc(r.repasar.join(", "))}</td></tr>`).join("")}
        </tbody></table></div>` : `<p>Todavía no hay casos resueltos en este dispositivo.</p>`}
    </main>`;
  $("#volver").onclick = () => (perfil ? vistaTablon() : vistaInicio());
  $("#csv").onclick = exportarCSV;
  $("#borrar").onclick = () => {
    $("#confirmacion").innerHTML = `<p class="aviso-maestro">Se borrarán todos los detectives y resultados de este dispositivo. <button class="boton-papel peligro" id="borrarSi">Sí, borrar todo</button> <button class="boton-papel" id="borrarNo">Cancelar</button></p>`;
    $("#borrarNo").onclick = () => ($("#confirmacion").innerHTML = "");
    $("#borrarSi").onclick = () => {
      perfiles = []; resultados = []; perfil = null;
      guardar("perfiles", perfiles); guardar("resultados", resultados);
      vistaInicio();
    };
  };
}

function exportarCSV() {
  const filas = resultados.flatMap(r => r.notas.map(n => ({
    alumno: r.nombre, curso: r.curso, unidad: r.unidad, caso: r.titulo, criterio: n.codigo,
    nota: String(n.nota).replace(".", ","), calificacion: n.calificacion, aciertos: n.aciertos,
    intentos: n.intentos, pistas: r.pistas, minutos: r.minutos, fecha: r.fecha.slice(0, 10),
  })));
  if (!filas.length) return;
  const claves = Object.keys(filas[0]);
  const csv = [claves.join(";"), ...filas.map(f => claves.map(k => `"${String(f[k]).replaceAll('"', '""')}"`).join(";"))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  a.download = `la-lupa_notas_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

/* ── Arranque ───────────────────────────────────────────────── */
async function init() {
  ajustarEscenario();
  try {
    const [reglas, prog, arteCat] = await Promise.all([leerJSON("datos/reglas.json"), leerJSON("datos/programacion.json"), leerJSON("datos/arte.json")]);
    D.reglas = reglas; D.prog = prog; D.arte = arteCat;
    const ids = [...new Set(Object.values(prog.cursos).flatMap(c => c.unidades.map(u => u.caso).filter(Boolean)))];
    await Promise.all(ids.map(async id => {
      try { D.casos[id] = await leerJSON(`datos/casos/${id}.json`); } catch { console.warn(`Falta el caso ${id}`); }
    }));
  } catch {
    pintarEscena(`<div class="bocadillo izq"><p>No se pudieron cargar los datos del juego. Ábrelo desde un servidor web (GitHub Pages, o <code>node .claude/serve.js</code> en local), no como archivo suelto.</p></div>`);
    return;
  }
  vistaInicio();
}
init();
