/* ============================================================
   AGENCIA LA LUPA · Academia de detectives
   La antigua escuela de La Alameda, reabierta por Robles para entrenar.
   Patio (hub) con el «turno de hoy», cola de repaso espaciado por alumno
   y salas con estética propia. Salas activas: Archivo (fichas pendientes),
   Pupitre (corrección del documento) y Laboratorio (sismógrafo de sílabas).
   Decisiones de Pablo (4/11/2026): siempre abierta desde el tablón; se registra
   aparte de los casos (contexto «academia»); sin libreta; se puede usar en casa.
   Diseño completo: docs/investigacion/academia-actividades.md
   ============================================================ */
"use strict";

const ACA = { palabras: [], textos: [], testigos: [], alTerminar: null, nivel: 1 };

/* ── Niveles de cada ejercicio (Pablo, 4/11): lupas de bronce, plata, oro y diamante ──
   Cada actividad tiene su propio nivel por alumno. Se sube con 2 rondas seguidas con ≥ 80 % de aciertos.
   Las actividades leen el nivel con nivelAca() y adaptan su dificultad con porNivel() y segunNivel(). */
const NIVELES_ACA = [
  { n: 1, nombre: "Lupa de bronce", corto: "Bronce", icono: "🥉", puntos: 1 },
  { n: 2, nombre: "Lupa de plata", corto: "Plata", icono: "🥈", puntos: 1.25 },
  { n: 3, nombre: "Lupa de oro", corto: "Oro", icono: "🥇", puntos: 1.5 },
  { n: 4, nombre: "Lupa de diamante · Maestro detective", corto: "Diamante", icono: "💎", puntos: 2 },
];
const UMBRAL_NIVEL = 0.8, RONDAS_NIVEL = 2;
const nivelAca = () => Math.min(4, Math.max(1, ACA.nivel || 1));
/* Valor según el nivel: segunNivel([3, 4, 5, 6]) → 3 en bronce… 6 en diamante */
const segunNivel = valores => valores[Math.min(nivelAca(), valores.length) - 1];
/* Filtra una lista de palabras o textos con campo «nivel» (1-3) según la lupa; si quedan pocas, amplía */
function porNivel(lista, minimo = 4, n = nivelAca()) {
  const nv = x => x.nivel || 1;
  const filtros = { 1: x => nv(x) === 1, 2: x => nv(x) <= 2, 3: x => nv(x) >= 2, 4: x => nv(x) === 3 };
  const res = lista.filter(filtros[n] || (() => true));
  if (res.length >= minimo) return res;
  const amplio = lista.filter(n >= 3 ? x => nv(x) >= 2 : x => nv(x) <= 2);
  return amplio.length >= minimo ? amplio : lista;
}
function progresoNivel(actId, s = estadoAca()) {
  s.niveles ??= {};
  return (s.niveles[actId] ??= { max: 1, racha: 0 });
}
const nivelMaximo = actId => (modoRevisionAca() ? 4 : progresoNivel(actId).max);
const modoRevisionAca = () => ajustes.revision === true;
function htmlElegirNivel(actId, elegido) {
  const max = nivelMaximo(actId);
  return `<div class="aca-niveles" role="radiogroup" aria-label="Nivel">${NIVELES_ACA.map(l => `
    <button class="aca-nivel ${l.n === elegido ? "activo" : ""}" data-nivel="${l.n}" ${l.n > max ? "disabled" : ""} role="radio" aria-checked="${l.n === elegido}">
      <span>${l.n > max ? "🔒" : l.icono}</span><b>${esc(l.corto)}</b></button>`).join("")}</div>`;
}   // bancos de datos (datos/academia/)
const INTERVALOS = [1, 3, 7, 15, 30];              // sesiones hasta el siguiente repaso
const TOPE_DIARIO = 150;                           // puntos de entrenamiento por día
let registrosAca = cargar("academia-registros", []);

const SALAS = [
  { id: "archivo", nombre: "El Archivo", lugar: "Sótano", fondo: "sala-archivo", instructor: "mateo", activa: true, actividad: "fichas", gancho: "Tus palabras falladas te esperan en las fichas." },
  { id: "pupitre", nombre: "El Pupitre", lugar: "Aula 1", fondo: "sala-pupitre", instructor: "anselmo", activa: true, actividad: "documento", gancho: "El Simulador del Tachón ha colado faltas en un documento." },
  { id: "laboratorio", nombre: "El Laboratorio", lugar: "Aula de ciencias", fondo: "sala-laboratorio", instructor: "mateo", activa: true, actividad: "sismografo", gancho: "Analiza la palabra: sílabas, golpe de voz y tilde." },
  { id: "terminal", nombre: "La Terminal ORTO-3000", lugar: "Informática", fondo: "sala-terminal", activa: false },
  { id: "pizarra", nombre: "La Pizarra", lugar: "Aula de gramática", fondo: "sala-pizarra", activa: false },
  { id: "interrogatorios", nombre: "Interrogatorios", lugar: "Planta baja", fondo: "sala-interrogatorios", instructor: "lola", activa: true, actividad: "testigo", gancho: "El testigo seseante: así se dice, así se escribe." },
  { id: "centralita", nombre: "La Centralita", lugar: "Azotea", fondo: "sala-centralita", activa: false },
  { id: "imprenta", nombre: "La Imprenta del Eco", lugar: "Antigua imprenta", fondo: "sala-imprenta", activa: false },
];
const sala = id => SALAS.find(s => s.id === id);
const azarElem = a => a[Math.floor(Math.random() * a.length)];
const barajar = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
const hoy = () => new Date().toISOString().slice(0, 10);
const enBanco = p => ACA.palabras.find(w => norm(w.p) === norm(p));
const reglasBanco = () => [...new Set(ACA.palabras.map(w => w.regla))];

/* ── Estado del alumno en la Academia (por perfil) ───────────── */
const claveAca = () => `academia-${perfil.id}`;
function estadoAca() {
  return { sesion: 0, ultimoDia: null, cola: {}, archivadas: [], puntos: 0, puntosDia: {}, turno: { dia: null, hechas: [] }, leccionVista: {}, ...cargar(claveAca(), {}) };
}
const guardarAca = s => guardar(claveAca(), s);
function puntosAcademia(p = perfil) { return p ? (cargar(`academia-${p.id}`, {}).puntos || 0) : 0; }

/* Cola de repaso espaciado: las palabras falladas entran; acertarlas cuando toca las hace avanzar */
function actualizarCola(eventos, origen) {
  if (!perfil) return 0;
  const s = estadoAca();
  let nuevas = 0;
  eventos.filter(e => e.criterio === "5.1" && e.palabra).forEach(e => {
    const f = s.cola[e.palabra];
    if (e.ok) {
      if (!f || s.sesion < f.proximo) return;
      f.nivel++;
      if (f.nivel >= INTERVALOS.length) { delete s.cola[e.palabra]; if (!s.archivadas.includes(e.palabra)) s.archivadas.push(e.palabra); }
      else f.proximo = s.sesion + INTERVALOS[f.nivel];
    } else {
      if (!f) nuevas++;
      s.cola[e.palabra] = { regla: e.regla || f?.regla || enBanco(e.palabra)?.regla || null, nivel: 0, proximo: s.sesion + INTERVALOS[0], fallos: (f?.fallos || 0) + 1, origen };
      s.archivadas = s.archivadas.filter(w => w !== e.palabra);
    }
  });
  guardarAca(s);
  return nuevas;
}
const fichasVencidas = s => Object.entries(s.cola).filter(([, f]) => f.proximo <= s.sesion).map(([p, f]) => ({ p, ...f }));

/* ── El turno de hoy: repaso + último caso + sorpresa ────────── */
function turnoDeHoy(s) {
  const mios = resultados.filter(r => r.perfilId === perfil.id && !r.diagnostico);
  const ultimaRegla = mios.at(-1)?.reglas?.find(r => reglasBanco().includes(r));
  const vencidas = fichasVencidas(s).length;
  const otra = azarElem(reglasBanco().filter(r => r !== ultimaRegla)) || reglasBanco()[0];
  const delCaso = ultimaRegla || "tildes-generales";
  return [
    vencidas ? { clave: "repaso", sala: "archivo", texto: `Repaso: ${vencidas} ficha${vencidas > 1 ? "s" : ""} vencida${vencidas > 1 ? "s" : ""}` }
             : { clave: "repaso", sala: "archivo", texto: "Repaso: palabras de riesgo" },
    { clave: "caso", sala: delCaso === "tildes-generales" ? "laboratorio" : "pupitre", regla: delCaso, texto: `Del último caso: ${D.reglas[delCaso]?.nombre || delCaso}` },
    s.sesion % 2 && ACA.testigos.length
      ? { clave: "sorpresa", sala: "interrogatorios", texto: "Sorpresa: el testigo seseante" }
      : { clave: "sorpresa", sala: "pupitre", regla: otra, texto: `Sorpresa: ${D.reglas[otra]?.nombre || otra}` },
  ];
}

/* ── Patio de la Academia (hub) ──────────────────────────────── */
function vistaPatio() {
  P = null;
  ACA.alTerminar = null;
  const s = estadoAca();
  if (s.ultimoDia !== hoy()) { s.sesion++; s.ultimoDia = hoy(); s.turno = { dia: hoy(), hechas: [] }; guardarAca(s); }
  const turno = turnoDeHoy(s);
  pintarEscena(`
    <div class="aca-cabecera">
      <button class="hud-volver" id="acaVolver">◂ Tablón</button>
      <h1 class="cartel">Academia de detectives</h1>
      <span class="placa">Fichas en cola: <b>${Object.keys(s.cola).length}</b> · Archivadas: <b>${s.archivadas.length}</b> · ${s.puntos || 0} pts</span>
    </div>
    <div class="aca-turno">
      <h2 class="cartel">Turno de hoy</h2>
      ${turno.map(t => `<button class="aca-tarea ${s.turno.hechas.includes(t.clave) ? "hecha" : ""}" data-clave="${t.clave}" data-sala="${t.sala}" data-regla="${esc(t.regla || "")}">
        <small>${esc(sala(t.sala).nombre)}</small><b>${esc(t.texto)}</b><span>${s.turno.hechas.includes(t.clave) ? "✔ Hecho" : "Empezar ▸"}</span></button>`).join("")}
      <p class="aca-anselmo">Don Anselmo: «Un buen detective entrena un poco cada día. Empieza por tu turno… o elige una puerta».</p>
    </div>
    <div class="aca-puertas">${SALAS.map(sl => `
      <button class="aca-puerta ${sl.activa ? "" : "cerrada"}" data-sala="${sl.id}" ${sl.activa ? "" : "disabled"}>
        <small>${esc(sl.lugar)}</small><b>${esc(sl.nombre)}</b><span>${sl.activa ? esc(sl.gancho) : "Próximamente"}</span></button>`).join("")}</div>`,
    { fondo: "patio-academia", clase: "oscurecido" });
  $("#acaVolver").onclick = vistaTablon;
  $$(".aca-tarea").forEach(b => b.onclick = () => entrarSala(b.dataset.sala, { regla: b.dataset.regla || null, turno: b.dataset.clave }));
  $$(".aca-puerta:not(.cerrada)").forEach(b => b.onclick = () => entrarSala(b.dataset.sala, {}));
}

/* ── Entrada a una sala: el instructor explica antes de practicar ── */
/* Varias actividades por sala: salas/<sala>-extra.js llama a nuevaActividad(...).
   La primera de la lista es la original de la sala. Al entrar, si hay más de una, se elige en un menú. */
function nuevaActividad(salaId, meta, fn) {
  const sl = sala(salaId);
  sl.actividades ??= [{ id: sl.actividad, nombre: sl.nombreActividad || "Entrenamiento principal", desc: sl.gancho, reglas: sl.reglas, leccionFija: sl.leccionFija }];
  sl.actividades.push(meta);
  ACTIVIDADES[meta.id] = fn;
}
function usarActividad(sl, id) {
  const m = (sl.actividades || []).find(a => a.id === id);
  if (!m) return;
  sl.actividad = m.id; sl.reglas = m.reglas; sl.leccionFija = m.leccionFija;
}
function menuActividades(sl, opts) {
  pintarEscena(`
    <h1 class="cartel titulo-escena">${esc(sl.nombre)}</h1>
    ${htmlPersonaje({ id: sl.instructor, expresion: "neutral", lado: "izq" }, "pequeno")}
    <div class="aca-panel der">
      <p class="apuntalo">¿Qué ejercicio hacemos hoy?</p>
      <div class="opciones">${sl.actividades.map(a => `<button class="opcion aca-act" data-act="${esc(a.id)}"><b>${esc(a.nombre)} <span class="aca-lupa">${NIVELES_ACA[nivelMaximo(a.id) - 1].icono}</span></b><small>${esc(a.desc || "")}</small></button>`).join("")}</div>
    </div>
    <button class="hud-volver" id="acaVolver">◂ Patio</button>`, { fondo: sl.fondo, clase: "oscurecido" });
  $("#acaVolver").onclick = vistaPatio;
  $$(".aca-act").forEach(b => b.onclick = () => entrarSala(sl.id, { ...opts, actividad: b.dataset.act }));
}

function entrarSala(id, { regla = null, turno = null, actividad = null }) {
  const sl = sala(id);
  if (sl.actividades?.length > 1 && !actividad) return menuActividades(sl, { regla, turno });
  if (actividad) usarActividad(sl, actividad);
  const s = estadoAca();
  if (sl.actividad === "fichas") return leccion(sl, null, turno, `Este es el fichero de tus palabras falladas. Cada ficha vuelve cuando toca: si la escribes bien, se va alejando; si fallas, vuelve al principio. ${fichasVencidas(s).length ? `Hoy tienes ${fichasVencidas(s).length} pendientes.` : "Hoy no tienes fichas vencidas: entrenaremos palabras de riesgo."}`);
  if (sl.actividad === "testigo") return leccion(sl, null, turno, "En La Alameda muchos hablamos con seseo: decimos «casuela» y se escribe cazuela. También decimos «caye» por calle (yeísmo) y nos comemos la d del final: «verdá». Hablar así no es un error: es nuestra forma de hablar, y está muy bien. Lo que tiene que saber un detective es cómo se ESCRIBE. Yo lo digo así… y lo escribo así.");
  // Salas sin elección de regla (salas/<id>.js define sl.leccionFija con el texto del instructor)
  if (sl.leccionFija) return leccion(sl, null, turno, sl.leccionFija);
  if (!regla) return elegirRegla(sl, turno);
  leccion(sl, regla, turno);
}

function elegirRegla(sl, turno) {
  const reglas = sl.reglas || (sl.actividad === "sismografo" ? ["tildes-generales"] : reglasBanco());
  if (reglas.length === 1) return leccion(sl, reglas[0], turno);
  pintarEscena(`
    <h1 class="cartel titulo-escena">${esc(sl.nombre)}</h1>
    ${htmlPersonaje({ id: sl.instructor, expresion: "neutral", lado: "izq" }, "pequeno")}
    <div class="aca-panel der">
      <p class="apuntalo">¿Qué quieres entrenar?</p>
      <div class="opciones">${reglas.map(r => `<button class="opcion" data-regla="${esc(r)}">${esc(D.reglas[r]?.nombre || r)}</button>`).join("")}
        <button class="opcion" data-regla="mezcla">Todo mezclado (modo inspector)</button></div>
    </div>
    <button class="hud-volver" id="acaVolver">◂ Patio</button>`, { fondo: sl.fondo, clase: "oscurecido" });
  $("#acaVolver").onclick = vistaPatio;
  $$(".opcion").forEach(b => b.onclick = () => leccion(sl, b.dataset.regla, turno));
}

function leccion(sl, regla, turno, texto) {
  const s = estadoAca();
  const ficha = regla && regla !== "mezcla" ? D.reglas[regla]?.ficha : null;
  const yaVista = s.leccionVista[regla] === s.sesion;
  const intro = texto || (regla === "mezcla" ? "Modo inspector: reglas mezcladas y sin avisar de cuál toca. Como en la calle." : `Hoy entrenamos: ${D.reglas[regla]?.nombre || regla}.`);
  pintarEscena(`
    <h1 class="cartel titulo-escena">${esc(sl.nombre)}</h1>
    ${htmlPersonaje({ id: sl.instructor, expresion: "neutral", lado: "izq" })}
    <div class="aca-panel der leccion">
      <span class="quien">${esc(nombreInstructor(sl))}</span>
      <p class="maquina-fija">${esc(intro)}</p>
      ${ficha && !yaVista ? `<p class="etiqueta">Lección rápida</p><ul class="ficha">${ficha.puntos.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
      <p class="etiqueta">Nivel del ejercicio</p>
      ${htmlElegirNivel(sl.actividad, ACA.nivel = Math.min(nivelMaximo(sl.actividad), cargar(`nivel-${perfil.id}-${sl.actividad}`, nivelMaximo(sl.actividad))))}
      <p class="aca-nivel-ayuda">${nivelMaximo(sl.actividad) < 4 ? `Consigue ${RONDAS_NIVEL} rondas seguidas con un ${UMBRAL_NIVEL * 100} % de aciertos para ganar la siguiente lupa.` : "¡Tienes todas las lupas de este ejercicio!"}</p>
      <div class="acciones izquierda"><button class="boton-sello" id="empezar">Empezar entrenamiento ▸</button>${ficha && yaVista ? `<button class="boton-papel" id="repasar">Ver la lección</button>` : ""}</div>
    </div>
    <button class="hud-volver" id="acaVolver">◂ Patio</button>`, { fondo: sl.fondo, clase: "oscurecido" });
  $("#acaVolver").onclick = vistaPatio;
  $("#repasar")?.addEventListener("click", () => abrirModal(`<h3>${esc(ficha.titulo)}</h3><ul class="ficha">${ficha.puntos.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`, "ventana-archivo"));
  $$(".aca-nivel:not([disabled])").forEach(b => b.onclick = () => {
    ACA.nivel = Number(b.dataset.nivel);
    guardar(`nivel-${perfil.id}-${sl.actividad}`, ACA.nivel);
    $$(".aca-nivel").forEach(x => { x.classList.toggle("activo", x === b); x.setAttribute("aria-checked", x === b); });
  });
  $("#empezar").onclick = () => {
    if (regla) { s.leccionVista[regla] = s.sesion; guardarAca(s); }
    ACTIVIDADES[sl.actividad](sl, regla, turno);
  };
}
const nombreInstructor = sl => arte(sl.instructor).nombre || "Instructor";

/* Partida «ligera» para reutilizar registrar() y los componentes del motor */
function partidaAca(sl, reglas) {
  P = { caso: { id: `academia-${sl.id}`, numero: "A", titulo: sl.nombre, reglas, escenas: [{ tipo: sl.actividad, regla: reglas.length === 1 ? reglas[0] : null }] },
        unidad: null, i: 0, eventos: [], piezas: [], cartas: false, pistas: {}, repasar: new Set(), consultas: 0, notas: [], inicio: Date.now(), academia: true };
}

function terminarActividad(sl, turno) {
  const ev = P.eventos;
  const aciertos = ev.filter(e => e.ok).length;
  actualizarCola(ev, "academia");
  const s = estadoAca();
  const dia = hoy();
  const nivel = nivelAca();
  const lupa = NIVELES_ACA[nivel - 1];
  const posibles = Math.round((aciertos * 5 + (aciertos === ev.length && ev.length ? 20 : 0)) * lupa.puntos);
  const ganados = Math.max(0, Math.min(posibles, TOPE_DIARIO - (s.puntosDia[dia] || 0)));
  s.puntosDia[dia] = (s.puntosDia[dia] || 0) + ganados;
  s.puntos = (s.puntos || 0) + ganados;
  if (turno && !s.turno.hechas.includes(turno)) s.turno.hechas.push(turno);
  // Progreso de nivel: solo cuenta jugar en la lupa más alta que se tiene
  let nuevaLupa = null;
  const pg = progresoNivel(sl.actividad, s);
  if (nivel === pg.max && ev.length) {
    pg.racha = aciertos / ev.length >= UMBRAL_NIVEL ? pg.racha + 1 : 0;
    if (pg.racha >= RONDAS_NIVEL && pg.max < 4) { pg.max++; pg.racha = 0; nuevaLupa = NIVELES_ACA[pg.max - 1]; guardar(`nivel-${perfil.id}-${sl.actividad}`, pg.max); }
  }
  guardarAca(s);
  registrosAca.push({ id: uid(), contexto: "academia", perfilId: perfil.id, nombre: perfil.nombre, curso: perfil.curso, sala: sl.id,
    reglas: P.caso.reglas, actividad: sl.actividad, nivel, fecha: new Date().toISOString(), aciertos, intentos: ev.length, notas: calcularNotas(ev), repasar: [...P.repasar], eventos: ev });
  guardar("academia-registros", registrosAca);
  if (typeof nubeTrasResultado === "function") nubeTrasResultado(registrosAca.at(-1));
  P = null;
  const aura = aciertos === ev.length && ev.length ? " ¡Ronda perfecta: +aura!" : "";
  // Si la actividad se lanzó desde otra pantalla (la ruta de preparación de un caso), se vuelve allí
  const volver = ACA.alTerminar;
  ACA.alTerminar = null;
  volver?.marcar?.(aciertos, ev.length);
  momento({ titulo: "¡Entrenamiento completado!", personaje: { id: sl.instructor, expresion: "contento", lado: "izq" }, boton: volver ? volver.boton : "Volver al patio",
    texto: `${lupa.icono} ${lupa.corto} · ${aciertos} de ${ev.length} a la primera. +${ganados} puntos${ganados < posibles ? " (has llegado al tope de hoy)" : ""}.${aura}${nuevaLupa ? ` ¡NUEVA LUPA: ${nuevaLupa.icono} ${nuevaLupa.nombre}!` : nivel === pg.max && pg.max < 4 && pg.racha ? ` Una ronda más así y ganas la ${NIVELES_ACA[pg.max].nombre.toLowerCase()}.` : ""}`, alSeguir: volver ? volver.ir : vistaPatio });
}

/* Leer en voz alta (si el navegador tiene voz en español; si no, no pasa nada) */
/* El sonido es un extra opcional (Pablo, 4/11): necesita cascos o altavoz. Se activa en la zona del maestro (ajustes.sonido) */
const sonidoActivo = () => ajustes.sonido === true;
function hablar(texto) {
  if (!sonidoActivo()) return;
  try { const u = new SpeechSynthesisUtterance(texto); u.lang = "es-ES"; u.rate = .9; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch { /* sin voz */ }
}
const hayVoz = () => sonidoActivo() && typeof speechSynthesis !== "undefined";

/* ── Actividades ─────────────────────────────────────────────── */
const ACTIVIDADES = {
  /* A1 · Fichas pendientes: escribir de memoria a partir de una pista (5.1) */
  fichas(sl, _regla, turno) {
    const s = estadoAca();
    let fichas = barajar(fichasVencidas(s)).slice(0, 6);
    const riesgo = !fichas.length;
    if (riesgo) fichas = barajar(ACA.palabras.filter(w => w.mal)).slice(0, 5).map(w => ({ p: w.p, regla: w.regla }));
    partidaAca(sl, [...new Set(fichas.map(f => f.regla).filter(Boolean))]);
    let k = 0;
    const pintar = () => {
      const f = fichas[k];
      if (!f) return terminarActividad(sl, turno);
      const w = enBanco(f.p);
      const pista = w?.frase ? `«${w.frase}»` : `Empieza por «${f.p[0]}» y tiene ${[...f.p].length} letras.`;
      pintarEscena(`
        <h1 class="cartel titulo-escena">${esc(sl.nombre)}</h1>
        <p class="instruccion">${riesgo ? "Sin fichas vencidas: entrena estas palabras de riesgo." : "Escribe la palabra de la ficha. Si aciertas, pasa al cajón siguiente."}</p>
        <div class="aca-ficha">
          <small>Ficha ${k + 1} de ${fichas.length} · ${esc(D.reglas[f.regla]?.nombre || "Repaso")}</small>
          <p class="aca-pista">${esc(pista)}</p>
          ${hayVoz() ? `<button class="boton-papel" id="oir">🔊 Escuchar la palabra</button>` : ""}
          <input id="resp" class="entrada" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Escribe la palabra">
          <p id="msg" class="msg"></p>
          <div class="acciones izquierda"><button class="boton-sello" id="ok">Comprobar</button></div>
        </div>
        <button class="hud-volver" id="acaVolver">◂ Patio</button>`, { fondo: sl.fondo, clase: "oscurecido" });
      $("#acaVolver").onclick = () => confirmar("¿Volver al patio? Se perderá esta ronda.", vistaPatio, "Volver");
      $("#oir")?.addEventListener("click", () => hablar(f.p));
      const inp = $("#resp"); inp.focus();
      let intentada = false, copiando = false;
      const comprobar = () => {
        if (!inp.value.trim()) return;
        const ok = norm(inp.value) === norm(f.p);
        if (!intentada) { intentada = true; registrar("5.1", ok, f.p, "ficha", f.regla); }
        if (ok) {
          $(".aca-ficha").classList.add(copiando ? "copiada" : "sellada");
          aviso(copiando ? "Bien copiada. La ficha vuelve al primer cajón." : `¡Bien! «${f.p}» pasa al cajón siguiente.`, "bien");
          k++; setTimeout(pintar, 900); return;
        }
        copiando = true;
        $("#msg").innerHTML = `Se escribe <strong>${esc(f.p)}</strong>. ${esc(PISTA_REGLA[f.regla] || "")} Escríbela tú para cerrar la ficha.`;
        inp.value = ""; inp.focus();
      };
      $("#ok").onclick = comprobar;
      inp.onkeydown = ev => { if (ev.key === "Enter") comprobar(); };
    };
    pintar();
  },

  /* P1 · La corrección del documento: faltas sembradas en un documento del barrio (9.2 + 5.1) */
  documento(sl, regla, turno) {
    const activas = regla && regla !== "mezcla" ? [regla] : reglasBanco();
    const s = estadoAca();
    const enCola = new Set(Object.keys(s.cola));
    const rondas = 2;
    let r = 0;
    partidaAca(sl, activas);
    const generar = () => {
      // Textos con al menos 2 palabras de la regla; si no los hay, con 1; y si tampoco, con cualquier regla
      const conReglas = rs => ACA.textos.map(t => ({ t, marcas: [...t.texto.matchAll(/\[([^\]]+)\]/g)].map(m => m[1]).filter(m => { const w = enBanco(m); return w?.mal && rs.includes(w.regla); }) }));
      let candidatos = conReglas(activas).filter(c => c.marcas.length >= 2);
      if (!candidatos.length) candidatos = conReglas(activas).filter(c => c.marcas.length >= 1);
      if (!candidatos.length) candidatos = conReglas(reglasBanco()).filter(c => c.marcas.length >= 2);
      const { t, marcas } = azarElem(candidatos);
      const n = Math.min(marcas.length, regla === "mezcla" ? 4 : 3);
      const elegidas = new Set([...marcas.filter(m => enCola.has(norm(m))), ...barajar(marcas)].slice(0, n));
      const decl = t.texto.replace(/\[([^\]]+)\]/g, (_, m) => {
        if (!elegidas.has(m)) return m;
        const w = enBanco(m);
        const may = m[0] !== m[0].toLowerCase();
        const cap = x => (may ? x[0].toUpperCase() + x.slice(1) : x);
        return `{${cap(w.mal)}|${cap(w.p)}|${w.regla}}`;
      });
      return { tipo: t.tipo, decl, n: elegidas.size };
    };
    const pintar = () => {
      if (r >= rondas) return terminarActividad(sl, turno);
      const doc = generar();
      const tokens = tokenizar(doc.decl);
      pintarEscena(`
        <h1 class="cartel titulo-escena">${esc(sl.nombre)}</h1>
        <p class="instruccion">El Simulador del Tachón ha colado ${doc.n} faltas en este documento. Tócalas y escríbelas bien.</p>
        <article class="documento pupitre"><small>${esc(doc.tipo)} · documento ${r + 1} de ${rondas}</small><div id="decl"></div></article>
        <p class="contador centro-abajo" id="cont"></p>
        <button class="hud-volver" id="acaVolver">◂ Patio</button>`, { fondo: sl.fondo });
      $("#acaVolver").onclick = () => confirmar("¿Volver al patio? Se perderá esta ronda.", vistaPatio, "Volver");
      const total = tokens.filter(x => x.error).length;
      const contador = () => ($("#cont").textContent = `Faltas corregidas: ${total - ctx.pendientes} de ${total}`);
      const ctx = { pendientes: total, conCarta: false, onCambio: contador, onCompleto: () => { aviso("¡Documento limpio!", "bien"); r++; setTimeout(pintar, 1000); } };
      $("#decl").append(textoInteractivo(tokens, ctx));
      contador();
    };
    pintar();
  },

  /* I5 · El testigo seseante: así se dice, así se escribe (5.1 y 1.3, sin tratar el habla como error) */
  testigo(sl, _regla, turno) {
    const lista = barajar(ACA.testigos).slice(0, 4);
    partidaAca(sl, ["c-z-s", "ll-y", "d-z-finales"]);
    let k = 0;
    const pintar = () => {
      const t = lista[k];
      if (!t) return terminarActividad(sl, turno);
      const objetivos = [...t.frase.matchAll(/\[([^\]]+)\]/g)].map(m => m[1]).filter(w => pronunciar(w) !== w.toLowerCase());
      const dicho = t.frase.split(/(\[[^\]]+\])/).map(trozo => {
        const m = trozo.match(/^\[(.+)\]$/);
        if (!m) return esc(trozo);
        return pronunciar(m[1]) !== m[1].toLowerCase() ? `<b>${esc(pronunciar(m[1]))}</b>` : esc(m[1]);
      }).join("");
      pintarEscena(`
        <h1 class="cartel titulo-escena">${esc(sl.nombre)}</h1>
        ${htmlPersonaje({ id: t.quien, expresion: "neutral", lado: "der" })}
        <div class="acta">
          <small>Acta de declaración · Testigo ${k + 1} de ${lista.length}: ${esc(arte(t.quien).nombre || t.quien)}</small>
          <p class="etiqueta">Así lo ha dicho</p>
          <p class="oral">[ ${dicho} ]</p>
          <p class="etiqueta">Escríbelo como se escribe</p>
          ${objetivos.map((w, i) => `<label class="campo-acta"><span class="oral">[${esc(pronunciar(w))}]</span> → <input data-i="${i}" class="entrada" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Escribe ${esc(pronunciar(w))} como se escribe"><small class="corr"></small></label>`).join("")}
          <p id="msg" class="msg"></p>
          <div class="acciones izquierda"><button class="boton-sello" id="ok">Comprobar el acta</button></div>
        </div>
        <button class="hud-volver" id="acaVolver">◂ Patio</button>`, { fondo: sl.fondo, clase: "oscurecido" });
      $("#acaVolver").onclick = () => confirmar("¿Volver al patio? Se perderá esta ronda.", vistaPatio, "Volver");
      const intentadas = new Set(), bien = new Set();
      $$(".campo-acta input")[0]?.focus();
      $("#ok").onclick = () => {
        $$(".campo-acta input").forEach(inp => {
          const i = Number(inp.dataset.i), w = objetivos[i];
          if (bien.has(i) || !inp.value.trim()) return;
          const ok = norm(inp.value) === norm(w);
          if (!intentadas.has(i)) { intentadas.add(i); registrar("5.1", ok, w, "testigo", enBanco(w)?.regla); }
          const nota = inp.parentElement.querySelector(".corr");
          if (ok) { bien.add(i); inp.disabled = true; inp.classList.add("acierto"); nota.textContent = ""; }
          else { nota.textContent = `Se escribe: ${w}. Escríbela tú.`; inp.value = ""; }
        });
        if (bien.size < objetivos.length) { $("#msg").textContent = bien.size ? "Revisa las que faltan." : "Escribe todas las palabras marcadas."; return; }
        $("#msg").textContent = "";
        $(".acta .acciones").innerHTML = `<div class="explicacion">${objetivos.map(w => `Se dice «${esc(pronunciar(w))}» y se escribe <b>${esc(w)}</b>: ${esc(porQueSeEscribe(w))}`).join("<br>")}</div><button class="flecha" id="sig">Siguiente testigo ▸</button>`;
        $("#sig").onclick = () => { k++; pintar(); };
        $(".acta").scrollTop = $(".acta").scrollHeight;
      };
    };
    pintar();
  },

  /* L1 · El sismógrafo de sílabas: sílaba fuerte (9.1) → tipo (9.1) → escribir con o sin tilde (5.1) */
  sismografo(sl, _regla, turno) {
    const s = estadoAca();
    const banco = ACA.palabras.filter(w => w.regla === "tildes-generales" && w.silabas);
    const conT = barajar(banco.filter(w => w.p !== quitarTildes(w.p)));
    const sinT = barajar(banco.filter(w => w.p === quitarTildes(w.p)));
    const cola = banco.filter(w => s.cola[w.p]);
    const lista = barajar([...new Set([...cola, ...conT.slice(0, 3), ...sinT.slice(0, 3)])]).slice(0, 6);
    partidaAca(sl, ["tildes-generales"]);
    let k = 0;
    const TIPOS = { 1: "aguda", 2: "llana", 3: "esdrujula" };
    const NOMBRE = { aguda: "aguda", llana: "llana", esdrujula: "esdrújula" };
    const REGLA = { aguda: "Las agudas llevan tilde si terminan en vocal, -n o -s.", llana: "Las llanas llevan tilde si NO terminan en vocal, -n ni -s.", esdrujula: "Las esdrújulas llevan tilde siempre." };
    const pintar = () => {
      const w = lista[k];
      if (!w) return terminarActividad(sl, turno);
      const desdeFinal = w.silabas.length - w.tonica;
      const tipo = TIPOS[Math.min(desdeFinal, 3)];
      const lleva = w.p !== quitarTildes(w.p);
      let paso = 1;
      const muestra = w.silabas.map((sil, i) => `<button class="silaba" data-i="${i}">${[...sil].map(ch => (/[aeiouáéíóú]/i.test(ch) ? `<span class="bajo-mancha gota">${esc(quitarTilde(ch))}</span>` : esc(ch))).join("")}</button>`).join("");
      pintarEscena(`
        <h1 class="cartel titulo-escena">${esc(sl.nombre)}</h1>
        <p class="instruccion" id="instr">Paso 1 · Toca la sílaba que suena más fuerte.</p>
        <div class="sismo">
          <small>Muestra ${k + 1} de ${lista.length} · las gotas tapan las posibles tildes</small>
          <div class="muestra">${muestra}</div>
          <svg class="onda" viewBox="0 0 600 80" preserveAspectRatio="none" aria-hidden="true"><polyline id="onda" points="0,40 600,40" fill="none" stroke="#9be2ae" stroke-width="3"/></svg>
          ${hayVoz() ? `<button class="boton-papel" id="oir">🔊 Escuchar</button>` : ""}
          <div id="zona"></div>
          <p id="msg" class="msg"></p>
        </div>
        <button class="hud-volver" id="acaVolver">◂ Patio</button>`, { fondo: sl.fondo, clase: "oscurecido" });
      $("#acaVolver").onclick = () => confirmar("¿Volver al patio? Se perderá esta ronda.", vistaPatio, "Volver");
      $("#oir")?.addEventListener("click", () => hablar(w.p));
      const pico = i => {
        const n = w.silabas.length, x = (i + .5) / n * 600;
        $("#onda").setAttribute("points", `0,40 ${x - 40},40 ${x - 20},10 ${x},75 ${x + 20},5 ${x + 40},40 600,40`);
      };
      let primera = true;
      $$(".silaba").forEach(b => b.onclick = () => {
        if (paso !== 1) return;
        const ok = Number(b.dataset.i) === w.tonica;
        if (primera) { registrar("9.1", ok, w.p, "sílaba tónica", "tildes-generales"); primera = false; }
        if (!ok) { $("#msg").textContent = "Esa no. Di la palabra en voz alta dando una palmada en la sílaba que suena más fuerte."; return; }
        b.classList.add("tonica"); pico(w.tonica); $("#msg").textContent = ""; paso = 2;
        $("#instr").textContent = "Paso 2 · ¿Qué tipo de palabra es?";
        let primera2 = true;
        $("#zona").innerHTML = `<div class="si-no">${Object.entries(NOMBRE).map(([id, nom]) => `<button data-t="${id}">${nom}</button>`).join("")}</div>`;
        $$("#zona button").forEach(t => t.onclick = () => {
          const ok2 = t.dataset.t === tipo;
          if (primera2) { registrar("9.1", ok2, w.p, "tipo de palabra", "tildes-generales"); primera2 = false; }
          if (!ok2) { $("#msg").textContent = "Cuenta desde el final: última sílaba → aguda; penúltima → llana; antepenúltima → esdrújula."; return; }
          $("#msg").textContent = ""; paso = 3;
          $("#instr").textContent = "Paso 3 · Escribe la palabra, con tilde o sin ella.";
          $("#zona").innerHTML = `<input id="resp" class="entrada" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Escribe la palabra"><div class="acciones izquierda"><button class="boton-sello" id="ok">Comprobar</button></div>`;
          const inp = $("#resp"); inp.focus();
          let intentada = false;
          const comprobar = () => {
            if (!inp.value.trim()) return;
            const ok3 = norm(inp.value) === norm(w.p);
            if (!intentada) { intentada = true; registrar("5.1", ok3, w.p, "sismógrafo", "tildes-generales"); }
            if (!ok3) { $("#msg").innerHTML = `Se escribe <strong>${esc(w.p)}</strong>. Escríbela tú.`; inp.value = ""; inp.focus(); return; }
            const ultima = w.p.slice(-1);
            const fin = /[aeiouáéíóú]/i.test(ultima) ? "vocal" : `-${ultima}`;
            const porque = `${w.p} es ${NOMBRE[tipo]}: la fuerza está en «${w.silabas[w.tonica]}» y termina en ${fin}. ${REGLA[tipo]} ${lleva ? "Por eso lleva tilde." : "Por eso no lleva tilde."}`;
            $("#zona").innerHTML = `<div class="explicacion">✔️ ${esc(porque)}</div><button class="flecha" id="sig">Siguiente ▸</button>`;
            $(".muestra").innerHTML = w.silabas.map((sil, i) => `<span class="silaba ${i === w.tonica ? "tonica" : ""}">${esc(sil)}</span>`).join("");
            $("#sig").onclick = () => { k++; pintar(); };
          };
          $("#ok").onclick = comprobar;
          inp.onkeydown = ev => { if (ev.key === "Enter") comprobar(); };
        });
      });
    };
    pintar();
  },
};
const quitarTildes = p => [...p].map(quitarTilde).join("");

/* Cómo suena en buena parte de Andalucía: seseo, yeísmo y -d final (solo para mostrarlo como habla, entre corchetes) */
const CON_TILDE = { a: "á", e: "é", i: "í", o: "ó", u: "ú" };
function pronunciar(w) {
  let s = w.toLowerCase().replace(/z/g, "s").replace(/c(?=[eiéí])/g, "s").replace(/ll/g, "y");
  if (s.endsWith("d")) {
    s = s.slice(0, -1);
    const i = s.search(/[aeiou][^aeiouáéíóú]*$/);
    if (i >= 0 && !/[áéíóú]/.test(s)) s = s.slice(0, i) + CON_TILDE[s[i]] + s.slice(i + 1);
  }
  return s;
}
function porQueSeEscribe(w) {
  const partes = [];
  if (/z/.test(w)) partes.push("lleva z (za, zo, zu, o z al final, como en arroz o diez)");
  if (/c(?=[eiéí])/.test(w)) partes.push("lleva c porque va delante de e, i (ce, ci)");
  if (/ll/.test(w)) partes.push("lleva ll, que con yeísmo suena igual que la y");
  if (/d$/.test(w)) partes.push("lleva d al final aunque no la pronunciemos (piensa en el plural: verdades, paredes)");
  return partes.join("; y ") + ".";
}

/* ── Resumen para la zona del maestro ────────────────────────── */
function resumenAcademiaHTML() {
  if (!registrosAca.length) return "";
  const por = {};
  registrosAca.forEach(r => {
    por[r.perfilId] ??= { nombre: r.nombre, sesiones: 0, aciertos: 0, intentos: 0, salas: new Set() };
    const x = por[r.perfilId]; x.sesiones++; x.aciertos += r.aciertos; x.intentos += r.intentos; x.salas.add(sala(r.sala)?.nombre || r.sala);
  });
  return `
    <h2>Academia (entrenamiento, aparte de los casos)</h2>
    <div class="tabla-scroll"><table>
      <thead><tr><th>Detective</th><th>Actividades</th><th>Acierto</th><th>Fichas en cola</th><th>Archivadas</th><th>Salas</th></tr></thead>
      <tbody>${Object.entries(por).map(([id, x]) => { const est = cargar(`academia-${id}`, {}); return `<tr><td>${esc(x.nombre)}</td><td>${x.sesiones}</td><td>${x.intentos ? Math.round(x.aciertos / x.intentos * 100) : 0} %</td><td>${Object.keys(est.cola || {}).length}</td><td>${(est.archivadas || []).length}</td><td>${esc([...x.salas].join(", "))}</td></tr>`; }).join("")}</tbody>
    </table></div>`;
}
