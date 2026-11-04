/* ============================================================
   AGENCIA LA LUPA · Academia · La Pizarra · ejercicios extra
   Z3 · La coma que cambia el culpable (id «coma»). Don Anselmo escribe con
   tiza una frase sin signos que se puede leer de dos maneras («Vamos a comer,
   niños» / «Vamos a comer niños»). Por cada frase:
     1) Elige: el alumno escoge cuál de las dos situaciones (texto + emoji)
        quiere expresar;
     2) Puntúa: con la tiza de signos (, . ¿ ? ¡ !) toca los huecos entre
        palabras, también al principio y al final. Si se equivoca, se rodean
        en rosa los huecos que no cuadran; si su puntuación dice la OTRA
        lectura, Anselmo se lo hace ver. Al acertar, las dos versiones se
        comparan: la comparación es la explicación;
     3) Escribe: la pizarra se borra y la escribe entera de memoria.
   Registra 9.1 al puntuar y 5.1 al reescribir (regla mayusculas-puntuacion-1;
   sin palabra, para que una frase no entre en la cola de repaso de palabras).
   Reutiliza la escena de pizarra.js (pizEscena, pizDecir, pizBorrar, pizDibujar).
   Datos: datos/academia/comas.json (validador: herramientas/validar_comas.py).
   ============================================================ */
"use strict";

const COMA = { banco: null };
const COMA_RONDA = 4;
const COMA_REGLA = "mayusculas-puntuacion-1";
const COMA_SIGNOS = [",", ".", "¿", "?", "¡", "!"];
const COMA_ORDEN = ",.:?!¿¡";   // en un hueco, primero lo que cierra y después lo que abre: «Lola, ¿vienes?»
const COMA_PASOS = ["Elige", "Puntúa", "Escribe"];
const COMA_TIPO = {
  vocativo: "Coma de vocativo: separa el nombre de aquel a quien hablamos.",
  "si-no": "Cuando «sí» o «no» responden a una pregunta, llevan coma detrás.",
  pregunta: "Las preguntas llevan dos signos: ¿ al principio y ? al final. Lo que afirmamos se cierra con punto.",
  "pregunta-exclamacion": "Pregunta: ¿ y ?. Exclamación (sorpresa, alegría, susto): ¡ y !. Siempre dos signos, uno al principio y otro al final.",
  enumeracion: "Coma de enumeración: separa los elementos de una lista; el último se une con «y», sin coma.",
  inciso: "Un inciso (la explicación que añadimos en medio) va entre dos comas.",
};

const comaCanon = s => [...s].filter(c => COMA_ORDEN.includes(c)).sort((a, b) => COMA_ORDEN.indexOf(a) - COMA_ORDEN.indexOf(b)).join("");
/* Palabras y signos de cada hueco: antes de la primera palabra, entre palabras y después de la última */
function comaPartir(frase) {
  const t = String(frase).normalize("NFC");
  return { palabras: t.match(/[\p{L}\p{N}]+/gu) || [], huecos: t.split(/[\p{L}\p{N}]+/u).map(comaCanon) };
}
const comaIguales = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
/* Lo escrito, sin espacios de más (ni antes de , . ? ! ni después de ¿ ¡) */
const comaLimpia = s => String(s ?? "").normalize("NFC").replace(/[“”"]/g, "").trim().replace(/\s+/g, " ").replace(/\s+([,.:?!])/g, "$1").replace(/([¿¡])\s+/g, "$1");
const comaVer = h => esc(h.replace(/([,.:?!])(?=[¿¡])/, "$1 "));
const clavecoma = () => `coma-${perfil.id}`;

function comaHayVoz() {
  if (!hayVoz()) return false;
  try { return typeof cenBuscarVoz === "function" ? !!cenBuscarVoz() : speechSynthesis.getVoices().some(v => /^es/i.test(v.lang)); }
  catch { return false; }
}

/* Frases de la ronda: primero las que no ha visto, con tipos variados */
function comaElegir() {
  const vistas = new Set(cargar(clavecoma(), []));
  const orden = [...barajar(COMA.banco.filter(f => !vistas.has(f.id))), ...barajar(COMA.banco.filter(f => vistas.has(f.id)))];
  const elegidas = [], tipos = new Set();
  orden.forEach(f => { if (elegidas.length < COMA_RONDA && !tipos.has(f.tipo)) { elegidas.push(f); tipos.add(f.tipo); } });
  orden.forEach(f => { if (elegidas.length < COMA_RONDA && !elegidas.includes(f)) elegidas.push(f); });
  return elegidas.sort((a, b) => a.nivel - b.nivel);
}

nuevaActividad("pizarra", {
  id: "coma",
  nombre: "La coma que cambia el culpable",
  desc: "Una coma mal puesta y acusamos a quien no es. Puntúa la frase.",
  reglas: [COMA_REGLA],
  leccionFija: "Una coma mal puesta y acusamos a quien no es. Yo escribo frases sin un solo signo. Tú decides qué quieren decir, pones las comas, los puntos y los signos de pregunta y de exclamación… y después la escribes entera, de memoria. Atención: un signo de más o de menos y el ogro del cuento se come a los niños.",
}, async function (sl, _regla, turno) {
  try { COMA.banco ??= (await leerJSON("datos/academia/comas.json")).frases; }
  catch { aviso("No se ha podido abrir la pizarra. Prueba otra vez.", "mal"); return vistaPatio(); }
  const lista = comaElegir();
  const conVoz = comaHayVoz();
  partidaAca(sl, [COMA_REGLA]);
  pizEscena(sl, "La coma que cambia el culpable", { volver: () => confirmar("¿Volver al patio? Se perderá esta ronda.", vistaPatio, "Volver") });
  $("#pizTablero").classList.add("coma-tablero");
  let k = 0;

  const pasos = n => {
    $("#pizPasos").innerHTML = `<span class="coma-num">Frase ${k + 1} de ${lista.length}</span>` + COMA_PASOS.map((t, i) =>
      `<span class="${i + 1 < n ? "hecho" : i + 1 === n ? "actual" : ""}">${i + 1 < n ? "✓" : i + 1}. ${t}</span>`).join("");
  };

  const ronda = () => {
    const f = lista[k];
    if (!f) return terminarActividad(sl, turno);
    const { palabras } = comaPartir(f.lecturas[0].frase);
    const n = palabras.length;
    const sol = f.lecturas.map(l => [l.frase, ...(l.tambien || [])].map(x => comaPartir(x).huecos));
    const orden = barajar([0, 1]);   // las dos situaciones, en orden al azar
    let elegida = null;
    let huecos = Array(n + 1).fill("");

    /* La frase en la pizarra: cada palabra va pegada a su hueco de detrás (así no se separan al cambiar de línea) */
    const pintarFrase = (editable, clase = "") => {
      const hueco = i => `<button class="coma-hueco ${huecos[i] ? "lleno" : ""} ${clase}" data-g="${i}" ${editable ? "" : "disabled tabindex=\"-1\""}
        aria-label="${i === 0 ? "Antes de la primera palabra" : i === n ? "Después de la última palabra" : `Entre «${esc(palabras[i - 1])}» y «${esc(palabras[i])}»`}"><span>${comaVer(huecos[i])}</span></button>`;
      $("#pizCont").innerHTML = `<div class="coma-frase ${editable ? "editable" : ""}">${palabras.map((p, i) =>
        `<span class="coma-grupo">${i === 0 ? hueco(0) : ""}<span class="coma-w">${esc(p)}</span>${hueco(i + 1)}</span>`).join("")}</div>`;
      comaAjustar();
    };
    const tarjeta = (j, extra = "", cuerpo = "") => {
      const L = f.lecturas[j];
      return `<div class="coma-lectura ${extra}"><span class="coma-emoji" aria-hidden="true">${L.emoji}</span><span class="coma-sit">${cuerpo || esc(L.situacion)}</span></div>`;
    };

    /* 1 · Elegir lo que se quiere decir */
    const paso1 = () => {
      pasos(1);
      huecos = Array(n + 1).fill("");
      pintarFrase(false);
      pizDecir(k === 0
        ? "Esta frase no tiene ni un signo. Según dónde los pongas, dice una cosa… o la contraria. ¿Cuál de estas dos quieres decir tú?"
        : "Otra frase desnuda, sin un solo signo. ¿Qué quieres que diga esta vez?");
      $("#pizAcc").innerHTML = "";
      $("#pizZona").className = "piz-zona coma-zona";
      $("#pizZona").innerHTML = `<div class="coma-lecturas">${orden.map(j => `<button class="coma-lectura" data-j="${j}">
          <span class="coma-emoji" aria-hidden="true">${f.lecturas[j].emoji}</span><span class="coma-sit">${esc(f.lecturas[j].situacion)}</span><small>Quiero decir esto ▸</small></button>`).join("")}</div>`;
      $$(".coma-lecturas .coma-lectura").forEach(b => b.onclick = () => { elegida = Number(b.dataset.j); paso2(); });
    };

    /* 2 · Puntuar tocando los huecos */
    const paso2 = () => {
      pasos(2);
      const otra = 1 - elegida;
      let signo = ",", intentos = 0, cerrado = false;
      pintarFrase(true);
      pizDecir("Coge la tiza: elige un signo y toca entre las palabras para ponerlo (si lo vuelves a tocar, se borra). ¡No te olvides del principio ni del final!");
      $("#pizZona").innerHTML = `<div class="coma-puntuar">
          ${tarjeta(elegida, "elegida")}
          <div class="coma-paleta" role="group" aria-label="Tiza de signos">${COMA_SIGNOS.map(s => `<button class="coma-signo" data-s="${s}" aria-label="Signo ${s}">${s}</button>`).join("")}
            <button class="coma-signo esponja" data-s="" aria-label="Esponja: borra un hueco" title="Esponja: borra los signos de un hueco">🧽</button></div>
        </div>`;
      $(".coma-puntuar .coma-lectura").insertAdjacentHTML("beforeend", `<button class="coma-cambiar" id="comaCambiar">⇄ Cambiar</button>`);
      $("#comaCambiar").onclick = () => { if (!intentos) paso1(); };
      const marcarSigno = () => $$(".coma-signo").forEach(b => { b.classList.toggle("activo", b.dataset.s === signo); b.setAttribute("aria-pressed", b.dataset.s === signo); });
      marcarSigno();
      $$(".coma-signo").forEach(b => b.onclick = () => { signo = b.dataset.s; marcarSigno(); });
      const activar = () => $$(".coma-hueco").forEach(b => b.onclick = () => {
        if (cerrado) return;
        const g = Number(b.dataset.g);
        if (!signo) huecos[g] = "";
        else huecos[g] = huecos[g].includes(signo) ? huecos[g].replace(signo, "") : comaCanon(huecos[g] + signo);
        b.querySelector("span").innerHTML = comaVer(huecos[g]);
        b.classList.toggle("lleno", !!huecos[g]);
        $$(".coma-marca").forEach(m => m.remove());
      });
      activar();
      $("#pizAcc").innerHTML = `<button class="boton-sello" id="comaOk">Comprobar</button>`;
      $("#comaOk").onclick = () => {
        if (cerrado) return;
        if (!huecos.some(Boolean)) { pizDecir("La frase sigue desnuda: pon al menos el signo del final.", "pensativo"); return; }
        const acierto = sol[elegida].findIndex(s => comaIguales(s, huecos));
        const diceOtra = sol[otra].some(s => comaIguales(s, huecos));
        if (!intentos) registrar("9.1", acierto >= 0, null, `puntuar: ${f.lecturas[elegida].frase}`, COMA_REGLA);
        intentos++;
        $("#comaCambiar")?.remove();
        if (acierto >= 0) { cerrado = true; return comparar(acierto, true); }
        // ¿Qué huecos no cuadran? (frente a la solución más parecida)
        const cerca = sol[elegida].map(s => s.map((x, i) => (x === huecos[i] ? -1 : i)).filter(i => i >= 0)).sort((a, b) => a.length - b.length)[0];
        if (intentos < 2) {
          $$(".coma-marca").forEach(m => m.remove());
          cerca.forEach(i => pizDibujar($(`.coma-hueco[data-g="${i}"]`), pizTrazoCirculo, "circulo rosa coma-marca", [12, 8]));
          pizDecir(diceOtra
            ? `¡Alto! Con esos signos la frase dice lo otro: ${f.lecturas[otra].emoji} ${f.lecturas[otra].explicacion} Te rodeo en rosa lo que cambia.`
            : `Hay ${cerca.length} hueco${cerca.length > 1 ? "s" : ""} que no cuadra${cerca.length > 1 ? "n" : ""}: te ${cerca.length > 1 ? "los" : "lo"} rodeo en rosa. Pista: ${COMA_TIPO[f.tipo]}`, diceOtra ? "sorprendido" : "pensativo");
          return;
        }
        cerrado = true;
        huecos = [...sol[elegida][0]];
        pintarFrase(false, "solucion");
        cerca.forEach(i => pizDibujar($(`.coma-hueco[data-g="${i}"]`), pizTrazoCirculo, "circulo amarilla", [12, 8]));
        comparar(0, false);
      };
    };

    /* Las dos versiones, una al lado de la otra: la comparación es la explicación */
    const comparar = (variante, bien) => {
      const L = f.lecturas[elegida], O = f.lecturas[1 - elegida];
      const escrita = [L.frase, ...(L.tambien || [])][variante];
      if (bien) {
        huecos = [...sol[elegida][variante]];
        pintarFrase(false, "correcto");
      }
      pizDecir(bien ? `¡Eso es! ${COMA_TIPO[f.tipo]} Mira qué cambia con otros signos:` : `Te lo enseño en tiza amarilla. ${COMA_TIPO[f.tipo]} Compara las dos versiones:`, bien ? "contento" : "neutral");
      $("#pizZona").innerHTML = `<div class="coma-compara">
          ${tarjeta(elegida, "ver tuya", `<b>${esc(escrita)}</b><em>${esc(L.explicacion)}</em>`)}
          ${tarjeta(1 - elegida, "ver otra", `<b>${esc(O.frase)}</b><em>${esc(O.explicacion)}</em>`)}
        </div>`;
      if (conVoz) hablar(escrita);
      $("#pizAcc").innerHTML = `${conVoz ? `<button class="boton-papel" id="comaOir">🔊 Oírla</button>` : ""}<button class="flecha" id="comaSig">Escríbela ▸</button>`;
      $("#comaOir")?.addEventListener("click", () => hablar(escrita));
      $("#comaSig").onclick = paso3;
    };

    /* 3 · Escribirla entera, de memoria */
    const paso3 = () => {
      const L = f.lecturas[elegida];
      const validas = [L.frase, ...(L.tambien || [])];
      $("#pizAcc").innerHTML = "";
      $("#pizZona").innerHTML = `<div class="coma-puntuar solo">${tarjeta(elegida, "elegida")}</div>`;
      pizBorrar(() => {
        pasos(3);
        $("#pizCont").innerHTML = `<p class="coma-aviso">Escríbela entera, con sus mayúsculas y sus signos:</p>
          <input id="comaResp" class="piz-entrada frase coma-entrada" maxlength="80" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Escribe la frase bien puntuada">
          <p class="coma-modelo" id="comaModelo"></p>`;
        pizDecir("La he borrado. Ahora escríbela tú, de memoria. Si tu teclado no tiene ¿ o ¡, usa los botones de la derecha.");
        $("#pizAcc").innerHTML = `<div class="coma-ayudas"><button class="coma-signo mini" data-c="¿">¿</button><button class="coma-signo mini" data-c="¡">¡</button></div><button class="boton-sello" id="comaOk">Escribir</button>`;
        const inp = $("#comaResp");
        inp.focus();
        $$(".coma-ayudas button").forEach(b => b.onclick = () => {
          const a = inp.selectionStart ?? inp.value.length, z = inp.selectionEnd ?? a;
          inp.setRangeText(b.dataset.c, a, z, "end"); inp.focus();
        });
        let intentada = false, hecho = false;
        const comprobar = () => {
          if (hecho) return;
          const v = comaLimpia(inp.value);
          if (!v) return;
          const ok = validas.some(x => comaLimpia(x) === v);
          if (!intentada) { intentada = true; registrar("5.1", ok, null, `reescribir: ${L.frase}`, COMA_REGLA); }
          if (!ok) {
            const suyas = comaPartir(v).palabras;
            const sinTildes = a => a.map(w => quitarTildes(w.toLowerCase()));
            const diag = comaIguales(suyas, palabras) ? "Las palabras están perfectas: fallan los signos."
              : comaIguales(sinTildes(suyas), sinTildes(palabras)) ? "Revisa las mayúsculas y las tildes."
              : "Alguna palabra no está igual.";
            $("#comaModelo").innerHTML = `Se escribe: <b>${esc(L.frase)}</b>`;
            pizDecir(`Casi. ${diag} Te la dejo escrita debajo: cópiala tú, signo a signo.`, "pensativo");
            inp.value = ""; inp.focus();
            return;
          }
          hecho = true;
          $("#comaModelo").textContent = "";
          inp.replaceWith(Object.assign(document.createElement("span"), { className: "piz-escrito frase coma-escrita", textContent: v }));
          pizDibujar($(".coma-escrita"), pizTrazoCirculo, "circulo amarilla", [16, 8]);
          if (conVoz) hablar(v);
          const ultima = k === lista.length - 1;
          pizDecir(ultima ? "¡Impecable! Con signos así, nadie acusará a quien no es. Caso cerrado." : "¡Impecable! Cada signo en su sitio. Vamos con la siguiente.", "contento");
          $("#pizAcc").innerHTML = `<button class="flecha" id="comaSig">${ultima ? "Terminar" : "Siguiente frase"} ▸</button>`;
          $("#comaSig").onclick = () => {
            const vistas = new Set(cargar(clavecoma(), [])); vistas.add(f.id); guardar(clavecoma(), [...vistas]);
            k++;
            if (k >= lista.length) return terminarActividad(sl, turno);
            $("#pizAcc").innerHTML = ""; $("#pizZona").innerHTML = "";
            pizBorrar(ronda);
          };
        };
        $("#comaOk").onclick = comprobar;
        inp.onkeydown = ev => { if (ev.key === "Enter") { ev.preventDefault(); comprobar(); } };
      });
    };

    paso1();
  };
  ronda();
});

/* Si la frase no cabe en la pizarra, la tiza se hace más pequeña */
function comaAjustar() {
  const c = $("#pizCont"), fr = $(".coma-frase");
  if (!c || !fr) return;
  let tam = 46;
  fr.style.setProperty("--tam", `${tam}px`);
  while ((fr.offsetHeight > c.clientHeight - 16 || fr.scrollWidth > c.clientWidth) && tam > 24) { tam -= 2; fr.style.setProperty("--tam", `${tam}px`); }
}
