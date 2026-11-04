/* ============================================================
   Multiplicópolis · sonido
   Engancha el motor común (shared/sonido.js) sin tocar app.js:
   envuelve funciones globales y observa el estado de la página.
   Se carga el último (después de app.js).
   ============================================================ */
(function () {
  "use strict";
  if (typeof Sonido === "undefined") return;
  const q = new URLSearchParams(location.search);
  if ((navigator.webdriver && !q.has("sonido")) || q.has("silencio")) return;

  Sonido.iniciar({ prefijo: "multiplicopolis", porDefecto: { musica: 0.35, efectos: 0.8 } });

  const avisar = e => console.warn("Sonido:", e);
  const envolver = (nombre, antes, despues) => {
    const f = window[nombre]; if (typeof f !== "function") return;
    window[nombre] = function (...args) {
      let dato; try { dato = antes?.(...args); } catch (e) { avisar(e); }
      const r = f.apply(this, args);
      try { despues?.(dato, ...args); } catch (e) { avisar(e); }
      return r;
    };
  };
  const visible = sel => { const el = document.querySelector(sel); return !!el && !el.classList.contains("hidden"); };

  /* ── Música según lo que hay en pantalla ── */
  function actualizar() {
    try {
      const tranquilo = typeof settings !== "undefined" && settings.quiet;
      const jugando = document.body.classList.contains("playing") && typeof game !== "undefined" && game;
      const maestro = visible("#appShell") && document.querySelector("#view-teacher.active");
      let musica = "ciudad", bajar = false;
      if (jugando) {
        if (game.source === "exam") musica = null;          // examen: concentración
        else if (game.source === "boss") musica = "jefe";
        else bajar = true;                                  // practicando: la música queda de fondo
      }
      if (maestro || tranquilo) musica = null;
      Sonido.musica(musica); Sonido.agachar(bajar);
    } catch (e) { avisar(e); }
  }
  new MutationObserver(actualizar).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  ["renderApp", "showApp", "logout", "applySettings"].forEach(n => envolver(n, null, actualizar));

  /* ── Efectos del juego ── */
  envolver("startGame", null, () => { if (document.body.classList.contains("playing")) Sonido.efecto(game.source === "boss" ? "revelacion" : "empezar"); actualizar(); });
  envolver("feedback", null, (d, msg, ok) => Sonido.efecto(ok ? "acierto" : "fallo"));
  envolver("registerOutcome", null, (d, q, ok) => { if (ok && game && [3, 5, 10, 15, 20].includes(game.streak)) Sonido.efecto("racha", { nivel: game.streak, retraso: 0.25 }); });
  envolver("finishGame",
    () => { const s = activeStudent(); return s ? rankFor(s.xp).name : null; },
    rangoAntes => {
      const total = game.rounds, acc = Math.round(game.correct / total * 100), estrellas = acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 50 ? 1 : 0;
      if (game.source === "exam") Sonido.efecto("subir");
      else if (estrellas === 0) Sonido.efecto("animo");
      else for (let k = 0; k < estrellas; k++) Sonido.efecto("estrella", { retraso: 0.2 + k * 0.38, min: 0 });
      const s = activeStudent();
      if (s && rangoAntes && rankFor(s.xp).name !== rangoAntes) Sonido.efecto("nivel-arriba", { retraso: 1.5 });
    });
  envolver("badgeToast", null, (d, lista) => { if (lista && lista.length) Sonido.efecto("subir", { retraso: 0.9 }); });
  envolver("loginStudent", null, () => { if (visible("#appShell")) Sonido.efecto("seleccion"); });

  // Multiplicación en columna: cada cifra bien puesta
  new MutationObserver(lista => {
    for (const m of lista) {
      const el = m.target, antes = (m.oldValue || "").split(/\s+/);
      if (el.classList.contains("done") && !antes.includes("done")) Sonido.efecto("pop", { vol: 0.8 });
    }
  }).observe(document.getElementById("gameOverlay"), { subtree: true, attributes: true, attributeFilter: ["class"], attributeOldValue: true });

  // Botones, pestañas y teclas
  document.addEventListener("click", ev => {
    const b = ev.target.closest?.("button"); if (!b || b.closest(".snd-control")) return;
    if (b.classList.contains("option") || b.id === "checkBtn") return; // el resultado ya suena
    Sonido.efecto(b.classList.contains("tab") || b.classList.contains("teacher-nav") ? "clic" : "boton");
  }, true);
  document.addEventListener("keydown", ev => {
    if (!/^[0-9,.]$/.test(ev.key) && ev.key !== "Backspace") return;
    if (ev.target.matches?.("#gameOverlay input")) Sonido.efecto("tecla");
  }, true);

  Sonido.control();
  actualizar();
})();
