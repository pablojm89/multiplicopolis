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
   Niveles (lupas, motor en academia.js · NIVELES_ACA):
   · Microscopio: bronce, parejas muy frecuentes (nivel 1) y 5 frases; plata, tríos
     (y parejas de nivel 2) y 6 frases; oro, parejas poco frecuentes (nivel 3),
     frases largas y 7 frases; diamante, 8 frases dobles (dos huecos de dos grupos,
     todas las muestras mezcladas) y los trucos de Mateo solo al final.
   · Centrifugadora: bronce, 2 familias de nivel 1 que heredan la letra; plata, 3
     familias con algún cambio (z → c); oro, 3 familias de nivel 2-3 con cambios y 3
     derivadas; diamante, 4 familias de nivel 3, 3 derivadas cada una, sin la letra
     destacada y escritas directamente.
   Datos: datos/academia/homofonos.json (validar_homofonos.py) y
   datos/academia/familias.json (validar_familias.py).
   ============================================================ */
"use strict";

const LAB_HOM_REGLAS = ["b-v-1", "h-1", "ll-y", "c-z-s"];
const LAB_FAM_REGLAS = ["h-1", "b-v-1", "c-z-s", "ll-y", "d-z-finales", "g-j-dieresis"];
const LAB_CERCANA = { "d-z-finales": "c-z-s" };     // regla más parecida cuando el microscopio no tiene la pedida
const LAB_HOM_FRASES = [5, 6, 7, 8];                // frases por ronda del microscopio, según la lupa
const LAB_FAM_RONDA = [[2, 2], [3, 2], [3, 3], [4, 3]];   // centrifugadora: [familias, derivadas por familia]
const LAB_TINTES = ["#9be2ae", "#7cc4f2", "#c9a2f5", "#f2c46b"];
const LAB = { hom: null, fam: null, dobles: [] };

async function labCargar(que) {
  if (que === "hom" && !LAB.hom) { const d = await leerJSON("datos/academia/homofonos.json"); LAB.hom = d.grupos; LAB.dobles = d.dobles || []; }
  else if (que === "fam") LAB.fam ??= (await leerJSON("datos/academia/familias.json")).familias;
  return LAB[que];
}
/* La lupa con la que se juega, a la vista en la pantalla del ejercicio */
const labLupa = () => NIVELES_ACA[nivelAca() - 1];
const labInsignia = () => `<span class="lab-insignia n${labLupa().n}" title="${esc(labLupa().nombre)}">${labLupa().icono} ${esc(labLupa().corto)}</span>`;
const labNv = x => x.nivel || 1;
/* Evita que dos muestras seguidas sean del mismo grupo (mantiene el orden si puede) */
function labIntercalar(lista, clave) {
  const out = [], resto = [...lista];
  while (resto.length) {
    const prev = out.length ? clave(out[out.length - 1]) : null;
    const i = Math.max(0, resto.findIndex(x => clave(x) !== prev));
    out.push(resto.splice(i, 1)[0]);
  }
  return out;
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
function labHueco(frase, palabra = "") { return labHuecos(frase, [palabra]); }
/* Frase con uno o varios huecos: «llenos» trae la palabra de cada hueco (o nada); «activo», el que se está resolviendo */
function labHuecos(frase, llenos = [], activo = -1) {
  const trozos = frase.split("___");
  const varios = trozos.length > 2;
  let out = esc(trozos[0]), antes = trozos[0];
  for (let i = 1; i < trozos.length; i++) {
    const p = llenos[i - 1] || "";
    const w = p && labMayus(antes, antes.length) ? p[0].toUpperCase() + p.slice(1) : p;
    out += `<span class="lab-hueco ${w ? "lleno" : ""} ${i - 1 === activo ? "activo" : ""}">${w ? esc(w) : varios ? `<i>${i}</i>` : "&nbsp;"}</span>${esc(trozos[i])}`;
    antes += "___" + trozos[i];
  }
  return out;
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
/* Grupos de la ronda según la lupa (bronce, plata y oro) */
function labHomGrupos(grupos, activas, mezcla) {
  const n = nivelAca();
  const deRegla = grupos.filter(g => labDeRegla(g, activas));
  const elegir = (lista, k) => (k > 0 ? labElegir(lista, activas, mezcla, k, g => g.formas.map(f => f.p)) : []);
  if (n === 1) return elegir(porNivel(deRegla.filter(g => g.formas.length === 2), 3, 1), 3);
  if (n === 2) {
    // Tríos primero: con dos tríos salen las 6 frases (una por forma); si faltan, parejas de nivel 1-2
    const cand = porNivel(deRegla, 3, 2);
    const trios = elegir(cand.filter(g => g.formas.length === 3), 2);
    return [...trios, ...elegir(cand.filter(g => g.formas.length === 2), Math.ceil((6 - trios.length * 3) / 2))];
  }
  // Oro: parejas poco frecuentes (nivel 3) y alguna de nivel 2 para variar
  const altos = deRegla.filter(g => labNv(g) === 3);
  const gs = elegir(altos, 3);
  gs.push(...elegir(deRegla.filter(g => labNv(g) === 2 && !gs.includes(g)), 4 - gs.length));
  if (gs.length < 4) gs.push(...elegir(deRegla.filter(g => !gs.includes(g)), 4 - gs.length));
  return gs;
}
/* En oro, frases largas: se elige entre las dos más largas de cada forma */
const labFraseNivel = f => (nivelAca() >= 3 ? azarElem([...f.frases].sort((a, b) => b.length - a.length).slice(0, 2)) : azarElem(f.frases));

/* Las muestras de la ronda: una vuelta con una forma de cada grupo, otra con la siguiente… */
function labHomRonda(grupos, activas, mezcla) {
  const cola = estadoAca().cola;
  const vueltas = [[], [], []];
  labHomGrupos(grupos, activas, mezcla).forEach(g => {
    barajar(g.formas).sort((a, b) => (cola[b.p] ? 1 : 0) - (cola[a.p] ? 1 : 0))
      .forEach((f, i) => vueltas[i].push({ g, f, frase: labFraseNivel(f) }));
  });
  const total = LAB_HOM_FRASES[nivelAca() - 1];
  return labIntercalar(vueltas.flatMap(v => barajar(v)), x => x.g).slice(0, total);
}

/* Diamante: frases con dos huecos de grupos distintos (datos «dobles») */
function labHomDobles(grupos, activas, mezcla) {
  const cola = estadoAca().cola;
  const grupoDe = p => grupos.find(g => g.formas.some(f => f.p === p));
  const todas = LAB.dobles.map(d => ({ frase: d.frase, huecos: d.p.map(p => { const g = grupoDe(p); return g && { g, f: g.formas.find(f => f.p === p) }; }) }))
    .filter(d => d.huecos.every(Boolean));
  const pesa = d => (d.huecos.some(h => cola[h.f.p]) ? 1 : 0);
  const deRegla = barajar(todas.filter(d => d.huecos.some(h => labDeRegla(h.g, activas)))).sort((a, b) => pesa(b) - pesa(a));
  const lista = deRegla.slice(0, LAB_HOM_FRASES[3]);
  if (lista.length < LAB_HOM_FRASES[3] && !mezcla) lista.push(...barajar(todas.filter(d => !lista.includes(d))).slice(0, LAB_HOM_FRASES[3] - lista.length));
  return labIntercalar(lista, d => d.huecos[0].g);
}

/* Escenario común del microscopio: ocular a la izquierda, mesa de muestras a la derecha */
function labHomEscena(sl, { k, total, frase, muestras, doble }) {
  pintarEscena(`
    <h1 class="cartel titulo-escena">${esc(sl.nombre)}</h1>
    ${labInsignia()}
    <p class="instruccion" id="labInstr">${doble ? "Paso 1 · Hueco 1: ¿qué muestra encaja? Hay muestras de dos grupos." : "Paso 1 · ¿Qué muestra encaja en la frase? Decide por el significado."}</p>
    <div class="lab-micro">
      <div class="lab-ocular" id="labOcular">
        <div class="lab-campo">
          <small>Muestra ${k + 1} de ${total}${doble ? " · doble" : ""}</small>
          <p class="lab-frase ${frase.length > 78 ? "larga" : ""}" id="labFrase">${doble ? labHuecos(frase, [], 0) : labHueco(frase)}</p>
          <span class="lab-aumento">× ${doble ? 1000 : 400}</span>
        </div>
      </div>
      <p class="lab-placa">Microscopio de homófonos · Lab. La Lupa</p>
    </div>
    <div class="lab-mesa ${doble ? "lab-doble" : ""}">
      <p class="lab-rotulo" id="labRotulo">${doble ? "Bandeja de muestras · dos grupos mezclados" : `Bandeja de muestras · ${muestras.length === 3 ? "las tres" : "las dos"} suenan igual`}</p>
      <div class="lab-bandeja" id="labBandeja">${muestras.map((x, i) => `<button class="lab-porta" data-p="${esc(x.p)}"><i>${"ABCDEF"[i]}</i><b>${esc(x.p)}</b></button>`).join("")}</div>
      <p class="lab-dice" id="labDice"><b>Mateo:</b> ${doble ? "Nivel diamante: dos huecos y dos grupos de muestras. Los trucos te los doy al final del análisis." : "Al oído son idénticas. Al microscopio, no: cada una significa una cosa. ¿Cuál pide la frase?"}</p>
      <div class="lab-zona" id="labZona"></div>
    </div>
    <button class="hud-volver" id="acaVolver">◂ Patio</button>`, { fondo: sl.fondo, clase: "oscurecido lab-sala" });
  labVolver();
}

nuevaActividad("laboratorio", {
  id: "homofonos", nombre: "El microscopio de homófonos",
  desc: "Suenan igual y se escriben distinto: el significado decide.", reglas: LAB_HOM_REGLAS,
}, async function (sl, regla, turno) {
  let grupos;
  try { grupos = await labCargar("hom"); } catch { aviso("El microscopio no enfoca: no se han podido cargar las muestras.", "mal"); return; }
  const { activas, mezcla } = labActivas(regla, LAB_HOM_REGLAS, LAB_CERCANA);
  if (nivelAca() === 4) return labHomDiamante(sl, turno, grupos, activas, mezcla);
  const lista = labHomRonda(grupos, activas, mezcla);
  partidaAca(sl, mezcla ? [...new Set(lista.map(x => x.g.regla))] : activas);
  let k = 0;

  const pintar = () => {
    const it = lista[k];
    if (!it) return terminarActividad(sl, turno);
    const { g, f, frase } = it;
    const reg = mezcla ? g.regla : activas[0];
    labHomEscena(sl, { k, total: lista.length, frase, muestras: barajar(g.formas) });
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

/* Diamante: dos huecos en la misma frase, con las muestras de los dos grupos mezcladas.
   Sin truco tras cada frase: los trucos se repasan al final, empezando por los grupos fallados. */
function labHomDiamante(sl, turno, grupos, activas, mezcla) {
  const lista = labHomDobles(grupos, activas, mezcla);
  if (!lista.length) { aviso("No hay muestras dobles para esta regla.", "mal"); return; }
  partidaAca(sl, mezcla ? [...new Set(lista.flatMap(d => d.huecos.map(h => h.g.regla)))] : activas);
  const fallos = new Map(), usados = [];
  const fallar = g => fallos.set(g, (fallos.get(g) || 0) + 1);
  let k = 0;

  const pintar = () => {
    const it = lista[k];
    if (!it) return trucos();
    const { frase, huecos } = it;
    huecos.forEach(h => { if (!usados.includes(h.g)) usados.push(h.g); });
    const regDe = h => (mezcla ? h.g.regla : activas[0]);
    labHomEscena(sl, { k, total: lista.length, frase, muestras: barajar([...huecos[0].g.formas, ...huecos[1].g.formas]), doble: true });
    const dice = html => ($("#labDice").innerHTML = html);
    const llenos = [];
    let h = 0, primera = true;

    const elegir = b => {
      const objetivo = huecos[h];
      const ok = b.dataset.p === objetivo.f.p;
      if (primera) { primera = false; registrar("9.1", ok, objetivo.f.p, "homófono: significado (doble)", regDe(objetivo)); if (!ok) fallar(objetivo.g); }
      if (!ok) {
        b.disabled = true; b.classList.add("descartada");
        dice(`<b>Mateo:</b> Esa muestra no encaja en el hueco ${h + 1}. Lee la frase entera y piensa qué significa.`);
        return;
      }
      b.disabled = true; b.classList.add("elegida");
      b.querySelector("i").textContent = h + 1;
      if (h === 0) {
        h = 1; primera = true;
        $$(".lab-porta:not(.elegida)").forEach(x => { x.disabled = false; x.classList.remove("descartada"); });
        $("#labFrase").innerHTML = labHuecos(frase, [], 1);
        $("#labInstr").textContent = "Paso 1 · Hueco 2: ¿y qué muestra encaja aquí?";
        dice("<b>Mateo:</b> Bien. Ahora el segundo hueco: es de otro grupo de muestras.");
        return;
      }
      dice("<b>Mateo:</b> ¡Las dos identificadas! Ahora las guardo… y tú las escribes de memoria.");
      labLuego(900, b, () => escribir(0));
    };
    $$(".lab-porta").forEach(b => b.onclick = () => elegir(b));

    const escribir = j => {
      if (j > 1) return informe();
      const objetivo = huecos[j];
      $$(".lab-porta").forEach(b => { b.disabled = true; b.classList.add("tapada"); });
      $("#labFrase").innerHTML = labHuecos(frase, llenos, j);
      $("#labInstr").textContent = `Paso 2 · Muestras tapadas: escribe la palabra del hueco ${j + 1}.`;
      $("#labZona").innerHTML = `${labInput("labResp", `Escribe la palabra del hueco ${j + 1}`)}<p id="msg" class="msg"></p>
        <div class="lab-acciones"><button class="boton-sello" id="labOk">Comprobar</button></div>`;
      const inp = $("#labResp"); inp.focus();
      let intentada = false;
      const comprobar = () => {
        if (!inp.value.trim()) return;
        const ok = norm(inp.value) === norm(objetivo.f.p);
        if (!intentada) { intentada = true; registrar("5.1", ok, objetivo.f.p, "homófono (doble)", regDe(objetivo)); if (!ok) { labSembrar([objetivo.f.p]); fallar(objetivo.g); } }
        if (!ok) { $("#msg").innerHTML = `Se escribe <strong>${esc(objetivo.f.p)}</strong>. Escríbela tú.`; inp.value = ""; inp.focus(); return; }
        llenos[j] = objetivo.f.p;
        escribir(j + 1);
      };
      $("#labOk").onclick = comprobar;
      inp.onkeydown = ev => { if (ev.key === "Enter") comprobar(); };
    };

    const informe = () => {
      $("#labFrase").innerHTML = labHuecos(frase, llenos);
      $("#labOcular").classList.add("enfocado");
      $("#labInstr").textContent = "¡Muestra doble identificada! Lee el informe del microscopio.";
      $("#labRotulo").textContent = "Informe del microscopio";
      const buenas = huecos.map(x => x.f.p);
      $("#labBandeja").outerHTML = `<div class="lab-analisis">${huecos.flatMap(x => x.g.formas).map(x => `
        <div class="lab-ficha ${buenas.includes(x.p) ? "buena" : ""}"><b>${esc(x.p)}</b><span>${esc(x.significado)}</span></div>`).join("")}</div>`;
      dice("<b>Mateo:</b> Apunto los dos grupos. Los trucos, al final del análisis.");
      $("#labZona").innerHTML = `<div class="lab-acciones"><button class="flecha" id="labSig">${k + 1 < lista.length ? "Siguiente muestra" : "Ver los trucos de Mateo"} ▸</button></div>`;
      $("#labSig").onclick = () => { k++; pintar(); };
      labFoco("#labSig");
    };
  };

  /* Al final, los trucos: primero los de los grupos fallados (todos), y si hay pocos, otros de la ronda hasta 4 */
  const trucos = () => {
    const fallados = usados.filter(g => fallos.has(g)).sort((a, b) => fallos.get(b) - fallos.get(a));
    const resto = barajar(usados.filter(g => !fallos.has(g)));
    const ver = [...fallados, ...resto].slice(0, Math.max(4, fallados.length));
    const POR_PAGINA = 4;
    const pagina = n => {
      const trozo = ver.slice(n * POR_PAGINA, (n + 1) * POR_PAGINA);
      const ultima = (n + 1) * POR_PAGINA >= ver.length;
      $("#labInstr").textContent = fallados.length ? "Los trucos de Mateo: primero, los de las muestras que se te resistieron." : "¡Ronda sin fallos! Repasa los trucos de Mateo.";
      $("#labRotulo").textContent = `Los trucos de Mateo${ver.length > POR_PAGINA ? ` · ${n + 1} de ${Math.ceil(ver.length / POR_PAGINA)}` : ""}`;
      $("#labTrucos").innerHTML = trozo.map(g => `<div class="lab-truco ${fallos.has(g) ? "fallado" : ""}"><b>${g.formas.map(x => esc(x.p)).join(" · ")}</b><span>${esc(g.truco)}</span></div>`).join("");
      $("#labZona").innerHTML = `<div class="lab-acciones"><button class="flecha" id="labSig">${ultima ? "Terminar el análisis" : "Más trucos"} ▸</button></div>`;
      $("#labSig").onclick = () => (ultima ? terminarActividad(sl, turno) : pagina(n + 1));
      labFoco("#labSig");
    };
    $("#labFrase").innerHTML = "Análisis completo";
    $("#labOcular").classList.add("enfocado");
    $("#labDice")?.remove();
    $(".lab-analisis")?.remove();
    $("#labZona").insertAdjacentHTML("beforebegin", `<div class="lab-trucos" id="labTrucos"></div>`);
    pagina(0);
  };
  pintar();
}

/* ── L3 · La centrifugadora de palabras ──────────────────────── */
const labCambia = (f, d) => d.letra !== f.letra;
const labTieneCambio = f => f.derivadas.some(d => labCambia(f, d));
/* Qué se explica al acertar: hereda la letra (o, si la raíz no la lleva, tampoco la lleva) o por qué cambia */
const labPorque = (f, d) => (!labCambia(f, d) ? (f.letra.startsWith("sin ") ? `Como «${f.raiz}», se escribe ${f.letra}.` : `Hereda la ${f.letra} de «${f.raiz}».`) : d.porque);

/* Derivadas de cada familia según la lupa (primero las que están en la cola del alumno):
   bronce, dos que heredan la letra; plata, una que la hereda y otra que la cambia;
   oro, tres con los cambios delante; diamante, tres cualesquiera, en orden aleatorio */
function labDerivadas(f, n = nivelAca(), cuantas = LAB_FAM_RONDA[n - 1][1]) {
  const cola = estadoAca().cola;
  const enCola = (a, b) => (cola[b.p] ? 1 : 0) - (cola[a.p] ? 1 : 0);
  const ds = barajar(f.derivadas).sort(enCola);
  const cambia = d => labCambia(f, d);
  if (n === 1) {
    const her = ds.filter(d => !cambia(d));
    return (her.length >= cuantas ? her : ds).slice(0, cuantas);
  }
  if (n === 2) {
    const primera = ds[0];
    const segunda = ds.slice(1).find(d => cambia(d) !== cambia(primera)) || ds[1];
    return [primera, segunda].filter(Boolean).sort((a, b) => cambia(a) - cambia(b));
  }
  if (n === 3) return barajar([...ds].sort((a, b) => enCola(a, b) || cambia(b) - cambia(a)).slice(0, cuantas));
  return ds.slice(0, cuantas);
}
/* Familias de la ronda según la lupa */
function labFamRonda(fams, activas, mezcla) {
  const n = nivelAca(), [cuantas] = LAB_FAM_RONDA[n - 1];
  const deRegla = fams.filter(f => labDeRegla(f, activas));
  const elegir = (lista, k) => labElegir(lista, activas, mezcla, k, f => [f.raiz, ...f.derivadas.map(d => d.p)]);
  let elegidas;
  if (n === 1) elegidas = elegir(porNivel(deRegla.filter(f => f.derivadas.filter(d => !labCambia(f, d)).length >= 2), 2, 1), cuantas);
  else if (n === 2) {
    const cand = porNivel(deRegla, 3, 2);
    elegidas = elegir(cand.filter(f => labNv(f) === 2), cuantas - 1);           // sobre todo de nivel 2
    elegidas.push(...elegir(cand.filter(f => !elegidas.includes(f)), cuantas - elegidas.length));
    // Al menos una familia en la que la letra cambia (z → c, h → sin h…)
    const otra = !elegidas.some(labTieneCambio) && barajar(cand.filter(f => labTieneCambio(f) && !elegidas.includes(f)))[0];
    if (otra) elegidas[elegidas.length - 1] = otra;
  } else if (n === 3) {
    const cand = porNivel(deRegla, 3, 3);                            // nivel 2 y 3
    const fuertes = cand.filter(f => labTieneCambio(f) || labNv(f) === 3);
    elegidas = elegir(fuertes.length >= cuantas ? fuertes : cand, cuantas);
  } else {                                                           // nivel 3 (si faltan, también 2)
    elegidas = elegir(deRegla.filter(f => labNv(f) === 3), cuantas);
    elegidas.push(...elegir(porNivel(deRegla, cuantas, 3).filter(f => !elegidas.includes(f)), cuantas - elegidas.length));
  }
  return elegidas.map(f => ({ f, ders: labDerivadas(f, n) }));
}

nuevaActividad("laboratorio", {
  id: "familias", nombre: "La centrifugadora de palabras",
  desc: "Las familias heredan la letra… casi siempre. Descubre cuándo cambia.", reglas: LAB_FAM_REGLAS,
}, async function (sl, regla, turno) {
  let fams;
  try { fams = await labCargar("fam"); } catch { aviso("La centrifugadora no arranca: no se han podido cargar las familias.", "mal"); return; }
  const { activas, mezcla } = labActivas(regla, LAB_FAM_REGLAS);
  const plan = labFamRonda(fams, activas, mezcla);
  const diamante = nivelAca() === 4;     // sin letra destacada: se escribe la palabra directamente
  partidaAca(sl, mezcla ? [...new Set(plan.map(x => x.f.regla))] : activas);
  let k = 0;

  const pintar = () => {
    const pl = plan[k];
    if (!pl) return terminarActividad(sl, turno);
    const { f, ders } = pl;
    const reg = mezcla ? f.regla : activas[0];
    const tinte = LAB_TINTES[k % LAB_TINTES.length];
    // La raíz por piezas, con la letra dudosa marcada (en diamante, no)
    let ini = 0;
    const marcar = !diamante && !f.letra.startsWith("sin ");
    const piezas = f.piezas.map((pz, i) => {
      const a = ini; ini += pz.length;
      const dentro = marcar && f.pos >= a && f.pos < a + pz.length
        ? `${esc(pz.slice(0, f.pos - a))}<mark>${esc(pz.slice(f.pos - a, f.pos - a + f.letra.length))}</mark>${esc(pz.slice(f.pos - a + f.letra.length))}`
        : esc(pz);
      return `<span class="${i ? "lab-suelta" : "lab-tronco"}">${dentro}</span>`;
    }).join("");
    pintarEscena(`
      <h1 class="cartel titulo-escena">${esc(sl.nombre)}</h1>
      ${labInsignia()}
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
          <p class="lab-dice"><b>Mateo:</b> ${diamante ? "Nivel diamante: esta vez no te marco la letra dudosa. Tú escribes cada palabra de la familia entera." : "Las palabras de una familia comparten la raíz… y casi siempre heredan su ortografía. Casi. Vamos a comprobarlo."}</p>
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
        $("#labLectura").innerHTML = `Raíz: <b>${esc(tronco)}${f.piezas.length > 1 ? "-" : ""}</b> · letra a vigilar: <b>${diamante ? "¿?" : esc(f.letra)}</b>`;
        $("#labBase").innerHTML = `<div class="lab-gradilla">${ders.map((d, i) => `<div class="lab-probeta" data-i="${i}"><i class="lab-tubo"><b></b></i><span>?</span></div>`).join("")}</div>`;
        (diamante ? directa : probeta)(0);
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
        $("#msg").innerHTML = `<span class="lab-ok">✔ ${esc(labPorque(f, d))}</span>`;
        labLuego(1500, q, () => escribir(j));
      });
    };

    const escribir = j => {
      $("#labInstr").textContent = "Paso 2 · La muestra se ha evaporado: escribe la palabra entera.";
      $("#labMolde").classList.add("evaporada");
      $("#labLetras").outerHTML = `<div class="lab-escribe">${labInput("labResp", "Escribe la palabra de la familia")}<button class="boton-sello" id="labOk">Comprobar</button></div>`;
      $("#msg").textContent = "";
      comprobarEscrita(j);
    };

    /* Diamante: pista y frase, y la palabra se escribe entera, sin elegir antes la letra */
    const directa = j => {
      const d = ders[j];
      if (!d) return resumen();
      $$(".lab-probeta").forEach((p, i) => p.classList.toggle("activa", i === j));
      $("#labRotulo").textContent = `Familia de «${f.raiz}» · probeta ${j + 1} de ${ders.length}`;
      $("#labInstr").textContent = "Escribe la palabra de la familia. ¿Hereda la letra o cambia? Sin pistas.";
      $("#labTrabajo").innerHTML = `
        <p class="lab-pide">${esc(d.pista)}:</p>
        <p class="lab-contexto">${labHueco(labFraseDer(d))}</p>
        <div id="labMolde" hidden></div>
        <div class="lab-escribe">${labInput("labResp", "Escribe la palabra de la familia")}<button class="boton-sello" id="labOk">Comprobar</button></div>
        <p id="msg" class="msg"></p>`;
      comprobarEscrita(j);
    };

    const comprobarEscrita = j => {
      const d = ders[j];
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
        const porque = labPorque(f, d);
        $("#msg").outerHTML = `<div class="explicacion lab-explica">✔️ <b>${esc(d.p)}</b>: ${esc(porque[0].toLowerCase() + porque.slice(1))}</div>
          <div class="lab-acciones"><button class="flecha" id="labSig">${j + 1 < ders.length ? "Siguiente probeta" : "Ver la familia"} ▸</button></div>`;
        $("#labSig").onclick = () => (diamante ? directa : probeta)(j + 1);
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
