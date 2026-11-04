/* ============================================================
   AGENCIA LA LUPA · Academia · El Laboratorio (ejercicios extra)
   L2 El microscopio de homófonos (homofonos): bajo el ocular, una frase con
   hueco; en la bandeja, las palabras que suenan igual, todas bien escritas.
   Se elige por el significado (9.1), las muestras se tapan y se escribe de
   memoria (5.1). Al acertar, el informe explica cada forma y el truco.
   L3 La centrifugadora de palabras (familias): la máquina separa la raíz y
   marca la letra dudosa. Para cada palabra de la familia que se pide, el
   alumno decide qué letra lleva (¿se hereda o cambia?, 9.1) y la escribe
   entera (5.1). Al final, la familia completa y cuándo cambia la letra.
   Las palabras falladas entran en la cola de repaso (terminarActividad) y se
   añaden al banco con su frase, para que la ficha del Archivo tenga pista.
   Datos: datos/academia/homofonos.json (validar_homofonos.py) y
   datos/academia/familias.json (validar_familias.py).
   ============================================================ */
"use strict";

const LAB_HOM_REGLAS = ["b-v-1", "h-1", "ll-y", "c-z-s"];
const LAB_FAM_REGLAS = ["h-1", "b-v-1", "c-z-s", "ll-y", "d-z-finales", "g-j-dieresis"];
const LAB_CERCANA = { "d-z-finales": "c-z-s" };     // regla más parecida cuando el microscopio no tiene la pedida
const LAB_RONDA = 3;                                // grupos (o familias) por ronda, dos palabras de cada uno
const LAB_TINTES = ["#9be2ae", "#7cc4f2", "#c9a2f5", "#f2c46b"];
const LAB = { hom: null, fam: null };

async function labCargar(que) {
  if (que === "hom") LAB.hom ??= (await leerJSON("datos/academia/homofonos.json")).grupos;
  else LAB.fam ??= (await leerJSON("datos/academia/familias.json")).familias;
  return LAB[que];
}
const labFraseDer = d => d.frase || enBanco(d.p)?.frase || "";

/* Las palabras del laboratorio que acaban en la cola necesitan su frase en el banco:
   sin ella, la ficha del Archivo daría una pista ambigua (tubo/tuvo tienen las mismas letras) */
function labSembrar(palabras) {
  const quiero = new Set(palabras);
  const entradas = [
    ...(LAB.hom || []).flatMap(g => g.formas.map(f => ({ p: f.p, regla: g.regla, frase: f.frases[0] }))),
    ...(LAB.fam || []).flatMap(f => f.derivadas.map(d => ({ p: d.p, regla: f.regla, frase: labFraseDer(d) }))),
  ];
  entradas.forEach(e => { if (quiero.has(e.p) && e.frase && !enBanco(e.p)) ACA.palabras.push({ ...e, origen: "laboratorio" }); });
}
/* Al arrancar: espera a que app.js cargue el banco y siembra las palabras que ya están en alguna cola */
(function labPrecarga(n = 0) {
  if (!ACA.palabras.length) { if (n < 40) setTimeout(() => labPrecarga(n + 1), 500); return; }
  let enCola = [];
  try { enCola = perfiles.flatMap(p => Object.keys(cargar(`academia-${p.id}`, {}).cola || {})); } catch { /* sin perfiles */ }
  if (enCola.length) Promise.all([labCargar("hom"), labCargar("fam")]).then(() => labSembrar(enCola)).catch(() => {});
})();

/* ── Utilidades ──────────────────────────────────────────────── */
function labActivas(regla, propias, cercana = {}) {
  if (regla && regla !== "mezcla") {
    const r = propias.includes(regla) ? regla : cercana[regla];
    if (r) return { activas: [r], mezcla: false };
  }
  return { activas: propias, mezcla: true };
}
const labDeRegla = (x, activas) => activas.includes(x.regla) || (x.tambien || []).some(r => activas.includes(r));
/* Primero lo que está en la cola del alumno; en modo mezcla, una regla distinta cada vez */
function labElegir(lista, activas, mezcla, n, palabrasDe) {
  const cola = estadoAca().cola;
  const pesa = x => (palabrasDe(x).some(p => cola[p]) ? 1 : 0);
  const cand = barajar(lista.filter(x => labDeRegla(x, activas))).sort((a, b) => pesa(b) - pesa(a));
  if (!mezcla) return cand.slice(0, n);
  const out = [], usadas = new Set();
  cand.forEach(x => { if (out.length < n && !usadas.has(x.regla)) { out.push(x); usadas.add(x.regla); } });
  cand.forEach(x => { if (out.length < n && !out.includes(x)) out.push(x); });
  return out;
}
/* ¿Empieza oración el hueco? Entonces la palabra va con mayúscula (¡Ay!, ¿Has visto…?) */
const labMayus = (frase, i) => /(^|[.!?…]\s+|[¡¿«"]\s*)$/.test(frase.slice(0, i));
function labHueco(frase, palabra = "") {
  const i = frase.indexOf("___");
  const w = palabra && labMayus(frase, i) ? palabra[0].toUpperCase() + palabra.slice(1) : palabra;
  return `${esc(frase.slice(0, i))}<span class="lab-hueco ${w ? "lleno" : ""}">${w ? esc(w) : "&nbsp;"}</span>${esc(frase.slice(i + 3))}`;
}
/* Palabra con la letra dudosa resaltada (si la letra es «sin h», no hay nada que resaltar) */
function labMarcar(p, pos, letra) {
  if (letra.startsWith("sin ")) return esc(p);
  return `${esc(p.slice(0, pos))}<mark>${esc(p.slice(pos, pos + letra.length))}</mark>${esc(p.slice(pos + letra.length))}`;
}
const labLuego = (ms, el, fn) => setTimeout(() => { if (el?.isConnected) fn(); }, movimientoReducido() ? Math.min(ms, 60) : ms);
/* El foco va al botón «Siguiente» un poco después: si no, el mismo Enter que comprueba la palabra lo pulsaría */
const labFoco = sel => { const b = $(sel); labLuego(400, b, () => b.focus()); };
const labVolver = () => ($("#acaVolver").onclick = () => confirmar("¿Volver al patio? Se perderá esta ronda.", vistaPatio, "Volver"));
const labInput = (id, etiqueta) => `<input id="${id}" class="entrada" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="${esc(etiqueta)}">`;

/* ── L2 · El microscopio de homófonos ────────────────────────── */
nuevaActividad("laboratorio", {
  id: "homofonos", nombre: "El microscopio de homófonos",
  desc: "Suenan igual y se escriben distinto: el significado decide.", reglas: LAB_HOM_REGLAS,
}, async function (sl, regla, turno) {
  let grupos;
  try { grupos = await labCargar("hom"); } catch { aviso("El microscopio no enfoca: no se han podido cargar las muestras.", "mal"); return; }
  const { activas, mezcla } = labActivas(regla, LAB_HOM_REGLAS, LAB_CERCANA);
  const cola = estadoAca().cola;
  const elegidos = labElegir(grupos, activas, mezcla, LAB_RONDA, g => g.formas.map(f => f.p));
  // Dos frases por grupo, de formas distintas, y los grupos intercalados
  const vueltas = [[], []];
  elegidos.forEach(g => {
    barajar(g.formas).sort((a, b) => (cola[b.p] ? 1 : 0) - (cola[a.p] ? 1 : 0)).slice(0, 2)
      .forEach((f, i) => vueltas[i].push({ g, f, frase: azarElem(f.frases) }));
  });
  const lista = [...barajar(vueltas[0]), ...barajar(vueltas[1])];
  const m = vueltas[0].length;
  if (lista[m] && lista[m - 1]?.g === lista[m].g && lista[m + 1]) [lista[m], lista[m + 1]] = [lista[m + 1], lista[m]];
  partidaAca(sl, mezcla ? [...new Set(elegidos.map(g => g.regla))] : activas);
  let k = 0;

  const pintar = () => {
    const it = lista[k];
    if (!it) return terminarActividad(sl, turno);
    const { g, f, frase } = it;
    const reg = mezcla ? g.regla : activas[0];
    const muestras = barajar(g.formas);
    pintarEscena(`
      <h1 class="cartel titulo-escena">${esc(sl.nombre)}</h1>
      <p class="instruccion" id="labInstr">Paso 1 · ¿Qué muestra encaja en la frase? Decide por el significado.</p>
      <div class="lab-micro">
        <div class="lab-ocular" id="labOcular">
          <div class="lab-campo">
            <small>Muestra ${k + 1} de ${lista.length}</small>
            <p class="lab-frase" id="labFrase">${labHueco(frase)}</p>
            <span class="lab-aumento">× 400</span>
          </div>
        </div>
        <p class="lab-placa">Microscopio de homófonos · Lab. La Lupa</p>
      </div>
      <div class="lab-mesa">
        <p class="lab-rotulo" id="labRotulo">Bandeja de muestras · ${muestras.length === 3 ? "las tres" : "las dos"} suenan igual</p>
        <div class="lab-bandeja" id="labBandeja">${muestras.map((x, i) => `<button class="lab-porta" data-p="${esc(x.p)}"><i>${"ABC"[i]}</i><b>${esc(x.p)}</b></button>`).join("")}</div>
        <p class="lab-dice" id="labDice"><b>Mateo:</b> Al oído son idénticas. Al microscopio, no: cada una significa una cosa. ¿Cuál pide la frase?</p>
        <div class="lab-zona" id="labZona"></div>
      </div>
      <button class="hud-volver" id="acaVolver">◂ Patio</button>`, { fondo: sl.fondo, clase: "oscurecido lab-sala" });
    labVolver();
    const dice = html => ($("#labDice").innerHTML = html);
    let elegida = false, primera = true;

    $$(".lab-porta").forEach(b => b.onclick = () => {
      if (elegida) return;
      const x = g.formas.find(y => y.p === b.dataset.p);
      const ok = x.p === f.p;
      if (primera) { primera = false; registrar("9.1", ok, f.p, "homófono: significado", reg); }
      if (!ok) {
        b.disabled = true; b.classList.add("descartada");
        dice(`<b>Mateo:</b> Esa muestra no encaja en esta frase. «${esc(x.p)}» significa ${esc(x.significado[0].toLowerCase() + x.significado.slice(1))} Prueba con otra.`);
        return;
      }
      elegida = true;
      b.classList.add("elegida");
      dice(`<b>Mateo:</b> ¡Bien visto! Es la muestra «${esc(f.p)}». Ahora la guardo… y tú la escribes de memoria.`);
      labLuego(900, b, escribir);
    });

    const escribir = () => {
      $$(".lab-porta").forEach(b => { b.disabled = true; b.classList.add("tapada"); });
      $("#labInstr").textContent = "Paso 2 · Las muestras están tapadas: escribe la palabra de la frase.";
      $("#labZona").innerHTML = `${labInput("labResp", "Escribe la palabra del hueco")}<p id="msg" class="msg"></p>
        <div class="lab-acciones"><button class="boton-sello" id="labOk">Comprobar</button></div>`;
      const inp = $("#labResp"); inp.focus();
      let intentada = false;
      const comprobar = () => {
        if (!inp.value.trim()) return;
        const ok = norm(inp.value) === norm(f.p);
        if (!intentada) { intentada = true; registrar("5.1", ok, f.p, "homófono", reg); if (!ok) labSembrar([f.p]); }
        if (!ok) { $("#msg").innerHTML = `Se escribe <strong>${esc(f.p)}</strong>. Escríbela tú.`; inp.value = ""; inp.focus(); return; }
        informe();
      };
      $("#labOk").onclick = comprobar;
      inp.onkeydown = ev => { if (ev.key === "Enter") comprobar(); };
    };

    const informe = () => {
      $("#labFrase").innerHTML = labHueco(frase, f.p);
      $("#labOcular").classList.add("enfocado");
      $("#labInstr").textContent = "¡Muestra identificada! Lee el informe del microscopio.";
      $("#labRotulo").textContent = "Informe del microscopio";
      $("#labBandeja").outerHTML = `<div class="lab-analisis">${g.formas.map(x => `
        <div class="lab-ficha ${x.p === f.p ? "buena" : ""}"><b>${esc(x.p)}</b><span>${esc(x.significado)}</span></div>`).join("")}</div>`;
      dice(`<b>Truco de Mateo:</b> ${esc(g.truco)}`);
      $("#labZona").innerHTML = `<div class="lab-acciones">${hayVoz() ? `<button class="boton-papel" id="labOir">🔊 Escúchalas: suenan igual</button>` : ""}
        <button class="flecha" id="labSig">${k + 1 < lista.length ? "Siguiente muestra" : "Terminar el análisis"} ▸</button></div>`;
      $("#labOir")?.addEventListener("click", () => hablar(g.formas.map(x => x.p).join(", ")));
      $("#labSig").onclick = () => { k++; pintar(); };
      labFoco("#labSig");
    };
  };
  pintar();
});

/* ── L3 · La centrifugadora de palabras ──────────────────────── */
/* Dos derivadas por familia: primero las de la cola; si se puede, una que hereda la letra y otra que la cambia */
function labDerivadas(f) {
  const cola = estadoAca().cola;
  const ds = barajar(f.derivadas).sort((a, b) => (cola[b.p] ? 1 : 0) - (cola[a.p] ? 1 : 0));
  const cambia = d => d.letra !== f.letra;
  const primera = ds[0];
  const segunda = ds.slice(1).find(d => cambia(d) !== cambia(primera)) || ds[1];
  return [primera, segunda].filter(Boolean).sort((a, b) => cambia(a) - cambia(b));
}

nuevaActividad("laboratorio", {
  id: "familias", nombre: "La centrifugadora de palabras",
  desc: "Las familias heredan la letra… casi siempre. Descubre cuándo cambia.", reglas: LAB_FAM_REGLAS,
}, async function (sl, regla, turno) {
  let fams;
  try { fams = await labCargar("fam"); } catch { aviso("La centrifugadora no arranca: no se han podido cargar las familias.", "mal"); return; }
  const { activas, mezcla } = labActivas(regla, LAB_FAM_REGLAS);
  const plan = labElegir(fams, activas, mezcla, LAB_RONDA, f => [f.raiz, ...f.derivadas.map(d => d.p)]).map(f => ({ f, ders: labDerivadas(f) }));
  partidaAca(sl, mezcla ? [...new Set(plan.map(x => x.f.regla))] : activas);
  let k = 0;

  const pintar = () => {
    const pl = plan[k];
    if (!pl) return terminarActividad(sl, turno);
    const { f, ders } = pl;
    const reg = mezcla ? f.regla : activas[0];
    const tinte = LAB_TINTES[k % LAB_TINTES.length];
    // La raíz por piezas, con la letra dudosa marcada
    let ini = 0;
    const piezas = f.piezas.map((pz, i) => {
      const a = ini; ini += pz.length;
      const dentro = f.pos >= a && f.pos < a + pz.length
        ? `${esc(pz.slice(0, f.pos - a))}<mark>${esc(pz.slice(f.pos - a, f.pos - a + f.letra.length))}</mark>${esc(pz.slice(f.pos - a + f.letra.length))}`
        : esc(pz);
      return `<span class="${i ? "lab-suelta" : "lab-tronco"}">${dentro}</span>`;
    }).join("");
    pintarEscena(`
      <h1 class="cartel titulo-escena">${esc(sl.nombre)}</h1>
      <p class="instruccion" id="labInstr">Pulsa «Centrifugar»: la máquina separa la raíz de la palabra.</p>
      <div class="lab-centri" style="--tinte:${tinte}">
        <div class="lab-maquina" id="labMaq">
          <div class="lab-rotor" id="labRotor">${[0, 1, 2, 3, 4, 5].map(i => `<i style="--a:${i * 60}deg"></i>`).join("")}</div>
          <div class="lab-tapa"><span class="lab-raiz" id="labRaiz">${piezas}</span></div>
        </div>
        <p class="lab-lectura" id="labLectura">Muestra ${k + 1} de ${plan.length} · lista para centrifugar</p>
        <div class="lab-base" id="labBase"><button class="boton-sello" id="labGirar">Centrifugar ▸</button></div>
      </div>
      <div class="lab-mesa lab-fam" style="--tinte:${tinte}">
        <p class="lab-rotulo" id="labRotulo">Familia de «${esc(f.raiz)}»</p>
        <div class="lab-trabajo" id="labTrabajo">
          <p class="lab-dice"><b>Mateo:</b> Las palabras de una familia comparten la raíz… y casi siempre heredan su ortografía. Casi. Vamos a comprobarlo.</p>
        </div>
      </div>
      <button class="hud-volver" id="acaVolver">◂ Patio</button>`, { fondo: sl.fondo, clase: "oscurecido lab-sala" });
    labVolver();

    $("#labGirar").onclick = () => {
      $("#labGirar").disabled = true;
      $("#labMaq").classList.add("girando");
      $("#labRotor").classList.add("girando");
      $("#labLectura").textContent = "Centrifugando…";
      labLuego(1600, $("#labMaq"), () => {
        $("#labMaq").classList.remove("girando");
        $("#labRaiz").classList.add("separada");
        const tronco = f.piezas[0];
        $("#labLectura").innerHTML = `Raíz: <b>${esc(tronco)}${f.piezas.length > 1 ? "-" : ""}</b> · letra a vigilar: <b>${esc(f.letra)}</b>`;
        $("#labBase").innerHTML = `<div class="lab-gradilla">${ders.map((d, i) => `<div class="lab-probeta" data-i="${i}"><i class="lab-tubo"><b></b></i><span>?</span></div>`).join("")}</div>`;
        probeta(0);
      });
    };

    const probeta = j => {
      const d = ders[j];
      if (!d) return resumen();
      $$(".lab-probeta").forEach((p, i) => p.classList.toggle("activa", i === j));
      const len = d.letra.startsWith("sin ") ? 0 : d.letra.length;
      const molde = `${esc(d.p.slice(0, d.pos))}<span class="lab-q" id="labQ">?</span>${esc(d.p.slice(d.pos + len))}`;
      $("#labRotulo").textContent = `Familia de «${f.raiz}» · probeta ${j + 1} de ${ders.length}`;
      $("#labInstr").textContent = "Paso 1 · ¿Qué letra lleva esta palabra de la familia? ¿La hereda o cambia?";
      $("#labTrabajo").innerHTML = `
        <p class="lab-pide">${esc(d.pista)}:</p>
        <p class="lab-contexto">${labHueco(labFraseDer(d))}</p>
        <div class="lab-molde" id="labMolde">${molde}</div>
        <div class="lab-letras" id="labLetras">${barajar(d.opciones).map(o => `<button data-o="${esc(o)}">${esc(o)}</button>`).join("")}</div>
        <p id="msg" class="msg"></p>`;
      let primera = true;
      $$("#labLetras button").forEach(b => b.onclick = () => {
        const ok = b.dataset.o === d.letra;
        if (primera) { primera = false; registrar("9.1", ok, d.p, "familia: letra heredada", reg); }
        if (!ok) {
          b.disabled = true; b.classList.add("mal");
          $("#msg").textContent = `No. Vuelve a mirar la raíz «${f.raiz}»: ¿qué letra trae? ¿Hay algo en esta palabra que la obligue a cambiar?`;
          return;
        }
        $$("#labLetras button").forEach(x => (x.disabled = true));
        b.classList.add("bien");
        const q = $("#labQ");
        q.textContent = len ? d.letra : ""; q.classList.add("puesta"); if (!len) q.classList.add("vacia");
        $("#msg").innerHTML = `<span class="lab-ok">✔ ${esc(d.letra === f.letra ? `Hereda la ${f.letra} de «${f.raiz}».` : d.porque)}</span>`;
        labLuego(1500, q, () => escribir(j));
      });
    };

    const escribir = j => {
      const d = ders[j];
      $("#labInstr").textContent = "Paso 2 · La muestra se ha evaporado: escribe la palabra entera.";
      $("#labMolde").classList.add("evaporada");
      $("#labLetras").outerHTML = `<div class="lab-escribe">${labInput("labResp", "Escribe la palabra de la familia")}<button class="boton-sello" id="labOk">Comprobar</button></div>`;
      $("#msg").textContent = "";
      const inp = $("#labResp"); inp.focus();
      let intentada = false;
      const comprobar = () => {
        if (!inp.value.trim()) return;
        const ok = norm(inp.value) === norm(d.p);
        if (!intentada) { intentada = true; registrar("5.1", ok, d.p, "familia de palabras", reg); if (!ok) labSembrar([d.p]); }
        if (!ok) { $("#msg").innerHTML = `Se escribe <strong>${esc(d.p)}</strong>. Escríbela tú.`; inp.value = ""; inp.focus(); return; }
        const pr = $$(".lab-probeta")[j];
        pr.classList.add("llena"); pr.classList.remove("activa");
        pr.querySelector("span").innerHTML = labMarcar(d.p, d.pos, d.letra);
        $("#labMolde").outerHTML = `<div class="lab-molde hecho">${labMarcar(d.p, d.pos, d.letra)}</div>`;
        $(".lab-escribe").remove();
        $("#msg").outerHTML = `<div class="explicacion lab-explica">✔️ <b>${esc(d.p)}</b>: ${esc(d.letra === f.letra ? `hereda la ${f.letra} de «${f.raiz}».` : d.porque[0].toLowerCase() + d.porque.slice(1))}</div>
          <div class="lab-acciones"><button class="flecha" id="labSig">${j + 1 < ders.length ? "Siguiente probeta" : "Ver la familia"} ▸</button></div>`;
        $("#labSig").onclick = () => probeta(j + 1);
        labFoco("#labSig");
      };
      $("#labOk").onclick = comprobar;
      inp.onkeydown = ev => { if (ev.key === "Enter") comprobar(); };
    };

    const resumen = () => {
      $("#labInstr").textContent = "Análisis completo: así hereda (o cambia) la letra esta familia.";
      $("#labRotulo").textContent = `Análisis · familia de «${f.raiz}»`;
      $("#labTrabajo").innerHTML = `
        <div class="lab-familia">
          <span class="lab-madre">${labMarcar(f.raiz, f.pos, f.letra)}</span>
          ${f.derivadas.map(d => `<span class="${d.letra === f.letra ? "" : "cambia"}">${labMarcar(d.p, d.pos, d.letra)}</span>`).join("")}
        </div>
        <p class="lab-dice"><b>Mateo:</b> ${esc(f.nota)}</p>
        <div class="lab-acciones"><button class="flecha" id="labSig">${k + 1 < plan.length ? "Siguiente muestra" : "Terminar el análisis"} ▸</button></div>`;
      $("#labSig").onclick = () => { k++; pintar(); };
      labFoco("#labSig");
    };
  };
  pintar();
});
