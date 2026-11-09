/* ============================================================
   AGENCIA LA LUPA · Academia · Sala 8: La Imprenta del Eco
   Actividad E3 «Pruebas de imprenta» (reglas mezcladas, intercalado).
   Aurora, la directora de «El Eco de La Alameda», pasa al alumno la galerada
   de un artículo: 4-5 faltas de reglas distintas de las 9 de 5.º. El alumno toca
   cada falta y la corrige (como en el Pupitre: pulsarPalabra + pedirCorreccion);
   en el margen se estampa la marca del corrector y se nombra la regla.
   Al terminar, la galerada se aprueba y sale limpia de la rotativa.
   Niveles (lupas del motor, nivelAca()): 🥉 galeradas cortas (nivel 1), 3 faltas muy visibles ·
   🥈 nivel 2, 4-5 faltas · 🥇 galeradas largas (nivel 2-3), 6 faltas y palabras «sospechosas» bien
   escritas que el aprendiz ha marcado con «?» (falsa alarma posible) · 💎 una galerada de las más
   largas (nivel 3), 7-8 faltas de reglas distintas y la hoja de correcciones boca abajo hasta el final.
   Datos: datos/academia/galeradas.json (validador: herramientas/validar_imprenta.py)
   ============================================================ */
"use strict";

Object.assign(sala("imprenta"), {
  activa: true,
  instructor: "aurora",
  actividad: "pruebas",
  gancho: "Corrige la galerada antes de que ruede la rotativa.",
  leccionFija: "Antes de que ruede la rotativa, el corrector revisa la galerada. Hoy, el corrector eres tú. En cada artículo se han colado unas cuantas faltas, y cada una es de una regla distinta: tildes, b y v, h, mayúsculas… todo mezclado, como en la calle. Con la lupa de bronce son tres y bien gordas; con la de diamante, ocho, y la hoja de correcciones se queda boca abajo hasta el final. Toca cada falta, escríbela bien y te diré qué regla has aplicado. Y cuidado con el lápiz rojo: si tachas una palabra que está bien escrita, mañana me escribe medio barrio.",
});

let GALERADAS = null;   // caché de datos/academia/galeradas.json
const IMP_MARCA = /\[([^\]|]+)\|([^\]|]+)(?:\|([^\]|]+))?\]/g;
const IMP_CORTA = {     // etiqueta de corrector para el margen
  "tildes-generales": "tilde", "b-v-1": "b/v", "h-1": "h", "c-z-s": "c/z/s", "ll-y": "ll/y",
  "g-j-dieresis": "g/j", "diptongo-monosilabos": "monosíl.", "d-z-finales": "-d/-z", "mayusculas-puntuacion-1": "mayúsc.",
};
const IMP_ANUNCIOS = [
  "Se busca gato naranja que responde al nombre de Bigotes (o al ruido de una lata de atún). Preguntar en la frutería.",
  "Clases de guitarra con Ramón. La primera es gratis; la paciencia de los vecinos de arriba, no.",
  "Biblioteca del barrio: devuelva sus libros a tiempo. Herminia lo apunta todo.",
  "Taller de Azucena: macetas un poco torcidas a mitad de precio. Las flores no se quejan.",
  "Panadería de Julián: pan recién hecho desde las seis. Los madrugadores se llevan el más crujiente.",
  "Frutas Manolo: lo más fresco del mercado. Sandías por encargo (con carretilla incluida).",
];
const IMP_BIEN = ["¡Cazada!", "¡Así me gusta!", "Una menos.", "¡Ojo de corrector!", "¡Limpia como una patena!"];
const IMP_FALSA = ["¡Quieto ese lápiz! Esa palabra está bien escrita.", "Esa no: si la tachas, la estropeamos nosotros.", "Falsa alarma. Respira y vuelve a leer."];
const IMP_MARGEN = 84;   // px de margen a cada lado de la galerada para las marcas
/* Qué trae cada lupa: galeradas por ronda, faltas por galerada, palabras «sospechosas» y si la hoja se ve */
const IMP_NIVELES = {
  1: { galeradas: 2, faltas: () => 3, sospechosas: 0, hoja: true, articulos: a => (a.nivel || 2) === 1, letra: 27 },
  2: { galeradas: 2, faltas: () => (Math.random() < .5 ? 4 : 5), sospechosas: 0, hoja: true, articulos: a => (a.nivel || 2) === 2, letra: 23 },
  3: { galeradas: 2, faltas: () => 6, sospechosas: 2, hoja: true, articulos: a => (a.nivel || 2) >= 2, letra: 22 },
  4: { galeradas: 1, faltas: () => (Math.random() < .5 ? 7 : 8), sospechosas: 2, hoja: false, articulos: a => (a.nivel || 2) === 3, letra: 21 },
};
/* Reglas cuyas faltas «se ven» de lejos (bronce): las tildes y los monosílabos, mejor para más adelante */
const IMP_VISIBLES = ["mayusculas-puntuacion-1", "h-1", "b-v-1", "ll-y", "g-j-dieresis", "c-z-s", "d-z-finales"];
const IMP_DUDA = ["Mi aprendiz ha marcado con «?» lo que le sonaba raro. Ojo: no todo lo marcado está mal.", "Las interrogaciones son del aprendiz. Unas son faltas; otras, falsas alarmas."];
const limpiarMarcas = t => t.replace(IMP_MARCA, (_, p) => p);
const mayusculaInicial = (modelo, x) => (modelo[0] !== modelo[0].toLowerCase() ? x[0].toUpperCase() + x.slice(1) : x);

async function cargarGaleradas() {
  if (!GALERADAS) GALERADAS = (await leerJSON("datos/academia/galeradas.json")).galeradas;
  return GALERADAS;
}

/* Candidatas de un artículo: forma correcta, regla y forma errónea (propia o del banco) */
function candidatasImprenta(art) {
  const out = [];
  art.parrafos.forEach((par, ip) => {
    for (const m of par.matchAll(IMP_MARCA)) {
      const w = enBanco(m[1]);
      // En las faltas de mayúscula, la forma errónea va tal cual (si no, «sevilla» volvería a ser «Sevilla»)
      const delBanco = w?.mal && w.regla === m[2] ? (m[2] === "mayusculas-puntuacion-1" ? w.mal : mayusculaInicial(m[1], w.mal)) : null;
      const mal = m[3] || delBanco;
      if (mal && mal !== m[1] && D.reglas[m[2]]) out.push({ clave: `${ip}:${m.index}`, p: m[1], regla: m[2], mal });
    }
  });
  return out;
}

/* Elige las faltas (de reglas distintas): primero las de la cola de repaso; después, reglas aún no vistas en la ronda.
   En bronce, las reglas que más se ven. Devuelve también las «sospechosas»: candidatas que se quedan bien escritas. */
function elegirFaltas(art, enCola, yaUsadas, cfg = IMP_NIVELES[nivelAca()]) {
  const cands = candidatasImprenta(art);
  const visible = c => (cfg === IMP_NIVELES[1] ? !IMP_VISIBLES.includes(c.regla) : 0);
  const deCola = barajar(cands.filter(c => enCola.has(norm(c.p)))).sort((a, b) => visible(a) - visible(b));
  const resto = barajar(cands.filter(c => !enCola.has(norm(c.p)))).sort((a, b) => visible(a) - visible(b) || yaUsadas.has(a.regla) - yaUsadas.has(b.regla));
  const n = cfg.faltas();
  const reglas = new Set(), elegidas = new Map();
  for (const c of [...deCola, ...resto]) {
    if (elegidas.size >= n) break;
    if (reglas.has(c.regla)) continue;
    reglas.add(c.regla);
    elegidas.set(c.clave, c);
  }
  const sospechosas = barajar(cands.filter(c => !elegidas.has(c.clave))).slice(0, cfg.sospechosas);
  return { elegidas, sospechosas: new Set(sospechosas.map(c => c.clave)) };
}

/* Prepara una galerada: párrafos con {mal|bien|regla} para tokenizar(), y en qué palabra (nº de orden en su párrafo)
   cae cada «?» del aprendiz: en las sospechosas y en alguna falta de verdad, para que el «?» no lo resuelva todo */
function prepararGalerada(art, { elegidas, sospechosas }) {
  const conDuda = new Set([...sospechosas, ...barajar([...elegidas.keys()]).slice(0, sospechosas.size ? Math.min(2, Math.ceil(sospechosas.size / 2) + (Math.random() < .5 ? 1 : 0)) : 0)]);
  const dudas = [];
  const parrafos = art.parrafos.map((par, ip) => {
    let out = "", visto = "", ultimo = 0;
    for (const m of par.matchAll(IMP_MARCA)) {
      const clave = `${ip}:${m.index}`, c = elegidas.get(clave);
      const antes = par.slice(ultimo, m.index);
      out += antes; visto += antes;
      if (conDuda.has(clave)) dudas.push({ ip, orden: (visto.match(/\p{L}+/gu) || []).length });
      out += c ? `{${c.mal}|${c.p}|${c.regla}}` : m[1];
      visto += c ? c.mal : m[1];
      ultimo = m.index + m[0].length;
    }
    return out + par.slice(ultimo);
  });
  return { art, parrafos, faltas: [...elegidas.values()], dudas };
}

/* Marca de corrector para el margen, según el tipo de cambio entre la forma mal escrita y la buena */
const IMP_DELEATUR = `<svg class="imp-dele" viewBox="0 0 26 26" aria-hidden="true"><path d="M3 21 C 7 9, 13 2, 16 7 C 19 12, 10 17, 9 11 C 8 6, 15 4, 23 3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`;
function marcaCorrector(mal, bien) {
  if (mal.toLowerCase() === bien.toLowerCase()) {
    const i = [...bien].findIndex((ch, k) => ch !== [...mal][k]);
    const letra = [...bien][i] || bien[0];
    return letra === letra.toUpperCase() ? `<span class="imp-tri">${esc(letra)}</span>/` : `<span class="imp-min">min.</span>/`;
  }
  let a = 0;
  while (a < mal.length && a < bien.length && mal[a] === bien[a]) a++;
  let z = 0;
  while (z < mal.length - a && z < bien.length - a && mal[mal.length - 1 - z] === bien[bien.length - 1 - z]) z++;
  const quita = mal.slice(a, mal.length - z), pone = bien.slice(a, bien.length - z);
  if (!pone) return `${IMP_DELEATUR}/`;                                       // sobra algo: deleátur
  if (quitarTildes(quita) === quitarTildes(pone) && quitarTildes(pone) === pone) return `<span class="imp-sin">${esc(pone)}</span>${IMP_DELEATUR}/`;  // sobra la tilde
  if (!quita) return `<span class="imp-ins">‸</span><b>${esc(pone)}</b>/`;      // falta algo: llamada de inserción
  return `<b>${esc(pone)}</b>/`;                                                // se cambia una letra
}

/* Fecha de la edición: «Miércoles, 4 de noviembre de 2026» */
function fechaEdicion() {
  try { const f = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); return f[0].toUpperCase() + f.slice(1); }
  catch { return ""; }
}

ACTIVIDADES.pruebas = async function (sl, _regla, turno) {
  let banco;
  try { banco = await cargarGaleradas(); } catch { aviso("No se ha podido abrir la imprenta. Inténtalo otra vez.", "mal"); return vistaPatio(); }
  const s = estadoAca();
  const enCola = new Set(Object.keys(s.cola).map(norm));
  const claveVistas = `imprenta-vistas-${perfil.id}`;
  const vistas = cargar(claveVistas, []);
  const nivel = nivelAca(), cfg = IMP_NIVELES[nivel], lupa = NIVELES_ACA[nivel - 1];
  // Artículos de la lupa: los que tienen palabras de la cola primero, y los de las últimas rondas al final.
  // En oro, mejor los largos; en diamante, de los más largos.
  const largo = a => a.parrafos.join(" ").length;
  const pool = banco.filter(cfg.articulos);
  const puntuar = a => candidatasImprenta(a).filter(c => enCola.has(norm(c.p))).length * 10 - (vistas.includes(a.id) ? 25 : 0) + (nivel === 4 ? largo(a) / 100 : 0) + (nivel === 3 && a.nivel === 3 ? 3 : 0) + Math.random() * 4;
  const arts = (pool.length >= cfg.galeradas ? pool : banco).slice().sort((a, b) => puntuar(b) - puntuar(a)).slice(0, cfg.galeradas);
  guardar(claveVistas, [...arts.map(a => a.id), ...vistas].slice(0, 8));
  const usadas = new Set();
  const galeradas = arts.map(a => { const g = prepararGalerada(a, elegirFaltas(a, enCola, usadas, cfg)); g.faltas.forEach(f => usadas.add(f.regla)); return g; });
  partidaAca(sl, [...usadas]);
  // Una palabra mal corregida vuelve en una ficha del Archivo: su pista es la frase del artículo, con hueco
  P.pistaDe = palabra => arts.flatMap(a => a.parrafos).map(par => pistaEnTexto(limpiarMarcas(par), palabra)).find(Boolean) || null;
  let r = 0;

  const pintar = () => {
    if (r >= galeradas.length) return terminarActividad(sl, turno);
    const g = galeradas[r], art = g.art;
    const total = g.faltas.length;
    pintarEscena(`
      <div class="imp-vade" aria-hidden="true"></div>
      <article class="imp-galerada n${nivel} ${nivel === 1 ? "imp-corta" : ""}" id="impGal">
        <span class="imp-reg tl"></span><span class="imp-reg tr"></span><span class="imp-reg bl"></span><span class="imp-reg br"></span>
        <header class="imp-tira"><span>Prueba de imprenta · Galerada ${r + 1} de ${galeradas.length}</span><span class="imp-lupa">${lupa.icono} ${esc(lupa.corto)}</span><span>Sección: ${esc(art.seccion)}</span><span>Corrector: ${esc(perfil.nombre)}</span></header>
        <div class="imp-cabecera"><small>Año XXIV · N.º ${1250 + r}</small><b>El Eco de La Alameda</b><small>Edición de la mañana</small></div>
        <p class="imp-seccion">${esc(art.seccion)}</p>
        <h2 class="imp-titular">${esc(art.titular)}</h2>
        <p class="imp-entradilla">${esc(art.entradilla)}</p>
        <div class="imp-cuerpo" id="impCuerpo"></div>
        <p class="imp-firma">${esc(art.firma)}</p>
        <div class="imp-sello" aria-hidden="true"><b>Aprobado</b><span>para imprenta</span></div>
      </article>
      <svg class="imp-lapiz" viewBox="0 0 320 34" aria-hidden="true">
        <polygon points="2,17 22,10 22,24" fill="#b3201b"/><polygon points="22,10 48,4 48,30 22,24" fill="#e9c79a"/>
        <rect x="48" y="4" width="132" height="26" fill="#c9302a"/><rect x="48" y="4" width="132" height="8" fill="#e2574f"/><rect x="48" y="22" width="132" height="8" fill="#9e221d"/>
        <rect x="180" y="4" width="92" height="26" fill="#2f5fa8"/><rect x="180" y="4" width="92" height="8" fill="#4d7cc4"/><rect x="180" y="22" width="92" height="8" fill="#22467e"/>
        <polygon points="272,4 298,10 298,24 272,30" fill="#e9c79a"/><polygon points="298,10 318,17 298,24" fill="#22467e"/>
      </svg>
      <aside class="imp-hoja ${cfg.hoja ? "" : "imp-tapada"}" id="impHoja">
        <h3>Hoja de correcciones</h3>
        ${cfg.hoja ? "" : `<p class="imp-boca-abajo">Boca abajo hasta que apruebes la galerada. Hoy, sin chuleta: cada regla, de memoria.</p>`}
        <p class="imp-cuenta" id="impCuenta"></p>
        <ol class="imp-lista" id="impLista"><li class="imp-vacio">Toca cada palabra mal escrita de la galerada y escríbela bien.</li></ol>
        <p class="imp-falsas" id="impFalsas"></p>
      </aside>
      <p class="imp-nota" id="impNota"></p>
      <div id="impAurora">${htmlPersonaje({ id: "aurora", expresion: "neutral", lado: "der" }, "imp-aurora")}</div>
      <button class="hud-volver imp-volver" id="acaVolver">◂ Patio</button>`, { fondo: sl.fondo, clase: "oscurecido sala-imp" });
    $("#acaVolver").onclick = () => confirmar("¿Volver al patio? Se perderá esta ronda.", vistaPatio, "Volver");

    const gal = $("#impGal");
    const btnDe = new Map();
    const tokensTodos = [];
    const ctx = { pendientes: total, conCarta: false, onCambio: tk => corregida(tk), onCompleto: () => setTimeout(aprobar, 700) };
    g.parrafos.forEach((par, ip) => {
      const tokens = tokenizar(par);
      const p = textoInteractivo(tokens, ctx);
      const botones = $$("button.w", p);
      tokens.filter(t => t.palabra).forEach((t, i) => btnDe.set(t, botones[i]));
      g.dudas.filter(d => d.ip === ip).forEach(d => botones[d.orden]?.classList.add("imp-duda"));
      tokensTodos.push(...tokens);
      $("#impCuerpo").append(p);
    });
    // La galerada tiene que caber entera: se baja la letra (y, si hace falta, el titular) hasta que quepa
    const cuerpo = $("#impCuerpo");
    // Antes de bajar la letra se aprietan el titular y el interlineado: así las palabras quedan más grandes (y se tocan mejor)
    // Caber es no salirse de la hoja y que la firma no quede debajo del lápiz de la mesa
    const lapiz = $(".imp-lapiz"), firma = $(".imp-firma", gal);
    const bajoLapiz = () => {
      const f = firma.getBoundingClientRect(), l = lapiz.getBoundingClientRect(), escala = gal.getBoundingClientRect().width / gal.offsetWidth || 1;
      return f.right > l.left && f.left < l.right && f.bottom > l.top + 12 * escala;
    };
    const cabe = () => gal.scrollHeight <= gal.clientHeight + 1 && !bajoLapiz();
    for (let letra = cfg.letra; letra >= 15; letra--) {
      cuerpo.style.setProperty("--imp-letra", `${letra}px`);
      if (cabe()) break;
      gal.classList.add("apretada");
      if (cabe()) break;
    }
    // En pantallas táctiles, un toque elige la palabra y otro la marca: con el dedo es fácil dar en la línea de al lado,
    // y tachar una palabra bien escrita cuenta como falsa alarma
    if (matchMedia("(pointer: coarse)").matches) {
      cuerpo.addEventListener("click", ev => {
        const b = ev.target.closest?.("button.w");
        if (!b || b.classList.contains("imp-elegida") || b.classList.contains("resuelta") || b.classList.contains("sospechosa")) return;
        ev.stopPropagation();
        $$(".imp-elegida", cuerpo).forEach(x => x.classList.remove("imp-elegida"));
        b.classList.add("imp-elegida");
        aviso(`«${b.textContent}»: toca otra vez para marcarla.`);
      }, true);
      cuerpo.addEventListener("click", () => $$(".imp-elegida", cuerpo).forEach(x => x.classList.remove("imp-elegida")));
    }

    const falsasAntes = P.eventos.filter(e => e.detalle === "falsa alarma").length;
    const falsas = () => P.eventos.filter(e => e.detalle === "falsa alarma").length - falsasAntes;
    let hechas = 0;
    const nota = (texto, expr = "neutral") => {
      $("#impNota").textContent = `Aurora: «${texto}»`;
      $("#impAurora").innerHTML = htmlPersonaje({ id: "aurora", expresion: expr, lado: "der" }, "imp-aurora");
    };
    const contar = () => {
      $("#impCuenta").innerHTML = `Faltas corregidas: <b>${hechas}</b> de ${total}`;
      $("#impFalsas").textContent = falsas() ? `Falsas alarmas: ${falsas()}` : "";
    };
    contar();
    nota(g.dudas.length ? azarElem(IMP_DUDA) : `${total} faltas, ${total} reglas distintas. La rotativa espera.`);

    // Falsas alarmas: Aurora reacciona (el registro lo hace pulsarPalabra)
    let previas = 0;
    $("#impCuerpo").addEventListener("click", () => setTimeout(() => {
      if (falsas() > previas) { previas = falsas(); nota(azarElem(IMP_FALSA), "sorprendido"); contar(); }
    }, 0));

    // Marcas en el margen: a la altura de la línea, en el margen de su columna
    const ocupados = {};
    function corregida(tk) {
      hechas++;
      const b = btnDe.get(tk);
      const nombre = D.reglas[tk.regla]?.nombre || tk.regla;
      b.dataset.n = hechas;
      b.classList.add("imp-corregida");
      const escala = gal.getBoundingClientRect().width / gal.offsetWidth || 1;
      const rg = gal.getBoundingClientRect(), rb = b.getBoundingClientRect();
      const y = (rb.top - rg.top) / escala, x = (rb.left + rb.width / 2 - rg.left) / escala;
      const lado = x < gal.offsetWidth / 2 ? "izq" : "der";
      const fila = `${lado}${Math.round(y / 10)}`;
      const m = document.createElement("span");
      m.className = `imp-marca ${lado}`;
      m.innerHTML = marcaCorrector(tk.t, tk.bien);
      m.title = `${tk.bien}: ${nombre}`;
      gal.append(m);
      // Varias marcas en la misma línea van una al lado de otra, hacia fuera (como en las pruebas de verdad)
      const ancho = m.offsetWidth + 4, usado = ocupados[fila] || 0;
      const cabe = usado + ancho <= IMP_MARGEN - 8;
      m.style.top = `${y - 4 + (cabe ? 0 : 16)}px`;
      m.style[lado === "izq" ? "right" : "left"] = `${gal.offsetWidth - IMP_MARGEN + 6 + (cabe ? usado : Math.max(0, IMP_MARGEN - ancho - 6))}px`;
      ocupados[fila] = cabe ? usado + ancho : usado;
      $(".imp-vacio")?.remove();
      $("#impLista").insertAdjacentHTML("beforeend", `<li><i>${hechas}</i><b>${esc(tk.bien)}</b><small>${esc(nombre)}</small></li>`);
      // Sin hoja (diamante), la regla no se dice hasta el final
      aviso(cfg.hoja ? `¡Bien! «${tk.bien}» · Regla: ${nombre}` : `¡Bien! «${tk.bien}»`, "bien");
      nota(`${azarElem(IMP_BIEN)} ${hechas < total ? `Quedan ${total - hechas}.` : "Galerada limpia."}`, "contento");
      contar();
    }

    // Galerada limpia: sello, rotativa y página impresa
    function aprobar() {
      if (!gal.isConnected) return;   // el alumno se ha ido al patio
      gal.classList.add("aprobada");
      $("#impHoja").classList.remove("imp-tapada");   // en diamante, la hoja se destapa ahora
      nota(hechas === total && !falsas() ? "¡Ni una falsa alarma! Esto sale tal cual." : "Aprobada. ¡A la rotativa!", "contento");
      const espera = movimientoReducido() ? 300 : cfg.hoja ? 1300 : 3200;
      setTimeout(imprimir, espera);
    }
    function imprimir() {
      if (!gal.isConnected) return;
      const cuerpo = art.parrafos.map(p => `<p>${esc(limpiarMarcas(p))}</p>`).join("");
      const ultima = r + 1 >= galeradas.length;
      const capa = document.createElement("div");
      capa.className = "imp-rotativa";
      capa.innerHTML = `
        <div class="imp-maquina" aria-hidden="true"><span class="imp-rodillo"></span><span class="imp-rodillo b"></span><span class="imp-tinta"></span></div>
        <div class="imp-salida"><article class="imp-impreso">
          <header><small>${esc(fechaEdicion())}</small><b>El Eco de La Alameda</b><small>Año XXIV · N.º ${1250 + r}</small></header>
          <p class="imp-seccion">${esc(art.seccion)}</p>
          <h2 class="imp-titular">${esc(art.titular)}</h2>
          <p class="imp-entradilla">${esc(art.entradilla)}</p>
          <div class="imp-texto">${cuerpo}<p class="imp-firma">${esc(art.firma)}</p></div>
          <aside class="imp-anuncio"><b>Anuncios por palabras</b>${esc(azarElem(IMP_ANUNCIOS))}</aside>
        </article></div>
        <div class="imp-pie">
          <p class="cartel">¡Impreso!</p>
          <p class="imp-pie-txt">${lupa.icono} ${esc(lupa.corto)} · ${hechas} faltas corregidas${falsas() ? ` · ${falsas()} falsa${falsas() > 1 ? "s" : ""} alarma${falsas() > 1 ? "s" : ""}` : " · sin falsas alarmas"}</p>
          <button class="flecha" id="impSig">${ultima ? "Cerrar la edición" : "Siguiente galerada"} ▸</button>
        </div>`;
      $("#escenario .capa").append(capa);
      $("#impSig").onclick = () => { r++; pintar(); };
    }
  };
  pintar();
};
