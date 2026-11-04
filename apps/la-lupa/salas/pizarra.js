/* ============================================================
   AGENCIA LA LUPA · Academia · Sala «La Pizarra»
   Z1 · Descubre la regla (9.1). Don Anselmo escribe pruebas con tiza y el
   alumno hace de detective: 1) observa y rodea las cuatro que se parecen;
   2) elige la hipótesis buena (las otras se tachan: demasiado amplia o
   demasiado estrecha); 3) pone la regla a prueba con palabras nuevas
   (la excepción o la que la confirma); 4) escribe un ejemplo propio.
   Al final, la ficha de Mateo confirma la regla descubierta.
   Datos: datos/academia/pizarra.json (validador: herramientas/validar_pizarra.py)

   Por qué leccionFija y no «reglas» en la sala: la lección normal enseña la
   ficha ANTES de practicar, y aquí la gracia es descubrirla. Don Anselmo
   presenta la sala sin destripar nada y la regla se elige dentro de la
   actividad; la ficha llega al final, como confirmación.
   ============================================================ */
"use strict";

const PIZ = { datos: null };
const PIZ_REGLAS = ["tildes-generales", "b-v-1", "h-1", "c-z-s", "ll-y", "g-j-dieresis", "diptongo-monosilabos", "d-z-finales", "mayusculas-puntuacion-1"];
const PIZ_PASOS = ["Observa", "Hipótesis", "Contraejemplo", "Tu ejemplo"];

Object.assign(sala("pizarra"), {
  activa: true,
  instructor: "anselmo",
  actividad: "descubre-regla",
  gancho: "Seis pruebas en la pizarra. La regla, la descubres tú.",
  leccionFija: "En mis tiempos, las reglas no se copiaban: se descubrían. Yo escribo unas pruebas en la pizarra y tú haces de detective: observas, sospechas, formulas una hipótesis… y la pones a prueba. Al final, comprobaremos si coincide con el Archivo de Mateo. Prohibido mirar antes.",
});

/* Lo que ya ha descubierto cada detective (para no repetir subregla) */
const clavePiz = () => `pizarra-${perfil.id}`;
const estadoPiz = () => ({ vistas: {}, ...cargar(clavePiz(), {}) });

ACTIVIDADES["descubre-regla"] = async function (sl, regla, turno) {
  try { PIZ.datos ??= (await leerJSON("datos/academia/pizarra.json")).reglas; }
  catch { aviso("No se ha podido abrir la pizarra. Prueba otra vez.", "mal"); return vistaPatio(); }
  if (regla && PIZ.datos[regla]) return pizRonda(sl, regla, turno);
  pizElegir(sl, turno);
};

/* ── Escena común: pizarra, borrador, Anselmo y bocadillo ────── */
const PIZ_FILTRO = `<svg class="piz-defs" aria-hidden="true" focusable="false"><defs>
  <filter id="piz-tiza" x="-6%" y="-12%" width="112%" height="124%">
    <feTurbulence type="fractalNoise" baseFrequency="1.15" numOctaves="2" seed="7" result="ruido"/>
    <feColorMatrix in="ruido" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.6 0 0 0 2.05" result="grano"/>
    <feComposite in="SourceGraphic" in2="grano" operator="in" result="tiza"/>
    <feDisplacementMap in="tiza" in2="ruido" scale="2.4" xChannelSelector="R" yChannelSelector="G"/>
  </filter></defs></svg>`;

function pizEscena(sl, tema, { volver }) {
  pintarEscena(`
    ${PIZ_FILTRO}
    <button class="hud-volver" id="acaVolver">◂ Patio</button>
    <h1 class="cartel piz-titulo">${esc(sl.nombre)}</h1>
    <p class="piz-tema">${esc(tema)}</p>
    <div class="piz-tablero" id="pizTablero">
      <div class="piz-pasos" id="pizPasos"></div>
      <div class="piz-contenido" id="pizCont"></div>
      <div class="piz-polvo" aria-hidden="true"></div>
    </div>
    <div class="piz-tizas" aria-hidden="true"><i></i><i class="amarilla"></i></div>
    <div class="piz-borrador" id="pizBorrador" aria-hidden="true"></div>
    ${htmlPersonaje({ id: "anselmo", expresion: "neutral", lado: "izq" }, "pequeno piz-anselmo")}
    <div class="piz-bocadillo"><span class="quien">${esc(nombreInstructor(sl))}</span><p id="pizDice" aria-live="polite"></p></div>
    <div class="piz-acciones" id="pizAcc"></div>
    <div class="piz-zona" id="pizZona"></div>`, { fondo: sl.fondo });
  $("#acaVolver").onclick = volver;
}

/* Escapa y evita que «-avo», «-bir»… se partan al cambiar de línea */
const pizTxt = t => esc(t).replace(/(^|[\s(«])(-\p{L}+)/gu, '$1<span class="piz-nw">$2</span>');

function pizDecir(texto, cara = "neutral") {
  const p = $("#pizDice");
  if (!p) return;
  p.innerHTML = pizTxt(texto);
  p.classList.remove("nuevo"); void p.offsetWidth; p.classList.add("nuevo");
  const img = $("img.piz-anselmo");
  if (img && (arte("anselmo").listas || []).includes(cara)) img.src = `arte/anselmo-${cara}.webp`;
}

function pizPasos(n) {
  $("#pizPasos").innerHTML = PIZ_PASOS.map((t, i) =>
    `<span class="${i + 1 < n ? "hecho" : i + 1 === n ? "actual" : ""}">${i + 1 < n ? "✓" : i + 1}. ${t}</span>`).join("");
}

/* El borrador pasa por la pizarra; a mitad de pasada se escribe lo nuevo */
function pizBorrar(despues) {
  const t = $("#pizTablero"), b = $("#pizBorrador");
  if (movimientoReducido()) return despues();
  t.classList.remove("escribiendo");
  b.classList.add("borrando"); t.classList.add("borrando", "polvo");
  setTimeout(() => {
    if (!t.isConnected) return;
    despues();
    t.classList.remove("borrando"); void t.offsetWidth; t.classList.add("escribiendo");
  }, 950);
  setTimeout(() => b.classList.remove("borrando"), 1000);
  setTimeout(() => t.classList.remove("polvo", "escribiendo"), 2600);
}

/* ── Trazos de tiza a mano alzada (SVG) ──────────────────────── */
const pizAzar = (a, b) => a + Math.random() * (b - a);
function pizTrazoCirculo(w, h) {
  const cx = w / 2, cy = h / 2, rx = w / 2 - 5, ry = h / 2 - 5;
  const a0 = -Math.PI * pizAzar(0.55, 0.85), vuelta = Math.PI * 2 * pizAzar(1.06, 1.13), fase = pizAzar(0, 6);
  let d = "";
  for (let i = 0; i <= 56; i++) {
    const t = i / 56, a = a0 + vuelta * t;
    const k = 1 + 0.035 * Math.sin(a * 3 + fase) + 0.03 - 0.07 * t;   // empieza por fuera y acaba por dentro: no cierra perfecto
    d += `${i ? "L" : "M"}${(cx + rx * k * Math.cos(a)).toFixed(1)},${(cy + ry * k * Math.sin(a) + (t - 0.5) * 4).toFixed(1)}`;
  }
  return d;
}
function pizTrazoTachon(w, h) {
  const j = () => pizAzar(-6, 6);
  return `M${10 + j()},${h * 0.22 + j()} Q${w / 2 + j()},${h / 2 + j() * 2} ${w - 10 + j()},${h * 0.8 + j()}`
       + ` M${w - 12 + j()},${h * 0.2 + j()} Q${w / 2 + j()},${h / 2 + j() * 2} ${12 + j()},${h * 0.84 + j()}`;
}
function pizTrazoSubrayado(w, h) {
  const j = () => pizAzar(-2.5, 2.5);
  return `M4,${h - 6 + j()} Q${w * 0.3},${h - 2 + j()} ${w * 0.55},${h - 6 + j()} T${w - 4},${h - 5 + j()}`;
}
function pizTrazoVisto(w, h) {
  return `M${w * 0.12},${h * 0.55} Q${w * 0.28},${h * 0.7} ${w * 0.38},${h * 0.88} Q${w * 0.6},${h * 0.4} ${w * 0.92},${h * 0.1}`;
}
/* Dibuja un trazo encima de un elemento. margen: cuánto se sale por cada lado */
function pizDibujar(el, trazo, clase = "", margen = [20, 12]) {
  const [mx, my] = margen;
  const w = el.offsetWidth + mx * 2, h = el.offsetHeight + my * 2;
  el.insertAdjacentHTML("beforeend", `<svg class="piz-trazo ${clase}" viewBox="0 0 ${w} ${h}" style="width:${w}px;height:${h}px;left:${-mx}px;top:${-my}px" aria-hidden="true"><path d="${trazo(w, h)}" pathLength="1"/></svg>`);
  return el.lastElementChild;
}

/* ── Elegir la regla (o una al azar) ─────────────────────────── */
function pizElegir(sl, turno) {
  const st = estadoPiz();
  pizEscena(sl, "Elige una regla", { volver: vistaPatio });
  pizPasos(0);
  $("#pizCont").innerHTML = `<div class="piz-portada">
      <p class="piz-grande">¿Qué regla investigamos hoy?</p>
      <svg class="piz-lupa" viewBox="0 0 120 120" aria-hidden="true"><circle cx="48" cy="48" r="32"/><path d="M72 72 L108 108"/><path d="M30 40 Q36 28 50 26"/></svg>
      <p class="piz-nota">★ = misterios ya resueltos de esa regla</p></div>`;
  pizDecir("Elige una regla. No te voy a decir cómo funciona: eso lo vas a descubrir tú. Cada una esconde varios misterios.");
  const reglas = PIZ_REGLAS.filter(r => PIZ.datos[r] && D.reglas[r]);
  $("#pizZona").classList.add("elegir");
  $("#pizZona").innerHTML = `<div class="piz-reglas">${reglas.map(r => {
    const hechos = (st.vistas[r] || []).length, total = PIZ.datos[r].length;
    return `<button class="piz-pizarrin" data-regla="${esc(r)}"><span>${esc(D.reglas[r].nombre)}</span><small>${hechos ? `${"★".repeat(Math.min(hechos, 6))} ${hechos}/${total}` : `${total} misterios`}</small></button>`;
  }).join("")}</div>`;
  $("#pizAcc").innerHTML = `<button class="boton-sello" id="pizAzar">Una al azar 🎲</button>`;
  $$(".piz-reglas .piz-pizarrin").forEach(b => b.onclick = () => pizRonda(sl, b.dataset.regla, turno));
  $("#pizAzar").onclick = () => {
    const pendientes = reglas.filter(r => (st.vistas[r] || []).length < PIZ.datos[r].length);
    pizRonda(sl, azarElem(pendientes.length ? pendientes : reglas), turno);
  };
}

/* ── Una ronda: una subregla entera, en cuatro pasos ─────────── */
function pizRonda(sl, regla, turno) {
  const st = estadoPiz();
  const vistas = st.vistas[regla] || [];
  const subs = PIZ.datos[regla];
  const sub = azarElem(subs.filter(s => !vistas.includes(s.id)).length ? subs.filter(s => !vistas.includes(s.id)) : subs);
  const frases = !!sub.frases;
  const clave = x => (frases ? String(x).trim().replace(/\s+/g, " ") : norm(x));
  const hip = Object.fromEntries(sub.hipotesis.map(h => [h.valor, h]));

  /* Muestra: 4 ejemplos (al menos uno que tumbe la estrecha) + 2 de relleno (al menos uno que tumbe la amplia) */
  const conPrueba = (lista, n, prueba = []) => {
    const b = barajar(lista);
    const una = b.find(x => prueba.includes(x));
    return una ? [una, ...b.filter(x => x !== una)].slice(0, n) : b.slice(0, n);
  };
  const ej = conPrueba(sub.ejemplos, 4, hip.estrecha?.prueba);
  const rel = conPrueba(sub.relleno, 2, hip.amplia?.prueba);
  const pruebas = barajar([...ej.map(p => ({ p, si: true })), ...rel.map(p => ({ p, si: false }))]);
  const restoEj = barajar(sub.ejemplos.filter(x => !ej.includes(x)));
  const restoRel = barajar(sub.relleno.filter(x => !rel.includes(x)));
  const modo = sub.contraejemplos?.length && Math.random() < 0.65 ? "excepcion" : "confirma";
  const nuevas = barajar(modo === "excepcion"
    ? [{ p: azarElem(sub.contraejemplos), ok: true }, ...restoEj.slice(0, 2).map(p => ({ p, ok: false }))]
    : [{ p: restoEj[0], ok: true }, ...restoRel.slice(0, 2).map(p => ({ p, ok: false }))]);
  const enPizarra = new Set([...pruebas, ...nuevas].map(x => clave(x.p)));
  const plural = w => (w.endsWith("z") ? `${w.slice(0, -1)}ces` : `${w}es`);
  const conPlural = (texto, w) => texto.replace("{plural}", plural(w));

  partidaAca(sl, [regla]);
  const salir = () => confirmar("¿Volver al patio? Se perderá esta ronda.", vistaPatio, "Volver");
  pizEscena(sl, D.reglas[regla]?.nombre || regla, { volver: salir });

  const htmlPrueba = (x, i, extra = "") =>
    `<button class="piz-p ${frases ? "frase" : ""} ${extra}" data-i="${i}" style="--g:${pizAzar(-2.5, 2.5).toFixed(1)}deg">${esc(x.p)}</button>`;
  const htmlHipotesis = () => `<p class="piz-regla"><small>Hipótesis</small>${pizTxt(hip.buena.texto)}</p>`;

  /* Paso 1 · Observar: rodear las cuatro que tienen algo en común */
  const paso1 = () => {
    pizPasos(1);
    $("#pizCont").innerHTML = `<div class="piz-pruebas ${frases ? "frases" : ""}">${pruebas.map((x, i) => htmlPrueba(x, i)).join("")}</div>`;
    pizDecir(`Seis pruebas. Cuatro tienen algo en común… y dos se han colado. Rodea con la tiza las cuatro que se parecen.`);
    $("#pizAcc").innerHTML = `<p class="piz-cuenta" id="pizCuenta">Rodeadas: 0 de 4</p><button class="boton-sello" id="pizOk" disabled>Comprobar</button>`;
    const elegidas = new Set();
    let intentos = 0, cerrado = false;
    const contar = () => { $("#pizCuenta").textContent = `Rodeadas: ${elegidas.size} de 4`; $("#pizOk").disabled = elegidas.size !== 4; };
    const rodear = b => { b.classList.add("rodeada"); pizDibujar(b, pizTrazoCirculo, "circulo"); };
    const desrodear = b => { b.classList.remove("rodeada"); b.querySelector(".circulo")?.remove(); };
    $$(".piz-p").forEach(b => b.onclick = () => {
      if (cerrado) return;
      const i = Number(b.dataset.i);
      if (elegidas.has(i)) { elegidas.delete(i); desrodear(b); }
      else if (elegidas.size < 4) { elegidas.add(i); rodear(b); }
      else aviso("Ya tienes cuatro rodeadas. Toca una para borrar su círculo.");
      contar();
    });
    $("#pizOk").onclick = () => {
      const bien = [...elegidas].filter(i => pruebas[i].si).length;
      const ok = bien === 4;
      if (!intentos) registrar("9.1", ok, null, "observar", regla);
      intentos++;
      if (!ok && intentos < 2) {
        pizDecir(`Tienes ${bien} de 4. Entre tus círculos hay alguna intrusa. Pista: ${sub.pista}`, "pensativo");
        return;
      }
      cerrado = true;
      $$(".piz-p").forEach(b => {
        const x = pruebas[Number(b.dataset.i)];
        if (x.si && !b.classList.contains("rodeada")) { rodear(b); b.querySelector(".circulo").classList.add("amarilla"); }
        if (!x.si) { desrodear(b); b.classList.add("fuera"); }
      });
      pizDecir(ok ? "¡Buen ojo! Esas cuatro tienen algo en común. Ahora, la pregunta de detective: ¿qué regla lo explica?"
                  : `Te lo enseño: son estas cuatro (las de tiza amarilla). ${sub.pista}`, ok ? "contento" : "neutral");
      $("#pizAcc").innerHTML = `<button class="flecha" id="pizSig">Formular la hipótesis ▸</button>`;
      $("#pizSig").onclick = paso2;
    };
  };

  /* Paso 2 · Hipótesis: una buena, una demasiado amplia y una demasiado estrecha */
  const paso2 = () => {
    pizPasos(2);
    $("#pizAcc").innerHTML = "";
    pizDecir("¿Qué regla explica las cuatro rodeadas y deja fuera a las otras dos? Elige la hipótesis buena.");
    const lista = barajar(sub.hipotesis);
    $("#pizZona").innerHTML = `<div class="piz-hipotesis">${lista.map((h, k) => `<button class="piz-pizarrin" data-k="${k}"><span>${pizTxt(h.texto)}</span><i class="piz-marca"></i></button>`).join("")}</div>`;
    let primera = true;
    $$(".piz-hipotesis .piz-pizarrin").forEach(b => b.onclick = () => {
      const h = lista[Number(b.dataset.k)];
      if (b.classList.contains("tachada")) return;
      if (primera) { registrar("9.1", h.valor === "buena", null, `hipótesis ${h.valor}`, regla); primera = false; }
      if (h.valor !== "buena") {
        b.classList.add("tachada");
        pizDibujar(b.querySelector("span"), pizTrazoTachon, "tachon", [6, 4]);
        b.insertAdjacentHTML("beforeend", `<em class="piz-veredicto">demasiado ${h.valor}</em>`);
        const testigo = (h.prueba || []).find(p => pruebas.some(x => x.p === p)) || h.prueba?.[0] || "";
        pizDecir(h.porque.replace("{p}", testigo), "pensativo");
        const i = pruebas.findIndex(x => x.p === testigo);
        if (i >= 0) {
          const pb = $(`.piz-p[data-i="${i}"]`);
          pb.querySelector(".subrayado")?.remove();
          pizDibujar(pb, pizTrazoSubrayado, "subrayado rosa", [6, 4]);
          pb.classList.remove("aviso"); void pb.offsetWidth; pb.classList.add("aviso");
        }
        return;
      }
      $$(".piz-hipotesis .piz-pizarrin").forEach(x => (x.disabled = true));
      b.classList.add("buena");
      pizDibujar(b.querySelector(".piz-marca"), pizTrazoVisto, "visto", [0, 0]);
      pizDecir(`¡Eso es! ${h.porque || "Explica las cuatro pruebas rodeadas y deja fuera a las otras dos."} Pero un buen detective no se fía de una hipótesis hasta ponerla a prueba.`, "contento");
      $("#pizAcc").innerHTML = `<button class="flecha" id="pizSig">Ponerla a prueba ▸</button>`;
      $("#pizSig").onclick = paso3;
    });
  };

  /* Paso 3 · Contraejemplo: la excepción que rompe la regla, o la palabra que la confirma */
  const paso3 = () => {
    $("#pizAcc").innerHTML = "";
    $("#pizZona").innerHTML = "";
    pizBorrar(() => {
      pizPasos(3);
      $("#pizCont").innerHTML = `${htmlHipotesis()}<div class="piz-pruebas nuevas ${frases ? "frases" : ""}">${nuevas.map((x, i) => htmlPrueba(x, i, "nueva")).join("")}</div>`;
      pizDecir(modo === "excepcion"
        ? "Te añado tres pruebas nuevas. Una de ellas rompe la regla: es la excepción. ¿Cuál es?"
        : `Te añado tres pruebas nuevas. Solo una cumple la regla. ¿Cuál la confirma?`);
      let primera = true, hecho = false;
      $$(".piz-p.nueva").forEach(b => b.onclick = () => {
        if (hecho || b.classList.contains("tachada")) return;
        const x = nuevas[Number(b.dataset.i)];
        if (primera) { registrar("9.1", x.ok, x.p, modo === "excepcion" ? "contraejemplo" : "confirmación", regla); primera = false; }
        if (!x.ok) {
          b.classList.add("tachada");
          pizDibujar(b, pizTrazoTachon, "tachon rosa", [6, 2]);
          pizDecir(modo === "excepcion"
            ? `«${x.p}» cumple la regla: ${conPlural(sub.si, x.p)} Busca la que no la cumple.`
            : `«${x.p}» no cumple la regla. Vuelve a leer la hipótesis de la pizarra.`, "pensativo");
          return;
        }
        hecho = true;
        b.classList.add("rodeada");
        pizDibujar(b, pizTrazoCirculo, "circulo amarilla");
        pizDecir(modo === "excepcion"
          ? `¡Pillada! «${x.p}» es la excepción: ${conPlural(sub.excepcion, x.p)}`
          : `¡Confirmada! «${x.p}» cumple la regla: ${conPlural(sub.si, x.p)}`, modo === "excepcion" ? "sorprendido" : "contento");
        $("#pizAcc").innerHTML = `<button class="flecha" id="pizSig">Tu ejemplo ▸</button>`;
        $("#pizSig").onclick = paso4;
      });
    });
  };

  /* Paso 4 · Tu ejemplo: si está en el banco, «¡en el archivo!»; si no, se acepta y lo revisa el maestro */
  const paso4 = () => {
    $("#pizAcc").innerHTML = "";
    pizBorrar(() => {
      pizPasos(4);
      $("#pizCont").innerHTML = `${htmlHipotesis()}
        <label class="piz-tuyo"><span>Tu ejemplo:</span>
          <input id="pizResp" class="piz-entrada ${frases ? "frase" : ""}" maxlength="${frases ? 40 : 24}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Escribe tu ejemplo"></label>`;
      pizDecir(frases
        ? "Y ahora lo más difícil: una frase tuya que cumpla la regla y que no esté en la pizarra. Escríbela con tu mejor letra."
        : "Y ahora lo más difícil: un ejemplo tuyo que cumpla la regla y que no esté en la pizarra. Escríbelo con tu mejor letra.");
      $("#pizAcc").innerHTML = `<button class="boton-sello" id="pizOk">Escribir en la pizarra</button>`;
      const inp = $("#pizResp");
      inp.focus();
      const rx = sub.patron ? new RegExp(sub.patron) : null;
      const delBanco = new Set([...sub.ejemplos, ...ACA.palabras.filter(w => w.regla === regla && (!rx || rx.test(norm(w.p)))).map(w => w.p)].map(clave));
      let registrado = false, dudas = 0, hecho = false;
      const anotar = (ok, v, detalle) => { if (!registrado) { registrado = true; registrar("9.1", ok, v, detalle, regla); } };
      // Un ejemplo propio que no está en el banco se guarda siempre para el maestro, aunque antes hubiera un fallo
      const paraRevisar = v => {
        if (!registrado) anotar(true, v, "ejemplo propio (revisar)");
        const e = P.eventos.findLast(x => x.detalle?.startsWith("ejemplo propio"));
        if (e) { e.revisar = v; e.detalle = "ejemplo propio (revisar)"; }   // el primer intento sigue contando para la nota
      };
      const comprobar = () => {
        if (hecho) return;
        const v = inp.value.trim().replace(/\s+/g, " ");
        if (!v) return;
        if (!frases && v.includes(" ")) return pizDecir("Una sola palabra, por favor. La pizarra no es tan grande.", "pensativo");
        if (frases && v.split(" ").length < 3) return pizDecir("Escribe una frase entera, con al menos tres palabras.", "pensativo");
        const k = clave(v);
        if (enPizarra.has(k)) return pizDecir(`«${v}» ya ha salido en la pizarra. Piensa en ${frases ? "una frase tuya" : "una palabra tuya"}.`, "pensativo");
        if (sub.contraejemplos.map(clave).includes(k)) { anotar(false, v, "ejemplo propio"); return pizDecir(`¡Cuidado! «${v}» es justo una excepción: no sirve como ejemplo de la regla. Prueba con otro.`, "sorprendido"); }
        if (sub.relleno.map(clave).includes(k)) { anotar(false, v, "ejemplo propio"); return pizDecir(`«${v}» está bien escrita, pero no cumple la regla. Prueba con otro.`, "pensativo"); }
        const enArchivo = delBanco.has(k);
        if (!enArchivo && rx && !rx.test(frases ? v : norm(v))) {
          dudas++;
          pizDecir(`Mmm… no me cuadra con la regla. Léela otra vez y prueba con otro. Pista: ${sub.pista}`, "pensativo");
          if (dudas >= 2 && !$("#pizAyuda")) {
            $("#pizAcc").insertAdjacentHTML("afterbegin", `<button class="boton-papel" id="pizAyuda">Dame una idea</button>`);
            $("#pizAyuda").onclick = () => {
              anotar(false, null, "ejemplo propio (ayuda)");
              const idea = restoEj.find(x => !enPizarra.has(clave(x))) || sub.ejemplos[0];
              pizDecir(`Te doy una del archivo: «${idea}». Escríbela tú en la pizarra.`, "neutral");
              inp.value = ""; inp.focus();
            };
          }
          return;
        }
        hecho = true;
        if (enArchivo) anotar(true, v, "ejemplo propio"); else paraRevisar(v);
        inp.replaceWith(Object.assign(document.createElement("span"), { className: `piz-escrito ${frases ? "frase" : ""}`, textContent: v }));
        const caja = $(".piz-escrito");
        pizDibujar(caja, pizTrazoCirculo, "circulo amarilla", [16, 8]);
        caja.insertAdjacentHTML("beforeend", enArchivo
          ? `<em class="piz-sello">★ ¡en el archivo!</em>`
          : `<em class="piz-sello revisar">? lo revisará tu maestro</em>`);
        pizDecir(enArchivo
          ? `¡En el archivo! «${v}» cumple la regla. Ya tienes tu propio ejemplo.`
          : `No lo tengo en mi archivo, pero me lo apunto: tu maestro lo revisará. Me parece un buen ejemplo.`, "contento");
        $("#pizAcc").innerHTML = `<button class="flecha" id="pizSig">Ver la confirmación ▸</button>`;
        $("#pizSig").onclick = final;
      };
      $("#pizOk").onclick = comprobar;
      inp.onkeydown = ev => { if (ev.key === "Enter") comprobar(); };
    });
  };

  /* Final · La ficha de Mateo confirma la regla descubierta */
  const final = () => {
    pizPasos(5);
    const ficha = D.reglas[regla]?.ficha;
    const punto = ficha?.puntos?.[sub.punto];
    pizDecir("Caso cerrado. Lo que has descubierto con tiza coincide con el Archivo de Mateo. Míralo:", "contento");
    $("#pizZona").innerHTML = ficha ? `<div class="piz-ficha">
        <span class="piz-ficha-sello">Confirmado</span>
        <small>${esc(ficha.titulo)} · ${esc(sub.nombre)}</small>
        <p>${esc(punto || ficha.puntos[0])}</p>
        <button class="boton-papel" id="pizFicha">Ver la ficha completa</button></div>` : "";
    $("#pizFicha")?.addEventListener("click", () => abrirModal(`<div class="sello-archivo">ARCHIVO DE MATEO</div><h3>${esc(ficha.titulo)}</h3><ul class="ficha">${ficha.puntos.map((x, i) => `<li${i === sub.punto ? ` class="piz-destacado"` : ""}>${esc(x)}</li>`).join("")}</ul>`, "ventana-archivo"));
    $("#pizAcc").innerHTML = `<button class="flecha" id="pizFin">Terminar ▸</button>`;
    $("#pizFin").onclick = () => {
      const st2 = estadoPiz();
      st2.vistas[regla] = [...new Set([...(st2.vistas[regla] || []), sub.id])];
      guardar(clavePiz(), st2);
      const s = estadoAca(); s.leccionVista[regla] = s.sesion; guardarAca(s);   // ya ha visto la ficha hoy
      terminarActividad(sl, turno);
      const seguir = $("#momentoSeguir");
      if (seguir) {
        seguir.insertAdjacentHTML("afterend", `<button class="boton-papel piz-otra" id="pizOtra">Otra regla ▸</button>`);
        $("#pizOtra").onclick = () => { cerrarModal(); pizElegir(sl, null); };
      }
    };
  };

  paso1();
}
