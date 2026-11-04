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
        ${perfiles.map(p => `<button class="ficha-detective" data-id="${esc(p.id)}"><span class="foto">${htmlAvatar(p) || "🕵️"}</span><span><b>${esc(p.nombre)}</b><small>${esc(cursos[p.curso]?.nombre || p.curso)}</small></span></button>`).join("")
          || `<p class="vacio">Todavía no hay detectives en el equipo. ¡Crea tu ficha!</p>`}
      </div>
      ${aliasLibres().length ? `
      <p class="etiqueta-clase">¿Eres de la clase? Busca tu ficha de aspirante:</p>
      <div class="fichas-clase">${aliasLibres().map(a => `<button class="ficha-clase" data-alias="${esc(a.alias)}"><img src="${a.avatar}" alt=""><span>${esc(a.alias)}</span></button>`).join("")}</div>` : ""}
      <form id="nuevo" class="nueva-ficha">
        <input id="nNombre" placeholder="Tu nombre de detective" maxlength="30" required autocomplete="off">
        <select id="nCurso">${Object.entries(cursos).map(([k, c]) => `<option value="${esc(k)}">${esc(c.nombre)}</option>`).join("")}</select>
        <button class="boton-sello">Crear ficha</button>
      </form>
    </div>
    ${nubeActiva() ? `<button class="enlace-maestro enlace-nube" id="irRecuperar">☁️ Recuperar mi detective</button>` : ""}
    <button class="enlace-maestro" id="irMaestro">Zona maestro/a</button>`, { fondo: "fachada-agencia", clase: "oscurecido" });
  $$(".ficha-detective").forEach(b => b.onclick = () => { perfil = perfiles.find(p => p.id === b.dataset.id); vistaTablon(); });
  const crear = (nombre, avatar) => {
    perfil = { id: uid(), nombre, curso: $("#nCurso").value, creado: new Date().toISOString(), ...(avatar ? { avatar } : {}) };
    perfiles.push(perfil);
    guardar("perfiles", perfiles);
    nubeNuevoAlumno(perfil);
    vistaTablon();
  };
  $$(".ficha-clase").forEach(b => b.onclick = () => crear(b.dataset.alias, b.dataset.alias));
  $("#nuevo").onsubmit = ev => {
    ev.preventDefault();
    const nombre = $("#nNombre").value.trim();
    if (!nombre) return;
    crear(nombre, null);
  };
  $("#irMaestro").onclick = pedirPin;
  $("#irRecuperar")?.addEventListener("click", pedirRecuperar);
}

/* ── Tablón de corcho con los casos del curso ───────────────── */
function vistaTablon() {
  P = null;
  const curso = D.prog.cursos[perfil.curso];
  const mios = resultados.filter(r => r.perfilId === perfil.id);
  const puntos = puntosDetective(mios);
  pintarEscena(`
    <div class="tablon-cabecera">
      <h1 class="cartel">Tablón de casos</h1>
      <span class="placa">${htmlAvatar(perfil, "mini")}Detective <b>${esc(perfil.nombre)}</b> · ${esc(rangoDe(puntos).nombre)} · ${puntos} pts</span>
      ${listaEncargos().length ? `<button class="boton-sello" id="irEncargos">📬 Encargos${encargosNuevos(mios, puntos) ? ` <span class="globo">${encargosNuevos(mios, puntos)}</span>` : ""}</button>` : ""}
      <button class="boton-sello" id="irAcademia">🎓 Academia</button>
      <button class="boton-papel" id="salir">Salir</button>
    </div>
    <div class="corcho tablon">${curso.unidades.map(u => tarjetaUnidad(u, mios)).join("")}</div>`, { fondo: "agencia" });
  $("#salir").onclick = () => { perfil = null; vistaInicio(); };
  $("#irAcademia").onclick = vistaPatio;
  $("#irEncargos")?.addEventListener("click", vistaEncargos);
  $$("[data-unidad]").forEach(b => b.onclick = () => {
    const u = curso.unidades.find(x => x.id === b.dataset.unidad);
    const ultimo = mios.filter(r => r.unidad === u.id).at(-1);
    if (!ultimo && pasosPreparacion(u).length && modoPreparacion() !== "no" && (debePrepararse(u, mios) || modoPreparacion() === "opcional" && !preparacionLista(u))) return vistaPreparacion(u);
    if (!ultimo) return iniciarCaso(u);
    abrirModal(`
      <h3>${esc(D.casos[u.caso].titulo)}</h3>
      <p>${ultimo.libreta ? `Expediente <b>sellado</b> por el director (${ultimo.libreta.puntos}/4 en la libreta).` : "Tu expediente está <b>pendiente de sello</b>: enseña tu libreta al director."}</p>
      <div class="acciones">
        ${ultimo.libreta ? "" : `<button class="boton-papel" id="sellarYa">Sellar (director)</button>`}
        <button class="boton-sello" id="jugarOtra">Jugar otra vez ▸</button>
      </div>`, "ventana-libreta");
    $("#jugarOtra").onclick = () => { cerrarModal(); iniciarCaso(u); };
    $("#sellarYa")?.addEventListener("click", () => sellar(ultimo, vistaTablon));
  });
}
const puntosDetective = mios => {
  const ultimoPorUnidad = {};
  mios.forEach(r => (ultimoPorUnidad[r.unidad] = r));
  return Object.values(ultimoPorUnidad).reduce((a, r) => a + puntosResultado(r), 0) + puntosAcademia();
};

function tarjetaUnidad(u, mios) {
  const reglas = u.reglas.length > 3 ? `Repaso de ${u.reglas.length} reglas` : u.reglas.map(r => D.reglas[r]?.nombre || r).join(" · ");
  const caso = u.caso && D.casos[u.caso];
  const tri = `<span class="trimestre">${u.trimestre}.º trim.</span>`;
  if (!caso) return `<article class="tarjeta-caso bloqueada">${tri}<span class="chincheta"></span><h3>${esc(u.titulo)}</h3>${reglas !== u.titulo ? `<p>${esc(reglas)}</p>` : ""}<span class="sello-mini">PRÓXIMAMENTE</span></article>`;
  const ultimo = mios.filter(r => r.unidad === u.id).at(-1);
  const estado = !ultimo ? ["nuevo", "NUEVO"] : ultimo.libreta ? ["resuelto", "SELLADO"] : ["pendiente", "SIN SELLAR"];
  return `
    <button class="tarjeta-caso" data-unidad="${esc(u.id)}">${tri}<span class="chincheta"></span>
      <small>Expediente ${esc(caso.numero)}</small>
      <h3>${esc(caso.titulo)}</h3>
      <p>${esc(u.titulo)}</p>
      <span class="sello-mini ${estado[0]}">${estado[1]}</span>
      ${etiquetaPreparacion(u, mios)}
    </button>`;
}

/* ── Partida ────────────────────────────────────────────────── */
function iniciarCaso(unidad) {
  P = { caso: D.casos[unidad.caso], unidad: unidad.id, i: 0, eventos: [], piezas: [], cartas: false, pistas: {}, repasar: new Set(), consultas: 0, notas: [], inicio: Date.now() };
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
    pistas: Object.values(P.pistas).reduce((a, b) => a + b, 0), consultas: P.consultas, modoLibreta: ajustes.libreta,
    notas, repasar: [...P.repasar], notasLibreta: P.notas, eventos: P.eventos, libreta: null,
    diagnostico: P.caso.diagnostico ? diagnosticoPorRegla(P.eventos) : null,
    ...(P.encargo ? { encargo: true } : {}),
  };
  resultados.push(res);
  guardar("resultados", resultados);
  res.aCola = actualizarCola(res.eventos, res.caso);
  nubeTrasResultado(res);
  P = null;
  pintarInforme(res);
}

function pintarInforme(res) {
  const diag = res.diagnostico ? `
      <p class="etiqueta">Tu punto de partida</p>
      <div class="diagnostico">${res.diagnostico.map(d => `
        <div class="regla-diag ${d.porcentaje >= 75 ? "domina" : d.porcentaje >= 50 ? "casi" : "entrenar"}">
          <span>${esc(D.reglas[d.regla]?.nombre || d.regla)}</span>
          <b>${d.porcentaje >= 75 ? "La dominas" : d.porcentaje >= 50 ? "Casi" : "A entrenar"}</b>
        </div>`).join("")}</div>` : "";
  pintarEscena(`
    <div class="informe-doc">
      ${res.encargo ? `<div class="sello-informe">ENCARGO CUMPLIDO</div>` : `<div class="sello-informe ${res.libreta ? "" : "pendiente"}">${res.libreta ? "SELLADO" : "SIN SELLAR"}</div>`}
      <small>AGENCIA LA LUPA · ${res.encargo ? "INFORME DEL ENCARGO" : "INFORME DEL DETECTIVE"}</small>
      <h1 class="cartel">${esc(res.titulo)}</h1>
      <p class="maquina-fija">${htmlAvatar(perfil, "mini")}Detective: ${esc(res.nombre)} · Pistas pedidas: ${res.pistas}${res.consultas ? ` · Consultas a la libreta: ${res.consultas}` : ""} · Tiempo: ${res.minutos} min</p>
      ${diag}
      <div class="notas">${res.notas.map(n => `
        <div class="nota"><span>${esc(NOMBRE_CRITERIO[n.criterio] || n.criterio)}</span>
          <div class="barra-nota"><i style="width:${n.nota * 10}%"></i></div>
          <small>${n.aciertos} de ${n.intentos} a la primera</small></div>`).join("")}</div>
      ${res.repasar.length ? `<p class="etiqueta">Palabras para repasar</p><div class="repasar">${res.repasar.map(w => `<span class="palabra-ficha">${esc(w)}</span>`).join("")}</div>` : `<p class="maquina-fija">Ni una sola palabra para repasar. ¡Impecable!</p>`}
      ${res.encargo ? `<p class="maquina-fija sello-aviso">+${puntosResultado(res)} puntos para tu rango.</p>` : `<p class="maquina-fija sello-aviso">${res.libreta ? `El director ha sellado tu libreta: ${res.libreta.puntos}/4. +${puntosResultado(res)} puntos.` : "📓 Enseña tu libreta al director Robles para que selle el expediente y ganes puntos extra."}</p>`}
      <div class="acciones izquierda">
        ${res.libreta || res.encargo ? "" : `<button class="boton-papel" id="sellar">Sellar (director)</button>`}
        <button class="boton-papel" id="academia">🎓 Ir a la Academia${res.aCola ? ` (${res.aCola} fichas nuevas)` : ""}</button>
        <button class="boton-sello" id="volver">${res.encargo ? "Volver a los encargos" : "Volver al tablón"} ▸</button>
      </div>
    </div>`, { fondo: "agencia", clase: "oscurecido" });
  $("#academia").onclick = vistaPatio;
  $("#volver").onclick = res.encargo ? vistaEncargos : vistaTablon;
  $("#sellar")?.addEventListener("click", () => sellar(res, () => pintarInforme(res)));
}

/* ── Sello del director: rúbrica rápida de la libreta + código ── */
const RUBRICA = ["Ha apuntado las pistas y cifras", "Ha escrito la regla con sus palabras", "Ha copiado bien las palabras corregidas", "Ha escrito el informe sin faltas"];
function sellar(res, despues) {
  abrirModal(`
    <h3>Sello del director</h3>
    <p>Solo para el maestro/a: marca lo que está bien en la libreta.</p>
    <div class="rubrica">${RUBRICA.map((r, k) => `<label><input type="checkbox" id="rub${k}"> ${esc(r)}</label>`).join("")}</div>
    <input id="codigoSello" class="entrada" type="password" autocomplete="off" placeholder="Código del director" aria-label="Código del director">
    <p id="selloMsg" class="msg"></p>
    <div class="acciones"><button class="boton-sello" id="estampar">Sellar expediente</button></div>`, "ventana-libreta");
  $("#estampar").onclick = () => {
    if (norm($("#codigoSello").value) !== norm(ajustes.codigoSello)) { $("#selloMsg").textContent = "Código incorrecto."; return; }
    const checks = RUBRICA.map((_, k) => $(`#rub${k}`).checked);
    res.libreta = { checks, puntos: checks.filter(Boolean).length, fecha: new Date().toISOString() };
    guardar("resultados", resultados);
    nubeTrasResultado(res);
    cerrarModal();
    despues();
  };
}

/* ── Zona maestro/a: página normal fuera del escenario ──────── */
/* ── PIN de la zona del maestro (ajustes.pin). Sin PIN, se entra directo y se avisa de que conviene ponerlo ── */
function pedirPin() {
  if (!ajustes.pin) return vistaMaestro();
  abrirModal(`
    <h3>Zona del maestro</h3>
    <p>Escribe el PIN para entrar.</p>
    <input id="pinIn" class="entrada" type="password" inputmode="numeric" autocomplete="off" aria-label="PIN">
    <p id="pinMsg" class="msg"></p>
    <div class="acciones"><button class="boton-sello" id="pinOk">Entrar</button></div>`, "ventana-libreta");
  const inp = $("#pinIn");
  inp.focus();
  const probar = () => {
    if (inp.value.trim() === ajustes.pin) { cerrarModal(); return vistaMaestro(); }
    $("#pinMsg").textContent = "PIN incorrecto.";
    inp.select();
  };
  $("#pinOk").onclick = probar;
  inp.onkeydown = ev => { if (ev.key === "Enter") probar(); };
}
/* ── Modo revisión: lo abre todo para que el maestro lo pruebe (encargos sin rango, preparación opcional, todas las lupas) ── */
const modoRevision = () => ajustes.revision === true;
const marcarRevision = () => document.body.classList.toggle("modo-revision", modoRevision());

function vistaMaestro() {
  $("#marco").hidden = true;
  const pag = $("#pagina");
  pag.hidden = false;
  const filas = resultados.slice().reverse();
  const criterios = [...new Set(resultados.flatMap(r => r.notas.map(n => n.criterio)))].sort();
  const diags = resultados.filter(r => r.diagnostico);
  const reglasDiag = [...new Set(diags.flatMap(r => r.diagnostico.map(d => d.regla)))];
  const ultimoDiag = {};
  diags.forEach(r => (ultimoDiag[r.perfilId] = r));
  pag.innerHTML = `
    <header class="pag-cabecera"><strong>Agencia La Lupa · Zona maestro/a</strong><button class="boton-papel" id="volver">◂ Volver al juego</button></header>
    <main class="pag-cuerpo">
      <p class="aviso-maestro">Prototipo: aquí se ven solo los datos guardados <strong>en este dispositivo</strong>. La sincronización con la hoja de cálculo llegará más adelante.</p>
      ${ajustes.pin ? "" : `<p class="aviso-maestro"><b>Sin PIN:</b> cualquier alumno puede entrar aquí. Pon uno en «PIN de esta zona» y guarda los ajustes.</p>`}
      <h2>Ajustes del aula</h2>
      <div class="fila">
        <label>Libreta: <select id="ajLibreta"><option value="papel">De papel (el juego no guarda las pistas)</option><option value="digital">Digital (el juego guarda las pistas y deja escribir)</option></select></label>
        <label>Código de sello: <input id="ajCodigo" value="${esc(ajustes.codigoSello)}" maxlength="20"></label>
        <label>PIN de esta zona: <input id="ajPin" type="password" inputmode="numeric" maxlength="8" value="${esc(ajustes.pin || "")}" placeholder="sin PIN"></label>
        <label><input type="checkbox" id="ajRevision" ${modoRevision() ? "checked" : ""}> <b>Modo revisión</b> (para probarlo tú: abre todos los encargos y las lupas, y la preparación se puede saltar)</label>
        <label><input type="checkbox" id="ajSonido" ${ajustes.sonido === true ? "checked" : ""}> Actividades con sonido (extra: necesitan cascos o altavoz)</label>
        <label>Preparación en la Academia antes de cada caso: <select id="ajPrep"><option value="obligatoria">Obligatoria (el caso se abre al terminarla)</option><option value="opcional">Recomendada (se puede saltar)</option><option value="no">Sin preparación</option></select></label>
        <button class="boton-sello" id="ajGuardar">Guardar ajustes</button>
      </div>
      ${diags.length ? `
      <h2>Evaluación inicial (prueba de acceso)</h2>
      <div class="tabla-scroll"><table>
        <thead><tr><th>Detective</th>${reglasDiag.map(r => `<th>${esc(D.reglas[r]?.nombre || r)}</th>`).join("")}</tr></thead>
        <tbody>${Object.values(ultimoDiag).map(r => `<tr><td>${esc(r.nombre)}</td>${reglasDiag.map(rg => { const d = r.diagnostico.find(x => x.regla === rg); return `<td class="${d ? (d.porcentaje >= 75 ? "celda-bien" : d.porcentaje >= 50 ? "celda-casi" : "celda-mal") : ""}">${d ? `${d.porcentaje} %` : "—"}</td>`; }).join("")}</tr>`).join("")}</tbody>
      </table></div>` : ""}
      ${htmlNotasFinales()}
      ${htmlSinInternet()}
      ${htmlNubeMaestro()}
      <h2>Imprimibles</h2>
      <div class="fila">
        <label>Libreta: <select id="impCaso"><option value="todos">Toda la temporada (con portada)</option>${Object.values(D.casos).sort((a, b) => a.numero.localeCompare(b.numero)).map(c => `<option value="${esc(c.id)}">${esc(c.numero)} · ${esc(c.titulo)}</option>`).join("")}</select></label>
        <a class="boton-papel" id="impLibreta" target="_blank" rel="noopener" href="imprimibles/libreta.html?casos=todos">Abrir libreta para imprimir</a>
      </div>
      <div class="fila">
        <a class="boton-papel" target="_blank" rel="noopener" href="imprimibles/apuntes.html?reglas=todas">Apuntes de las 9 reglas (para la libreta)</a>
        <a class="boton-papel" target="_blank" rel="noopener" href="imprimibles/ficha-aspirante.html">Ficha de aspirante (avatares)</a>
        <a class="boton-papel" target="_blank" rel="noopener" href="imprimibles/autorizacion-familias.html">Autorización para las familias (borrador)</a>
      </div>
      ${resumenAcademiaHTML()}
      ${htmlPaqueteMaestro()}
      <h2>Casos resueltos</h2>
      <div class="fila">
        <button class="boton-sello" id="csv">Exportar notas por criterio (CSV)</button>
        <button class="boton-papel peligro" id="borrar">Borrar datos de este dispositivo</button>
      </div>
      <div id="confirmacion"></div>
      ${filas.length ? `
      <div class="tabla-scroll"><table>
        <thead><tr><th>Detective</th><th>Curso</th><th>Caso</th><th>Fecha</th>${criterios.map(c => `<th title="${esc(NOMBRE_CRITERIO[c] || "")}">${esc(c)}</th>`).join("")}<th>Libreta</th><th>Pistas</th><th>Repasar</th></tr></thead>
        <tbody>${filas.map(r => `<tr>
          <td>${esc(r.nombre)}</td><td>${esc(r.curso)}.º</td><td>${r.encargo ? "📬 " : ""}${esc(r.titulo)}</td>
          <td>${esc(new Date(r.fecha).toLocaleDateString("es-ES"))}</td>
          ${criterios.map(c => { const n = r.notas.find(x => x.criterio === c); return `<td>${n ? `${n.nota} <small>${n.calificacion}</small><br><small>${esc(n.codigo)}</small>` : "—"}</td>`; }).join("")}
          <td>${r.encargo ? "—" : r.libreta ? `${r.libreta.puntos}/4 ✔` : "sin sellar"}</td>
          <td>${r.pistas}${r.consultas ? ` (+${r.consultas} consultas)` : ""}</td><td>${esc(r.repasar.join(", "))}</td></tr>`).join("")}
        </tbody></table></div>` : `<p>Todavía no hay casos resueltos en este dispositivo.</p>`}
    </main>`;
  $("#ajLibreta").value = ajustes.libreta;
  $("#ajPrep").value = modoPreparacion();
  $$(".nf-cuenta").forEach(c => c.onchange = () => {
    ajustes = { ...ajustes, cuentanNota: { ...cuentanNota(), [c.dataset.tipo]: c.checked } };
    guardar("ajustes", ajustes);
    vistaMaestro();
  });
  $("#ajGuardar").onclick = () => {
    ajustes = { ...ajustes, libreta: $("#ajLibreta").value, codigoSello: $("#ajCodigo").value.trim() || "LUPA", preparacion: $("#ajPrep").value, sonido: $("#ajSonido").checked, revision: $("#ajRevision").checked, pin: $("#ajPin").value.trim() };
    marcarRevision();
    guardar("ajustes", ajustes);
    $("#ajGuardar").textContent = "Guardado ✔";
  };
  $("#impCaso").onchange = () => {
    const v = $("#impCaso").value;
    $("#impLibreta").href = `imprimibles/libreta.html?casos=${encodeURIComponent(v)}${v === "todos" ? "" : "&portada=0"}`;
  };
  activarPaqueteMaestro(vistaMaestro);
  activarSinInternet();
  activarNubeMaestro(vistaMaestro);
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

/* ── Qué cuenta para la nota (decide el maestro): casos, encargos y Academia ── */
const cuentanNota = () => ({ casos: true, encargos: false, academia: false, ...(ajustes.cuentanNota || {}) });
const tipoDe = r => (r.contexto === "academia" ? "academia" : r.encargo ? "encargos" : "casos");
function fuentesNota() {
  const c = cuentanNota();
  return [...resultados.filter(r => !r.diagnostico), ...registrosAca].filter(r => c[tipoDe(r)]);
}
function htmlNotasFinales() {
  const c = cuentanNota();
  const por = {};
  fuentesNota().forEach(r => {
    por[r.perfilId] ??= { nombre: r.nombre, crit: {} };
    r.notas.forEach(n => (por[r.perfilId].crit[n.criterio] ??= []).push(n.nota));
  });
  const crits = [...new Set(Object.values(por).flatMap(p => Object.keys(p.crit)))].sort();
  const media = v => Math.round(v.reduce((a, b) => a + b, 0) / v.length * 10) / 10;
  return `
      <h2>¿Qué cuenta para la nota?</h2>
      <div class="fila">${[["casos", "Casos de la temporada"], ["encargos", "Encargos"], ["academia", "Academia (entrenamiento y preparación)"]].map(([k, t]) =>
        `<label><input type="checkbox" class="nf-cuenta" data-tipo="${k}" ${c[k] ? "checked" : ""}> ${t}</label>`).join("")}</div>
      <p class="aviso-maestro">Media de las notas por criterio de lo marcado (el piloto es evaluación inicial y no cuenta). Todo queda registrado aunque no lo marques, y el CSV lo incluye todo con su tipo.</p>
      ${crits.length ? `<div class="tabla-scroll"><table>
        <thead><tr><th>Detective</th>${crits.map(k => `<th title="${esc(NOMBRE_CRITERIO[k] || "")}">${esc(k)}</th>`).join("")}</tr></thead>
        <tbody>${Object.values(por).map(p => `<tr><td>${esc(p.nombre)}</td>${crits.map(k => { const v = p.crit[k]; if (!v) return "<td>—</td>"; const m = media(v); return `<td>${m} <small>${calificacion(m)}</small><br><small>${v.length} reg.</small></td>`; }).join("")}</tr>`).join("")}</tbody>
      </table></div>` : "<p>Todavía no hay notas de lo marcado.</p>"}`;
}

function exportarCSV() {
  const c = cuentanNota();
  const aca = registrosAca.map(r => ({ ...r, unidad: r.sala, titulo: `Academia · ${sala(r.sala)?.nombre || r.sala}`, notas: r.notas.map(n => ({ ...n, codigo: `${n.criterio}.${letraCurso(r.curso)}` })), pistas: 0, consultas: 0, minutos: "" }));
  const filas = [...resultados, ...aca].flatMap(r => r.notas.map(n => ({
    alumno: r.nombre, curso: r.curso, tipo: tipoDe(r), cuenta_nota: !r.diagnostico && c[tipoDe(r)] ? "sí" : "no", unidad: r.unidad, caso: r.titulo, criterio: n.codigo,
    nota: String(n.nota).replace(".", ","), calificacion: n.calificacion, aciertos: n.aciertos,
    intentos: n.intentos, libreta: r.contexto === "academia" || r.encargo ? "—" : r.libreta ? `${r.libreta.puntos}/4` : "sin sellar",
    pistas: r.pistas, consultas_libreta: r.consultas || 0, minutos: r.minutos, fecha: r.fecha.slice(0, 10),
  })));
  if (!filas.length) return;
  const claves = Object.keys(filas[0]);
  const csv = [claves.join(";"), ...filas.map(f => claves.map(k => `"${String(f[k]).replaceAll('"', '""')}"`).join(";"))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  a.download = `la-lupa_notas_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

/* ── Sin internet: service worker (sw.js) y descarga de todo desde la zona del maestro ── */
function registrarSinInternet() {
  try { if ("serviceWorker" in navigator && /^(https:|http:\/\/localhost)/.test(location.href)) navigator.serviceWorker.register("sw.js").catch(() => {}); } catch { /* sin service worker */ }
}
const BANCOS_ACADEMIA = ["palabras", "textos", "testigos", "verbos", "pizarra", "dictados", "galeradas", "apuntes", "partes", "sintilde", "homofonos", "familias", "comas"];
function archivosDelJuego() {
  const u = new Set(["./", "index.html", "manifest.webmanifest", "icono-192.png", "icono-512.png", "datos/reglas.json", "datos/programacion.json", "datos/arte.json", "datos/encargos.json"]);
  $$("script[src], link[rel=stylesheet]").forEach(x => u.add(x.getAttribute("src") || x.getAttribute("href")));
  BANCOS_ACADEMIA.forEach(b => u.add(`datos/academia/${b}.json`));
  Object.keys(D.casos).forEach(id => u.add(`datos/casos/${id}.json`));
  Object.keys(D.encargos || {}).forEach(id => u.add(`datos/encargos/${id}.json`));
  Object.entries(D.arte).forEach(([id, a]) => {
    if (a.listo) u.add(`arte/${id}.webp`);
    (a.listas || []).forEach(e => u.add(`arte/${id}-${e}.webp`));
  });
  ["apuntes", "libreta", "ficha-aspirante", "autorizacion-familias"].forEach(x => u.add(`imprimibles/${x}.html`));
  return [...u].filter(Boolean).map(x => new URL(x, location.href).href);
}
function htmlSinInternet() {
  return `
      <h2>Jugar sin internet</h2>
      <p class="aviso-maestro">Descarga el juego completo en este dispositivo (unos 25 MB, sobre todo las imágenes). Después funciona aunque falle el wifi. En tablets se puede «Añadir a la pantalla de inicio» y se abre como una app.</p>
      <div class="fila"><button class="boton-papel" id="precargar">Descargar todo para usar sin internet</button><span id="precargaMsg"></span></div>`;
}
function activarSinInternet() {
  $("#precargar").onclick = async () => {
    const msg = $("#precargaMsg");
    if (!("serviceWorker" in navigator)) { msg.textContent = "Este navegador no permite guardar el juego sin conexión."; return; }
    try {
      const reg = await navigator.serviceWorker.register("sw.js");
      const sw = reg.active || reg.waiting || reg.installing || (await navigator.serviceWorker.ready).active;
      navigator.serviceWorker.onmessage = ev => {
        if (ev.data?.tipo === "progreso") msg.textContent = `Descargando… ${ev.data.hechos} de ${ev.data.total}`;
        if (ev.data?.tipo === "precargado") msg.textContent = ev.data.fallos ? `Listo, pero ${ev.data.fallos} archivos no se han podido descargar. Vuelve a intentarlo con buena conexión.` : `¡Listo! ${ev.data.hechos} archivos guardados: ya funciona sin internet.`;
      };
      (sw || navigator.serviceWorker.controller).postMessage({ tipo: "precargar", urls: archivosDelJuego() });
      msg.textContent = "Empezando la descarga…";
    } catch { msg.textContent = "No se ha podido preparar la descarga (hace falta abrir el juego desde su web, no desde un archivo)."; }
  };
}

/* ── Arranque ───────────────────────────────────────────────── */
async function init() {
  ajustarEscenario();
  try {
    const [reglas, prog, arteCat] = await Promise.all([leerJSON("datos/reglas.json"), leerJSON("datos/programacion.json"), leerJSON("datos/arte.json")]);
    D.reglas = reglas; D.prog = prog; D.arte = arteCat;
    try {
      const [pal, tex, tes] = await Promise.all([leerJSON("datos/academia/palabras.json"), leerJSON("datos/academia/textos.json"), leerJSON("datos/academia/testigos.json")]);
      ACA.palabras = pal.palabras; ACA.textos = tex.textos; ACA.testigos = tes.testigos;
    } catch { console.warn("Sin datos de la Academia"); }
    const ids = [...new Set(Object.values(prog.cursos).flatMap(c => c.unidades.map(u => u.caso).filter(Boolean)))];
    await Promise.all(ids.map(async id => {
      try { D.casos[id] = await leerJSON(`datos/casos/${id}.json`); } catch { console.warn(`Falta el caso ${id}`); }
    }));
  } catch {
    pintarEscena(`<div class="bocadillo izq"><p>No se pudieron cargar los datos del juego. Ábrelo desde un servidor web (GitHub Pages, o <code>node .claude/serve.js</code> en local), no como archivo suelto.</p></div>`);
    return;
  }
  marcarRevision();
  registrarSinInternet();
  await cargarEncargos();
  await cargarPaquete();
  vistaInicio();
}
init();
