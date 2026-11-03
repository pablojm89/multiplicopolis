/* ============================================================
   AGENCIA LA LUPA · motor de casos (v1, prototipo)
   Todo el contenido vive en datos/*.json: este archivo no contiene textos de casos.
   Mapa: Utilidades → Estado → Marcado de faltas → Registro y notas → Pantallas
         (inicio, tablón, caso, informe, maestro) → Componentes → Pasos → Arranque
   ============================================================ */
"use strict";

/* ── Utilidades ─────────────────────────────────────────────── */
const PREFIJO = "lalupa-";
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const norm = s => String(s ?? "").normalize("NFC").trim().toLowerCase();
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const guardar = (k, v) => { try { localStorage.setItem(PREFIJO + k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } };
const cargar = (k, f) => { try { return JSON.parse(localStorage.getItem(PREFIJO + k)) ?? f; } catch { return f; } };
async function leerJSON(ruta) {
  const r = await fetch(ruta, { cache: "no-cache" });
  if (!r.ok) throw new Error(`No se pudo leer ${ruta}`);
  return r.json();
}

/* ── Estado ─────────────────────────────────────────────────── */
const D = { reglas: {}, prog: null, casos: {} };   // datos cargados de datos/
let perfiles = cargar("perfiles", []);             // [{id, nombre, curso}]
let resultados = cargar("resultados", []);         // un registro por caso terminado
let perfil = null;                                 // detective con la sesión abierta
let P = null;                                      // partida en curso

const NOMBRE_CRITERIO = {
  "5.1": "Escribo con corrección",
  "9.1": "Descubro y aplico reglas",
  "9.2": "Reviso textos y encuentro errores",
};

/* ── Marcado de faltas: {mal|bien} o {mal|bien|carta} ───────── */
const SEMILLA = /\{([^{}|]+)\|([^{}|]+)(?:\|([^{}|]+))?\}/g;
const visible = t => String(t ?? "").replace(SEMILLA, (_, mal) => mal);
const tieneFaltas = t => /\{[^{}|]+\|[^{}|]+/.test(String(t ?? ""));

function tokenizar(texto) {
  const out = [];
  let ultimo = 0;
  const plano = s => s.split(/(\p{L}+)/u).forEach(parte => {
    if (parte) out.push({ t: parte, palabra: /^\p{L}+$/u.test(parte) });
  });
  for (const m of String(texto).matchAll(SEMILLA)) {
    plano(texto.slice(ultimo, m.index));
    out.push({ t: m[1], palabra: true, error: true, bien: m[2], carta: m[3] || null });
    ultimo = m.index + m[0].length;
  }
  plano(texto.slice(ultimo));
  return out;
}

const quitarTilde = ch => ch.normalize("NFD").replace(/́/g, "").normalize("NFC");
const llevaTilde = (p, pos) => quitarTilde(p[pos]) !== p[pos];

/* ── Registro y notas ───────────────────────────────────────── */
function registrar(criterio, ok, palabra, detalle) {
  const paso = P.caso.pasos[P.i];
  P.eventos.push({ paso: P.i, tipo: paso.tipo, criterio, ok, palabra: palabra || null, detalle, at: new Date().toISOString() });
  if (!ok && palabra && detalle !== "falsa alarma") P.repasar.add(palabra);
}

function calificacion(n) { return n < 5 ? "IN" : n < 6 ? "SU" : n < 7 ? "BI" : n < 9 ? "NT" : "SB"; }

function calcularNotas(eventos) {
  const por = {};
  eventos.forEach(e => {
    por[e.criterio] ??= { ok: 0, total: 0 };
    por[e.criterio].total++;
    if (e.ok) por[e.criterio].ok++;
  });
  return Object.entries(por).sort().map(([criterio, v]) => {
    const nota = Math.max(1, Math.round(v.ok / v.total * 100) / 10);
    return { criterio, aciertos: v.ok, intentos: v.total, nota, calificacion: calificacion(nota) };
  });
}

const letraCurso = curso => (curso === "5" ? "a" : "b");

/* ── Pantallas ──────────────────────────────────────────────── */
function pantalla(html) { $("#app").innerHTML = html; window.scrollTo(0, 0); }

function vistaInicio() {
  const cursos = D.prog.cursos;
  pantalla(`
    <section class="inicio">
      <header class="marca">
        <div class="logo">🔍</div>
        <h1>Agencia La Lupa</h1>
        <p>Detectives de la lengua · Barrio de La Alameda</p>
      </header>
      <div class="tarjeta">
        <h2>¿Quién investiga hoy?</h2>
        <div class="perfiles">
          ${perfiles.map(p => `<button class="perfil" data-id="${esc(p.id)}"><span>🕵️</span><strong>${esc(p.nombre)}</strong><small>${esc(cursos[p.curso]?.nombre || p.curso)}</small></button>`).join("")
            || `<p class="suave">Todavía no hay detectives en este equipo. ¡Crea tu ficha!</p>`}
        </div>
        <form id="nuevo" class="fila">
          <input id="nNombre" placeholder="Tu nombre de detective" maxlength="30" required autocomplete="off">
          <select id="nCurso">${Object.entries(cursos).map(([k, c]) => `<option value="${esc(k)}">${esc(c.nombre)}</option>`).join("")}</select>
          <button class="primario">Crear ficha</button>
        </form>
      </div>
      <button id="irMaestro" class="enlace">🔒 Zona maestro/a</button>
    </section>`);
  $$(".perfil").forEach(b => b.onclick = () => { perfil = perfiles.find(p => p.id === b.dataset.id); vistaTablon(); });
  $("#nuevo").onsubmit = e => {
    e.preventDefault();
    const nombre = $("#nNombre").value.trim();
    if (!nombre) return;
    perfil = { id: uid(), nombre, curso: $("#nCurso").value, creado: new Date().toISOString() };
    perfiles.push(perfil);
    guardar("perfiles", perfiles);
    vistaTablon();
  };
  $("#irMaestro").onclick = vistaMaestro;
}

function vistaTablon() {
  const curso = D.prog.cursos[perfil.curso];
  const mios = resultados.filter(r => r.perfilId === perfil.id);
  const trimestres = [...new Set(curso.unidades.map(u => u.trimestre))];
  pantalla(`
    <header class="barra">
      <div class="marca-mini">🔍 <strong>Agencia La Lupa</strong></div>
      <div class="quien">🕵️ <strong>${esc(perfil.nombre)}</strong> <small>${esc(curso.nombre)}</small></div>
      <button id="salir" class="fantasma">Salir</button>
    </header>
    <section class="tablon">
      <h2>📌 Tablón de casos</h2>
      ${trimestres.map(t => `
        <h3>${t}.º trimestre</h3>
        <div class="casos">${curso.unidades.filter(u => u.trimestre === t).map(u => tarjetaUnidad(u, mios)).join("")}</div>`).join("")}
      <p class="suave pie">Programación: ${esc(D.prog.fuente)}</p>
    </section>`);
  $("#salir").onclick = () => { perfil = null; vistaInicio(); };
  $$("[data-unidad]").forEach(b => b.onclick = () => iniciarCaso(curso.unidades.find(u => u.id === b.dataset.unidad)));
}

function tarjetaUnidad(u, mios) {
  const reglas = u.reglas.length > 3 ? `Repaso de ${u.reglas.length} reglas` : u.reglas.map(r => D.reglas[r]?.nombre || r).join(" · ");
  const caso = u.caso && D.casos[u.caso];
  if (!caso) return `<article class="caso bloqueado"><span class="sello">Próximamente</span><h4>${esc(u.titulo)}</h4><p>${esc(reglas)}</p></article>`;
  const ultimo = mios.filter(r => r.unidad === u.id).at(-1);
  return `
    <button class="caso" data-unidad="${esc(u.id)}">
      ${ultimo ? `<span class="sello resuelto">Resuelto</span>` : `<span class="sello nuevo">Nuevo</span>`}
      <span class="caso-emoji">${esc(caso.emoji || "🗂️")}</span>
      <h4>${esc(caso.titulo)}</h4>
      <p>${esc(u.titulo)}</p>
      <small>${esc(reglas)}</small>
    </button>`;
}

function iniciarCaso(unidad) {
  P = {
    caso: D.casos[unidad.caso], unidad: unidad.id, i: 0, eventos: [], piezas: [],
    cartas: false, pistas: {}, repasar: new Set(), inicio: Date.now(),
  };
  renderPaso();
}

function renderPaso() {
  const paso = P.caso.pasos[P.i];
  if (!paso) return vistaInforme();
  pantalla(`
    <header class="barra">
      <button id="abandonar" class="fantasma">← Tablón</button>
      <div class="titulo-caso">
        <strong>${esc(P.caso.emoji)} ${esc(P.caso.titulo)}</strong>
        <div class="progreso" aria-label="Avance del caso"><span style="width:${Math.round(P.i / P.caso.pasos.length * 100)}%"></span></div>
      </div>
    </header>
    <div class="caso-layout">
      <main id="escena" class="escena"></main>
      <aside id="cuaderno" class="cuaderno"></aside>
    </div>`);
  $("#abandonar").onclick = () => confirmar("¿Volver al tablón? Se perderá el avance de este caso.", vistaTablon, "Volver al tablón");
  renderCuaderno();
  (PASOS[paso.tipo] || pasoDesconocido)(paso, $("#escena"));
}

const siguiente = () => { P.i++; renderPaso(); };

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
  pantalla(`
    <section class="informe">
      <div class="sello-grande">CASO RESUELTO</div>
      <h2>${esc(P.caso.emoji)} ${esc(P.caso.titulo)}</h2>
      <p>¡Buen trabajo, detective ${esc(perfil.nombre)}!</p>
      <div class="notas">
        ${notas.map(n => `
          <div class="nota">
            <strong>${esc(NOMBRE_CRITERIO[n.criterio] || n.criterio)}</strong>
            <div class="barra-nota"><span style="width:${n.nota * 10}%"></span></div>
            <small>${n.aciertos} de ${n.intentos} a la primera</small>
          </div>`).join("")}
      </div>
      ${res.repasar.length ? `<h3>📝 Palabras para repasar</h3><div class="repasar">${res.repasar.map(w => `<span class="ficha-palabra">${esc(w)}</span>`).join("")}</div>` : `<p class="premio">🌟 ¡Ni una sola palabra para repasar!</p>`}
      <p class="suave">Pistas usadas: ${res.pistas} · Tiempo: ${res.minutos} min</p>
      <button id="volver" class="primario grande">Volver al tablón</button>
    </section>`);
  P = null;
  $("#volver").onclick = vistaTablon;
}

function vistaMaestro() {
  const filas = resultados.slice().reverse();
  const criterios = [...new Set(resultados.flatMap(r => r.notas.map(n => n.criterio)))].sort();
  pantalla(`
    <header class="barra">
      <div class="marca-mini">🔍 <strong>Agencia La Lupa</strong> · Zona maestro/a</div>
      <button id="volver" class="fantasma">← Volver</button>
    </header>
    <section class="maestro">
      <p class="aviso-maestro">Prototipo: aquí se ven solo los datos guardados <strong>en este dispositivo</strong>. La sincronización con la hoja de cálculo y el PIN llegarán más adelante.</p>
      <div class="fila">
        <button id="csv" class="primario">⬇️ Exportar notas por criterio (CSV)</button>
        <button id="borrar" class="fantasma peligro">Borrar datos de este dispositivo</button>
      </div>
      ${filas.length ? `
      <div class="tabla-scroll"><table>
        <thead><tr><th>Detective</th><th>Curso</th><th>Caso</th><th>Fecha</th>${criterios.map(c => `<th title="${esc(NOMBRE_CRITERIO[c] || "")}">${esc(c)}</th>`).join("")}<th>Pistas</th><th>Repasar</th></tr></thead>
        <tbody>${filas.map(r => `<tr>
          <td>${esc(r.nombre)}</td><td>${esc(r.curso)}.º</td><td>${esc(r.titulo)}</td>
          <td>${esc(new Date(r.fecha).toLocaleDateString("es-ES"))}</td>
          ${criterios.map(c => { const n = r.notas.find(x => x.criterio === c); return `<td>${n ? `${n.nota} <small>${n.calificacion}</small><br><small>${esc(n.codigo)}</small>` : "—"}</td>`; }).join("")}
          <td>${r.pistas}</td><td>${esc(r.repasar.join(", "))}</td></tr>`).join("")}
        </tbody></table></div>` : `<p class="suave">Todavía no hay casos resueltos en este dispositivo.</p>`}
    </section>`);
  $("#volver").onclick = () => (perfil ? vistaTablon() : vistaInicio());
  $("#csv").onclick = exportarCSV;
  $("#borrar").onclick = () => confirmar("Se borrarán todos los detectives y resultados de este dispositivo.", () => {
    perfiles = []; resultados = []; perfil = null;
    guardar("perfiles", perfiles); guardar("resultados", resultados);
    vistaInicio();
  }, "Borrar todo");
}

function exportarCSV() {
  const filas = resultados.flatMap(r => r.notas.map(n => ({
    alumno: r.nombre, curso: r.curso, unidad: r.unidad, caso: r.titulo, criterio: n.codigo,
    nota: String(n.nota).replace(".", ","), calificacion: n.calificacion, aciertos: n.aciertos,
    intentos: n.intentos, pistas: r.pistas, minutos: r.minutos, fecha: r.fecha.slice(0, 10),
  })));
  if (!filas.length) return aviso("No hay datos que exportar.");
  const claves = Object.keys(filas[0]);
  const csv = [claves.join(";"), ...filas.map(f => claves.map(k => `"${String(f[k]).replaceAll('"', '""')}"`).join(";"))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  a.download = `la-lupa_notas_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

/* ── Componentes ────────────────────────────────────────────── */
function aviso(msg, tipo = "") {
  const t = $("#toast");
  t.textContent = msg;
  t.className = `toast visible ${tipo}`;
  clearTimeout(aviso.temporizador);
  aviso.temporizador = setTimeout(() => (t.className = "toast"), 2600);
}

function abrirModal(html) {
  const m = $("#modal");
  m.innerHTML = `<div class="modal-caja" role="dialog" aria-modal="true">${html}<button class="cerrar" aria-label="Cerrar">✕</button></div>`;
  m.classList.add("visible");
  $(".cerrar", m).onclick = cerrarModal;
  m.onclick = e => { if (e.target === m) cerrarModal(); };
}
/* Confirmación dentro de la página (confirm() no funciona en todos los visores) */
function confirmar(mensaje, siAcepta, textoSi = "Sí") {
  abrirModal(`<h3>${esc(mensaje)}</h3><div class="acciones"><button class="fantasma" id="cNo">Cancelar</button><button class="primario" id="cSi">${esc(textoSi)}</button></div>`);
  $("#cNo").onclick = cerrarModal;
  $("#cSi").onclick = () => { cerrarModal(); siAcepta(); };
}
function cerrarModal() { $("#modal").classList.remove("visible"); $("#modal").innerHTML = ""; }
document.addEventListener("keydown", e => { if (e.key === "Escape") cerrarModal(); });

function cartasCaso() { return P.caso.reglas.flatMap(r => D.reglas[r]?.cartas || []); }

function verFicha() {
  const fichas = P.caso.reglas.map(r => D.reglas[r]?.ficha).filter(Boolean);
  abrirModal(fichas.map(f => `<h3>📘 ${esc(f.titulo)}</h3><ul class="ficha">${f.puntos.map(p => `<li>${esc(p)}</li>`).join("")}</ul>`).join("") || "<p>No hay ficha para este caso.</p>");
}

function renderCuaderno() {
  const paso = P.caso.pasos[P.i];
  const pistas = paso.pistas || [];
  const usadas = P.pistas[P.i] || 0;
  $("#cuaderno").innerHTML = `
    <h3>📓 Mi cuaderno</h3>
    <div class="bloque"><small>Cifras encontradas</small>
      <div class="cifras">${P.piezas.length ? P.piezas.map(d => `<span class="cifra">${esc(d)}</span>`).join("") : `<em class="suave">Ninguna todavía</em>`}</div>
    </div>
    ${P.cartas ? `<div class="bloque"><small>Cartas de reglas</small>${cartasCaso().map(c => `<div class="carta mini"><strong>${esc(c.titulo)}</strong><span>${esc(c.texto)}</span></div>`).join("")}</div>` : ""}
    <button id="verFicha" class="secundario">📘 Archivo de Mateo</button>
    ${pistas.length ? `<button id="pedirPista" class="secundario" ${usadas >= pistas.length ? "disabled" : ""}>💡 Pedir pista (${usadas}/${pistas.length})</button>` : ""}
    <div>${pistas.slice(0, usadas).map(p => `<p class="pista">💡 ${esc(p)}</p>`).join("")}</div>`;
  $("#verFicha").onclick = verFicha;
  $("#pedirPista")?.addEventListener("click", () => {
    P.pistas[P.i] = usadas + 1;
    aviso(`💡 ${pistas[usadas]}`);
    renderCuaderno();
  });
}

function personaje(paso) {
  return `<div class="personaje"><span class="avatar">${esc(paso.emoji || "🕵️")}</span><div><strong>${esc(paso.quien || "")}</strong>${paso.lugar ? `<small>📍 ${esc(paso.lugar)}</small>` : ""}</div></div>`;
}
const introHTML = paso => (paso.intro ? `<p class="intro">${esc(visible(paso.intro))}</p>` : "");

/* Texto con palabras pulsables. Varios bloques pueden compartir el mismo ctx:
   ctx = { pendientes, conCarta, onCompleto(), onCambio() } */
function textoInteractivo(tokens, ctx) {
  const p = document.createElement("p");
  p.className = "texto-pistas";
  tokens.forEach(tk => {
    if (!tk.palabra) { p.append(document.createTextNode(tk.t)); return; }
    const b = document.createElement("button");
    b.type = "button";
    b.className = "w";
    b.textContent = tk.t;
    b.onclick = () => pulsarPalabra(tk, b, ctx);
    p.append(b);
  });
  return p;
}

function pulsarPalabra(tk, b, ctx) {
  if (tk.resuelta) return;
  if (!tk.error) {
    if (!tk.falsa) { tk.falsa = true; registrar("9.2", false, tk.t, "falsa alarma"); }
    b.classList.remove("falsa"); void b.offsetWidth; b.classList.add("falsa");
    aviso(`«${tk.t}» está bien escrita. ¡Sigue buscando!`);
    return;
  }
  if (!tk.detectada) { tk.detectada = true; registrar("9.2", true, tk.bien, "detectada"); }
  b.classList.add("sospechosa");
  const escribir = () => pedirCorreccion(tk, () => {
    tk.resuelta = true;
    b.textContent = tk.bien;
    b.className = "w resuelta";
    ctx.pendientes--;
    ctx.onCambio?.();
    if (ctx.pendientes === 0) ctx.onCompleto();
  });
  if (ctx.conCarta && tk.carta && !tk.cartaOk) elegirCarta(tk, escribir); else escribir();
}

function elegirCarta(tk, despues) {
  abrirModal(`
    <h3>🃏 ¿Qué carta lo demuestra?</h3>
    <p>¿Por qué <strong class="tachada">${esc(tk.t)}</strong> está mal escrita?</p>
    <div class="cartas">${cartasCaso().map(c => `<button class="carta" data-id="${esc(c.id)}"><strong>${esc(c.titulo)}</strong><span>${esc(c.texto)}</span></button>`).join("")}</div>
    <p id="cartaMsg" class="msg"></p>`);
  $$("#modal .carta").forEach(btn => btn.onclick = () => {
    const ok = btn.dataset.id === tk.carta;
    if (!tk.cartaIntentada) { tk.cartaIntentada = true; registrar("9.1", ok, tk.bien, "carta"); }
    if (ok) { tk.cartaOk = true; despues(); return; }
    btn.classList.add("mal");
    btn.disabled = true;
    $("#cartaMsg").textContent = "Esa carta no lo demuestra. Busca la sílaba fuerte de la palabra y mira cómo termina.";
  });
}

function pedirCorreccion(tk, hecho) {
  let fallos = 0;
  abrirModal(`
    <h3>🔎 ¡Falta encontrada!</h3>
    <p>Escribe bien la palabra <strong class="tachada">${esc(tk.t)}</strong>:</p>
    <input id="corr" class="entrada" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Palabra corregida">
    <p id="corrMsg" class="msg"></p>
    <div class="acciones"><button class="primario" id="corrOk">Comprobar</button></div>`);
  const inp = $("#corr");
  inp.focus();
  const comprobar = () => {
    if (!inp.value.trim()) return;
    const ok = norm(inp.value) === norm(tk.bien);
    if (!tk.intentada) { tk.intentada = true; registrar("5.1", ok, tk.bien, "corrección"); }
    if (ok) { cerrarModal(); aviso(`✔️ ¡Bien! Se escribe «${tk.bien}».`, "bien"); hecho(); return; }
    fallos++;
    $("#corrMsg").innerHTML = fallos >= 2
      ? `Se escribe <strong>${esc(tk.bien)}</strong>. Escríbela tú.`
      : "Todavía no. Busca la sílaba fuerte y mira cómo termina la palabra.";
    inp.select();
  };
  $("#corrOk").onclick = comprobar;
  inp.onkeydown = e => { if (e.key === "Enter") comprobar(); };
}

function recompensa(paso, el, textoPorDefecto = "¡Bien hecho, detective!") {
  const r = paso.recompensa;
  if (r?.digito) P.piezas.push(r.digito);
  renderCuaderno();
  const zona = $("#premio", el);
  zona.innerHTML = `<div class="premio">🗝️ ${esc(r?.texto || textoPorDefecto)}</div><button class="primario grande" id="seguir">Continuar</button>`;
  $("#seguir").onclick = siguiente;
  zona.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* ── Pasos (uno por "tipo" del JSON del caso) ───────────────── */
const PASOS = {
  narracion(paso, el) {
    el.innerHTML = `${personaje(paso)}<div class="bocadillo"><p>${esc(visible(paso.texto))}</p></div>
      <button class="primario grande" id="seguir">${esc(paso.boton || "Continuar")}</button>`;
    $("#seguir").onclick = siguiente;
  },

  descubre(paso, el) {
    let q = 0;
    const pintar = () => {
      const pr = paso.preguntas[q];
      let primera = true;
      el.innerHTML = `${personaje(paso)}${q === 0 ? introHTML(paso) : ""}
        <div class="grupos">${pr.grupos.map(g => `<div class="grupo"><small>${esc(g.titulo)}</small><div>${g.palabras.map(w => `<span class="ficha-palabra">${esc(w)}</span>`).join("")}</div></div>`).join("")}</div>
        <h3 class="pregunta">${esc(pr.pregunta)}</h3>
        <div class="opciones">${pr.opciones.map((o, k) => `<button class="opcion" data-k="${k}">${esc(o)}</button>`).join("")}</div>
        <div id="explica"></div>
        <small class="suave">Pregunta ${q + 1} de ${paso.preguntas.length}</small>`;
      $$(".opcion", el).forEach(b => b.onclick = () => {
        const ok = Number(b.dataset.k) === pr.correcta;
        if (primera) { registrar("9.1", ok, null, "descubre la regla"); primera = false; }
        if (!ok) { b.classList.add("mal"); b.disabled = true; aviso("Mmm… eso no encaja con todas las palabras. Prueba otra.", "mal"); return; }
        $$(".opcion", el).forEach(x => (x.disabled = true));
        b.classList.add("bien");
        const ultima = q + 1 >= paso.preguntas.length;
        $("#explica").innerHTML = `<div class="explicacion">✔️ ${esc(pr.explicacion)}</div><button class="primario" id="sigQ">${ultima ? "¡Entendido!" : "Siguiente"}</button>`;
        $("#sigQ").onclick = () => {
          q++;
          if (!ultima) return pintar();
          if (paso.desbloquea === "cartas") { P.cartas = true; aviso("🃏 ¡Has conseguido las cartas de reglas! Están en tu cuaderno.", "bien"); }
          siguiente();
        };
      });
    };
    pintar();
  },

  caza(paso, el) {
    const tokens = tokenizar(paso.declaracion);
    const total = tokens.filter(t => t.error).length;
    el.innerHTML = `${personaje(paso)}${introHTML(paso)}
      <p class="instruccion">Toca las palabras mal escritas y corrígelas.</p>
      <div class="declaracion" id="decl"></div>
      <p class="contador" id="cont"></p><div id="premio"></div>`;
    const contador = () => ($("#cont").textContent = `Faltas corregidas: ${total - ctx.pendientes} de ${total}`);
    const ctx = { pendientes: total, conCarta: false, onCambio: contador, onCompleto: () => recompensa(paso, el) };
    $("#decl").append(textoInteractivo(tokens, ctx));
    contador();
  },

  careo(paso, el) {
    const tokens = tokenizar(paso.declaracion);
    const total = tokens.filter(t => t.error).length;
    el.innerHTML = `${personaje(paso)}${introHTML(paso)}
      <p class="instruccion">Señala cada falta, presenta la carta que lo demuestra y escríbela bien.</p>
      <div class="declaracion careo" id="decl"></div>
      <p class="contador" id="cont"></p><div id="premio"></div>`;
    const contador = () => ($("#cont").textContent = `Faltas demostradas: ${total - ctx.pendientes} de ${total}`);
    const ctx = { pendientes: total, conCarta: true, onCambio: contador, onCompleto: () => recompensa(paso, el, "¡Declaración aclarada! Ramón no es un ladrón… pero ¿dónde está la caja?") };
    $("#decl").append(textoInteractivo(tokens, ctx));
    contador();
  },

  clasifica(paso, el) {
    let k = 0;
    let primera = true;
    el.innerHTML = `${personaje(paso)}${introHTML(paso)}
      <div id="actual" class="actual"></div>
      <div class="cubos">${paso.categorias.map(c => `<button class="cubo" data-id="${esc(c.id)}"><strong>${esc(c.nombre)}</strong><div class="dentro" id="cubo-${esc(c.id)}"></div></button>`).join("")}</div>
      <p id="clMsg" class="msg"></p><div id="premio"></div>`;
    const pintar = () => {
      const w = paso.palabras[k];
      primera = true;
      $("#actual").innerHTML = w
        ? `<small>Etiqueta ${k + 1} de ${paso.palabras.length}</small><span class="ficha-palabra grande">${esc(w.p)}</span>`
        : `<span class="premio">✔️ ¡Todo ordenado!</span>`;
    };
    $$(".cubo", el).forEach(b => b.onclick = () => {
      const w = paso.palabras[k];
      if (!w) return;
      const ok = b.dataset.id === w.cat;
      if (primera) { registrar("9.1", ok, w.p, "clasificar"); primera = false; }
      if (!ok) {
        $("#clMsg").innerHTML = `No. Sepárala en sílabas: <strong>${esc(w.silabas)}</strong>. ¿Cuál suena más fuerte?`;
        b.classList.remove("sacude"); void b.offsetWidth; b.classList.add("sacude");
        return;
      }
      $("#clMsg").textContent = "";
      $(`#cubo-${w.cat}`).insertAdjacentHTML("beforeend", `<span class="mini-palabra">${esc(w.p)}</span>`);
      k++;
      pintar();
      if (k >= paso.palabras.length) { $$(".cubo", el).forEach(x => (x.disabled = true)); recompensa(paso, el); }
    });
    pintar();
  },

  manchas(paso, el) {
    const resp = {};
    const contadas = new Set();
    const resueltas = new Set();
    el.innerHTML = `${personaje(paso)}${introHTML(paso)}
      <div class="partitura">${paso.palabras.map((w, k) => `
        <div class="manchada" data-k="${k}">
          <span class="palabra-mancha">${[...w.p].map((ch, i) => (i === w.pos ? `<span class="bajo-mancha">${esc(quitarTilde(ch))}</span>` : esc(ch))).join("")}</span>
          <div class="si-no"><button data-v="1">Con tilde</button><button data-v="0">Sin tilde</button></div>
          <small class="expl"></small>
        </div>`).join("")}</div>
      <button class="primario" id="comprobar">Comprobar</button><div id="premio"></div>`;
    $$(".manchada", el).forEach(caja => {
      const k = Number(caja.dataset.k);
      $$(".si-no button", caja).forEach(b => b.onclick = () => {
        resp[k] = b.dataset.v === "1";
        $$(".si-no button", caja).forEach(x => x.classList.toggle("activo", x === b));
      });
    });
    $("#comprobar").onclick = () => {
      const faltan = paso.palabras.some((_, k) => !resueltas.has(k) && resp[k] === undefined);
      if (faltan) return aviso("Decide primero todas las palabras.");
      paso.palabras.forEach((w, k) => {
        if (resueltas.has(k)) return;
        const caja = $(`.manchada[data-k="${k}"]`, el);
        const ok = resp[k] === llevaTilde(w.p, w.pos);
        if (!contadas.has(k)) { contadas.add(k); registrar("5.1", ok, w.p, "manchas"); }
        if (ok) {
          resueltas.add(k);
          caja.className = "manchada resuelta";
          $(".palabra-mancha", caja).textContent = w.p;
          $$(".si-no button", caja).forEach(x => (x.disabled = true));
          $(".expl", caja).textContent = w.silabas;
        } else {
          caja.className = "manchada error";
          delete resp[k];
          $$(".si-no button", caja).forEach(x => x.classList.remove("activo"));
          $(".expl", caja).textContent = `Pista: ${w.silabas}`;
        }
      });
      if (resueltas.size === paso.palabras.length) { $("#comprobar").remove(); recompensa(paso, el); }
      else aviso("Algunas no son correctas. Mira las pistas y vuelve a decidir.", "mal");
    };
  },

  candado(paso, el) {
    el.innerHTML = `${personaje({ emoji: "🔒", quien: paso.lugar })}${introHTML(paso)}
      <div class="candado">${[...paso.codigo].map((_, k) => `<input class="rueda" maxlength="1" inputmode="numeric" aria-label="Cifra ${k + 1}" data-k="${k}">`).join("")}</div>
      <button class="primario" id="abrir">Abrir</button>
      <p id="cMsg" class="msg"></p><div id="premio"></div>`;
    const ruedas = $$(".rueda", el);
    ruedas.forEach((r, k) => (r.oninput = () => {
      r.value = r.value.replace(/\D/g, "").slice(-1);
      if (r.value && ruedas[k + 1]) ruedas[k + 1].focus();
    }));
    ruedas[0].focus();
    $("#abrir").onclick = () => {
      if (ruedas.map(r => r.value).join("") !== paso.codigo) {
        $("#cMsg").textContent = "El candado no se abre. Revisa las cifras de tu cuaderno y su orden.";
        return;
      }
      $("#abrir").remove();
      ruedas.forEach(r => (r.disabled = true));
      $("#cMsg").textContent = "";
      $("#premio").innerHTML = `<div class="premio">🎉 ${esc(paso.exito)}</div><button class="primario grande" id="seguir">Continuar</button>`;
      $("#seguir").onclick = siguiente;
    };
  },

  expediente(paso, el) {
    const bloques = P.caso.pasos.slice(0, P.i).flatMap(p =>
      [p.texto, p.intro].filter(tieneFaltas).map(t => ({ etiqueta: p.lugar || p.quien || "Aviso", tokens: tokenizar(t) })));
    const errores = bloques.flatMap(b => b.tokens.filter(t => t.error));
    el.innerHTML = `${personaje(paso)}${introHTML(paso)}
      <div id="exp" class="expediente"></div>
      <p class="contador" id="cont"></p>
      <button class="primario grande" id="entregar">Entregar expediente</button>`;
    const contador = () => ($("#cont").textContent = `Faltas corregidas: ${errores.length - ctx.pendientes} de ${errores.length}`);
    const ctx = { pendientes: errores.length, conCarta: false, onCambio: contador, onCompleto: () => aviso("📁 ¡Expediente perfecto! Ya puedes entregarlo.", "bien") };
    bloques.forEach(b => {
      const hoja = document.createElement("article");
      hoja.className = "hoja";
      hoja.innerHTML = `<small>${esc(b.etiqueta)}</small>`;
      hoja.append(textoInteractivo(b.tokens, ctx));
      $("#exp").append(hoja);
    });
    contador();
    $("#entregar").onclick = () => {
      const sinResolver = errores.filter(t => !t.resuelta);
      const entregar = () => {
        sinResolver.forEach(t => {
          if (!t.detectada) registrar("9.2", false, t.bien, "no encontrada");
          if (!t.intentada) registrar("5.1", false, t.bien, "sin corregir");
        });
        siguiente();
      };
      if (sinResolver.length) confirmar("Todavía quedan faltas en el expediente. ¿Entregarlo de todas formas?", entregar, "Entregar así");
      else entregar();
    };
  },
};

function pasoDesconocido(paso, el) {
  el.innerHTML = `<p class="msg">Este paso (“${esc(paso.tipo)}”) todavía no existe en el motor.</p><button class="primario" id="seguir">Saltar</button>`;
  $("#seguir").onclick = siguiente;
}

/* ── Arranque ───────────────────────────────────────────────── */
async function init() {
  try {
    const [reglas, prog] = await Promise.all([leerJSON("datos/reglas.json"), leerJSON("datos/programacion.json")]);
    D.reglas = reglas;
    D.prog = prog;
    const ids = [...new Set(Object.values(prog.cursos).flatMap(c => c.unidades.map(u => u.caso).filter(Boolean)))];
    await Promise.all(ids.map(async id => {
      try { D.casos[id] = await leerJSON(`datos/casos/${id}.json`); } catch { console.warn(`Falta el caso ${id}`); }
    }));
  } catch {
    $("#app").innerHTML = `<div class="tarjeta"><h2>No se pudieron cargar los datos</h2><p>Abre el juego desde un servidor web (GitHub Pages, o <code>node .claude/serve.js</code> en local), no como archivo suelto.</p></div>`;
    return;
  }
  vistaInicio();
}
init();
