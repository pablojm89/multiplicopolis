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
        <input id="nNombre" placeholder="Tu alias de detective" title="Inventa un alias: no hace falta tu nombre real ni tus apellidos" maxlength="30" required autocomplete="off" autocapitalize="words">
        <select id="nCurso">${Object.entries(cursos).map(([k, c]) => `<option value="${esc(k)}">${esc(c.nombre)}</option>`).join("")}</select>
        <button class="boton-sello">Crear ficha</button>
      </form>
    </div>
    ${nubeActiva() ? `<button class="enlace-maestro enlace-nube" id="irRecuperar">☁️ Recuperar mi detective</button>` : ""}
    <button class="enlace-maestro" id="irMaestro">Zona maestro/a</button>`, { fondo: "fachada-agencia", clase: "oscurecido" });
  $$(".ficha-detective").forEach(b => b.onclick = () => { perfil = perfiles.find(p => p.id === b.dataset.id); vistaTablon(); });
  const crear = (nombre, avatar) => {
    nombre = nombre.replace(/^[\s=+\-@]+/, "").trim();
    const clave = claveAlias(avatar || nombre);
    const aviso1 = !clave ? "Tu alias tiene que llevar alguna letra o algún número."
      : perfiles.some(p => idAlumno(p) === clave || claveAlias(p.nombre) === claveAlias(nombre)) ? "Ya hay un detective con ese alias en este dispositivo. Elige otro o entra con tu ficha." : "";
    if (aviso1) { aviso(aviso1, "mal"); return; }
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

/* Dos alias son el mismo si solo cambian las mayúsculas, las tildes, los espacios o los signos: la misma normalización que la nube (nube.js) */
const claveAlias = s => normAlias(s);

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
    const delCaso = mios.filter(r => r.unidad === u.id);
    const ultimo = delCaso.find(r => r.libreta) || delCaso.at(-1);   // el sello es del caso, no de cada intento
    const medias = partidaAMedias(u.id, D.casos[u.caso]);
    if (medias) return ofrecerContinuar(D.casos[u.caso], medias, () => reanudarPartida(u.id, D.casos[u.caso], medias), () => iniciarCaso(u));
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
/* Puntos de un caso: el mejor intento de juego + el sello de la libreta (que es del caso, no del intento).
   Así, volver a jugar un caso nunca quita puntos ni el sello. */
const puntosLibreta = r => (r.libreta ? r.libreta.puntos * 25 + 50 : 0);
const puntosUnidad = rs => Math.max(...rs.map(r => puntosResultado(r) - puntosLibreta(r))) + Math.max(...rs.map(puntosLibreta));
const puntosDetective = mios => {
  const porUnidad = {};
  mios.forEach(r => (porUnidad[r.unidad] ??= []).push(r));
  return Object.values(porUnidad).reduce((a, rs) => a + puntosUnidad(rs), 0) + puntosAcademia();
};

/* Orden de la temporada: cada caso se abre al terminar el anterior, para no destripar la historia.
   ajustes.orden = "libre" (zona del maestro) los abre todos; el modo revisión, también. */
const ordenLibre = () => ajustes.orden === "libre" || modoRevision();
function casoAnteriorPendiente(u, mios) {
  if (ordenLibre()) return null;
  const conCaso = D.prog.cursos[perfil.curso].unidades.filter(x => x.caso && D.casos[x.caso]);
  const k = conCaso.findIndex(x => x.id === u.id);
  const previa = k > 0 ? conCaso[k - 1] : null;
  return previa && !mios.some(r => r.unidad === previa.id) ? previa : null;
}

/* ── Partida a medias: se guarda al entrar en cada escena y se puede continuar otro día ── */
const clavePartidas = () => `partidas-${perfil.id}`;
const partidasGuardadas = () => cargar(clavePartidas(), {});
function guardarPartida() {
  if (!P || !perfil) return;
  const todas = partidasGuardadas();
  todas[P.unidad] = {
    caso: P.caso.id, nEscenas: P.caso.escenas.length, i: P.i, ...(P.encargo ? { encargo: true } : {}),
    // Lo de la escena en curso no se guarda: al continuar, esa escena empieza de nuevo
    eventos: P.eventos.filter(e => e.escena < P.i), piezas: P.piezas.slice(0, P.nPiezas ?? P.piezas.length),
    notas: P.notas.filter(n => n.escena < P.i), cartas: P.cartas, pistas: P.pistas, consultas: P.consultas,
    ms: Date.now() - P.inicio, fecha: new Date().toISOString(),
  };
  guardar(clavePartidas(), todas);
}
function olvidarPartida(unidad) {
  const todas = partidasGuardadas();
  if (todas[unidad]) { delete todas[unidad]; guardar(clavePartidas(), todas); }
}
/* Solo vale si el caso no ha cambiado desde que se guardó */
function partidaAMedias(unidad, caso) {
  const g = perfil && partidasGuardadas()[unidad];
  return g && caso && g.caso === caso.id && g.nEscenas === caso.escenas.length && g.i > 0 && g.i < caso.escenas.length ? g : null;
}
function reanudarPartida(unidad, caso, g) {
  const eventos = g.eventos || [];
  P = {
    caso, unidad, i: g.i, eventos, piezas: g.piezas || [], cartas: !!g.cartas, pistas: g.pistas || {}, consultas: g.consultas || 0, notas: g.notas || [],
    repasar: new Set(eventos.filter(e => !e.ok && e.palabra && e.detalle !== "falsa alarma").map(e => e.palabra)),
    inicio: Date.now() - (g.ms || 0), ...(g.encargo ? { encargo: true } : {}),
  };
  renderEscena();
}
function ofrecerContinuar(caso, g, continuar, deNuevo) {
  abrirModal(`
    <h3>${esc(caso.titulo)}</h3>
    <p>Dejaste este expediente <b>a medias</b>: ibas por la escena ${g.i + 1} de ${g.nEscenas}. Tus pistas y tus aciertos están guardados.</p>
    <div class="acciones">
      <button class="boton-papel" id="deNuevo">Empezar de nuevo</button>
      <button class="boton-sello" id="continuar">Continuar ▸</button>
    </div>`, "ventana-libreta");
  $("#continuar").onclick = () => { cerrarModal(); continuar(); };
  $("#deNuevo").onclick = () => { cerrarModal(); deNuevo(); };
}

function tarjetaUnidad(u, mios) {
  const reglas = u.reglas.length > 3 ? `Repaso de ${u.reglas.length} reglas` : u.reglas.map(r => D.reglas[r]?.nombre || r).join(" · ");
  const caso = u.caso && D.casos[u.caso];
  const tri = `<span class="trimestre">${u.trimestre}.º trim.</span>`;
  if (!caso) return `<article class="tarjeta-caso bloqueada">${tri}<span class="chincheta"></span><h3>${esc(u.titulo)}</h3>${reglas !== u.titulo ? `<p>${esc(reglas)}</p>` : ""}<span class="sello-mini">PRÓXIMAMENTE</span></article>`;
  const previa = casoAnteriorPendiente(u, mios);
  if (previa) return `<article class="tarjeta-caso cerrada">${tri}<span class="chincheta"></span><small>Expediente ${esc(caso.numero)}</small><h3>${esc(caso.titulo)}</h3><p class="candado-caso">🔒 Antes, resuelve «${esc(D.casos[previa.caso].titulo)}»</p></article>`;
  const delCaso = mios.filter(r => r.unidad === u.id);
  const estado = partidaAMedias(u.id, caso) ? ["pendiente", "A MEDIAS"] : !delCaso.length ? ["nuevo", "NUEVO"] : delCaso.some(r => r.libreta) ? ["resuelto", "SELLADO"] : ["pendiente", "SIN SELLAR"];
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
  P.nPiezas = P.piezas.length;
  guardarPartida();
  precargarEscena(P.caso.escenas[P.i + 1]);
  (ESCENAS[e.tipo] || escenaDesconocida)(e);
}
/* Descarga ya las imágenes de la escena siguiente, para que no aparezca en blanco con mala conexión */
function precargarEscena(e) {
  if (!e) return;
  const urls = [e.fondo, e.objeto].filter(id => id && arte(id).listo).map(id => `arte/${id}.webp`);
  const pj = e.personaje, listas = pj ? arte(pj.id).listas || [] : [];
  const expr = pj && (listas.includes(pj.expresion) ? pj.expresion : listas.includes("neutral") ? "neutral" : null);
  if (expr) urls.push(`arte/${pj.id}-${expr}.webp`);
  urls.forEach(u => { new Image().src = u; });
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
  olvidarPartida(P.unidad);
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
    <input id="codigoSello" class="entrada" type="password" autocomplete="new-password" placeholder="Código del director" aria-label="Código del director">
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
    <input id="pinIn" class="entrada" type="password" inputmode="numeric" autocomplete="new-password" aria-label="PIN">
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
      <p class="aviso-maestro">Aquí se ven los datos guardados <strong>en este dispositivo</strong>. Si se borran los datos del navegador, se pierden: descarga de vez en cuando una <b>copia de seguridad</b> (más abajo) o activa la nube.</p>
      ${ajustes.pin ? "" : `<p class="aviso-maestro"><b>Sin PIN:</b> cualquier alumno puede entrar aquí. Pon uno en «PIN de esta zona» y guarda los ajustes.</p>`}
      ${norm(ajustes.codigoSello) === "lupa" ? `<p class="aviso-maestro"><b>Código de sello sin cambiar:</b> el que viene por defecto (LUPA) es público, así que un alumno podría sellarse solo. Cámbialo por uno tuyo.</p>` : ""}
      <h2>Ajustes del aula</h2>
      <div class="fila">
        <label>Libreta: <select id="ajLibreta"><option value="papel">De papel (el juego no guarda las pistas)</option><option value="digital">Digital (el juego guarda las pistas y deja escribir)</option></select></label>
        <label>Código de sello: <input id="ajCodigo" value="${esc(ajustes.codigoSello)}" maxlength="20" autocomplete="off"></label>
        <label>PIN de esta zona: <input id="ajPin" type="password" inputmode="numeric" maxlength="8" autocomplete="new-password" value="${esc(ajustes.pin || "")}" placeholder="sin PIN"></label>
        <label><input type="checkbox" id="ajRevision" ${modoRevision() ? "checked" : ""}> <b>Modo revisión</b> (para probarlo tú: abre todos los encargos y las lupas, y la preparación se puede saltar)</label>
        <label><input type="checkbox" id="ajSonido" ${ajustes.sonido === true ? "checked" : ""}> Actividades con sonido (extra: necesitan cascos o altavoz)</label>
        <label>Preparación en la Academia antes de cada caso: <select id="ajPrep"><option value="obligatoria">Obligatoria (el caso se abre al terminarla)</option><option value="opcional">Recomendada (se puede saltar)</option><option value="no">Sin preparación</option></select></label>
        <label>Orden de los casos: <select id="ajOrden"><option value="temporada">En orden (cada caso se abre al resolver el anterior)</option><option value="libre">Libre (todos abiertos)</option></select></label>
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
      ${htmlCopia()}
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
          ${criterios.map(c => { const n = r.notas.find(x => x.criterio === c); return `<td>${n ? `${esc(n.nota)} <small>${esc(n.calificacion)}</small><br><small>${esc(n.codigo)}</small>` : "—"}</td>`; }).join("")}
          <td>${r.encargo ? "—" : r.libreta ? `${Number(r.libreta.puntos) || 0}/4 ✔` : "sin sellar"}</td>
          <td>${Number(r.pistas) || 0}${r.consultas ? ` (+${Number(r.consultas) || 0} consultas)` : ""}</td><td>${esc(r.repasar.join(", "))}</td></tr>`).join("")}
        </tbody></table></div>` : `<p>Todavía no hay casos resueltos en este dispositivo.</p>`}
    </main>`;
  $("#ajLibreta").value = ajustes.libreta;
  $("#ajPrep").value = modoPreparacion();
  $("#ajOrden").value = ajustes.orden === "libre" ? "libre" : "temporada";
  $$(".nf-cuenta").forEach(c => c.onchange = () => {
    ajustes = { ...ajustes, cuentanNota: { ...cuentanNota(), [c.dataset.tipo]: c.checked } };
    guardar("ajustes", ajustes);
    vistaMaestro();
  });
  $("#ajGuardar").onclick = () => {
    ajustes = { ...ajustes, libreta: $("#ajLibreta").value, codigoSello: $("#ajCodigo").value.trim() || "LUPA", preparacion: $("#ajPrep").value, orden: $("#ajOrden").value, sonido: $("#ajSonido").checked, revision: $("#ajRevision").checked, pin: $("#ajPin").value.trim() };
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
  activarNotasFinales();
  activarNubeMaestro(vistaMaestro);
  activarCopia();
  $("#volver").onclick = () => (perfil ? vistaTablon() : vistaInicio());
  $("#csv").onclick = exportarCSV;
  $("#borrar").onclick = () => {
    $("#confirmacion").innerHTML = `<p class="aviso-maestro">Se borrarán todos los detectives y resultados de este dispositivo. <button class="boton-papel peligro" id="borrarSi">Sí, borrar todo</button> <button class="boton-papel" id="borrarNo">Cancelar</button></p>`;
    $("#borrarNo").onclick = () => ($("#confirmacion").innerHTML = "");
    $("#borrarSi").onclick = () => {
      // Se borra todo lo de los alumnos (también la Academia, las partidas a medias y la cola de la nube); los ajustes del aula se quedan
      clavesDelJuego().filter(c => c !== PREFIJO + "ajustes").forEach(c => localStorage.removeItem(c));
      location.reload();
    };
  };
}

/* ── Qué cuenta para la nota (decide el maestro): casos, encargos y Academia ── */
const cuentanNota = () => ({ casos: true, encargos: false, academia: false, ...(ajustes.cuentanNota || {}) });
const tipoDe = r => (r.contexto === "academia" ? "academia" : r.encargo ? "encargos" : "casos");
function fuentesNota() {
  const c = cuentanNota();
  const desde = ajustes.notaDesde || "", hasta = ajustes.notaHasta || "";
  return [...resultados.filter(r => !r.diagnostico), ...registrosAca]
    .filter(r => c[tipoDe(r)])
    .filter(r => (!desde || r.fecha.slice(0, 10) >= desde) && (!hasta || r.fecha.slice(0, 10) <= hasta));
}
/* Media por alumno y criterio de lo que cuenta (con el periodo elegido), en el orden de la lista de Séneca */
function notasPorAlumno() {
  const por = {};
  fuentesNota().forEach(r => {
    const pf = perfiles.find(p => p.id === r.perfilId);
    por[r.perfilId] ??= { id: r.perfilId, nombre: r.nombre, lista: pf?.lista || "", crit: {} };
    r.notas.forEach(n => (por[r.perfilId].crit[n.criterio] ??= []).push(n.nota));
  });
  const filas = Object.values(por).sort((a, b) => (Number(a.lista) || 999) - (Number(b.lista) || 999) || a.nombre.localeCompare(b.nombre));
  const crits = [...new Set(filas.flatMap(p => Object.keys(p.crit)))].sort((a, b) => a.localeCompare(b, "es", { numeric: true }));
  return { filas, crits };
}
const mediaNotas = v => Math.round(v.reduce((a, b) => a + b, 0) / v.length * 10) / 10;
const notaSeneca = v => Math.max(1, Math.min(10, Math.round(mediaNotas(v))));   // Séneca: nota entera de 1 a 10
function htmlNotasFinales() {
  const c = cuentanNota();
  const { filas, crits } = notasPorAlumno();
  return `
      <h2>¿Qué cuenta para la nota?</h2>
      <div class="fila">${[["casos", "Casos de la temporada"], ["encargos", "Encargos"], ["academia", "Academia (entrenamiento y preparación)"]].map(([k, t]) =>
        `<label><input type="checkbox" class="nf-cuenta" data-tipo="${k}" ${c[k] ? "checked" : ""}> ${t}</label>`).join("")}</div>
      <div class="fila"><label>Periodo: desde <input type="date" id="nfDesde" value="${esc(ajustes.notaDesde || "")}"></label><label>hasta <input type="date" id="nfHasta" value="${esc(ajustes.notaHasta || "")}"></label><small>(por ejemplo, el trimestre; vacío = todo)</small></div>
      <p class="aviso-maestro">Media de las notas por criterio de lo marcado (el piloto es evaluación inicial y no cuenta). <b>Para Séneca</b> (no admite importar archivos): pon a cada detective su <b>n.º de lista de Séneca</b>; la tabla se ordena así, y el botón 📋 de cada criterio copia su columna de notas enteras (1-10) para pasarlas o pegarlas en ese orden. Ver <code>docs/investigacion/seneca-exportacion.md</code>.</p>
      ${crits.length ? `<div class="tabla-scroll"><table class="tabla-seneca">
        <thead><tr><th>N.º</th><th>Detective</th>${crits.map(k => `<th title="${esc(NOMBRE_CRITERIO[k] || "")}">${esc(k)}.${esc(letraCurso(perfiles.find(p => p.id === filas[0]?.id)?.curso || "5"))}<br><button class="boton-mini" data-copiar="${esc(k)}" title="Copiar la columna para Séneca">📋</button></th>`).join("")}</tr></thead>
        <tbody>${filas.map(p => `<tr><td><input class="nf-lista" data-perfil="${esc(p.id)}" value="${esc(p.lista)}" size="3" inputmode="numeric" aria-label="N.º de lista de ${esc(p.nombre)}"></td><td>${esc(p.nombre)}</td>${crits.map(k => { const v = p.crit[k]; if (!v) return "<td>—</td>"; const m = mediaNotas(v); return `<td><b>${notaSeneca(v)}</b> <small>(${m} · ${calificacion(m)})</small><br><small>${v.length} reg.</small></td>`; }).join("")}</tr>`).join("")}</tbody>
      </table></div>
      <div class="fila"><button class="boton-papel" id="csvSeneca">Exportar tabla para Séneca (CSV)</button><span id="copiaMsg"></span></div>` : "<p>Todavía no hay notas de lo marcado.</p>"}`;
}
function activarNotasFinales() {
  $$(".nf-lista").forEach(i => i.onchange = () => {
    const pf = perfiles.find(p => p.id === i.dataset.perfil);
    if (pf) { pf.lista = i.value.trim(); guardar("perfiles", perfiles); }
  });
  ["nfDesde", "nfHasta"].forEach(id => $(`#${id}`) && ($(`#${id}`).onchange = () => {
    ajustes = { ...ajustes, notaDesde: $("#nfDesde").value, notaHasta: $("#nfHasta").value };
    guardar("ajustes", ajustes);
    vistaMaestro();
  }));
  $$("[data-copiar]").forEach(b => b.onclick = async () => {
    const { filas } = notasPorAlumno();
    const col = filas.map(p => (p.crit[b.dataset.copiar] ? notaSeneca(p.crit[b.dataset.copiar]) : "")).join("\n");
    try { await navigator.clipboard.writeText(col); $("#copiaMsg").textContent = `Copiada la columna ${b.dataset.copiar} (${filas.length} alumnos, en orden de lista).`; }
    catch { $("#copiaMsg").textContent = "No se ha podido copiar: usa el CSV."; }
  });
  $("#csvSeneca")?.addEventListener("click", () => {
    const { filas, crits } = notasPorAlumno();
    const letra = letraCurso(perfiles.find(p => p.id === filas[0]?.id)?.curso || "5");
    const cab = ["n_lista", "alias", ...crits.map(k => `${k}.${letra}`)];
    const lineas = [cab.join(";"), ...filas.map(p => [`"${celdaSegura(p.lista).replaceAll('"', '""')}"`, `"${celdaSegura(p.nombre).replaceAll('"', '""')}"`, ...crits.map(k => (p.crit[k] ? notaSeneca(p.crit[k]) : ""))].join(";"))];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\ufeff" + lineas.join("\n")], { type: "text/csv;charset=utf-8" }));
    a.download = `la-lupa_seneca_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  });
}

/* Un texto que empieza por = + - @ se lee como fórmula en una hoja de cálculo: se le antepone un apóstrofo */
const celdaSegura = v => { const s = String(v ?? ""); return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s; };
function exportarCSV() {
  const c = cuentanNota();
  const aca = registrosAca.map(r => ({ ...r, unidad: r.sala, titulo: `Academia · ${sala(r.sala)?.nombre || r.sala}`, notas: r.notas.map(n => ({ ...n, codigo: `${n.criterio}.${letraCurso(r.curso)}` })), pistas: 0, consultas: 0, minutos: "" }));
  const filas = [...resultados, ...aca].flatMap(r => r.notas.map(n => ({
    alumno: celdaSegura(r.nombre), curso: r.curso, tipo: tipoDe(r), cuenta_nota: !r.diagnostico && c[tipoDe(r)] ? "sí" : "no", unidad: r.unidad, caso: r.titulo, criterio: n.codigo,
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
  ["bebas-neue", "nunito", "patrick-hand", "special-elite", "vt323"].forEach(f => u.add(`fuentes/${f}.woff2`));
  return [...u].filter(Boolean).map(x => new URL(x, location.href).href);
}
function htmlSinInternet() {
  return `
      <h2>Jugar sin internet</h2>
      <p class="aviso-maestro">Descarga el juego completo en este dispositivo (unos 25 MB, sobre todo las imágenes). Después funciona aunque falle el wifi. En tablets se puede «Añadir a la pantalla de inicio» y se abre como una app.</p>
      <p class="aviso-maestro"><b>En iPad:</b> la app de la pantalla de inicio guarda sus datos aparte de Safari, así que instálala primero y configura y descarga todo <b>dentro de la app</b>. Y si el juego se usa desde Safari sin instalar, el iPad borra los datos tras 7 días sin abrirlo: antes de unas vacaciones, descarga una copia de seguridad.</p>
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

/* ── Copia de seguridad: todo lo guardado en este dispositivo, en un archivo ── */
const clavesDelJuego = () => { try { return Object.keys(localStorage).filter(c => c.startsWith(PREFIJO)); } catch { return []; } };
function htmlCopia() {
  return `
      <h2>Copia de seguridad</h2>
      <p class="aviso-maestro">Guarda en un archivo todos los detectives, resultados, progreso de la Academia y ajustes de este dispositivo, para recuperarlos si se borran o para pasarlos a otro. El archivo lleva los alias y las notas: guárdalo donde solo lo veas tú. Los avatares de la clase van aparte, en su paquete.</p>
      <div class="fila">
        <button class="boton-papel" id="copiaBajar">Descargar copia de seguridad</button>
        <label class="boton-papel" for="copiaSubir">Restaurar una copia…</label><input type="file" id="copiaSubir" accept=".json,application/json" hidden>
        <span id="copiaEstado"></span>
      </div>
      <div id="copiaConfirmar"></div>`;
}
function activarCopia() {
  $("#copiaBajar").onclick = () => {
    const datos = Object.fromEntries(clavesDelJuego().map(c => [c.slice(PREFIJO.length), localStorage.getItem(c)]));
    const copia = { app: "lalupa", tipo: "copia", version: 1, fecha: new Date().toISOString(), detectives: perfiles.length, resultados: resultados.length, datos };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(copia)], { type: "application/json" }));
    a.download = `la-lupa_copia_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    $("#copiaEstado").textContent = `Copia descargada: ${perfiles.length} detectives y ${resultados.length} resultados.`;
  };
  $("#copiaSubir").onchange = async ev => {
    const f = ev.target.files[0];
    ev.target.value = "";
    if (!f) return;
    let copia;
    try { copia = JSON.parse(await f.text()); } catch { copia = null; }
    const valida = copia && copia.app === "lalupa" && copia.tipo === "copia" && copia.datos && typeof copia.datos === "object" && Object.values(copia.datos).every(v => typeof v === "string");
    if (!valida) { $("#copiaEstado").textContent = "Ese archivo no es una copia de seguridad de La Lupa."; return; }
    $("#copiaConfirmar").innerHTML = `<p class="aviso-maestro">La copia es del ${esc(new Date(copia.fecha).toLocaleDateString("es-ES"))} y trae ${Number(copia.detectives) || 0} detectives y ${Number(copia.resultados) || 0} resultados. Al restaurarla <b>se sustituye todo lo que hay ahora en este dispositivo</b> (${perfiles.length} detectives y ${resultados.length} resultados). <button class="boton-papel peligro" id="copiaSi">Sí, restaurar</button> <button class="boton-papel" id="copiaNo">Cancelar</button></p>`;
    $("#copiaNo").onclick = () => ($("#copiaConfirmar").innerHTML = "");
    $("#copiaSi").onclick = () => {
      try {
        clavesDelJuego().forEach(c => localStorage.removeItem(c));
        Object.entries(copia.datos).forEach(([k, v]) => localStorage.setItem(PREFIJO + k, v));
        location.reload();
      } catch { $("#copiaEstado").textContent = "No se ha podido restaurar: el navegador no deja guardar datos."; }
    };
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
  // Un perfil de un curso que ya no existe pasa al primero, para que su tablón se abra
  perfiles.forEach(p => { if (!D.prog.cursos[p.curso]) p.curso = Object.keys(D.prog.cursos)[0]; });
  try { navigator.storage?.persist?.(); } catch { /* el navegador decide */ }
  marcarRevision();
  registrarSinInternet();
  await cargarEncargos();
  await Promise.race([cargarPaquete(), new Promise(listo => setTimeout(listo, 2000))]);
  vistaInicio();
}
init();
