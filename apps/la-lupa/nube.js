/* ============================================================
   AGENCIA LA LUPA · guardar en la nube (Google Apps Script + Hojas de Google)
   Opcional: solo funciona si el maestro pone la URL del Apps Script y el código de aula
   en la zona del maestro (ajustes.nube = { url, aula }). Sin eso, no se envía nada.

   - Cola (lalupa-nube-cola): NO guarda copias de los datos, solo referencias a lo que falta por subir
     (qué alumnos, qué resultados y de qué detectives hay progreso nuevo). Lo que se envía se construye
     en el momento del envío con lo que hay guardado, así que la cola ocupa muy poco y nunca manda algo viejo.
   - El envío se da por hecho SOLO si el servidor contesta { ok: true }. Si no se puede leer la respuesta,
     no se borra nada: se reintenta. Repetir un envío no duplica (el servidor actualiza por id).
   - «Recuperar mi detective»: en otro dispositivo, el alumno escribe su alias y se baja su progreso,
     que se VALIDA y se FUSIONA con lo que haya aquí (no lo sustituye).
   Se usa el ALIAS como identificador: nunca el nombre real (datos de menores).
   Servidor y pasos: backend/apps-script/la-lupa.gs y apps/la-lupa/NUBE.md
   ============================================================ */
"use strict";

/* ── Identidad ──────────────────────────────────────────────────
   normAlias es LA normalización de alias del juego (la misma que normAlias_ en la-lupa.gs):
   sin mayúsculas ni tildes, y todo lo que no sea letra o número se queda en un guion.
   «Lucía», «LUCIA» y « lucia » son el mismo detective; «José M.» y «jose m», también.
   Un alias que se queda vacío (solo emojis o signos) no vale. */
const normAlias = s => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").normalize("NFC")
  .replace(/[^\p{L}\p{N}]+/gu, "-").slice(0, 40).replace(/^-+|-+$/g, "");
const idAlumno = pf => normAlias(pf?.avatar || pf?.nombre);
const nubeConf = () => ajustes.nube || {};
const nubeActiva = () => !!(nubeConf().url && nubeConf().aula);

const esObjeto = v => !!v && typeof v === "object" && !Array.isArray(v);
class ErrorNube extends Error {}   // errores con un mensaje pensado para enseñarlo tal cual

/* ── Cola de referencias ────────────────────────────────────── */
const NUBE = { enviando: false, fallos: 0, noAntes: 0, temporizador: null };
const NUBE_LOTE = { items: 40, caracteres: 300000, registros: 100 };   // tamaño de cada envío
const NUBE_TOPE = { notas: 6000, porAlumno: 400 };                     // tamaño máximo de la cola
const colaVacia = () => ({ v: 2, seq: 0, alumnos: {}, notas: {}, progreso: {}, descartadas: 0 });
/* Se lee de localStorage cada vez (no se guarda en memoria): así dos pestañas no se pisan la cola */
function nubeCola() {
  const c = cargar("nube-cola", null);
  if (!esObjeto(c) || c.v !== 2) return colaVacia();
  const mapa = v => (esObjeto(v) ? v : {});
  return { ...colaVacia(), ...c, seq: Number(c.seq) || 0, alumnos: mapa(c.alumnos), notas: mapa(c.notas), progreso: mapa(c.progreso) };
}
const nubePendientes = (c = nubeCola()) => Object.keys(c.alumnos).length + Object.keys(c.notas).length + Object.keys(c.progreso).length;
const nubeEstado = () => cargar("nube-estado", null);
const marcaProgreso = m => (esObjeto(m) ? { seq: Number(m.seq) || 0, todo: m.todo === true, desde: Number(m.desde) || 0, res: Array.isArray(m.res) ? m.res : [], aca: Array.isArray(m.aca) ? m.aca : [] }
  : { seq: 0, todo: false, desde: 0, res: [], aca: [] });

/* Apuntar algo en la cola. fn recibe la cola y el n.º de orden de esta anotación */
function nubeMarcar(fn) {
  if (!nubeActiva()) return;
  const c = nubeCola();
  fn(c, ++c.seq);
  const ids = Object.keys(c.notas);
  if (ids.length > NUBE_TOPE.notas) {   // tope: se sueltan las más antiguas (siguen en el dispositivo; «Volver a enviar todo» las recupera)
    ids.sort((a, b) => c.notas[a] - c.notas[b]).slice(0, ids.length - NUBE_TOPE.notas).forEach(id => delete c.notas[id]);
    c.descartadas = (Number(c.descartadas) || 0) + ids.length - NUBE_TOPE.notas;
  }
  guardar("nube-cola", c);
  clearTimeout(NUBE.temporizador);
  NUBE.temporizador = setTimeout(nubeEnviar, 300);
}
const marcarAlumno = (c, seq, pf) => { c.alumnos[pf.id] = seq; };
const marcarNota = (c, seq, r) => { c.notas[r.id] = seq; };
/* Progreso de un detective: sin r, todo su historial; con r, solo ese resultado (o registro de la Academia) */
function marcarProgreso(c, seq, pf, r) {
  const m = (c.progreso[pf.id] = marcaProgreso(c.progreso[pf.id]));
  m.seq = seq;
  if (!r) Object.assign(m, { todo: true, desde: 0, res: [], aca: [] });
  else {
    const l = r.contexto === "academia" ? m.aca : m.res;
    if (!l.includes(r.id)) l.push(r.id);
    if (m.res.length + m.aca.length > NUBE_TOPE.porAlumno) Object.assign(m, { todo: true, desde: 0, res: [], aca: [] });
  }
}
function nubeMarcarTodo() {
  nubeMarcar((c, seq) => {
    perfiles.forEach(pf => { if (idAlumno(pf)) { marcarAlumno(c, seq, pf); marcarProgreso(c, seq, pf); } });
    [...resultados, ...registrosAca].forEach(r => { if (perfiles.some(p => p.id === r.perfilId && idAlumno(p))) marcarNota(c, seq, r); });
  });
}

/* Enganches: los llaman app.js (informe, sello, perfil nuevo) y academia.js (fin de actividad) */
function nubeTrasResultado(r) {
  if (!nubeActiva() || !r) return;
  const pf = perfiles.find(p => p.id === r.perfilId);
  if (!pf || !idAlumno(pf)) return;
  nubeMarcar((c, seq) => { marcarNota(c, seq, r); marcarProgreso(c, seq, pf, r); });
}
function nubeNuevoAlumno(pf) { if (nubeActiva() && pf && idAlumno(pf)) nubeMarcar((c, seq) => marcarAlumno(c, seq, pf)); }

/* ── Lo que se sube ─────────────────────────────────────────────
   Sin los eventos detallados (pesan mucho) ni lo que es solo de este dispositivo (partidas a medias, n.º de lista). */
const sinEventos = r => { const { eventos, notasLibreta, aCola, ...resto } = r; return resto; };
const perfilNube = pf => ({ id: pf.id, nombre: pf.nombre, curso: pf.curso, ...(pf.avatar ? { avatar: pf.avatar } : {}), ...(pf.creado ? { creado: pf.creado } : {}) });
function resumenNota(r, pf) {
  return {
    resultId: r.id, studentId: idAlumno(pf), alias: pf.nombre, curso: r.curso,
    tipo: r.contexto === "academia" ? "academia" : r.encargo ? "encargo" : "caso", unidad: r.unidad || r.sala, titulo: r.titulo || `Academia · ${r.sala}${r.actividad ? ` · ${r.actividad}` : ""}`,
    nivel: r.nivel || null, fecha: r.fecha, libreta: r.libreta ? r.libreta.puntos : null, diagnostico: !!r.diagnostico,
    notas: (r.notas || []).map(n => ({ criterio: n.codigo || `${n.criterio}.${letraCurso(r.curso)}`, nota: n.nota, calificacion: n.calificacion, aciertos: n.aciertos, intentos: n.intentos })),
  };
}
const historial = pf => [...resultados.filter(r => r.perfilId === pf.id), ...registrosAca.filter(r => r.perfilId === pf.id)];
function instantanea(pf, registros = historial(pf)) {
  const aca = r => r.contexto === "academia";
  return {
    studentId: idAlumno(pf), alias: pf.nombre, curso: pf.curso, updatedAt: new Date().toISOString(),
    snapshot: { perfil: perfilNube(pf), resultados: registros.filter(r => !aca(r)).map(sinEventos), academia: cargar(`academia-${pf.id}`, {}), registrosAca: registros.filter(aca).map(sinEventos) },
  };
}

/* Prepara el siguiente envío con lo apuntado en la cola. Devuelve los elementos y lo que hay que tachar si llega bien */
function nubeLote(c) {
  const items = [], hecho = { alumnos: {}, notas: {}, progreso: {} }, sobran = { alumnos: [], notas: [], progreso: [] };
  let tam = 0;
  const cabe = it => {
    const t = JSON.stringify(it).length;
    if (items.length && (items.length >= NUBE_LOTE.items || tam + t > NUBE_LOTE.caracteres)) return false;
    items.push(it); tam += t;
    return true;
  };
  const at = new Date().toISOString();
  const porOrden = m => Object.keys(m).sort((a, b) => m[a] - m[b]);
  let lleno = false;
  for (const pid of porOrden(c.alumnos)) {
    const pf = perfiles.find(p => p.id === pid);
    if (!pf || !idAlumno(pf)) { sobran.alumnos.push(pid); continue; }
    if (!cabe({ id: `s-${pid}`, type: "student", app: "lalupa", at, payload: { studentId: idAlumno(pf), alias: pf.nombre, curso: pf.curso } })) { lleno = true; break; }
    hecho.alumnos[pid] = c.alumnos[pid];
  }
  if (!lleno) for (const rid of porOrden(c.notas)) {
    const r = resultados.find(x => x.id === rid) || registrosAca.find(x => x.id === rid);
    const pf = r && perfiles.find(p => p.id === r.perfilId);
    if (!pf || !idAlumno(pf)) { sobran.notas.push(rid); continue; }
    if (!cabe({ id: `g-${rid}`, type: "grade", app: "lalupa", at, payload: resumenNota(r, pf) })) { lleno = true; break; }
    hecho.notas[rid] = c.notas[rid];
  }
  if (!lleno) for (const pid of Object.keys(c.progreso).sort((a, b) => marcaProgreso(c.progreso[a]).seq - marcaProgreso(c.progreso[b]).seq)) {
    const pf = perfiles.find(p => p.id === pid);
    if (!pf || !idAlumno(pf)) { sobran.progreso.push(pid); continue; }
    const m = marcaProgreso(c.progreso[pid]), todos = historial(pf);
    // Con «todo», el historial va por tandas desde donde se quedó (m.desde); además, lo apuntado suelto (p. ej. un sello nuevo)
    const tanda = m.todo ? todos.slice(m.desde, m.desde + NUBE_LOTE.registros) : [];
    const sueltos = todos.filter(r => (m.res.includes(r.id) || m.aca.includes(r.id)) && !tanda.includes(r)).slice(0, NUBE_LOTE.registros - tanda.length);
    if (!cabe({ id: `p-${pid}-${m.seq}-${m.desde}`, type: "progress", app: "lalupa", at, payload: instantanea(pf, [...tanda, ...sueltos]) })) break;
    // ids: lo suelto que va en este envío y lo apuntado que ya no existe en este dispositivo (para tacharlo también)
    const idsTodos = new Set(todos.map(r => r.id));
    hecho.progreso[pid] = { seq: m.seq, avance: tanda.length, total: todos.length, ids: [...sueltos.map(r => r.id), ...[...m.res, ...m.aca].filter(id => !idsTodos.has(id))] };
  }
  return { items, hecho, sobran };
}
/* Tachar de la cola lo que el servidor ha confirmado (o lo que ya no existe en este dispositivo) */
function nubeTachar({ hecho, sobran }, confirmado) {
  const c = nubeCola();
  if (!confirmado && !sobran.alumnos.length && !sobran.notas.length && !sobran.progreso.length) return c;
  sobran.alumnos.forEach(k => delete c.alumnos[k]);
  sobran.notas.forEach(k => delete c.notas[k]);
  sobran.progreso.forEach(k => delete c.progreso[k]);
  if (confirmado) {
    // Solo se tacha lo que no se ha vuelto a apuntar mientras viajaba (mismo n.º de orden)
    Object.entries(hecho.alumnos).forEach(([k, seq]) => { if (c.alumnos[k] === seq) delete c.alumnos[k]; });
    Object.entries(hecho.notas).forEach(([k, seq]) => { if (c.notas[k] === seq) delete c.notas[k]; });
    Object.entries(hecho.progreso).forEach(([k, h]) => {
      if (!c.progreso[k]) return;
      const m = (c.progreso[k] = marcaProgreso(c.progreso[k]));
      const reiniciado = m.seq !== h.seq && m.todo && m.desde === 0;   // se ha pedido subirlo todo de nuevo durante el envío
      if (m.todo && !reiniciado) { m.desde += h.avance; if (m.desde >= h.total) { m.todo = false; m.desde = 0; } }
      if (m.seq === h.seq) { m.res = m.res.filter(id => !h.ids.includes(id)); m.aca = m.aca.filter(id => !h.ids.includes(id)); }
      if (!m.todo && !m.res.length && !m.aca.length) delete c.progreso[k];
    });
  }
  guardar("nube-cola", c);
  return c;
}

/* ── Envío ──────────────────────────────────────────────────────
   POST legible (text/plain, sin no-cors): Apps Script contesta con CORS y se puede leer { ok: true }.
   HAY QUE COMPROBARLO CON UN APPS SCRIPT REAL (botón «Probar conexión»): ver NUBE.md. */
async function nubePost(items) {
  const control = new AbortController(), reloj = setTimeout(() => control.abort(), 45000);
  try {
    const r = await fetch(nubeConf().url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, redirect: "follow", signal: control.signal,
      body: JSON.stringify({ app: "lalupa", classCode: nubeConf().aula, type: "batch", items }) });
    const texto = await r.text();
    let j = null;
    try { j = JSON.parse(texto); } catch { /* no es JSON: una página de error o de inicio de sesión */ }
    if (esObjeto(j) && j.ok === true) return { ok: true, respuesta: j };
    if (esObjeto(j)) return { ok: false, motivo: j.error === "ocupado" ? "El servidor estaba ocupado; se reintenta solo." : `El servidor ha contestado con un error (${String(j.error || "sin detalle").slice(0, 120)}).` };
    return { ok: false, motivo: `El servidor no ha contestado como se esperaba (código ${r.status}). Revisa que la implementación esté publicada para «Cualquier usuario» y que la URL sea la que acaba en /exec.` };
  } catch {
    return { ok: false, motivo: navigator.onLine === false ? "No hay conexión." : "No se ha podido leer la respuesta del servidor (sin conexión, URL equivocada o el navegador no deja leerla)." };
  } finally { clearTimeout(reloj); }
}
async function nubeEnviar(ahora = false) {
  if (!nubeActiva() || NUBE.enviando || navigator.onLine === false) return;
  if (!ahora && Date.now() < NUBE.noAntes) return;
  const cola = nubeCola(), firma = JSON.stringify(cola);
  const lote = nubeLote(cola);
  if (!lote.items.length) { nubeTachar(lote, false); return; }
  NUBE.enviando = true;
  let res;
  try { res = await nubePost(lote.items); } finally { NUBE.enviando = false; }
  const at = new Date().toISOString();
  if (res.ok) {
    const despues = nubeTachar(lote, true);
    const quedan = nubePendientes(despues) && JSON.stringify(despues) !== firma;   // si la cola no avanza, no se insiste: ya volverá a intentarlo el reloj
    const rechazados = Array.isArray(res.respuesta.rechazados) ? res.respuesta.rechazados : [];
    NUBE.fallos = 0; NUBE.noAntes = 0;
    guardar("nube-ultimo", at);
    guardar("nube-estado", { ok: true, at, rechazados: rechazados.length, motivo: rechazados.length ? String(rechazados[0]?.error || "").slice(0, 120) : "" });
    if (quedan) { clearTimeout(NUBE.temporizador); NUBE.temporizador = setTimeout(nubeEnviar, 1500); }
  } else {
    // No confirmado: NO se toca la cola. Se reintenta cada vez más espaciado (1, 2, 4… hasta 10 minutos)
    nubeTachar(lote, false);
    NUBE.fallos++;
    NUBE.noAntes = Date.now() + Math.min(600000, 30000 * 2 ** NUBE.fallos);
    guardar("nube-estado", { ok: false, at, motivo: res.motivo });
  }
  return res;
}
addEventListener("online", () => nubeEnviar(true));
setInterval(() => nubeEnviar(), 60000);
/* Cola de una versión anterior (lista con copias enteras): se cambia por referencias y se vuelve a apuntar todo */
if (Array.isArray(cargar("nube-cola", null))) { guardar("nube-cola", colaVacia()); nubeMarcarTodo(); }
else if (nubeActiva() && nubePendientes()) setTimeout(nubeEnviar, 3000);

/* Prueba de conexión (zona del maestro): comprueba que se puede LEER la respuesta del servidor, al leer y al enviar */
async function nubeProbar() {
  try {
    const u = new URL(nubeConf().url);
    Object.entries({ app: "lalupa", classCode: nubeConf().aula, type: "ping" }).forEach(([k, v]) => u.searchParams.set(k, v));
    const j = await (await fetch(u, { method: "GET" })).json();
    if (!j || j.ok !== true) return { ok: false, motivo: "El servidor contesta, pero no es el Apps Script de La Lupa (revisa la URL y que hayas pegado la última versión del código)." };
    if (!(Number(j.version) >= 2)) return { ok: false, motivo: "El Apps Script es de una versión anterior: pega el código nuevo de la-lupa.gs y vuelve a implementarlo." };
  } catch { return { ok: false, motivo: "No se puede leer del servidor (sin conexión, URL equivocada o la implementación no es para «Cualquier usuario»)." }; }
  const envio = await nubePost([]);
  return envio.ok ? { ok: true } : { ok: false, motivo: `Se puede leer, pero el envío no se confirma: ${envio.motivo}` };
}

/* ── Fusionar (lo mismo que hace el servidor) ───────────────── */
const sellado = x => esObjeto(x?.libreta);
/* Estado de la Academia, campo a campo, sin perder puntos ni niveles. ES LA MISMA FUNCIÓN que fusionarAcademia_ en
   backend/apps-script/la-lupa.gs: si se cambia una, hay que cambiar la otra. Es idempotente. */
function fusionarAcademia(a, b) {
  a = esObjeto(a) ? a : {}; b = esObjeto(b) ? b : {};
  const n = v => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const mapa = v => (esObjeto(v) ? v : {});
  const lista = v => (Array.isArray(v) ? v : []);
  const claves = (x, y) => [...new Set([...Object.keys(mapa(x)), ...Object.keys(mapa(y))])].filter(k => k !== "__proto__");
  const maxTexto = (x, y) => { x = typeof x === "string" ? x : ""; y = typeof y === "string" ? y : ""; return (x > y ? x : y) || null; };
  const nuevo = n(b.sesion) > n(a.sesion) ? b : a, viejo = nuevo === a ? b : a;
  const out = { ...viejo, ...nuevo };
  out.sesion = Math.max(n(a.sesion), n(b.sesion));
  out.ultimoDia = maxTexto(a.ultimoDia, b.ultimoDia);
  // Puntos: por día, el mayor; el total nunca baja respecto a ninguno de los dos
  out.puntosDia = {};
  claves(a.puntosDia, b.puntosDia).forEach(d => { out.puntosDia[d] = Math.max(n(mapa(a.puntosDia)[d]), n(mapa(b.puntosDia)[d])); });
  out.puntos = Math.max(n(a.puntos), n(b.puntos), Object.values(out.puntosDia).reduce((s, v) => s + v, 0));
  // Niveles (lupas) por ejercicio: el más alto; la racha, la del que va más alto
  out.niveles = {};
  claves(a.niveles, b.niveles).forEach(k => {
    const x = mapa(mapa(a.niveles)[k]), y = mapa(mapa(b.niveles)[k]);
    const mx = Math.max(n(x.max), 1), my = Math.max(n(y.max), 1);
    out.niveles[k] = { max: Math.max(mx, my), racha: mx === my ? Math.max(n(x.racha), n(y.racha)) : (mx > my ? n(x.racha) : n(y.racha)) };
  });
  // Cola de repaso: unión; si la palabra está en los dos, la ficha más avanzada (y el mayor n.º de fallos)
  const ca = mapa(a.cola), cb = mapa(b.cola), an = lista(nuevo.archivadas), av = lista(viejo.archivadas);
  out.cola = {};
  claves(ca, cb).forEach(w => {
    const x = esObjeto(ca[w]) ? ca[w] : null, y = esObjeto(cb[w]) ? cb[w] : null;
    if (x && y) {
      const mejor = n(y.nivel) > n(x.nivel) || (n(y.nivel) === n(x.nivel) && n(y.proximo) > n(x.proximo)) ? y : x;
      out.cola[w] = { ...mejor, fallos: Math.max(n(x.fallos), n(y.fallos)) };
    } else if (x || y) {
      // Está en la cola de uno y archivada (dominada) en el otro: manda el que lleva más sesiones; a igualdad, se repasa
      const esDelNuevo = (nuevo === a ? x : y) !== null;
      if (!esDelNuevo && an.includes(w) && n(a.sesion) !== n(b.sesion)) return;
      out.cola[w] = { ...(x || y) };
    }
  });
  out.archivadas = [];
  [...an, ...av].forEach(w => { if (typeof w === "string" && !(w in out.cola) && !out.archivadas.includes(w)) out.archivadas.push(w); });
  // Turno de hoy: el del día más reciente; si es el mismo día, lo hecho en los dos
  const ta = mapa(a.turno), tb = mapa(b.turno), da = typeof ta.dia === "string" ? ta.dia : "", db = typeof tb.dia === "string" ? tb.dia : "";
  const hechas = t => lista(t.hechas).filter(x => typeof x === "string");
  out.turno = da === db ? { dia: da || null, hechas: [...new Set([...hechas(ta), ...hechas(tb)])] } : (da > db ? { dia: da, hechas: hechas(ta) } : { dia: db, hechas: hechas(tb) });
  // Lecciones vistas: la sesión más alta. Preparación de cada caso: los pasos hechos en cualquiera de los dos
  out.leccionVista = {};
  claves(a.leccionVista, b.leccionVista).forEach(k => { out.leccionVista[k] = Math.max(n(mapa(a.leccionVista)[k]), n(mapa(b.leccionVista)[k])); });
  out.prep = {};
  claves(a.prep, b.prep).forEach(u => { out.prep[u] = [...new Set([...lista(mapa(a.prep)[u]), ...lista(mapa(b.prep)[u])].filter(x => typeof x === "string"))]; });
  return out;
}

/* ── Validar lo que baja de la nube ─────────────────────────────
   Nada de la nube entra tal cual: se reconstruye campo a campo con su tipo (los números, con Number();
   los textos, recortados y sin < >). Lo que no tiene forma válida se descarta. Si se añade un campo nuevo
   a los resultados o al estado de la Academia y debe viajar, hay que añadirlo aquí. */
const ID_VALIDO = /^[\w-]{4,40}$/;
const textoNube = (v, max = 160) => (typeof v === "string" || typeof v === "number" ? String(v).replace(/[<>]/g, "").slice(0, max) : "");
const enteroNube = (v, min, max) => { const x = Math.round(Number(v)); return Number.isFinite(x) ? Math.min(max, Math.max(min, x)) : min; };
const fechaNube = v => typeof v === "string" && v.length <= 40 && !Number.isNaN(Date.parse(v));
const diaNube = v => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const listaNube = (v, max = 60, cuantos = 300) => (Array.isArray(v) ? v : []).filter(x => typeof x === "string" && x.trim()).map(x => textoNube(x, max)).slice(0, cuantos);
function mapaNube(v, claveOk, valor) {
  const out = {};
  if (!esObjeto(v)) return out;
  Object.keys(v).slice(0, 5000).forEach(k => {
    if (k === "__proto__" || k === "constructor" || k === "prototype" || /[<>]/.test(k) || k.length > 60 || !claveOk(k)) return;
    const x = valor(v[k]);
    if (x !== undefined) out[k] = x;
  });
  return out;
}
function notasNube(v, curso, conCodigo) {
  return (Array.isArray(v) ? v : []).filter(n => esObjeto(n) && /^\d{1,2}\.\d{1,2}$/.test(String(n.criterio)) && Number.isFinite(Number(n.nota))).slice(0, 30).map(n => {
    const nota = Math.min(10, Math.max(1, Math.round(Number(n.nota) * 10) / 10));
    return { criterio: String(n.criterio), aciertos: enteroNube(n.aciertos, 0, 100000), intentos: enteroNube(n.intentos, 0, 100000), nota, calificacion: calificacion(nota),
      ...(conCodigo ? { codigo: `${n.criterio}.${letraCurso(curso)}` } : {}) };
  });
}
function selloNube(l) {
  if (!esObjeto(l)) return null;
  const checks = Array.from({ length: 4 }, (_, k) => Array.isArray(l.checks) && l.checks[k] === true);
  return { checks, puntos: Array.isArray(l.checks) ? checks.filter(Boolean).length : enteroNube(l.puntos, 0, 4), fecha: fechaNube(l.fecha) ? l.fecha : new Date().toISOString() };
}
function resultadoNube(x, perfil, cursos) {
  if (!esObjeto(x) || !ID_VALIDO.test(String(x.id ?? "")) || !fechaNube(x.fecha) || !Array.isArray(x.notas)) return null;
  const curso = cursos[x.curso] ? String(x.curso) : perfil.curso;
  const base = { id: String(x.id), perfilId: perfil.id, nombre: textoNube(x.nombre, 40).replace(/^[\s=+\-@]+/, "").trim() || perfil.nombre, curso, fecha: x.fecha,
    reglas: listaNube(x.reglas, 60, 40), repasar: listaNube(x.repasar, 60, 300), eventos: [] };
  if (x.contexto === "academia") {
    const salaId = textoNube(x.sala, 40);
    if (!salaId) return null;
    return { ...base, contexto: "academia", sala: salaId, actividad: textoNube(x.actividad, 40), nivel: enteroNube(x.nivel, 1, 4),
      aciertos: enteroNube(x.aciertos, 0, 100000), intentos: enteroNube(x.intentos, 0, 100000), notas: notasNube(x.notas, curso, false) };
  }
  return { ...base, app: "lalupa", unidad: textoNube(x.unidad, 60) || null, caso: textoNube(x.caso, 60), titulo: textoNube(x.titulo, 160),
    minutos: enteroNube(x.minutos, 0, 100000), pistas: enteroNube(x.pistas, 0, 100000), consultas: enteroNube(x.consultas, 0, 100000),
    modoLibreta: x.modoLibreta === "digital" ? "digital" : "papel", notas: notasNube(x.notas, curso, true), notasLibreta: [], libreta: selloNube(x.libreta),
    diagnostico: Array.isArray(x.diagnostico) ? x.diagnostico.filter(d => esObjeto(d) && textoNube(d.regla, 60)).slice(0, 60)
      .map(d => ({ regla: textoNube(d.regla, 60), aciertos: enteroNube(d.aciertos, 0, 100000), intentos: enteroNube(d.intentos, 0, 100000), porcentaje: enteroNube(d.porcentaje, 0, 100) })) : null,
    ...(x.encargo === true ? { encargo: true } : {}) };
}
function academiaNube(a) {
  if (!esObjeto(a)) return {};
  const si = () => true;
  return {
    sesion: enteroNube(a.sesion, 0, 100000), ultimoDia: diaNube(a.ultimoDia) ? a.ultimoDia : null, puntos: enteroNube(a.puntos, 0, 10000000),
    puntosDia: mapaNube(a.puntosDia, diaNube, v => enteroNube(v, 0, 100000)),
    cola: mapaNube(a.cola, si, f => (esObjeto(f) ? { regla: f.regla == null ? null : textoNube(f.regla, 60), nivel: enteroNube(f.nivel, 0, 10), proximo: enteroNube(f.proximo, 0, 1000000), fallos: enteroNube(f.fallos, 0, 100000), origen: textoNube(f.origen, 60), ...(f.pista ? { pista: textoNube(f.pista, 300) } : {}), ...(f.por ? { por: textoNube(f.por, 300) } : {}) } : undefined)),
    archivadas: listaNube(a.archivadas, 60, 5000),
    turno: esObjeto(a.turno) ? { dia: diaNube(a.turno.dia) ? a.turno.dia : null, hechas: listaNube(a.turno.hechas, 40, 20) } : { dia: null, hechas: [] },
    leccionVista: mapaNube(a.leccionVista, si, v => enteroNube(v, 0, 100000)),
    niveles: mapaNube(a.niveles, si, v => (esObjeto(v) ? { max: enteroNube(v.max, 1, 4), racha: enteroNube(v.racha, 0, 100) } : undefined)),
    prep: mapaNube(a.prep, si, v => listaNube(v, 40, 30)),
  };
}
function nubeValidar(s, id) {
  const mala = "La copia de la nube de ese alias está vacía o dañada y no se ha podido usar. Avisa a tu maestro o maestra.";
  if (!esObjeto(s) || !esObjeto(s.perfil)) throw new ErrorNube(mala);
  const cursos = D.prog?.cursos || {}, p = s.perfil;
  const perfil = { id: String(p.id ?? ""), nombre: textoNube(p.nombre, 40).replace(/^[\s=+\-@]+/, "").trim(), curso: textoNube(p.curso, 10), creado: fechaNube(p.creado) ? p.creado : new Date().toISOString() };
  if (typeof p.avatar === "string" && p.avatar.trim()) perfil.avatar = textoNube(p.avatar, 60);
  if (!ID_VALIDO.test(perfil.id) || idAlumno(perfil) !== id) throw new ErrorNube(mala);
  if (!cursos[perfil.curso]) throw new ErrorNube(`La copia de la nube es de un curso («${perfil.curso}») que no existe en este juego.`);
  const limpiar = lista => (Array.isArray(lista) ? lista : []).slice(0, 5000).map(x => resultadoNube(x, perfil, cursos));
  const res = limpiar(s.resultados), aca = limpiar(s.registrosAca);
  return { perfil, resultados: res.filter(x => x && x.contexto !== "academia"), registrosAca: aca.filter(x => x && x.contexto === "academia"), academia: academiaNube(s.academia),
    descartados: [...res, ...aca].filter(x => !x).length + res.filter(x => x && x.contexto === "academia").length + aca.filter(x => x && x.contexto !== "academia").length };
}

/* ── Recuperar el progreso en otro dispositivo ──────────────── */
async function nubeRecuperar(alias) {
  const id = normAlias(alias);
  if (!id) throw new ErrorNube("Escribe tu alias de detective.");
  let j = null;
  try {
    const u = new URL(nubeConf().url);
    Object.entries({ app: "lalupa", classCode: nubeConf().aula, type: "progress", studentId: id }).forEach(([k, v]) => u.searchParams.set(k, v));
    j = await (await fetch(u, { method: "GET" })).json();
  } catch { throw new ErrorNube("No se ha podido conectar con la nube. Prueba más tarde."); }
  if (!esObjeto(j) || j.ok !== true) throw new ErrorNube(j?.error === "no encontrado" ? "No hay ningún detective con ese alias en esta aula." : "La nube ha contestado con un error. Avisa a tu maestro o maestra.");
  const s = nubeValidar(j.progress?.snapshot, id);
  const yaEsta = perfiles.find(p => p.id === s.perfil.id) || perfiles.find(p => idAlumno(p) === id);
  const pf = yaEsta || s.perfil;
  if (!yaEsta) { perfiles.push(pf); guardar("perfiles", perfiles); }
  // Fusión por id: lo de la nube que no está aquí, se añade; lo que ya está, se queda como está y solo se copia el sello más reciente
  const fusionar = (locales, remotos) => {
    const idsRemotos = new Set(remotos.map(x => x.id));
    remotos.forEach(x => {
      const mio = locales.find(r => r.id === x.id);
      if (!mio) locales.push({ ...x, perfilId: pf.id });
      else if (mio.perfilId === pf.id && sellado(x) && (!sellado(mio) || String(x.libreta.fecha) > String(mio.libreta.fecha || ""))) mio.libreta = x.libreta;
    });
    return locales.filter(r => r.perfilId === pf.id && !idsRemotos.has(r.id));   // lo de aquí que la nube no tiene
  };
  const soloAqui = [...fusionar(resultados, s.resultados), ...fusionar(registrosAca, s.registrosAca)];
  guardar("resultados", resultados);
  guardar("academia-registros", registrosAca);
  guardar(`academia-${pf.id}`, fusionarAcademia(cargar(`academia-${pf.id}`, {}), s.academia));
  // Lo que este dispositivo tenía de más (y la Academia ya fusionada) sube a la nube
  nubeMarcar((c, seq) => {
    if (soloAqui.length > NUBE_TOPE.porAlumno) marcarProgreso(c, seq, pf);
    else if (soloAqui.length) soloAqui.forEach(r => { marcarNota(c, seq, r); marcarProgreso(c, seq, pf, r); });
    else if (yaEsta) { const m = (c.progreso[pf.id] = marcaProgreso(c.progreso[pf.id])); m.seq = seq; }
  });
  return { pf, descartados: s.descartados };
}
function pedirRecuperar() {
  abrirModal(`
    <h3>☁️ Recuperar mi detective</h3>
    <p>Escribe tu alias de detective tal como lo pusiste en el otro dispositivo.</p>
    <input id="recAlias" class="entrada" autocomplete="off" maxlength="40" aria-label="Alias">
    <p id="recMsg" class="msg"></p>
    <div class="acciones"><button class="boton-sello" id="recOk">Recuperar</button></div>`, "ventana-libreta");
  const inp = $("#recAlias");
  inp.focus();
  let buscando = false;
  const ir = async () => {
    if (buscando || !inp.value.trim()) return;
    buscando = true;
    $("#recMsg").textContent = "Buscando en el archivo de la agencia…";
    let r = null, error = "";
    try { r = await nubeRecuperar(inp.value.trim()); }
    catch (e) { error = e instanceof ErrorNube ? e.message : "No se ha podido recuperar el detective. Avisa a tu maestro o maestra."; }
    buscando = false;
    if (!r) { const m = $("#recMsg"); if (m) m.textContent = error; return; }
    cerrarModal();
    perfil = r.pf;
    vistaTablon();
    aviso(r.descartados ? `¡Detective recuperado! (${r.descartados} resultados de la nube estaban dañados y no se han usado)` : "¡Detective recuperado!", "bien");
  };
  $("#recOk").onclick = ir;
  inp.onkeydown = ev => { if (ev.key === "Enter") ir(); };
}

/* ── Sección de la zona del maestro ─────────────────────────── */
function htmlEstadoNube() {
  if (!nubeActiva()) return "La nube no está configurada.";
  const c = nubeCola(), e = nubeEstado(), ultimo = cargar("nube-ultimo", null);
  const fecha = v => esc(new Date(v).toLocaleString("es-ES"));
  return `Pendientes de enviar: <b>${nubePendientes(c)}</b>${ultimo ? ` · último envío confirmado: ${fecha(ultimo)}` : " · todavía no se ha confirmado ningún envío"}
    ${e && e.ok === false ? `<br><b>⚠️ No se ha podido confirmar el último envío</b> (${fecha(e.at)}): ${esc(e.motivo || "")} No se ha borrado nada de la cola; se reintenta solo.` : ""}
    ${e && e.ok && e.rechazados ? `<br><b>⚠️ El servidor ha rechazado ${Number(e.rechazados)} elemento(s)</b> del último envío: ${esc(e.motivo || "")}` : ""}
    ${c.descartadas ? `<br><b>⚠️ La cola se llenó</b> y se soltaron ${Number(c.descartadas)} notas antiguas (siguen en este dispositivo): pulsa «Volver a enviar todo» cuando haya conexión.` : ""}`;
}
function htmlNubeMaestro() {
  const c = nubeConf();
  return `
      <h2>Guardar en la nube (opcional)</h2>
      <p class="aviso-maestro">Con un Apps Script de Google (los pasos están en <code>apps/la-lupa/NUBE.md</code>), las notas y el progreso de cada detective se guardan en tu hoja de cálculo y el alumno puede seguir en otro dispositivo. Se envía el <b>alias</b>, nunca el nombre. Sin URL, no se envía nada.</p>
      <div class="fila">
        <label>URL del Apps Script: <input id="nubeUrl" value="${esc(c.url || "")}" placeholder="https://script.google.com/macros/s/…/exec" size="44"></label>
        <label>Código de aula: <input id="nubeAula" value="${esc(c.aula || "")}" maxlength="20" placeholder="5A-2027"></label>
        <button class="boton-papel" id="nubeGuardar">Guardar</button>
        <button class="boton-papel" id="nubeProbar" ${nubeActiva() ? "" : "disabled"}>Probar conexión</button>
        <button class="boton-papel" id="nubeEnviar" ${nubeActiva() ? "" : "disabled"}>Enviar ahora</button>
        <button class="boton-papel" id="nubeTodo" ${nubeActiva() ? "" : "disabled"}>Volver a enviar todo</button>
      </div>
      <p id="nubeEstado">${htmlEstadoNube()}</p>
      <p id="nubePrueba" role="status"></p>`;
}
function activarNubeMaestro(repintar) {
  $("#nubeGuardar").onclick = () => {
    const url = $("#nubeUrl").value.trim(), aula = $("#nubeAula").value.trim();
    if (url && !/^https:\/\/script\.google\.com\/|^http:\/\/localhost[:/]/.test(url)) { $("#nubeEstado").textContent = "La URL tiene que ser la de un Apps Script (https://script.google.com/…)."; return; }
    const antes = nubeConf();
    ajustes = { ...ajustes, nube: url && aula ? { url, aula } : null };
    guardar("ajustes", ajustes);
    // Solo si cambia el destino se apunta todo para subir (el servidor no duplica lo que ya tenga)
    if (nubeActiva() && (antes.url !== url || antes.aula !== aula)) { guardar("nube-estado", null); nubeMarcarTodo(); }
    repintar();
  };
  $("#nubeProbar").onclick = async () => {
    $("#nubePrueba").textContent = "Probando…";
    const r = await nubeProbar();
    if ($("#nubePrueba")) $("#nubePrueba").textContent = r.ok ? "✔ Conexión correcta: el servidor confirma los envíos." : `✖ ${r.motivo}`;
  };
  $("#nubeEnviar").onclick = async () => { await nubeEnviar(true); repintar(); };
  $("#nubeTodo").onclick = async () => { nubeMarcarTodo(); await nubeEnviar(true); repintar(); };
}
