/* ============================================================
   AGENCIA LA LUPA · Academia · La Centralita · ejercicios extra
   R3 · El deletreo (id «deletreo»). Lola deletrea por el walkie una palabra
   con los nombres de las letras (hache, uve, zeta, ge, jota, elle, ye…, «o con
   tilde», «u con diéresis»).
     Fase 1 · Escuchar: el alumno apunta la palabra. Con voz, cada letra se dice
       con hablar(); sin voz, el nombre de la letra sale un momento en la
       pantalla del walkie y se borra. Corrección letra a letra.
     Fase 2 · Deletrear: el walkie «cambia de sentido»: sale una palabra y el
       alumno pulsa en orden las teclas, que llevan el NOMBRE de la letra
       («uve» para la v). Hay teclas trampa: las que suenan igual.
   Registra 5.1 por palabra (y la fallada entra en la cola de repaso).
   Niveles (lupas, NIVELES_ACA de academia.js):
     🥉 bronce: palabras de 4 a 6 letras de nivel 1;
     🥈 plata: de 6 a 8 letras (nivel ≤ 2);
     🥇 oro: palabras largas (7 o más) con tilde o diéresis;
     💎 diamante: palabras de nivel 3, las letras pasan más deprisa, se puede
        repetir menos y hay más teclas trampa (tildes, hache, dobles…).
   Datos: palabras de 4 a 12 letras de datos/academia/palabras.json y, para
   las reglas que allí faltan (g/j), las marcadas de dictados.json (con el
   nivel de su frase).
   ============================================================ */
"use strict";

const DEL_REGLAS = ["h-1", "b-v-1", "g-j-dieresis", "ll-y", "c-z-s", "d-z-finales", "tildes-generales"];
const DEL_ESCUCHAS = [3, 3, 3, 2];          // veces que Lola puede deletrear cada palabra, según la lupa
const DEL_PASO = { voz: [1500, 1300, 1150, 950], pantalla: [1800, 1500, 1300, 1000] };   // ms por letra
const DEL_TECLAS = [[8, 11], [10, 14], [10, 15], [15, 20]];   // teclas mínimas y máximas de la fase 2
const DEL_RONDA = [3, 3];    // palabras de la fase 1 (escuchar) y de la fase 2 (teclas)
const DEL = { banco: null, gen: 0, tempo: [] };

/* Nombres de las letras (Ortografía de la RAE, 2010). La ll no es una letra, es un dígrafo, pero tiene nombre: elle */
const DEL_NOMBRE = {
  a: "a", b: "be", c: "ce", d: "de", e: "e", f: "efe", g: "ge", h: "hache", i: "i", j: "jota", k: "ka", l: "ele", ll: "elle",
  m: "eme", n: "ene", ñ: "eñe", o: "o", p: "pe", q: "cu", r: "erre", s: "ese", t: "te", u: "u", v: "uve", w: "uve doble",
  x: "equis", y: "ye", z: "zeta", á: "a con tilde", é: "e con tilde", í: "i con tilde", ó: "o con tilde", ú: "u con tilde", ü: "u con diéresis",
};
const DEL_OTRO = { y: "i griega" };
const DEL_ORDEN = "a á b c d e é f g h i í j k l ll m n ñ o ó p q r s t u ú ü v w x y z".split(" ");
/* Teclas trampa: lo que se confunde al oído (b/v, g/j, seseo, yeísmo, d final, diéresis, tilde) */
const DEL_TRAMPA = { b: ["v"], v: ["b"], g: ["j"], j: ["g"], c: ["z", "s"], z: ["c", "s"], s: ["c", "z"], ll: ["y", "l"], y: ["ll", "i"], l: ["ll"],
  i: ["y"], d: ["z"], q: ["k", "c"], k: ["c", "q"], x: ["s"], ü: ["u"], u: ["ü"], á: ["a"], é: ["e"], í: ["i"], ó: ["o"], ú: ["u"], n: ["ñ"], ñ: ["n"], h: ["o"] };
const DEL_VOCAL_TILDE = { a: "á", e: "é", i: "í", o: "ó", u: "ú" };
/* Letras que interesan en cada regla (para el comentario final de Lola) */
const DEL_CLAVE = { "h-1": ["h"], "b-v-1": ["b", "v"], "g-j-dieresis": ["ü", "g", "j"], "ll-y": ["ll", "y"], "c-z-s": ["z", "c", "s"], "d-z-finales": ["d", "z"], "tildes-generales": ["á", "é", "í", "ó", "ú"] };

/* Parte la palabra en lo que se nombra al deletrear (la ll va junta: «elle») */
function delLetras(p) {
  const s = [...String(p).normalize("NFC").toLowerCase()], out = [];
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "l" && s[i + 1] === "l") { out.push("ll"); i++; } else out.push(s[i]);
  }
  return out;
}
const delNombre = l => DEL_NOMBRE[l] || l;
const delBase = l => l.normalize("NFD").replace(/\p{M}/gu, "");

/* Consejo cuando se falla (o se duda) la letra esperada u; antes = la letra anterior */
function delTruco(u, antes) {
  if (u === "h") return "La hache no suena, pero se escribe. Al deletrear hay que nombrarla: «hache».";
  if (u === "b" || u === "v") return "La be y la uve suenan igual: solo su nombre las distingue, be (b) y uve (v).";
  if (u === "g" || u === "j") return "Delante de e, i, la ge suena como la jota (gente, jirafa). Por eso cada una tiene su nombre: ge y jota.";
  if (u === "c" || u === "z" || u === "s") return "Con seseo, la ce, la zeta y la ese pueden sonar igual. El nombre de la letra no engaña: ce, zeta, ese.";
  if (u === "ll" || u === "y") return "Con yeísmo, la ll y la y suenan igual. La ll se llama elle (son dos eles juntas); la y se llama ye o i griega.";
  if (u === "ü") return "Con diéresis, la u suena: pingüino, cigüeña. Se deletrea «u con diéresis».";
  if (u === "u" && (antes === "g" || antes === "q")) return "Aquí la u no suena (gue, gui, que, qui), pero se escribe. Y sin diéresis.";
  if (u === "d") return "La de casi no se oye al final, pero se escribe: piensa en el plural (paredes, verdades).";
  if (u === "q") return "La q se llama cu y siempre va con u: que, qui.";
  if ("áéíóú".includes(u)) return `La tilde también se deletrea: «${delNombre(u)}».`;
  if ("aeiou".includes(u)) return `Esta va sin tilde: «${delNombre(u)}» a secas.`;
  return "Escucha bien el nombre de cada letra.";
}
/* Lo que hay que recordar de la palabra (según su regla) */
function delNota(w, U) {
  const claves = DEL_CLAVE[w.regla] || [];
  if (w.regla === "h-1" && !U.includes("h")) return `La palabra «${w.p}» no lleva hache: empieza por «${delNombre(U[0])}».`;
  if (w.regla === "d-z-finales") return `La palabra «${w.p}» termina en ${delNombre(U.at(-1))}, aunque casi no se oiga.`;
  const l = U.find(x => claves.includes(x));
  if (!l) return `La palabra «${w.p}», letra a letra.`;
  if (l === "h") return `La palabra «${w.p}» lleva hache aunque no suene.`;
  return `La palabra «${w.p}» lleva ${delNombre(l)} (${l}).`;
}

/* Alineación letra a letra (así una letra saltada no estropea las siguientes) */
function delAlinear(E, U) {
  const n = E.length, m = U.length;
  const coste = (a, b) => (a === b ? 0 : delBase(a) === delBase(b) ? 0.5 : 1);
  const d = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++)
    d[i][j] = Math.min(d[i - 1][j - 1] + coste(E[i - 1], U[j - 1]), d[i - 1][j] + 1, d[i][j - 1] + 1);
  const pares = Array(n).fill(null), sobran = [];
  let i = n, j = m;
  const igual = (a, b) => Math.abs(a - b) < 1e-9;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && igual(d[i][j], d[i - 1][j - 1] + coste(E[i - 1], U[j - 1]))) { pares[i - 1] = U[j - 1]; i--; j--; }
    else if (i > 0 && igual(d[i][j], d[i - 1][j] + 1)) i--;
    else { sobran.unshift(U[j - 1]); j--; }
  }
  return { pares, sobran };
}

/* ── Banco: palabras de 4 a 12 letras de la regla ────────────── */
async function delCargar() {
  if (DEL.banco) return DEL.banco;
  const banco = [], vistas = new Set();
  const meter = (p, regla, frase, nivel) => {
    const n = [...p].length;
    if (n < 4 || n > 12 || !/^[a-záéíóúüñ]+$/.test(p) || vistas.has(p)) return;
    vistas.add(p); banco.push({ p, regla, frase, nivel: nivel || 1 });
  };
  ACA.palabras.filter(w => DEL_REGLAS.includes(w.regla)).forEach(w => meter(w.p, w.regla, w.frase, w.nivel));
  try {
    (await leerJSON("datos/academia/dictados.json")).frases.forEach(f => f.marcas.forEach(m => {
      if (!DEL_REGLAS.includes(m.regla)) return;
      const p = f.texto.startsWith(m.p) ? m.p[0].toLowerCase() + m.p.slice(1) : m.p;   // «Había…» → había
      meter(p, m.regla, f.texto.replace(new RegExp(`(^|[^\\p{L}])${m.p}(?!\\p{L})`, "u"), "$1___"), f.nivel || 2);
    }));
  } catch { /* sin dictados basta con palabras.json */ }
  if (banco.length) DEL.banco = banco;
  return banco;
}
/* Las palabras que tocan en cada lupa, en orden: primero las del filtro estricto (barajadas) y, si no
   llegan, las del siguiente filtro, más flojo; así en oro van primero las largas con tilde o diéresis */
const delLargo = w => [...w.p].length;
const delAcento = w => /[áéíóúü]/.test(w.p);
function delDeNivel(lista, n, nivel = nivelAca()) {
  const nv = w => w.nivel || 1;
  const filtros = {
    1: [w => nv(w) === 1 && delLargo(w) >= 4 && delLargo(w) <= 6, w => nv(w) <= 2 && delLargo(w) <= 6, w => delLargo(w) <= 7],
    2: [w => nv(w) <= 2 && delLargo(w) >= 6 && delLargo(w) <= 8, w => delLargo(w) >= 6 && delLargo(w) <= 8, w => delLargo(w) >= 5 && delLargo(w) <= 9],
    3: [w => delLargo(w) >= 7 && delAcento(w), w => delLargo(w) >= 7 && (delAcento(w) || nv(w) >= 2), w => delLargo(w) >= 7],
    4: [w => nv(w) === 3 && delLargo(w) >= 6, w => nv(w) === 3, w => nv(w) >= 2 && delLargo(w) >= 8, w => delLargo(w) >= 8],
  }[nivel] || [];
  const out = [], usadas = new Set();
  const meter = l => barajar(l.filter(w => !usadas.has(w))).forEach(w => { usadas.add(w); out.push(w); });
  for (const f of filtros) { meter(lista.filter(f)); if (out.length >= n) return out; }
  meter(lista);
  return out;
}
/* Primero, las palabras que el alumno tiene en la cola de repaso; en modo inspector, reglas alternadas */
function delElegir(banco, activas, mezcla) {
  const n = DEL_RONDA[0] + DEL_RONDA[1];
  const cola = estadoAca().cola;
  const pesa = w => (cola[w.p] ? 1 : 0);
  const cand = delDeNivel(banco.filter(w => activas.includes(w.regla)), n).map((w, i) => [w, i]).sort((a, b) => pesa(b[0]) - pesa(a[0]) || a[1] - b[1]).map(x => x[0]);
  let elegidas = [];
  if (!mezcla) elegidas = cand.slice(0, n);
  else {
    const por = {};
    cand.forEach(w => (por[w.regla] ??= []).push(w));
    const rs = barajar(Object.keys(por));
    for (let i = 0; elegidas.length < n && rs.some(r => por[r].length); i++) { const w = por[rs[i % rs.length]].shift(); if (w) elegidas.push(w); }
  }
  if (elegidas.length < n) elegidas.push(...delDeNivel(banco, n).filter(w => !elegidas.includes(w)).slice(0, n - elegidas.length));
  // En la fase 1 (de oído) van primero las más cortas
  const oido = elegidas.slice(0, DEL_RONDA[0]).sort((a, b) => delLetras(a.p).length - delLetras(b.p).length);
  return [...oido, ...elegidas.slice(DEL_RONDA[0])];
}
/* Teclas de la fase 2: las letras de la palabra + sus trampas + relleno, en orden alfabético.
   Cuanto más alta la lupa, más trampas: desde oro, tildes en todas las vocales si la palabra lleva alguna;
   en diamante, siempre, más la hache y las trampas de las trampas (b → v → …). */
function delTeclas(U, regla, nivel = nivelAca()) {
  const [min, max] = DEL_TECLAS[nivel - 1];
  const set = new Set(U);
  const acento = U.some(u => "áéíóúü".includes(u));
  const tildes = regla === "tildes-generales" || nivel >= 4 || (nivel >= 3 && acento);
  const trampasDe = u => ("aeiou".includes(u) ? (tildes ? [DEL_VOCAL_TILDE[u]] : []).concat(nivel >= 4 && u === "u" ? ["ü"] : []) : DEL_TRAMPA[u] || []);
  U.forEach(u => trampasDe(u).forEach(t => { if (set.size < max) set.add(t); }));
  if (nivel >= 4) {
    if (!set.has("h") && set.size < max) set.add("h");
    [...set].forEach(u => (DEL_TRAMPA[u] || []).forEach(t => { if (set.size < max) set.add(t); }));
  }
  const relleno = barajar(DEL_ORDEN.filter(l => !set.has(l) && !/[áéíóúüñwkx]/.test(l)));
  while (set.size < min && relleno.length) set.add(relleno.pop());
  return DEL_ORDEN.filter(l => set.has(l));
}

/* ── Voz: solo si hay de verdad una voz en español (en headless hay speechSynthesis, pero sin voces) ── */
function delHayVoz() {
  if (!hayVoz()) return false;
  try {
    if (typeof cenBuscarVoz === "function") return !!cenBuscarVoz();
    return speechSynthesis.getVoices().some(v => /^es/i.test(v.lang));
  } catch { return false; }
}
function delParar() {
  DEL.gen++;
  DEL.tempo.forEach(clearTimeout);
  DEL.tempo = [];
  try { if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel(); } catch { /* sin voz */ }
}
function delLuego(gen, ms, fn) { DEL.tempo.push(setTimeout(() => { if (gen === DEL.gen) fn(); }, ms)); }

/* El walkie del alumno (CSS puro) */
const delWalkie = () => `
  <div class="del-walkie" id="delWalkie">
    <i class="del-antena" aria-hidden="true"></i><i class="del-ruleta" aria-hidden="true"></i>
    <div class="del-cuerpo">
      <div class="del-cabeza" aria-hidden="true"><span class="del-led"></span><span>LA LUPA · W-7</span></div>
      <div class="del-rejilla" aria-hidden="true"><div class="del-ondas">${"<i></i>".repeat(9)}</div></div>
      <div class="del-pantalla" id="delPantalla"><small id="delCanal">CANAL 7 · LOLA</small><b id="delLetra" aria-live="polite"></b><span id="delPos"></span></div>
      <button class="del-ptt" id="delEmitir"></button>
      <div class="del-teclitas" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    </div>
  </div>`;

/* ── La actividad ─────────────────────────────────────────────── */
nuevaActividad("centralita", {
  id: "deletreo",
  nombre: "El deletreo",
  objeto: "walkie",
  desc: "Lola deletrea por el walkie: hache, uve, zeta… Apúntalo sin perder ni una letra.",
  reglas: DEL_REGLAS,
}, async function (sl, regla, turno) {
  const banco = await delCargar();
  if (!banco.length) { aviso("No hay señal: no se han podido cargar las palabras.", "mal"); return vistaPatio(); }
  if (typeof cenEsperarVoces === "function") await cenEsperarVoces();
  const conVoz = delHayVoz();
  const mezcla = !regla || regla === "mezcla" || !DEL_REGLAS.includes(regla);
  const activas = mezcla ? DEL_REGLAS : [regla];
  const lista = delElegir(banco, activas, mezcla);
  partidaAca(sl, [...new Set(lista.map(w => w.regla))]);
  let modo = conVoz && cargar("deletreo-modo", "voz") !== "pantalla" ? "voz" : "pantalla";
  let k = 0;
  const lupa = NIVELES_ACA[nivelAca() - 1], ESCUCHAS = segunNivel(DEL_ESCUCHAS);

  const pintar = () => {
    delParar();
    const gen = DEL.gen;
    const w = lista[k];
    if (!w) return terminarActividad(sl, turno);
    const fase = k < DEL_RONDA[0] ? 1 : 2;
    const U = delLetras(w.p);
    pintarEscena(`
      <h1 class="cartel titulo-escena">${esc(sl.nombre)}</h1>
      <div class="del-modo" role="group" aria-label="Cómo llegan las letras">
        <button data-modo="voz" ${conVoz ? "" : `disabled title="Este equipo no tiene voz en español"`}>🔊 Voz</button>
        <button data-modo="pantalla">📟 Pantalla</button>
      </div>
      <div class="del-lola">${htmlPersonaje({ id: "lola", expresion: "neutral", lado: "izq" }, "pequeno")}</div>
      ${delWalkie()}
      <section class="del-panel">
        <header class="del-cabecera">
          <b>${fase === 1 ? "Fase 1 · Lola deletrea" : "Fase 2 · Deletreas tú"}</b>
          <span class="del-progreso" aria-label="Palabra ${k + 1} de ${lista.length}">${lista.map((_, i) => `<i class="${i < k ? "hecho" : i === k ? "actual" : ""} ${i === DEL_RONDA[0] ? "corte" : ""}"></i>`).join("")}</span>
          <small>${mezcla ? "Modo inspector" : esc(D.reglas[regla]?.nombre || "")}</small>
          <span class="del-nivel" title="${esc(lupa.nombre)}">${lupaImg(lupa)} ${esc(lupa.corto)}</span>
        </header>
        <p class="del-dice" id="delDice" aria-live="polite"></p>
        <div class="del-casillas ${U.length > 10 ? "largas muy-largas" : U.length > 8 ? "largas" : ""}" id="delCasillas">${U.map((_, i) => `<span class="del-casilla" data-i="${i}"><b></b><small></small></span>`).join("")}</div>
        <div class="del-trabajo" id="delTrabajo"></div>
        <div class="del-pie" id="delPie"><p id="msg" class="msg"></p><span id="delPieBtn"></span></div>
      </section>
      <button class="hud-volver" id="acaVolver">◂ Patio</button>`, { fondo: sl.fondo, clase: "oscurecido del-sala" });

    $("#acaVolver").onclick = () => confirmar("¿Volver al patio? Se perderá esta ronda.", () => { delParar(); vistaPatio(); }, "Volver");
    const dice = (t, cara) => { $("#delDice").innerHTML = `<b>Lola:</b> ${t}`; if (cara) delCara(cara); };
    const casilla = i => $(`.del-casilla[data-i="${i}"]`);
    const msg = t => { $("#msg").textContent = t; };
    const alAire = on => $("#delWalkie")?.classList.toggle("emitiendo", on);
    /* Pantalla del walkie: texto fijo o un destello que se borra solo */
    const lcd = (texto, clase = "", ms = 0) => {
      const b = $("#delLetra");
      if (!b) return;
      b.textContent = texto;
      b.className = `${clase} ${[...texto].length > 9 ? "larga" : ""}`;
      if (ms) { b.style.setProperty("--dur", `${ms}ms`); void b.offsetWidth; b.classList.add("destello"); }
    };
    const cerrar = () => {
      const ultimo = k === lista.length - 1, cambio = k === DEL_RONDA[0] - 1;
      if (w.frase) $("#msg").innerHTML = `<span class="del-clave">En clave: «${esc(w.frase.replace("___", w.p))}»</span>`;
      $("#delPieBtn").innerHTML = `<button class="flecha" id="delSig">${ultimo ? "Cerrar la transmisión" : cambio ? "¡Cambio de sentido!" : "Siguiente palabra"} ▸</button>`;
      $("#delSig").onclick = () => { k++; pintar(); };
      $("#delSig").focus();
    };

    /* Selector de modo */
    let estado = "espera";
    const marcarModo = () => $$(".del-modo button").forEach(b => { b.classList.toggle("activo", b.dataset.modo === modo); b.setAttribute("aria-pressed", b.dataset.modo === modo); });
    marcarModo();
    $$(".del-modo button").forEach(b => b.onclick = () => {
      if (b.dataset.modo === modo) return;
      modo = b.dataset.modo; guardar("deletreo-modo", modo); marcarModo();
      if (fase === 1 && estado === "espera") return pintar();
      aviso(fase === 1 ? "El cambio vale desde la siguiente palabra." : modo === "voz" ? "Ahora el walkie dirá cada letra que pulses." : "El walkie se queda en silencio.");
    });

    /* ── Fase 1 · Lola deletrea y el alumno apunta ── */
    const faseEscuchar = () => {
      let escuchas = 0;
      $("#delTrabajo").innerHTML = `
        <label class="del-libreta"><span>Apunta aquí la palabra</span>
          <input id="delResp" class="del-entrada" maxlength="18" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Escribe la palabra que deletrea Lola" disabled></label>
        <button class="boton-sello" id="delOk" disabled>Comprobar</button>`;
      const inp = $("#delResp");
      const boton = () => {
        const b = $("#delEmitir"), quedan = ESCUCHAS - escuchas;
        b.innerHTML = `${modo === "voz" ? "🔊" : "📟"} ${escuchas ? "Otra vez" : "Recibir"}<small>${quedan ? `quedan ${quedan}` : "sin más"}</small>`;
        b.disabled = !quedan || estado === "emitiendo" || estado === "corrigiendo" || estado === "hecho";
      };
      lcd("· · ·", "espera");
      $("#delPos").textContent = `${U.length} letras`;
      if (k === 0) dice(modo === "voz"
        ? "Canal seguro… o casi: alguien escucha en la azotea. No diré la palabra: te la deletreo letra a letra. Pulsa «Recibir» y apúntala sin perder ni una."
        : "Hay interferencias y el walkie se ha quedado sin sonido. Las letras saldrán en la pantalla de una en una… y se borrarán. ¡No pestañees! Pulsa «Recibir».");
      else dice(modo === "voz" ? "Otra palabra en camino. Pulsa «Recibir» y escucha las letras." : "Otra palabra en camino. Ojo a la pantalla: las letras no esperan.");
      boton();

      const deletrear = () => {
        escuchas++; estado = "emitiendo"; boton(); alAire(true);
        inp.disabled = false; $("#delOk").disabled = false; inp.focus();
        $$(".del-casilla").forEach(c => c.classList.remove("sonando", "sonada"));
        const paso = segunNivel(DEL_PASO[modo === "voz" ? "voz" : "pantalla"]);
        let t = 500;
        lcd("¡atento!", "espera");
        U.forEach((u, i) => {
          const ms = paso + (delNombre(u).length > 6 ? 500 : 0);
          delLuego(gen, t, () => {
            $$(".del-casilla.sonando").forEach(c => c.classList.remove("sonando"));
            casilla(i).classList.add("sonando", "sonada");
            $("#delPos").textContent = `letra ${i + 1} de ${U.length}`;
            if (modo === "voz") { hablar(delNombre(u)); lcd("♪", "voz", ms - 200); }
            else lcd(delNombre(u) + (DEL_OTRO[u] ? ` (${DEL_OTRO[u]})` : ""), "letra", ms - 250);
          });
          t += ms;
        });
        delLuego(gen, t, () => {
          $$(".del-casilla.sonando").forEach(c => c.classList.remove("sonando"));
          alAire(false);
          lcd("cambio", "espera");
          $("#delPos").textContent = `${U.length} letras`;
          if (estado === "emitiendo") estado = "escribiendo";
          boton();
          dice(escuchas < ESCUCHAS ? "Cambio. ¿Lo tienes? Si se te ha escapado alguna letra, te lo repito." : "Cambio y corto. Ya no puedo repetirlo: comprueba lo que has apuntado.");
        });
      };
      $("#delEmitir").onclick = () => { if (escuchas < ESCUCHAS && estado !== "emitiendo") deletrear(); };

      const comprobar = () => {
        if (estado === "corrigiendo" || estado === "hecho" || inp.disabled) return;
        const v = inp.value.normalize("NFC").trim().toLowerCase();
        if (!v) return msg("Apunta la palabra antes de comprobar.");
        delParar();
        estado = "corrigiendo"; boton(); alAire(false);
        const ok = v === w.p;
        registrar("5.1", ok, w.p, `deletreo: de oído (${modo})`, w.regla);
        pistaFicha(ok, w.frase);
        const { pares, sobran } = delAlinear(U, delLetras(v));
        U.forEach((u, i) => {
          const c = casilla(i);
          c.classList.remove("sonando", "sonada");
          c.querySelector("b").textContent = u;
          c.querySelector("small").textContent = delNombre(u);
          c.classList.add(pares[i] === u ? "ok" : pares[i] ? "mal" : "falta");
          if (pares[i] && pares[i] !== u) c.dataset.puse = pares[i];
        });
        lcd(ok ? "¡recibido!" : "revisa", ok ? "ok" : "mal");
        if (ok) {
          dice(`¡Recibido, letra a letra! ${esc(delNota(w, U))}`, "contento");
          estado = "hecho"; inp.disabled = true; $("#delOk").disabled = true;
          return cerrar();
        }
        const i = U.findIndex((u, j) => pares[j] !== u);
        let por;
        if (i >= 0) {
          const u = U[i], x = pares[i];
          por = x ? `En la letra ${i + 1} dije «${esc(delNombre(u))}» y apuntaste «${esc(x)}», que es la ${esc(delNombre(x))}.`
                  : `Te falta la letra ${i + 1}: «${esc(delNombre(u))}».`;
          por += ` ${esc(delTruco(u, U[i - 1]))}`;
        } else por = `Te sobra${sobran.length > 1 ? "n" : ""}: ${sobran.map(esc).join(", ")}.`;
        dice(por, "pensativo");
        $("#delTrabajo").innerHTML = `
          <label class="del-libreta arreglo"><span>Escríbela bien para cerrar la transmisión</span>
            <input id="delArr" class="del-entrada" maxlength="18" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Escribe ${esc(w.p)}"></label>
          <button class="boton-sello" id="delArrOk">Corregir</button>`;
        const arr = $("#delArr");
        arr.focus();
        const corregir = () => {
          if (!arr.value.trim()) return;
          if (arr.value.normalize("NFC").trim().toLowerCase() !== w.p) { msg("Todavía no. Cópiala tal como está en las casillas."); arr.select(); return; }
          msg("");
          estado = "hecho"; arr.disabled = true; $("#delArrOk").disabled = true;
          $$(".del-casilla.mal, .del-casilla.falta").forEach(c => { c.classList.remove("mal", "falta"); c.classList.add("arreglada"); });
          dice(`¡Ahora sí! ${esc(delNota(w, U))}`, "contento");
          cerrar();
        };
        $("#delArrOk").onclick = corregir;
        arr.onkeydown = ev => { if (ev.key === "Enter") { ev.preventDefault(); corregir(); } };
      };
      $("#delOk").onclick = comprobar;
      inp.onkeydown = ev => { if (ev.key === "Enter") { ev.preventDefault(); comprobar(); } };
      inp.oninput = () => msg("");
    };

    /* ── Fase 2 · El walkie cambia de sentido: el alumno deletrea con las teclas ── */
    const faseTeclear = () => {
      let pos = 0, errores = 0, aqui = 0;
      estado = "tecleando";
      lcd(w.p, "palabra");
      $("#delCanal").textContent = "CANAL 7 · PARA LOLA";
      $("#delPos").textContent = "deletréala";
      const teclas = delTeclas(U, w.regla);
      $("#delTrabajo").innerHTML = `<div class="del-teclado ${teclas.length > 15 ? "muchas" : ""}" role="group" aria-label="Teclas con el nombre de las letras">${teclas.map(t =>
        `<button class="del-tecla" data-l="${esc(t)}"><b>${esc(delNombre(t))}</b>${DEL_OTRO[t] ? `<small>o ${esc(DEL_OTRO[t])}</small>` : ""}</button>`).join("")}</div>`;
      const b = $("#delEmitir");
      b.innerHTML = `💡 Pista<small>la siguiente tecla</small>`;
      dice(k === DEL_RONDA[0]
        ? `¡Cambio de sentido! Ahora me deletreas tú a mí. Cada tecla lleva el NOMBRE de una letra. Pulsa en orden las de «${esc(w.p)}».`
        : `Deletréame «${esc(w.p)}». Tecla a tecla y en orden: cuidado con las que suenan igual.`);
      const ayudar = () => { $$(".del-tecla.ayuda").forEach(x => x.classList.remove("ayuda")); $(`.del-tecla[data-l="${CSS.escape(U[pos])}"]`)?.classList.add("ayuda"); };
      b.onclick = () => {
        if (estado !== "tecleando") return;
        errores++; aqui = 2; ayudar();
        msg(`Va la «${delNombre(U[pos])}». ${delTruco(U[pos], U[pos - 1])}`);
      };
      const destello = (el, clase) => { el.classList.remove("bien", "fallo"); void el.offsetWidth; el.classList.add(clase); };
      $$(".del-tecla").forEach(t => t.onclick = () => {
        if (estado !== "tecleando") return;
        const l = t.dataset.l, u = U[pos];
        if (l === u) {
          destello(t, "bien");
          const c = casilla(pos);
          c.querySelector("b").textContent = u;
          c.querySelector("small").textContent = delNombre(u);
          c.classList.add(aqui ? "arreglada" : "ok");
          if (modo === "voz" && conVoz) hablar(delNombre(u));
          pos++; aqui = 0; msg("");
          $$(".del-tecla.ayuda").forEach(x => x.classList.remove("ayuda"));
          if (pos < U.length) { casilla(pos).classList.add("sonando"); return; }
          estado = "hecho";
          registrar("5.1", errores === 0, w.p, "deletreo: con las teclas", w.regla);
          pistaFicha(errores === 0, w.frase);
          lcd(errores ? "recibido" : "¡perfecto!", "ok");
          b.disabled = true;
          dice(errores ? `Recibido, aunque con ${errores} interferencia${errores > 1 ? "s" : ""}. ${esc(delNota(w, U))}` : `¡Deletreo perfecto! ${esc(delNota(w, U))}`, "contento");
          return cerrar();
        }
        errores++; aqui++;
        destello(t, "fallo");
        const mismaBase = delBase(l) === delBase(u);
        msg(mismaBase || (DEL_TRAMPA[u] || []).includes(l) || (DEL_TRAMPA[l] || []).includes(u)
          ? `Esa es la «${delNombre(l)}». ${delTruco(u, U[pos - 1])}`
          : `Esa es la «${delNombre(l)}». Mira la letra ${pos + 1} de «${w.p}».`);
        if (aqui >= 2) ayudar();
      });
      casilla(0).classList.add("sonando");
    };

    if (fase === 1) faseEscuchar(); else faseTeclear();
  };
  pintar();
});

/* Cambia la cara de Lola sin repintar la escena */
function delCara(expresion) {
  const caja = $(".del-lola");
  if (caja) caja.innerHTML = htmlPersonaje({ id: "lola", expresion, lado: "izq" }, "pequeno");
}
