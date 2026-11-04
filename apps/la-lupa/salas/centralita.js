/* ============================================================
   AGENCIA LA LUPA · Academia · La Centralita (azotea)
   R1 Dictado por radio: la radio lee un mensaje (speechSynthesis, es-ES, 0,85)
   y el alumno lo teclea en la cinta del télex. Puede escucharlo hasta 3 veces.
   P3 Relámpago (sin voz o si el alumno lo elige): el mensaje sale unos segundos
   en la cinta, se borra y se escribe de memoria.
   Corrección palabra a palabra (tildes y mayúsculas cuentan; los signos, no):
   las falladas se explican y se reescriben. Las palabras marcadas registran 5.1
   y, si se fallan, entran en la cola de repaso (terminarActividad).
   Datos: datos/academia/dictados.json (validar_centralita.py).
   ============================================================ */
"use strict";

const CEN_REGLAS = ["tildes-generales", "b-v-1", "h-1", "c-z-s", "ll-y", "g-j-dieresis", "diptongo-monosilabos", "d-z-finales", "mayusculas-puntuacion-1"];
const CEN_EMISIONES = 3;     // escuchas (o destellos) por mensaje
const CEN_RONDA = 4;         // mensajes por ronda
const CEN = { banco: null, voz: null, gen: 0, temporizadores: [] };

Object.assign(sala("centralita"), {
  activa: true, instructor: "lola", actividad: "dictado",
  gancho: "Mensajes por radio: escúchalos y tecléalos en el télex.",
  reglas: CEN_REGLAS,
});

/* ── Voz: solo si hay una voz en español ─────────────────────── */
const cenHaySintesis = () => sonidoActivo() && typeof speechSynthesis !== "undefined" && typeof SpeechSynthesisUtterance !== "undefined";
function cenBuscarVoz() {
  if (!cenHaySintesis()) return null;
  try {
    const voces = speechSynthesis.getVoices();
    return voces.find(v => v.lang === "es-ES") || voces.find(v => /^es[-_]ES/i.test(v.lang)) || voces.find(v => /^es\b/i.test(v.lang)) || null;
  } catch { return null; }
}
/* Chrome carga las voces tarde: se espera un momento al evento voiceschanged */
function cenEsperarVoces() {
  if (!cenHaySintesis() || cenBuscarVoz()) return Promise.resolve();
  return new Promise(res => {
    const t = setTimeout(res, 900);
    try { speechSynthesis.addEventListener("voiceschanged", () => { clearTimeout(t); res(); }, { once: true }); } catch { res(); }
  });
}
function cenModoInicial() {
  const pref = cargar("centralita-modo", null);
  if (!CEN.voz) return "relampago";
  return pref === "relampago" ? "relampago" : "radio";
}

/* ── Comparación palabra a palabra ───────────────────────────── */
const cenPalabras = s => String(s ?? "").normalize("NFC").match(/[\p{L}\p{N}]+/gu) || [];
const cenBase = w => quitarTildes(w.toLowerCase());
function cenLev(a, b) {
  const x = [...a], y = [...b];
  let fila = Array.from({ length: y.length + 1 }, (_, j) => j);
  for (let i = 1; i <= x.length; i++) {
    const nueva = [i];
    for (let j = 1; j <= y.length; j++) nueva[j] = Math.min(fila[j] + 1, nueva[j - 1] + 1, fila[j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
    fila = nueva;
  }
  return fila[y.length];
}
/* Coste de emparejar la palabra esperada e con la escrita u: 0 si es igual; poco si solo cambia la tilde o la mayúscula */
function cenCoste(e, u) {
  if (e === u) return 0;
  const be = cenBase(e), bu = cenBase(u);
  if (be === bu) return 0.2;
  return 0.4 + 0.6 * cenLev(be, bu) / Math.max([...be].length, [...bu].length);
}
/* Alinea lo escrito con el mensaje (así una palabra saltada no estropea las siguientes) */
function cenAlinear(E, U) {
  const n = E.length, m = U.length;
  const d = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++)
    d[i][j] = Math.min(d[i - 1][j - 1] + cenCoste(E[i - 1], U[j - 1]), d[i - 1][j] + 1, d[i][j - 1] + 1);
  const escrita = Array(n).fill(null), sobran = [];
  let i = n, j = m;
  const igual = (a, b) => Math.abs(a - b) < 1e-9;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && igual(d[i][j], d[i - 1][j - 1] + cenCoste(E[i - 1], U[j - 1]))) { escrita[i - 1] = U[j - 1]; i--; j--; }
    else if (i > 0 && igual(d[i][j], d[i - 1][j] + 1)) i--;
    else { sobran.unshift(U[j - 1]); j--; }
  }
  return { escrita, sobran };
}
/* Por qué falla una palabra sin marca (tilde, mayúscula o letras) */
function cenPorQue(e, u, i) {
  if (!u) return "Escríbela para completar el mensaje.";
  if (u.toLowerCase() === e.toLowerCase()) {
    if (e[0] !== e[0].toLowerCase()) return i === 0 ? "Va con mayúscula: es la primera palabra del mensaje." : "Va con mayúscula: es un nombre propio o empieza una oración.";
    return "Va en minúscula.";
  }
  if (cenBase(u) === cenBase(e)) return e !== quitarTildes(e) ? `${PISTA_REGLA["tildes-generales"]} Esta lleva tilde.` : "Esta no lleva tilde.";
  return "Fíjate letra a letra.";
}

/* ── Elegir los mensajes de la ronda (primero, los que tienen palabras en tu cola) ── */
function cenElegir(activas, mezcla) {
  const cola = estadoAca().cola;
  const pesa = f => (f.marcas.some(m => cola[m.p]) ? 1 : 0);
  const candidatas = barajar(CEN.banco.filter(f => activas.includes(f.regla))).sort((a, b) => pesa(b) - pesa(a));
  if (!mezcla) return candidatas.slice(0, CEN_RONDA);
  const elegidas = [], usadas = new Set();
  candidatas.forEach(f => { if (elegidas.length < CEN_RONDA && !usadas.has(f.regla)) { elegidas.push(f); usadas.add(f.regla); } });
  return barajar(elegidas);
}

/* ── Temporizadores y voz que no deben sobrevivir a la pantalla ── */
function cenParar() {
  CEN.gen++;
  CEN.temporizadores.forEach(clearTimeout);
  CEN.temporizadores = [];
  try { if (cenHaySintesis()) speechSynthesis.cancel(); } catch { /* sin voz */ }
}
function cenLuego(gen, ms, fn) { CEN.temporizadores.push(setTimeout(() => { if (gen === CEN.gen) fn(); }, ms)); }

/* ── La actividad ─────────────────────────────────────────────── */
ACTIVIDADES.dictado = async function (sl, regla, turno) {
  try { CEN.banco ??= (await leerJSON("datos/academia/dictados.json")).frases; }
  catch { aviso("No hay señal: no se han podido cargar los mensajes.", "mal"); return; }
  await cenEsperarVoces();
  CEN.voz = cenBuscarVoz();
  const activas = regla && regla !== "mezcla" ? [regla] : CEN_REGLAS;
  const lista = cenElegir(activas, !regla || regla === "mezcla");
  partidaAca(sl, activas);
  let modo = cenModoInicial();
  let k = 0;
  const DIAL = [14, 38, 62, 86];   // posición de la aguja para cada canal (%)

  const pintar = () => {
    cenParar();
    const gen = CEN.gen;
    const f = lista[k];
    if (!f) return terminarActividad(sl, turno);
    const E = cenPalabras(f.texto);
    let emisiones = 0, estado = "espera";   // espera → emitiendo → escribiendo → corrigiendo → hecho
    const aguja = k ? DIAL[k - 1] : 0;
    const regNombre = f.marcas.length && D.reglas[f.regla]?.nombre;
    pintarEscena(`
      <h1 class="cartel titulo-escena">${esc(sl.nombre)}</h1>
      <div class="cen-modo" role="group" aria-label="Modo de recepción">
        <button data-modo="radio" ${CEN.voz ? "" : `disabled title="${sonidoActivo() ? "Este equipo no tiene voz en español" : "El sonido está desactivado (zona del maestro)"}"`}>📻 Radio</button>
        <button data-modo="relampago">⚡ Relámpago</button>
      </div>
      <div class="cen-lola">${htmlPersonaje({ id: "lola", expresion: "neutral", lado: "izq" }, "pequeno")}</div>
      <div class="cen-consola">
        <div class="cen-radio" id="cenRadio">
          <div class="cen-altavoz" aria-hidden="true"><div class="cen-ondas">${"<i></i>".repeat(11)}</div></div>
          <div class="cen-centro">
            <div class="cen-dial" aria-hidden="true">
              <div class="cen-escala">${[88, 92, 96, 100, 104, 108].map(x => `<span>${x}</span>`).join("")}</div>
              <i class="cen-aguja" id="cenAguja" style="left:${aguja}%"></i>
            </div>
            <div class="cen-canales" aria-label="Mensaje ${k + 1} de ${lista.length}">
              <span class="cen-rotulo">Canal</span>
              ${lista.map((_, i) => `<i class="${i < k ? "hecho" : i === k ? "actual" : ""}"></i>`).join("")}
              <span class="cen-rotulo">Mensaje ${k + 1} de ${lista.length}${regla === "mezcla" || !regla ? "" : ` · ${esc(regNombre || "")}`}</span>
            </div>
          </div>
          <div class="cen-mandos">
            <div class="cen-piloto"><i id="cenPiloto"></i><span>En el aire</span></div>
            <button class="cen-emitir" id="cenEmitir"></button>
          </div>
        </div>
        <p class="cen-dice" id="cenDice" aria-live="polite"></p>
        <div class="cen-telex">
          <div class="cen-maquina" aria-hidden="true"><b>TÉLEX</b><small>La Lupa</small><span class="cen-ranura"></span></div>
          <div class="cen-cinta" id="cenCinta">
            <div class="cen-recibido" id="cenRecibido" hidden></div>
            <div class="cen-cuenta" id="cenCuenta" hidden><i></i></div>
            <textarea id="cenResp" class="cen-escribe" rows="2" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Teclea el mensaje en la cinta" placeholder="Pulsa «${modo === "radio" ? "Escuchar" : "Recibir"}» y teclea aquí el mensaje…" disabled></textarea>
          </div>
        </div>
        <div class="cen-pie" id="cenPie">
          <p id="msg" class="msg"></p>
          <button class="boton-sello" id="cenOk" disabled>Transmitir ▸</button>
        </div>
      </div>
      <button class="hud-volver" id="acaVolver">◂ Patio</button>`, { fondo: sl.fondo, clase: "oscurecido cen-sala" });

    const dice = (t, cara) => { $("#cenDice").innerHTML = `<b>Lola:</b> ${t}`; if (cara) cenCara(cara); };
    const resp = $("#cenResp");
    requestAnimationFrame(() => { const a = $("#cenAguja"); if (a) a.style.left = `${DIAL[k]}%`; });
    $("#acaVolver").onclick = () => confirmar("¿Volver al patio? Se perderá esta ronda.", () => { cenParar(); vistaPatio(); }, "Volver");

    /* Selector de modo */
    const marcarModo = () => $$(".cen-modo button").forEach(b => { b.classList.toggle("activo", b.dataset.modo === modo); b.setAttribute("aria-pressed", b.dataset.modo === modo); });
    marcarModo();
    $$(".cen-modo button").forEach(b => b.onclick = () => {
      if (b.dataset.modo === modo) return;
      if (estado === "corrigiendo" || estado === "hecho") { modo = b.dataset.modo; guardar("centralita-modo", modo); marcarModo(); aviso("El cambio de modo vale desde el siguiente mensaje."); return; }
      modo = b.dataset.modo; guardar("centralita-modo", modo); pintar();
    });

    const botonEmitir = () => {
      const quedan = CEN_EMISIONES - emisiones;
      const b = $("#cenEmitir");
      const verbo = modo === "radio" ? (emisiones ? "Repetir" : "Escuchar") : (emisiones ? "Otra vez" : "Recibir");
      b.innerHTML = `${modo === "radio" ? "▶" : "⚡"} ${verbo}<small>${quedan ? `quedan ${quedan}` : "sin más emisiones"}</small>`;
      b.disabled = !quedan || estado === "emitiendo" || estado === "corrigiendo" || estado === "hecho";
    };
    const alAire = on => { $("#cenRadio")?.classList.toggle("emitiendo", on); };
    const listoParaEscribir = () => {
      resp.disabled = false; resp.hidden = false; resp.placeholder = "Teclea aquí el mensaje…";
      $("#cenOk").disabled = false;
      resp.focus();
    };

    /* Inicio */
    if (modo === "radio") dice(k === 0
      ? "Te llamo desde el kiosco. Pulsa «Escuchar» y teclea mi mensaje en la cinta. Puedes oírlo hasta tres veces. Cuentan las tildes y las mayúsculas; los signos, no tanto."
      : "Nuevo mensaje en camino. Escucha y teclea.");
    else dice(k === 0
      ? "Hay interferencias: mando el mensaje en modo relámpago. Saldrá en la cinta unos segundos y se borrará. ¡Memorízalo! Fíjate en las palabras subrayadas."
      : "Otro relámpago. Atento a las palabras subrayadas.");
    botonEmitir();

    /* Emitir por radio */
    const emitirRadio = () => {
      let u;
      try {
        u = new SpeechSynthesisUtterance(f.texto);
        u.lang = "es-ES"; u.rate = 0.85;
        if (CEN.voz) u.voice = CEN.voz;
      } catch { return pasarARelampago(); }
      emisiones++; estado = "emitiendo"; botonEmitir(); alAire(true);
      listoParaEscribir();
      let acabado = false;
      const fin = () => {
        if (acabado || gen !== CEN.gen) return;
        acabado = true; alAire(false);
        if (estado === "emitiendo") estado = "escribiendo";
        botonEmitir();
        dice(emisiones < CEN_EMISIONES ? "Fin del mensaje. Si te falta algo, vuelve a escucharlo." : "Ya no hay más emisiones. Revisa tu cinta y transmite.");
      };
      u.onend = fin;
      u.onerror = ev => { if (ev.error === "interrupted" || ev.error === "canceled") return fin(); fin(); pasarARelampago(); };
      cenLuego(gen, 4000 + E.length * 900, fin);   // por si el navegador no avisa del final
      dice("Emitiendo… teclea mientras escuchas.");
      try { speechSynthesis.cancel(); speechSynthesis.speak(u); } catch { fin(); pasarARelampago(); }
    };
    const pasarARelampago = () => {
      if (gen !== CEN.gen) return;
      aviso("No se oye la radio: pasamos al modo relámpago.");
      modo = "relampago"; CEN.voz = null; pintar();
    };

    /* Emitir en modo relámpago: la frase sale en la cinta, se subrayan las palabras clave y se borra */
    const emitirRelampago = () => {
      emisiones++; estado = "emitiendo"; botonEmitir(); alAire(true);
      resp.hidden = true; $("#cenOk").disabled = true;
      const rec = $("#cenRecibido");
      rec.hidden = false; rec.className = "cen-recibido";
      const clave = new Set(f.marcas.map(m => m.p));
      const trozos = f.texto.split(/([\p{L}\p{N}]+)/u);
      const html = trozos.map(t => (clave.has(t) ? `<u>${esc(t)}</u>` : esc(t)));
      const consejo = azarElem(f.marcas);
      dice(`Ojo a «${esc(consejo.p)}». ${esc(consejo.por)}`, emisiones === 1 ? "sorprendido" : null);
      const ms = 3000 + 500 * E.length;   // 8 palabras → 7 s; 14 palabras → 10 s
      const empezarCuenta = () => {
        const c = $("#cenCuenta");
        c.hidden = false;
        c.firstElementChild.style.transition = "none"; c.firstElementChild.style.width = "100%";
        void c.offsetWidth;
        c.firstElementChild.style.transition = `width ${ms}ms linear`; c.firstElementChild.style.width = "0%";
        cenLuego(gen, ms, borrar);
      };
      if (movimientoReducido()) { rec.innerHTML = html.join(""); empezarCuenta(); }
      else {
        // el télex escribe a golpes, trozo a trozo
        let i = 0;
        const paso = () => {
          i++;
          rec.innerHTML = html.slice(0, i).join("") + `<span class="cen-cursor"></span>`;
          if (i < html.length) cenLuego(gen, 55, paso); else { rec.innerHTML = html.join(""); empezarCuenta(); }
        };
        paso();
      }
      const borrar = () => {
        rec.classList.add("borrando");
        $("#cenCuenta").hidden = true;
        cenLuego(gen, 650, () => {
          rec.hidden = true; rec.innerHTML = ""; rec.classList.remove("borrando");
          alAire(false); estado = "escribiendo"; botonEmitir();
          listoParaEscribir();
          dice(emisiones < CEN_EMISIONES ? "¡Borrado! Ahora tecléalo de memoria. Si lo necesitas, puedes verlo otra vez." : "¡Borrado! Ya no hay más destellos: tecléalo de memoria.", "neutral");
        });
      };
    };

    $("#cenEmitir").onclick = () => {
      if (emisiones >= CEN_EMISIONES || estado === "emitiendo") return;
      if (modo === "radio") emitirRadio(); else emitirRelampago();
    };

    /* Transmitir: corrección palabra a palabra */
    const transmitir = () => {
      if (estado === "corrigiendo" || estado === "hecho" || resp.disabled) return;
      if (!cenPalabras(resp.value).length) { $("#msg").textContent = "La cinta está vacía: teclea el mensaje."; return; }
      cenParar();   // corta la voz y los destellos pendientes, pero esta pantalla sigue viva:
      const gen2 = CEN.gen;
      alAire(false);
      estado = "corrigiendo"; botonEmitir();
      const { escrita, sobran } = cenAlinear(E, cenPalabras(resp.value));
      const bien = E.map((e, i) => escrita[i] === e);
      // Registro: solo las palabras marcadas (con su regla), a la primera
      const usadas = new Set();
      const marcaDe = {};
      f.marcas.forEach(m => {
        const i = E.findIndex((e, j) => e === m.p && !usadas.has(j));
        if (i < 0) return;
        usadas.add(i); marcaDe[i] = m;
        // Un despiste de mayúscula no es un fallo de b/v, de h…: solo cuenta en la regla de mayúsculas
        const mayus = m.regla === "mayusculas-puntuacion-1";
        const ok = bien[i] || (!mayus && escrita[i]?.toLowerCase() === m.p.toLowerCase());
        registrar("5.1", ok, i === 0 && !mayus ? m.p.toLowerCase() : m.p, "dictado", m.regla);
        Object.assign(P.eventos.at(-1), { modo, emisiones });
      });
      // La cinta muestra ya el mensaje bien escrito, con las palabras falladas en rojo
      resp.hidden = true;
      const rec = $("#cenRecibido");
      rec.hidden = false; rec.className = "cen-recibido corregido";
      let w = -1;
      rec.innerHTML = f.texto.split(/([\p{L}\p{N}]+)/u).map(t => {
        if (!/^[\p{L}\p{N}]+$/u.test(t)) return esc(t);
        w++;
        return `<span class="cen-w ${bien[w] ? "ok" : "mal"} ${marcaDe[w] ? "clave" : ""}" data-i="${w}">${esc(t)}</span>`;
      }).join("");
      const falladas = E.map((_, i) => i).filter(i => !bien[i]);
      const aciertos = E.length - falladas.length;
      const pie = $("#cenPie");
      const notaSobran = sobran.length ? ` Te sobraba${sobran.length > 1 ? "n" : ""}: ${sobran.map(x => `<s>${esc(x)}</s>`).join(", ")}.` : "";

      const cerrar = () => {
        estado = "hecho";
        const ultimo = k === lista.length - 1;
        pie.innerHTML = `
          <div class="cen-limpio"><small>Mensaje en limpio · ${aciertos} de ${E.length} palabras a la primera</small><p>${esc(f.texto)}</p></div>
          <button class="flecha" id="cenSig">${ultimo ? "Cerrar la emisión" : "Siguiente mensaje"} ▸</button>`;
        $("#cenSig").onclick = () => { k++; pintar(); };
        $("#cenSig").focus();
      };

      if (!falladas.length) {
        dice(`¡Recibido alto y claro! Mensaje perfecto.${notaSobran}`, "contento");
        aviso("¡Mensaje perfecto!", "bien");
        return cerrar();
      }
      dice(`Hay interferencias en ${falladas.length} palabra${falladas.length > 1 ? "s" : ""}. ${falladas.length > 1 ? "Vamos a arreglarlas una a una" : "Vamos a arreglarla"}.${notaSobran}`, "pensativo");
      let n = 0;
      const arreglar = () => {
        if (gen2 !== CEN.gen) return;
        const i = falladas[n];
        if (i === undefined) { dice("¡Cinta arreglada! Así queda el mensaje.", "contento"); return cerrar(); }
        const e = E[i], u = escrita[i], m = marcaDe[i];
        $$(".cen-w").forEach(x => x.classList.toggle("foco", Number(x.dataset.i) === i));
        const soloMayus = u && u.toLowerCase() === e.toLowerCase();
        const por = m && !soloMayus ? m.por : cenPorQue(e, u, i);
        const reglaW = soloMayus && m?.regla !== "mayusculas-puntuacion-1" ? null : m?.regla;
        pie.innerHTML = `
          <div class="cen-arreglo">
            <small>Arreglo ${n + 1} de ${falladas.length}${reglaW ? ` · ${esc(D.reglas[reglaW]?.nombre || reglaW)}` : ""}</small>
            <p>${u ? `Tecleaste <s>${esc(u)}</s> → se escribe` : "Faltaba esta palabra:"} <b>${esc(e)}</b>. ${esc(por)}</p>
            <div class="cen-fila">
              <input id="cenArr" class="entrada" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Escribe ${esc(e)}">
              <button class="boton-sello" id="cenArrOk">Corregir</button>
              ${reglaW && D.reglas[reglaW]?.ficha ? `<button class="boton-papel" id="cenFicha">📁 Ficha</button>` : ""}
            </div>
            <p id="msg" class="msg"></p>
          </div>`;
        const inp = $("#cenArr"); inp.focus();
        $("#cenFicha")?.addEventListener("click", () => { const fi = D.reglas[reglaW].ficha; abrirModal(`<h3>${esc(fi.titulo)}</h3><ul class="ficha">${fi.puntos.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`, "ventana-archivo"); });
        const ok = () => {
          if (!inp.value.trim()) return;
          if (inp.value.normalize("NFC").trim() !== e) { $("#msg").textContent = "Todavía no. Cópiala letra a letra, tal como está en verde."; inp.select(); return; }
          const chip = $(`.cen-w[data-i="${i}"]`);
          chip.classList.remove("mal", "foco"); chip.classList.add("arreglada");
          n++; arreglar();
        };
        $("#cenArrOk").onclick = ok;
        inp.onkeydown = ev => { if (ev.key === "Enter") { ev.preventDefault(); ok(); } };   // sin preventDefault, el Enter pulsaría también «Siguiente»
      };
      arreglar();
    };
    $("#cenOk").onclick = transmitir;
    resp.onkeydown = ev => { if (ev.key === "Enter") { ev.preventDefault(); transmitir(); } };
    resp.oninput = () => { $("#msg").textContent = ""; };
  };
  pintar();
};

/* Cambia la cara de Lola sin repintar la escena */
function cenCara(expresion) {
  const caja = $(".cen-lola");
  if (caja) caja.innerHTML = htmlPersonaje({ id: "lola", expresion, lado: "izq" }, "pequeno");
}
