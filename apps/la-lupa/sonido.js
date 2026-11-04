/* ============================================================
   Agencia La Lupa · sonido
   Engancha el motor común (shared/sonido.js) al juego SIN tocar
   el resto del código: envuelve funciones globales del motor y
   escucha los cambios de clase que ya hacen las escenas y salas.
   Catálogo de puntos de sonido y decisiones: SONIDO.md
   Se carga el último (después de app.js).
   ============================================================ */
(function () {
  "use strict";
  if (typeof Sonido === "undefined") return;
  const q = new URLSearchParams(location.search);
  // Sin sonido para el jugador automático (Playwright) salvo que se pida con ?sonido
  if ((navigator.webdriver && !q.has("sonido")) || q.has("silencio")) return;

  Sonido.iniciar({ prefijo: "la-lupa", porDefecto: { musica: 0.4, efectos: 0.8 } });

  /* ── Lugar (fondo de la escena) → [música, ambiente de fondo] ── */
  const LUGARES = {
    "agencia": ["agencia", "agencia"],
    "agencia-saboteada": ["noche", "lluvia"],
    "fachada-agencia": ["noche", "calle"],
    "calle-alameda": ["amanecer", "patio"],
    "kiosco": ["noche", "calle"],
    "plaza-feria": ["feria", "mercado"],
    "feria-apagada": ["noche", "feria"],
    "caseta-feria": ["noche", "feria"],
    "casa-feria": ["noche", "interior"],
    "panaderia": ["amanecer", "interior"],
    "floristeria": ["amanecer", "patio"],
    "taller-ceramica": ["amanecer", "interior"],
    "plaza-azulejos": ["amanecer", "patio"],
    "mercado": ["noche", "mercado"],
    "almacen-mercado": ["tension", "interior"],
    "biblioteca": ["noche", "interior"],
    "conserjeria": ["noche", "interior"],
    "radio-alameda": ["agencia", "radio"],
    "azotea-radio": ["amanecer", "calle"],
    "centro-vecinal": ["noche", "interior"],
    "estudio-fotos": ["noche", "interior"],
    "redaccion-eco": ["agencia", "oficina"],
    "imprenta-eco": ["agencia", "imprenta"],
    // Academia
    "patio-academia": ["academia", "patio"],
    "sala-archivo": ["academia", "interior"],
    "sala-pupitre": ["academia", "interior"],
    "sala-laboratorio": ["academia", "interior"],
    "sala-interrogatorios": ["tension", "interior"],
    "sala-terminal": ["academia", "interior"],
    "sala-pizarra": ["academia", "interior"],
    "sala-imprenta": ["academia", "imprenta"],
    "sala-centralita": [null, null] // el dictado por radio necesita silencio
  };
  const POR_DEFECTO = ["agencia", "agencia"];
  let modo = "", fondoAnterior = null, escenaAnterior = null;

  function ambientePara(fondo) {
    let [musica, amb] = LUGARES[fondo] || POR_DEFECTO;
    if (modo === "inicio") [musica, amb] = ["noche", "calle"];
    if (modo === "informe") musica = "triunfo";
    const e = P && !P.academia && P.caso && P.caso.escenas ? P.caso.escenas[P.i] : null;
    if (e) {
      if (e.tipo === "careo" || e.tipo === "candado" || e.personaje?.id === "tachon") musica = "tension";
      if (e.tipo === "final") musica = "triunfo";
    }
    return [musica, amb, e];
  }

  /* ── Efectos con prioridad: en un mismo instante suena solo el más importante ── */
  let pendiente = null, programado = false, bloqueoHasta = 0;
  function sfx(nombre, prio = 1, opciones) {
    if (!pendiente || prio > pendiente.prio) pendiente = { nombre, prio, opciones };
    if (programado) return;
    programado = true;
    setTimeout(() => {
      const p = pendiente; pendiente = null; programado = false;
      if (!p) return;
      const ahora = performance.now();
      if (p.prio < 3 && ahora < bloqueoHasta) return; // tras un momento grande, nada pequeño encima
      if (p.prio >= 3) bloqueoHasta = ahora + 450;
      try { Sonido.efecto(p.nombre, p.opciones); } catch (e) { console.warn("Sonido:", e); }
    }, 0);
  }

  /* ── Envolver funciones del motor ── */
  const envolver = (nombre, antes, despues) => {
    const f = window[nombre]; if (typeof f !== "function") return;
    window[nombre] = function (...args) {
      try { antes?.(...args); } catch (e) { console.warn("Sonido:", e); }
      const r = f.apply(this, args);
      try { despues?.(r, ...args); } catch (e) { console.warn("Sonido:", e); }
      return r;
    };
  };

  // Cada pantalla pasa por aquí: decide la música y el fondo, y el sonido de cambiar de sitio
  envolver("pintarEscena", null, (r, html, opciones = {}) => {
    const fondo = opciones.fondo || null;
    const [musica, amb, e] = ambientePara(fondo);
    Sonido.contexto(musica, amb);
    if (fondo && fondoAnterior && fondo !== fondoAnterior) {
      const sala = f => /^sala-/.test(f);
      if (sala(fondo) || sala(fondoAnterior) || (fondoAnterior === "fachada-agencia" && fondo === "agencia")) sfx("puerta-abrir", 1);
      else if (e && e !== escenaAnterior) sfx("pasos", 1, { n: 3, vol: 0.7 });
    }
    fondoAnterior = fondo; escenaAnterior = e;
  });
  envolver("vistaInicio", () => { if (modo && modo !== "inicio") sfx("puerta-cerrar", 2); modo = "inicio"; });
  envolver("vistaTablon", () => { modo = "tablon"; });
  envolver("vistaEncargos", () => { modo = "encargos"; sfx("papel", 1); });
  envolver("vistaPatio", () => { modo = "academia"; });
  envolver("iniciarCaso", () => { modo = "caso"; });
  envolver("iniciarEncargo", () => { modo = "caso"; });
  envolver("vistaInforme", () => { modo = "informe"; sfx("caso-resuelto", 3); });
  envolver("vistaMaestro", () => { modo = "maestro"; fondoAnterior = null; Sonido.contexto(null, null); });

  // Texto que se escribe solo: tecleo de máquina de escribir y timbre al final
  envolver("maquina", null, (r, el, texto) => {
    if (!el || !texto || el.textContent.length >= texto.length) return; // movimiento reducido: sin tecleo
    let largo = 0;
    const t = setInterval(() => {
      if (!el.isConnected) return clearInterval(t);
      const s = el.textContent;
      if (el.classList.contains("completo") || s.length >= texto.length) { clearInterval(t); if (el.isConnected) Sonido.efecto("retorno", { vol: 0.6 }); return; }
      if (s.length > largo) { const c = s[s.length - 1]; Sonido.efecto(/\s/.test(c) ? "espacio" : "tecleo", { vol: 0.7, min: 0.05 }); largo = s.length; }
    }, 72);
  });

  // Momentos grandes (pantalla con título estampado)
  envolver("momento", null, (r, { titulo = "", tipo = "exito" } = {}) => {
    const t = titulo.toLowerCase();
    const nombre = t.includes("pista conseguida") ? "pista-conseguida"
      : t.includes("pista falsa") || tipo === "fallo" ? "pista-falsa"
      : t.includes("clic") ? "candado-abrir"
      : t.includes("cartas") ? "cartas-barajar"
      : t.includes("aclarada") ? "revelacion"
      : t.includes("entrenamiento") ? "entrenamiento"
      : "subir";
    sfx(nombre, 3);
  });
  envolver("abrirModal", null, (r, html, clase = "") => sfx(clase.includes("cartas") ? "cartas-barajar" : "ventana", 1));
  envolver("cerrarModal", () => { const m = document.getElementById("capaModal"); if (m && m.classList.contains("visible") && !m.querySelector(".momento")) sfx("ventana-cerrar", 1); });
  envolver("verLibreta", null, () => sfx("pagina", 2));
  envolver("verArchivo", null, () => sfx("cajon", 2));
  envolver("pedirPista", null, () => sfx("lupa", 2));
  // Sello del director: suena al estampar con el código correcto
  const sellarOriginal = window.sellar;
  if (typeof sellarOriginal === "function") window.sellar = (res, despues) => sellarOriginal(res, (...a) => { try { sfx("sello", 3); } catch (e) {} return despues?.(...a); });

  /* ── Lo que ya hacen las escenas y salas al marcar elementos ── */
  const POR_CLASE = {
    falsa: ["falsa-alarma", 2], sospechosa: ["falta-encontrada", 2],
    resuelta: ["acierto", 2], bien: ["acierto", 2], buena: ["acierto", 2], acierto: ["acierto", 2], arreglada: ["acierto", 2], corregido: ["acierto", 2],
    mal: ["fallo", 2], error: ["fallo", 2], sacude: ["fallo", 2],
    roto: ["precinto", 3], aprobada: ["sello", 3],
    tachada: ["tachar", 1], "tachada-tira": ["tachar", 1], borrando: ["borrador", 1], rodeada: ["tiza", 1],
    "ter-destello": ["ter-ok", 2], "ter-fallo": ["ter-error", 2], "imp-corregida": ["lapiz", 1], lleno: ["pop", 1], emitiendo: ["radio", 1]
  };
  const AL_APARECER = [[".sello-resuelto", "sello", 3, 350], [".imp-rotativa", "rotativa", 2, 0], [".imp-marca", "lapiz", 1, 0]];
  const observador = new MutationObserver(lista => { try { revisar(lista); } catch (e) { console.warn("Sonido:", e); } });
  const revisar = lista => {
    for (const m of lista) {
      if (m.type === "attributes") {
        const el = m.target; if (el.id === "toast" || el.id === "capaModal") continue;
        const antes = new Set((m.oldValue || "").split(/\s+/));
        for (const c of el.classList) {
          if (antes.has(c) || !POR_CLASE[c]) continue;
          let [nombre, prio] = POR_CLASE[c];
          if (c === "sacude" && el.closest(".panel-candado")) nombre = "candado-error";
          sfx(nombre, prio);
        }
      } else for (const n of m.addedNodes) {
        if (n.nodeType !== 1) continue;
        for (const [sel, nombre, prio, retraso] of AL_APARECER)
          if (n.matches(sel) || n.querySelector(sel)) setTimeout(() => sfx(nombre, prio, { dur: 2.2 }), retraso);
      }
    }
  };
  const escenario = document.getElementById("escenario");
  if (escenario) observador.observe(escenario, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"], attributeOldValue: true });

  /* ── Clics y teclas ── */
  document.addEventListener("click", ev => {
    const b = ev.target.closest?.("button, a, [role=button]"); if (!b || !b.closest("#escenario")) return;
    if (b.id === "abrir" && b.closest(".portada")) return sfx("expediente", 2);
    if (b.classList.contains("carta")) return sfx("carta", 1);
    if (b.classList.contains("rueda")) return;
    sfx("boton", 0);
  }, true);
  document.addEventListener("input", ev => { if (ev.target.classList?.contains("rueda")) sfx("candado-girar", 1); }, true);
  document.addEventListener("keydown", ev => {
    if (ev.key.length !== 1 && ev.key !== "Backspace") return;
    const t = ev.target; if (!t.closest?.("#escenario") || t.classList?.contains("rueda")) return;
    if (fondoAnterior === "sala-terminal") Sonido.efecto("ter-tecleo");
    else if (t.matches?.("input, textarea")) Sonido.efecto("tecla");
  }, true);

  /* ── Voz (Centralita, fichas, sismógrafo): la música se aparta mientras habla ── */
  if (typeof speechSynthesis !== "undefined") {
    let hablando = false;
    setInterval(() => { const h = speechSynthesis.speaking; if (h !== hablando) { hablando = h; Sonido.agachar(h); } }, 200);
  }

  /* ── Botón de sonido (abajo a la izquierda, fuera del escenario) ── */
  const css = document.createElement("style");
  css.textContent = `.snd-control{left:12px;right:auto;bottom:12px}.snd-control .snd-panel{left:0;right:auto}
  .snd-boton{--snd-fondo:#1d1712e0;--snd-tinta:#f1e4c8;width:40px;height:40px;line-height:40px;font-size:19px;border:1px solid #c9a96a66}
  .snd-panel{--snd-fondo:#241c15f5;--snd-tinta:#f1e4c8;--snd-acento:#c9a96a;font-family:'Special Elite',monospace}`;
  document.head.appendChild(css);
  Sonido.control();
})();
