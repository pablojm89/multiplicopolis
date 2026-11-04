/* ============================================================
   AGENCIA LA LUPA · escenas
   Una función por "tipo" de escena del JSON del caso. Cada una pinta la
   escena completa con pintarEscena() y llama a siguiente() al terminar.
   ============================================================ */
"use strict";

const ladoContrario = pj => (pj?.lado === "izq" ? "der" : "izq");
const hud = () => `<div class="hud">${htmlHUD()}</div>`;
const tituloEscena = e => (e.titulo ? `<h1 class="cartel titulo-escena">${esc(e.titulo)}</h1>` : "");
const instruccion = e => (e.instruccion ? `<p class="instruccion">${esc(e.instruccion)}</p>` : "");

/* Generador pseudoaleatorio con semilla: la misma colocación en cada partida */
function azar(semilla) {
  let h = 1779033703 ^ semilla.length;
  for (const c of semilla) h = Math.imul(h ^ c.charCodeAt(0), 3432918353);
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}

const ESCENAS = {
  /* Portada del expediente con precinto que hay que romper */
  portada(e) {
    pintarEscena(`
      <div class="portada">
        <div class="logo-agencia">AGENCIA <span>LA LUPA</span></div>
        <div class="expediente-cerrado">
          <div class="pestana">EXPEDIENTE ${esc(P.caso.numero)}</div>
          <h1 class="cartel">${esc(P.caso.titulo)}</h1>
          <p class="resumen maquina-fija">${esc(P.caso.resumen || "")}</p>
          <button class="precinto" id="precinto" aria-label="Romper el precinto">
            <span>PRECINTO · CONTIENE FALTAS DE ORTOGRAFÍA PELIGROSAS · NO ABRIR SIN LUPA · PRECINTO · CONTIENE FALTAS DE ORTOGRAFÍA PELIGROSAS</span>
          </button>
          <button class="boton-sello abrir" id="abrir" hidden>Abrir expediente ▸</button>
        </div>
        <p class="toca" id="toca">Toca el precinto para romperlo</p>
      </div>
      <button class="hud-volver" id="hudVolver2">◂ Tablón</button>`, { fondo: e.fondo, clase: "oscurecido" });
    $("#hudVolver2").onclick = vistaTablon;
    $("#precinto").onclick = () => {
      $("#precinto").classList.add("roto");
      $("#toca").hidden = true;
      setTimeout(() => { $("#abrir").hidden = false; $("#abrir").focus(); }, movimientoReducido() ? 0 : 650);
    };
    $("#abrir").onclick = siguiente;
  },

  /* Relato: personaje + bocadillo con texto que se escribe solo */
  relato(e) {
    const lado = ladoContrario(e.personaje);
    pintarEscena(`
      ${tituloEscena(e)}
      ${htmlObjeto(e.objeto, `objeto-escena ${lado}`)}
      ${htmlPersonaje(e.personaje)}
      <div class="bocadillo ${lado}">
        ${e.quien ? `<span class="quien">${esc(e.quien)}</span>` : ""}
        <p class="maquina" id="txt"></p>
        <button class="flecha" id="sig" hidden>Seguir ▸</button>
      </div>
      ${hud()}`, { fondo: e.fondo });
    activarHUD();
    $("#sig").onclick = siguiente;
    maquina($("#txt"), visible(e.texto), () => { $("#sig").hidden = false; $("#sig").focus(); });
  },

  /* Descubre la regla en el tablón de corcho de Mateo (criterio 9.1) */
  descubre(e) {
    let q = 0;
    const pintar = () => {
      const pr = e.preguntas[q];
      let primera = true;
      pintarEscena(`
        ${htmlPersonaje(e.personaje, "pequeno")}
        <div class="corcho">
          ${q === 0 && e.intro ? `<p class="nota-corcho">${esc(e.quien ? `${e.quien}: ` : "")}«${esc(e.intro)}»</p>` : ""}
          <div class="fichas-grupos">${pr.grupos.map(g => `
            <div class="ficha-grupo"><span class="chincheta"></span><small>${esc(g.titulo)}</small>
              <div>${g.palabras.map(w => `<span class="palabra-ficha">${esc(w)}</span>`).join("")}</div></div>`).join("")}</div>
          <h2 class="pregunta">${esc(pr.pregunta)}</h2>
          <div class="opciones">${pr.opciones.map((o, k) => `<button class="opcion" data-k="${k}">${esc(o)}</button>`).join("")}</div>
          <small class="contador-q">Ficha ${q + 1} de ${e.preguntas.length}</small>
        </div>
        ${hud()}`, { fondo: e.fondo });
      activarHUD();
      $$(".opcion").forEach(b => b.onclick = () => {
        const ok = Number(b.dataset.k) === pr.correcta;
        if (primera) { registrar("9.1", ok, null, "descubre la regla"); primera = false; }
        if (!ok) { b.classList.add("mal"); b.disabled = true; aviso("Mmm… eso no encaja con todas las palabras. Prueba otra.", "mal"); return; }
        $$(".opcion").forEach(x => (x.disabled = true));
        b.classList.add("bien");
        const ultima = q + 1 >= e.preguntas.length;
        momento({
          titulo: ultima ? "¡Regla descubierta!" : "¡Bien visto!", texto: pr.explicacion,
          personaje: { id: e.personaje?.id || "mateo", expresion: "contento", lado: "izq" },
          alSeguir: () => {
            q++;
            if (!ultima) return pintar();
            if (e.desbloquea === "cartas") P.cartas = true;
            momento({ titulo: "¡Cartas de reglas!", texto: "Mateo te da sus cartas de reglas. Están en tu libreta y te servirán como prueba en los careos.", personaje: { id: "mateo", expresion: "contento", lado: "izq" }, alSeguir: siguiente });
          },
        });
      });
    };
    pintar();
  },

  /* Papeles revueltos: encontrar las faltas camufladas; juntas forman la pista */
  papeles(e) {
    const rnd = azar(P.caso.id + P.i);
    const items = [
      ...e.palabras.map(p => ({ t: p, palabra: true })),
      ...e.faltas.map((f, n) => ({ t: f.mal, palabra: true, error: true, bien: f.bien, regla: f.regla || null, n })),
    ].map(x => ({ x, k: rnd() })).sort((a, b) => a.k - b.k).map(o => o.x);
    const cols = 5, celdaW = 236, celdaH = 92;
    const frase = !e.frase ? "" : esc(e.frase).replace(/\{(\d+)\}/g, (_, n) => `<span class="hueco" data-n="${n}">?</span>`);
    pintarEscena(`
      ${tituloEscena(e)}${instruccion(e)}
      <div class="mostrador" id="mostrador"></div>
      ${frase ? `<div class="tira-pista"><span class="etiqueta">PISTA</span> <span class="frase-pista">${frase}</span></div>` : `<p class="contador centro-abajo" id="cont"></p>`}
      ${hud()}`, { fondo: e.fondo });
    activarHUD();
    const ctx = {
      pendientes: e.faltas.length,
      onCambio: tk => {
        const h = $(`.hueco[data-n="${tk.n}"]`);
        if (h) { h.textContent = tk.bien; h.classList.add("lleno"); }
        if ($("#cont")) $("#cont").textContent = `Faltas corregidas: ${e.faltas.length - ctx.pendientes} de ${e.faltas.length}`;
      },
      onCompleto: () => setTimeout(() => recompensa(e), 700),
    };
    if ($("#cont")) $("#cont").textContent = `Faltas corregidas: 0 de ${e.faltas.length}`;
    items.forEach((tk, i) => {
      const b = botonPalabra(tk, ctx, "papel");
      const c = i % cols, f = Math.floor(i / cols);
      b.style.left = `${30 + c * celdaW + rnd() * 40}px`;
      b.style.top = `${f * celdaH + rnd() * 22}px`;
      b.style.setProperty("--giro", `${(rnd() * 14 - 7).toFixed(1)}deg`);
      b.style.fontSize = `${26 + Math.round(rnd() * 10)}px`;
      $("#mostrador").append(b);
    });
  },

  /* Caza del error en un documento (periódico, ficha, nota…): detectar y escribir bien (9.2 + 5.1) */
  caza(e) {
    const tokens = tokenizar(e.declaracion);
    const total = tokens.filter(t => t.error).length;
    pintarEscena(`
      ${tituloEscena(e)}${e.intro ? `<p class="instruccion">${esc(visible(e.intro))}</p>` : ""}
      ${htmlObjeto(e.objeto, "objeto-documento")}
      ${htmlPersonaje(e.personaje, "pequeno")}
      <article class="documento ${e.objeto ? "con-objeto" : ""}">
        ${e.quien ? `<small>${esc(e.quien)}</small>` : ""}
        <div id="decl"></div>
      </article>
      <p class="contador centro-abajo" id="cont"></p>
      ${hud()}`, { fondo: e.fondo, clase: "oscurecido" });
    activarHUD();
    const contador = () => ($("#cont").textContent = `Faltas corregidas: ${total - ctx.pendientes} de ${total}`);
    const ctx = { pendientes: total, conCarta: false, onCambio: contador, onCompleto: () => setTimeout(() => recompensa(e), 600) };
    $("#decl").append(textoInteractivo(tokens, ctx));
    contador();
  },

  /* Elegir la conclusión del caso */
  hipotesis(e) {
    pintarEscena(`
      ${tituloEscena(e)}
      <div class="hipotesis">${e.opciones.map((o, k) => `<button class="tira-maquina" data-k="${k}">${esc(o)}</button>`).join("")}</div>
      ${hud()}`, { fondo: e.fondo, clase: "oscurecido" });
    activarHUD();
    $$(".tira-maquina").forEach(b => b.onclick = () => {
      if (Number(b.dataset.k) !== e.correcta) { b.classList.add("tachada-tira"); pistaFalsa(e.fallo); return; }
      momento({ titulo: "¡Bien deducido!", texto: e.acierto, personaje: { id: "lola", expresion: "contento", lado: "izq" }, alSeguir: siguiente });
    });
  },

  /* Clasificar palabras en cubos (criterio 9.1) */
  clasifica(e) {
    let k = 0, primera = true;
    pintarEscena(`
      ${tituloEscena(e)}${instruccion(e)}
      <div class="etiqueta-colgante" id="actual"></div>
      <p class="msg centro" id="clMsg"></p>
      <div class="cubos">${e.categorias.map(c => `<button class="cubo" data-id="${esc(c.id)}"><span class="cubo-nombre">${esc(c.nombre)}</span><span class="dentro" id="cubo-${esc(c.id)}"></span></button>`).join("")}</div>
      ${hud()}`, { fondo: e.fondo });
    activarHUD();
    const pintarActual = () => {
      const w = e.palabras[k];
      primera = true;
      $("#actual").innerHTML = w ? `<small>Ramo ${k + 1} de ${e.palabras.length}</small><span>${esc(w.p)}</span>` : "<span>✔</span>";
    };
    $$(".cubo").forEach(b => b.onclick = () => {
      const w = e.palabras[k];
      if (!w) return;
      const ok = b.dataset.id === w.cat;
      if (primera) { registrar("9.1", ok, w.p, "clasificar"); primera = false; }
      if (!ok) {
        $("#clMsg").innerHTML = w.pista ? `No. ${esc(w.pista)}` : `No. Sepárala en sílabas: <strong>${esc(w.silabas)}</strong>. ¿Cuál suena más fuerte?`;
        b.classList.remove("sacude"); void b.offsetWidth; b.classList.add("sacude");
        return;
      }
      $("#clMsg").textContent = "";
      $(`#cubo-${w.cat}`).insertAdjacentHTML("beforeend", `<span class="flor">${esc(w.p)}</span>`);
      k++;
      pintarActual();
      if (k >= e.palabras.length) { $$(".cubo").forEach(x => (x.disabled = true)); setTimeout(() => recompensa(e), 600); }
    });
    pintarActual();
  },

  /* Manchas sobre la partitura: ¿hay tilde debajo? (criterio 5.1) */
  manchas(e) {
    const resp = {}, contadas = new Set(), resueltas = new Set();
    pintarEscena(`
      ${tituloEscena(e)}${instruccion(e)}
      <div class="partitura">${e.palabras.map((w, k) => `
        <div class="manchada" data-k="${k}">
          <span class="palabra-mancha">${[...w.p].map((ch, i) => (i === w.pos ? `<span class="bajo-mancha">${esc(quitarTilde(ch))}</span>` : esc(ch))).join("")}</span>
          <span class="si-no"><button data-v="1">Con tilde</button><button data-v="0">Sin tilde</button></span>
          <small class="expl"></small>
        </div>`).join("")}</div>
      <button class="boton-sello comprobar" id="comprobar">Comprobar</button>
      ${hud()}`, { fondo: e.fondo });
    activarHUD();
    $$(".manchada").forEach(caja => {
      const k = Number(caja.dataset.k);
      $$(".si-no button", caja).forEach(b => b.onclick = () => {
        resp[k] = b.dataset.v === "1";
        $$(".si-no button", caja).forEach(x => x.classList.toggle("activo", x === b));
      });
    });
    $("#comprobar").onclick = () => {
      if (e.palabras.some((_, k) => !resueltas.has(k) && resp[k] === undefined)) return aviso("Decide primero todas las palabras.");
      e.palabras.forEach((w, k) => {
        if (resueltas.has(k)) return;
        const caja = $(`.manchada[data-k="${k}"]`);
        const ok = resp[k] === llevaTilde(w.p, w.pos);
        if (!contadas.has(k)) { contadas.add(k); registrar("5.1", ok, w.p, "manchas"); }
        if (ok) {
          resueltas.add(k);
          caja.className = "manchada resuelta";
          $(".palabra-mancha", caja).textContent = w.p;
          $(".expl", caja).textContent = w.silabas;
        } else {
          caja.className = "manchada error";
          delete resp[k];
          $$(".si-no button", caja).forEach(x => x.classList.remove("activo"));
          $(".expl", caja).textContent = `Pista: ${w.silabas}`;
        }
      });
      if (resueltas.size === e.palabras.length) { $("#comprobar").remove(); setTimeout(() => recompensa(e), 700); }
      else aviso("Algunas no son correctas. Mira las pistas y vuelve a decidir.", "mal");
    };
  },

  /* Huecos: a cada palabra le falta una letra; el alumno elige cuál (5.1) */
  huecos(e) {
    const resp = {}, contadas = new Set(), resueltas = new Set();
    pintarEscena(`
      ${tituloEscena(e)}${instruccion(e)}
      <div class="partitura hoja-huecos">${e.palabras.map((w, k) => `
        <div class="manchada" data-k="${k}">
          <span class="palabra-mancha">${esc(w.p.slice(0, w.pos))}<span class="hueco-letra">?</span>${esc(w.p.slice(w.pos + w.letra.length))}</span>
          <span class="si-no">${w.opciones.map(o => `<button data-v="${esc(o)}">${esc(o || "sin letra")}</button>`).join("")}</span>
          <small class="expl"></small>
        </div>`).join("")}</div>
      <button class="boton-sello comprobar" id="comprobar">Comprobar</button>
      ${hud()}`, { fondo: e.fondo, clase: "oscurecido" });
    activarHUD();
    $$(".manchada").forEach(caja => {
      const k = Number(caja.dataset.k);
      $$(".si-no button", caja).forEach(b => b.onclick = () => {
        resp[k] = b.dataset.v;
        $$(".si-no button", caja).forEach(x => x.classList.toggle("activo", x === b));
      });
    });
    $("#comprobar").onclick = () => {
      if (e.palabras.some((_, k) => !resueltas.has(k) && resp[k] === undefined)) return aviso("Elige primero la letra de todas las palabras.");
      e.palabras.forEach((w, k) => {
        if (resueltas.has(k)) return;
        const caja = $(`.manchada[data-k="${k}"]`);
        const ok = resp[k] === w.letra;
        if (!contadas.has(k)) { contadas.add(k); registrar("5.1", ok, w.p, "huecos", w.regla); }
        if (ok) {
          resueltas.add(k);
          caja.className = "manchada resuelta";
          $(".palabra-mancha", caja).textContent = w.p;
          $(".expl", caja).textContent = w.pista || "";
        } else {
          caja.className = "manchada error";
          delete resp[k];
          $$(".si-no button", caja).forEach(x => x.classList.remove("activo"));
          $(".expl", caja).textContent = `Pista: ${w.pista || "fíjate en la regla"}`;
        }
      });
      if (resueltas.size === e.palabras.length) { $("#comprobar").remove(); setTimeout(() => recompensa(e), 700); }
      else aviso("Algunas no son correctas. Mira las pistas y vuelve a elegir.", "mal");
    };
  },

  /* Careo: señalar la falta, presentar la carta y corregir (9.2 + 9.1 + 5.1) */
  careo(e) {
    const tokens = tokenizar(e.declaracion);
    const total = tokens.filter(t => t.error).length;
    pintarEscena(`
      ${tituloEscena(e)}${instruccion(e)}
      ${htmlPersonaje(e.personaje)}
      <div class="bocadillo careo ${ladoContrario(e.personaje)}">
        <span class="quien">${esc(e.quien || "")}</span>
        <div id="decl"></div>
        <p class="contador" id="cont"></p>
      </div>
      ${hud()}`, { fondo: e.fondo });
    activarHUD();
    const contador = () => ($("#cont").textContent = `Faltas demostradas: ${total - ctx.pendientes} de ${total}`);
    const ctx = {
      pendientes: total, conCarta: true, onCambio: contador,
      onCompleto: () => setTimeout(() => momento({ titulo: "¡Declaración aclarada!", texto: e.aclarado || "La declaración ya no tiene faltas. Sigamos investigando.", personaje: { id: "lola", expresion: "contento", lado: "izq" }, alSeguir: siguiente }), 600),
    };
    $("#decl").append(textoInteractivo(tokens, ctx));
    contador();
  },

  /* Candado de cifras */
  candado(e) {
    pintarEscena(`
      ${tituloEscena(e)}${instruccion(e)}
      ${htmlObjeto(e.objeto, "objeto-candado")}
      <div class="panel-candado">
        <div class="ruedas">${[...e.codigo].map((_, k) => `<input class="rueda" maxlength="1" inputmode="numeric" aria-label="Cifra ${k + 1}" data-k="${k}">`).join("")}</div>
        <button class="boton-sello" id="abrir">Abrir</button>
        <p class="msg" id="cMsg"></p>
      </div>
      ${hud()}`, { fondo: e.fondo, clase: "oscurecido" });
    activarHUD();
    const ruedas = $$(".rueda");
    ruedas.forEach((r, k) => (r.oninput = () => { r.value = r.value.replace(/\D/g, "").slice(-1); if (r.value && ruedas[k + 1]) ruedas[k + 1].focus(); }));
    ruedas[0].focus();
    $("#abrir").onclick = () => {
      if (ruedas.map(r => r.value).join("") !== e.codigo) {
        $("#cMsg").textContent = "El candado no se abre. Mira las cifras de tu libreta y su orden.";
        $(".panel-candado").classList.remove("sacude"); void $(".panel-candado").offsetWidth; $(".panel-candado").classList.add("sacude");
        return;
      }
      momento({ titulo: "¡Clic!", texto: e.exito, personaje: { id: "lola", expresion: "sorprendido", lado: "izq" }, alSeguir: siguiente });
    };
  },

  /* Revisar el expediente: faltas sembradas en los textos del caso (9.2 + 5.1) */
  expediente(e) {
    const bloques = P.caso.escenas.slice(0, P.i).flatMap(x =>
      [x.texto, x.intro].filter(tieneFaltas).map(t => ({ etiqueta: x.quien || x.titulo || "Aviso", tokens: tokenizar(t) })));
    const errores = bloques.flatMap(b => b.tokens.filter(t => t.error));
    pintarEscena(`
      ${tituloEscena(e)}${instruccion(e)}
      ${htmlPersonaje(e.personaje, "pequeno")}
      <div class="carpeta-abierta"><div id="hojas"></div></div>
      <div class="pie-expediente"><span class="contador" id="cont"></span><button class="boton-sello" id="entregar">Archivar expediente</button></div>
      ${hud()}`, { fondo: e.fondo });
    activarHUD();
    const contador = () => ($("#cont").textContent = `Faltas corregidas: ${errores.length - ctx.pendientes} de ${errores.length}`);
    const ctx = { pendientes: errores.length, onCambio: contador, onCompleto: () => aviso("¡Expediente perfecto! Ya puedes archivarlo.", "bien") };
    bloques.forEach(b => {
      const hoja = document.createElement("article");
      hoja.className = "hoja";
      hoja.innerHTML = `<small>${esc(b.etiqueta)}</small>`;
      hoja.append(textoInteractivo(b.tokens, ctx));
      $("#hojas").append(hoja);
    });
    contador();
    $("#entregar").onclick = () => {
      const sinResolver = errores.filter(t => !t.resuelta);
      const archivar = () => {
        sinResolver.forEach(t => {
          if (!t.detectada) registrar("9.2", false, t.bien, "no encontrada");
          if (!t.intentada) registrar("5.1", false, t.bien, "sin corregir");
        });
        siguiente();
      };
      if (sinResolver.length) confirmar("Todavía quedan faltas en el expediente. ¿Archivarlo así?", archivar, "Archivar así");
      else archivar();
    };
  },

  /* Momento de libreta: el alumno apunta en su libreta de papel (o aquí, en modo digital) */
  apunta(e) {
    const digital = ajustes.libreta === "digital";
    pintarEscena(`
      ${tituloEscena(e)}
      ${htmlPersonaje(e.personaje)}
      <div class="hoja-libreta ${ladoContrario(e.personaje)}">
        <p class="apuntalo">📓 ${esc(e.cabecera || "Saca tu libreta de detective")}</p>
        <ol>${e.apuntar.map((x, k) => `<li>${esc(x)}${digital ? `<textarea class="nota-digital" data-k="${k}" rows="2" aria-label="${esc(x)}"></textarea>` : ""}</li>`).join("")}</ol>
        <button class="boton-sello" id="hecho">${digital ? "Guardar" : "Ya lo he apuntado"} ▸</button>
      </div>
      ${hud()}`, { fondo: e.fondo });
    activarHUD();
    $("#hecho").onclick = () => {
      if (digital) $$(".nota-digital").forEach(t => P.notas.push({ escena: P.i, pregunta: e.apuntar[t.dataset.k], respuesta: t.value.trim() }));
      siguiente();
    };
  },

  /* Cierre del caso */
  final(e) {
    pintarEscena(`
      <div class="final">
        <div class="sello-resuelto">${esc(e.sello || "¡CASO RESUELTO!")}</div>
        <div class="equipo">${(e.equipo || ["lola", "mateo", "pilar", "ramon"]).map(id => htmlPersonaje({ id, expresion: "contento", lado: "fila" })).join("")}</div>
        <p class="bocadillo-final maquina" id="txt"></p>
        <button class="boton-sello" id="informe" hidden>Ver mi informe ▸</button>
      </div>`, { fondo: e.fondo, clase: "oscurecido" });
    $("#informe").onclick = vistaInforme;
    maquina($("#txt"), visible(e.texto), () => { $("#informe").hidden = false; });
  },
};

function escenaDesconocida(e) {
  pintarEscena(`<div class="bocadillo izq"><p>Esta escena (“${esc(e.tipo)}”) todavía no existe en el motor.</p><button class="flecha" id="sig">Saltar ▸</button></div>`, { fondo: e.fondo });
  $("#sig").onclick = siguiente;
}
