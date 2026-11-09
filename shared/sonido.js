/* ============================================================
   shared/sonido.js · Motor de sonido común de los juegos
   Todo se sintetiza con Web Audio: no hay archivos de audio,
   no hay licencias que cumplir y no pesa nada.

   API (todo es seguro de llamar aunque el navegador no tenga audio):
     Sonido.iniciar({prefijo})       prefijo de localStorage del juego ("la-lupa" → "la-lupa-sonido")
     Sonido.efecto(nombre, {vol,pan}) efecto puntual (ver Sonido.EFECTOS)
     Sonido.musica(nombre|null)      hilo musical con fundido (ver Sonido.MUSICAS)
     Sonido.fondo(nombre|null)       ambiente de fondo: capas continuas + sonidos que vuelven de vez en cuando (ver Sonido.FONDOS)
     Sonido.contexto(musica, fondo)  las dos cosas a la vez
     Sonido.agachar(true|false)      baja la música (p. ej. mientras habla una voz)
     Sonido.control(padre?, opts)    botón 🔊 con volumen de música y efectos (se guarda por dispositivo)
     Sonido.silenciar(bool) · Sonido.silenciado() · Sonido.volumen('musica'|'efectos', 0..1)

   Los navegadores no dejan sonar nada hasta el primer toque o tecla:
   lo pedido antes queda apuntado y empieza a sonar en ese momento.
   ============================================================ */
(function (global) {
  'use strict';

  const m2f = n => 440 * Math.pow(2, (n - 69) / 12);
  const azar = (a, b) => a + Math.random() * (b - a);
  const elige = arr => arr[Math.floor(Math.random() * arr.length)];

  let ctx = null, buses = null, ruidoBuf = null;
  let clave = 'sonido';
  const prefs = { silencio: false, musica: 0.45, efectos: 0.8 };
  const quiere = { musica: null, fondo: null };
  const activas = { musica: [], fondo: [] };
  let agachado = false, reloj = null, iniciado = false;
  const ultimoEfecto = {};

  /* ── Preferencias ─────────────────────────────────────────── */
  function cargarPrefs() { try { Object.assign(prefs, JSON.parse(localStorage.getItem(clave)) || {}); } catch (e) {} }
  function guardarPrefs() { try { localStorage.setItem(clave, JSON.stringify(prefs)); } catch (e) {} }

  /* ── Grafo de audio ───────────────────────────────────────── */
  function impulso(seg, caida) {
    const n = Math.floor(ctx.sampleRate * seg), b = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, caida);
    }
    return b;
  }
  function bus(destino, volumen, segRev) {
    const vol = ctx.createGain(); vol.gain.value = volumen; vol.connect(destino);
    const entrada = ctx.createGain(); entrada.connect(vol);
    const conv = ctx.createConvolver(); conv.buffer = impulso(segRev, 2.4);
    const rev = ctx.createGain(); rev.connect(conv); conv.connect(vol);
    return { vol, entrada, rev };
  }
  const volFondo = v => v > 0 ? Math.min(1.6, 0.4 + v * 1.8) : 0;
  function crearContexto() {
    if (ctx) return ctx;
    const AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC({ latencyHint: 'interactive' }); } catch (e) { ctx = new AC(); }
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.25;
    comp.connect(ctx.destination);
    const maestro = ctx.createGain(); maestro.gain.value = prefs.silencio ? 0 : 1; maestro.connect(comp);
    const agache = ctx.createGain(); agache.gain.value = 1; agache.connect(maestro);
    buses = {
      maestro, agache,
      musica: bus(agache, prefs.musica, 2.6),
      fondo: bus(maestro, volFondo(prefs.musica), 2.2),
      efectos: bus(maestro, prefs.efectos, 1.3)
    };
    const n = ctx.sampleRate * 2; ruidoBuf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = ruidoBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    reloj = setInterval(tic, 40);
    return ctx;
  }

  /* ── Piezas básicas ───────────────────────────────────────── */
  // Un "destino" es {entrada, rev}: un bus o una pieza de música/fondo con su propio fundido.
  function salida(dest, rev, pan) {
    const g = ctx.createGain(); let n = g;
    if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); g.connect(p); n = p; }
    n.connect(dest.entrada);
    if (rev > 0) { const s = ctx.createGain(); s.gain.value = rev; n.connect(s); s.connect(dest.rev); }
    return g;
  }
  function osc(tipo, f, t, fin) { const o = ctx.createOscillator(); o.type = tipo; o.frequency.setValueAtTime(f, t); o.start(t); o.stop(fin); return o; }
  function ruido(t, fin) { const s = ctx.createBufferSource(); s.buffer = ruidoBuf; s.loop = true; s.start(t, Math.random() * 1.5); s.stop(fin); return s; }
  function filtro(tipo, f, q) { const b = ctx.createBiquadFilter(); b.type = tipo; b.frequency.value = f; if (q != null) b.Q.value = q; return b; }
  // Golpe con caída exponencial (pulsaciones, campanas, golpes).
  function golpe(g, t, vol, ataque, caida) { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + ataque); g.gain.setTargetAtTime(0.0001, t + ataque, caida); }

  // Tono simple: {f, f2 (glide), tipo, vol, a, c (caída), dur, rev, pan, lp}
  function tono(dest, t, o) {
    const dur = o.dur || (o.c || 0.2) * 6, fin = t + dur + 0.05;
    const g = salida(dest, o.rev || 0, o.pan || 0);
    const v = osc(o.tipo || 'sine', o.f, t, fin);
    if (o.f2) v.frequency.exponentialRampToValueAtTime(o.f2, t + (o.glide || dur * 0.8));
    if (o.vib) { const l = osc('sine', o.vib[0], t, fin), lg = ctx.createGain(); lg.gain.value = o.vib[1]; l.connect(lg); lg.connect(v.frequency); }
    let n = v; if (o.lp) { const f = filtro('lowpass', o.lp, o.q || 0.7); v.connect(f); n = f; }
    n.connect(g); golpe(g, t, o.vol || 0.2, o.a || 0.005, o.c || 0.2);
    return g;
  }
  // Ráfaga de ruido filtrado: {vol, a, c, dur, tipo (filtro), f, f2, q, rev, pan}
  function soplo(dest, t, o) {
    const dur = o.dur || 0.2, fin = t + dur + (o.c || 0.05) * 6 + 0.05;
    const g = salida(dest, o.rev || 0, o.pan || 0), s = ruido(t, fin), f = filtro(o.tipo || 'bandpass', o.f || 2000, o.q != null ? o.q : 1);
    if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + dur);
    s.connect(f); f.connect(g);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(o.vol || 0.2, t + (o.a || 0.003));
    if (o.mantener) g.gain.setValueAtTime(o.vol || 0.2, t + dur);
    g.gain.setTargetAtTime(0.0001, o.mantener ? t + dur : t + (o.a || 0.003), o.c || dur / 3);
    return g;
  }

  /* ── Instrumentos de la música ────────────────────────────── */
  const INS = {
    // Piano eléctrico (FM suave): los acordes de la agencia
    rhodes(d, t, n, vol, dur) {
      const f = m2f(n), fin = t + dur * 3 + 0.6, g = salida(d, 0.35, azar(-0.25, 0.25));
      const c = osc('sine', f, t, fin), mod = osc('sine', f, t, fin), mg = ctx.createGain();
      mg.gain.setValueAtTime(f * 1.4, t); mg.gain.setTargetAtTime(f * 0.08, t, 0.25); mod.connect(mg); mg.connect(c.frequency);
      c.connect(g); golpe(g, t, vol, 0.008, dur * 0.55);
      const tine = osc('sine', f * 4.01, t, t + 0.4), tg = ctx.createGain(); tine.connect(tg); tg.connect(g); golpe(tg, t, 0.25, 0.002, 0.05);
    },
    bajo(d, t, n, vol, dur) {
      const f = m2f(n), fin = t + dur + 0.6, g = salida(d, 0.08, 0), lp = filtro('lowpass', 900, 0.8);
      lp.frequency.setValueAtTime(1400, t); lp.frequency.setTargetAtTime(380, t, 0.08);
      osc('triangle', f, t, fin).connect(lp); osc('sine', f, t, fin).connect(lp); lp.connect(g);
      golpe(g, t, vol, 0.006, Math.min(0.35, dur * 0.6));
    },
    vibrafono(d, t, n, vol) {
      const f = m2f(n), fin = t + 3, g = salida(d, 0.5, azar(-0.4, 0.4)), trem = ctx.createGain();
      const lfo = osc('sine', 5.2, t, fin), lg = ctx.createGain(); lg.gain.value = 0.25; lfo.connect(lg); lg.connect(trem.gain); trem.gain.value = 0.75;
      osc('sine', f, t, fin).connect(trem); trem.connect(g); golpe(g, t, vol, 0.004, 0.7);
      const ar = osc('sine', f * 4, t, t + 0.5), ag = ctx.createGain(); ar.connect(ag); ag.connect(g); golpe(ag, t, 0.18, 0.002, 0.06);
    },
    celesta(d, t, n, vol) {
      const f = m2f(n), fin = t + 2.5, g = salida(d, 0.6, azar(-0.5, 0.5));
      osc('sine', f, t, fin).connect(g);
      const p = osc('sine', f * 2.76, t, t + 0.8), pg = ctx.createGain(); p.connect(pg); pg.connect(g); golpe(pg, t, 0.35, 0.002, 0.12);
      golpe(g, t, vol, 0.003, 0.5);
    },
    caja(d, t, n, vol) { // caja de música, un pelín desafinada
      const f = m2f(n) * azar(0.996, 1.003), fin = t + 2, g = salida(d, 0.55, azar(-0.3, 0.3));
      osc('sine', f, t, fin).connect(g);
      const p = osc('sine', f * 3.01, t, t + 0.4), pg = ctx.createGain(); p.connect(pg); pg.connect(g); golpe(pg, t, 0.3, 0.001, 0.05);
      golpe(g, t, vol, 0.002, 0.32);
    },
    pizz(d, t, n, vol) {
      const f = m2f(n), fin = t + 0.6, g = salida(d, 0.3, azar(-0.3, 0.3)), lp = filtro('lowpass', 2200, 1);
      lp.frequency.setTargetAtTime(600, t, 0.06);
      osc('triangle', f, t, fin).connect(lp); osc('sawtooth', f * 1.003, t, fin).connect(lp); lp.connect(g);
      golpe(g, t, vol, 0.003, 0.09);
    },
    pad(d, t, notas, vol, dur) {
      const fin = t + dur + 3.5, g = salida(d, 0.7, 0), lp = filtro('lowpass', 900, 0.5);
      notas.forEach((n, i) => { [-7, 7].forEach(cent => { const o = osc('sawtooth', m2f(n), t, fin); o.detune.value = cent + azar(-2, 2); o.connect(lp); }); });
      const lfo = osc('sine', 0.13, t, fin), lg = ctx.createGain(); lg.gain.value = 250; lfo.connect(lg); lg.connect(lp.frequency);
      lp.connect(g);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol / notas.length, t + Math.min(2.5, dur * 0.4));
      g.gain.setValueAtTime(vol / notas.length, t + dur); g.gain.setTargetAtTime(0.0001, t + dur, 0.9);
    },
    escobilla(d, t, vol) { soplo(d, t, { tipo: 'bandpass', f: 3500, q: 0.6, vol, a: 0.03, c: 0.08, dur: 0.12, rev: 0.1, pan: 0.2 }); },
    charles(d, t, vol) { soplo(d, t, { tipo: 'highpass', f: 7000, q: 0.5, vol, a: 0.001, c: 0.025, dur: 0.03, pan: -0.25 }); },
    chasquido(d, t, vol) { soplo(d, t, { tipo: 'bandpass', f: 1900, q: 3, vol, a: 0.001, c: 0.02, dur: 0.02, rev: 0.4, pan: 0.35 }); },
    madera(d, t, vol, f) { tono(d, t, { f: f || 1250, vol, a: 0.001, c: 0.03, dur: 0.12, rev: 0.25 }); tono(d, t, { f: (f || 1250) * 2.3, vol: vol * 0.4, a: 0.001, c: 0.012, dur: 0.06 }); },
    timbal(d, t, vol) { tono(d, t, { f: 78, f2: 42, glide: 0.5, vol, a: 0.003, c: 0.5, dur: 2, rev: 0.6, lp: 300 }); soplo(d, t, { tipo: 'lowpass', f: 400, vol: vol * 0.4, c: 0.08, dur: 0.1, rev: 0.4 }); }
  };

  /* ── Hilo musical ─────────────────────────────────────────────
     Cada música: {bpm, swing, pasos (por compás), crear() → paso(i, t, d, dest)}
     i = semicorchea global (o corchea en el vals), t = instante, d = duración del paso */
  const AC = { // acordes: [bajo, ...voces]
    Dm9: [38, 53, 57, 60, 64], Bbmaj7: [34, 57, 62, 65], Gm9: [43, 58, 62, 65, 69], A7b9: [45, 55, 58, 61, 65],
    Dm: [38, 57, 62, 65], Gm: [43, 58, 62, 67], A7: [45, 55, 61, 64]
  };
  function motivo(escala, notas) { // frase de 16 semicorcheas con silencios, siempre nueva
    const r = Array(16).fill(null); let pos = 0, idx = Math.floor(escala.length / 2);
    while (pos < 16) {
      if (Math.random() < 0.62) { idx = Math.max(0, Math.min(escala.length - 1, idx + elige([-2, -1, -1, 1, 1, 2, 0]))); r[pos] = escala[idx]; }
      pos += elige([2, 2, 2, 4, 3, 1]);
    }
    return notas ? r.map(n => n == null ? null : n) : r;
  }

  const MUSICAS = {
    // Oficina de la agencia: jazz de cine negro, lento y con escobillas
    agencia: { nombre: 'Agencia (jazz de cine negro)', nivel: 0.8, bpm: 74, swing: 1, pasos: 16, crear() {
      const prog = [AC.Dm9, AC.Bbmaj7, AC.Gm9, AC.A7b9], escala = [62, 65, 67, 69, 72, 74, 77, 79];
      let frase = motivo(escala), frase2 = motivo(escala);
      return (i, t, d, D) => {
        const compas = Math.floor(i / 16), p = i % 16, ac = prog[compas % 4], sig = prog[(compas + 1) % 4];
        if (p === 0) ac.slice(1).forEach((n, k) => INS.rhodes(D, t + k * 0.012, n, 0.075, d * 14));
        if (p === 6 && Math.random() < 0.35) ac.slice(1).forEach(n => INS.rhodes(D, t, n, 0.04, d * 2));
        if (p % 4 === 0) { // bajo que camina
          const b = p / 4, raiz = ac[0];
          const n = b === 0 ? raiz : b === 1 ? raiz + elige([7, 3, 4]) : b === 2 ? raiz + elige([12, 10, 7]) : sig[0] + elige([-1, 1]);
          INS.bajo(D, t, n, 0.32, d * 4);
        }
        if (p === 4 || p === 12) INS.escobilla(D, t, 0.05);
        if (p % 2 === 0) INS.charles(D, t, p % 4 === 2 ? 0.022 : 0.012);
        const bloque = Math.floor(compas / 2) % 4; // dos compases de melodía, dos de respiro
        if (bloque === 0 || bloque === 2) {
          const n = (bloque === 0 ? frase : frase2)[p]; if (n && compas % 2 === 0) INS.vibrafono(D, t, n, 0.09);
          if (n && compas % 2 === 1 && Math.random() < 0.5) INS.vibrafono(D, t, n - 12 + 12, 0.06);
        }
        if (p === 0 && compas % 16 === 15) { frase = motivo(escala); frase2 = motivo(escala); }
      };
    } },
    // Calle de noche: sin ritmo, colchón oscuro y una celesta que deja caer notas
    noche: { nombre: 'Calle de noche (misterio)', nivel: 2.2, bpm: 60, swing: 0, pasos: 16, crear() {
      const prog = [[50, 57, 64, 65], [46, 57, 62, 64], [43, 55, 58, 62], [45, 52, 57, 61]], esc = [74, 76, 77, 79, 81, 82, 85, 86];
      return (i, t, d, D) => {
        const p = i % 32, ac = prog[Math.floor(i / 32) % 4];
        if (p === 0) { INS.pad(D, t, ac.slice(1), 0.12, d * 30); INS.bajo(D, t, ac[0] - 12, 0.18, d * 24); if (Math.random() < 0.35) INS.timbal(D, t, 0.22); }
        if (p % 4 === 0 && Math.random() < 0.32) INS.celesta(D, t + azar(0, 0.05), elige(esc), azar(0.05, 0.09));
        if (p === 20 && Math.random() < 0.5) INS.celesta(D, t, ac[1] + 24, 0.05);
      };
    } },
    // Careo, candado, momento de la verdad: ostinato grave y reloj
    tension: { nombre: 'Tensión (careo y candado)', nivel: 1.4, bpm: 88, swing: 0, pasos: 16, crear() {
      const ost = [38, 38, 50, 38, 39, 38, 50, 38];
      return (i, t, d, D) => {
        const compas = Math.floor(i / 16), p = i % 16, sube = Math.floor(compas / 4) % 2;
        if (p % 2 === 0) INS.pizz(D, t, ost[(p / 2) % 8] + sube, p === 0 ? 0.2 : 0.13);
        if (p % 4 === 0) INS.madera(D, t, p === 0 ? 0.05 : 0.035, p === 0 ? 1100 : 1400);
        if (p === 0 && compas % 4 === 0) INS.pad(D, t, sube ? [51, 57, 63] : [50, 56, 62], 0.09, d * 60);
        if (p === 0 && compas % 2 === 0) INS.timbal(D, t, 0.25);
        if (p === 14 && compas % 4 === 3) INS.celesta(D, t, 86 + sube, 0.05);
      };
    } },
    // Academia: pizzicato de detective, curioso y con chasquidos de dedos
    academia: { nombre: 'Academia (pizzicato curioso)', nivel: 1.5, bpm: 104, swing: 0.5, pasos: 16, crear() {
      const _ = null, M = {
        Dm: [62, _, 65, _, 69, _, 68, 69, _, _, 65, _, 62, _, _, _], Gm: [67, _, 70, _, 74, _, 73, 74, _, _, 70, _, 67, _, _, _],
        A7: [69, _, 73, _, 76, _, 79, _, 76, _, 73, _, 70, _, 69, _], Fin: [74, _, _, _, 69, _, _, _, 62, _, _, _, _, _, _, _]
      };
      const prog = ['Dm', 'Gm', 'Dm', 'A7'], bajos = { Dm: [38, 45], Gm: [43, 50], A7: [45, 52] };
      return (i, t, d, D) => {
        const compas = Math.floor(i / 16), p = i % 16, nom = prog[compas % 4], vuelta = Math.floor(compas / 4) % 2;
        if (p % 4 === 0) INS.pizz(D, t, bajos[nom][(p / 4) % 2] - 12, 0.22);
        if (p === 4 || p === 12) INS.chasquido(D, t, 0.12);
        if (p % 2 === 0) INS.charles(D, t, 0.01);
        if (vuelta === 0) { const n = (compas % 4 === 3 && compas % 8 === 7 ? M.Fin : M[nom])[p]; if (n) INS.pizz(D, t, n, 0.12); }
        else if (p % 4 === 0 && Math.random() < 0.45) INS.celesta(D, t, AC[nom][1 + (p / 4) % 3] + 12, 0.06);
      };
    } },
    // Feria y mercado de noche: vals de caja de música
    feria: { nombre: 'Feria (vals de caja de música)', bpm: 132, swing: 0, pasos: 6, subdiv: 2, crear() {
      const mel = [[76, 81, 84], [83, 80, 76], [81, 84, 83, 81], [86, 77], [76, 81, 84], [86, 83, 80], [81, 76, 72], [69]];
      const pos = [[0, 2, 4], [0, 2, 4], [0, 2, 3, 4], [0, 4], [0, 2, 4], [0, 2, 4], [0, 2, 4], [0]];
      const ac = [[45, 57, 60, 64], [40, 56, 59, 62], [45, 57, 60, 64], [38, 57, 62, 65], [45, 57, 60, 64], [40, 56, 59, 62], [45, 57, 60, 64], [45, 57, 60, 64]];
      return (i, t, d, D) => {
        const compas = Math.floor(i / 6) % 8, p = i % 6, a = ac[compas];
        const k = pos[compas].indexOf(p); if (k >= 0) INS.caja(D, t + azar(0, 0.012), mel[compas][k], 0.11);
        if (p === 0) INS.bajo(D, t, a[0], 0.2, d * 2);
        if (p === 2 || p === 4) a.slice(2).forEach(n => INS.caja(D, t, n - 12, 0.03));
      };
    } },
    // Lugares de día o cálidos (amanecer, panadería, taller, plaza por la tarde): suave, sin batería
    amanecer: { nombre: 'Amanecer (suave y cálido)', nivel: 1.3, bpm: 66, swing: 0, pasos: 16, crear() {
      const prog = [[41, 57, 60, 64, 67], [43, 59, 62, 65, 69], [45, 57, 60, 64, 67], [43, 58, 62, 65, 69]], esc = [72, 74, 76, 79, 81, 84];
      return (i, t, d, D) => {
        const compas = Math.floor(i / 16), p = i % 16, ac = prog[compas % 4];
        if (p === 0) { ac.slice(1).forEach((n, k) => INS.rhodes(D, t + k * 0.04, n, 0.06, d * 14)); INS.bajo(D, t, ac[0], 0.22, d * 12); }
        if (p === 8 && Math.random() < 0.6) INS.rhodes(D, t, ac[2] + 12, 0.035, d * 6);
        if (p % 4 === 2 && Math.random() < 0.28) INS.celesta(D, t, elige(esc), 0.05);
      };
    } },
    // Multiplicópolis: ciudad alegre, marimba y pizzicato en Do mayor
    ciudad: { nombre: 'Ciudad alegre (Multiplicópolis)', nivel: 1.2, bpm: 112, swing: 0.25, pasos: 16, crear() {
      const _ = null, prog = [[48, 64, 67, 72], [45, 64, 69, 72], [41, 65, 69, 72], [43, 62, 67, 71]];
      const M = [[76, _, 79, _, 84, _, 79, _, 81, _, 79, _, 76, _, _, _], [76, _, 77, _, 79, _, 81, _, 79, _, 76, _, 72, _, _, _],
        [77, _, 81, _, 84, _, 81, _, 79, _, 77, _, 76, _, 74, _], [74, _, 76, _, 77, _, 79, _, 74, _, _, _, 71, _, _, _]];
      return (i, t, d, D) => {
        const compas = Math.floor(i / 16), p = i % 16, ac = prog[compas % 4], vuelta = Math.floor(compas / 4) % 2;
        if (p % 4 === 0) INS.bajo(D, t, ac[0] + (p === 8 ? 7 : 0), 0.26, d * 2);
        if (p === 4 || p === 12) ac.slice(1).forEach(n => INS.pizz(D, t, n, 0.06));
        if (p === 4 || p === 12) INS.chasquido(D, t, 0.08);
        if (p % 2 === 0) INS.charles(D, t, 0.012);
        const n = M[compas % 4][p];
        if (n && vuelta === 0) INS.vibrafono(D, t, n, 0.08);
        else if (n && vuelta === 1 && p % 4 === 0) INS.celesta(D, t, n + 12, 0.06);
      };
    } },
    // Jefe final de Multiplicópolis: épico y con tambores, sin dar miedo
    jefe: { nombre: 'Jefe final (épico)', nivel: 1.2, bpm: 126, swing: 0, pasos: 16, crear() {
      const prog = [[45, 57, 60, 64], [41, 57, 60, 65], [43, 55, 59, 62], [40, 56, 59, 64]];
      return (i, t, d, D) => {
        const compas = Math.floor(i / 16), p = i % 16, ac = prog[compas % 4];
        if (p % 2 === 0) INS.pizz(D, t, ac[0] - (p % 4 === 0 ? 0 : -12), p % 4 === 0 ? 0.2 : 0.12);
        if (p === 0 || p === 6 || p === 10) INS.timbal(D, t, 0.22);
        if (p === 4 || p === 12) soplo(D, t, { tipo: 'bandpass', f: 1800, q: 0.7, vol: 0.1, a: 0.001, c: 0.06, dur: 0.08, rev: 0.3 });
        if (p === 0) INS.pad(D, t, ac.slice(1), 0.1, d * 15);
        if (p % 4 === 2 && compas % 2 === 1) INS.vibrafono(D, t, ac[1 + (p / 4 | 0) % 3] + 12, 0.07);
      };
    } },
    // Caso resuelto, informe: cálido y luminoso
    triunfo: { nombre: 'Caso resuelto (cálido)', bpm: 84, swing: 0.6, pasos: 16, crear() {
      const prog = [[41, 57, 60, 64, 69], [45, 55, 60, 64, 67], [46, 57, 62, 65, 69], [48, 58, 62, 65, 67]];
      return (i, t, d, D) => {
        const compas = Math.floor(i / 16), p = i % 16, ac = prog[compas % 4];
        if (p === 0) ac.slice(1).forEach((n, k) => INS.rhodes(D, t + k * 0.015, n, 0.07, d * 14));
        if (p === 0 || p === 8) INS.bajo(D, t, ac[0] + (p === 8 ? 7 : 0), 0.3, d * 8);
        if (p % 2 === 0) { const arp = ac.slice(1).concat(ac.slice(2).map(n => n + 12)); INS.vibrafono(D, t, arp[(p / 2) % arp.length] + 12, p % 4 === 0 ? 0.07 : 0.045); }
        if (p === 4 || p === 12) INS.escobilla(D, t, 0.045);
      };
    } }
  };

  /* ── Efectos ─────────────────────────────────────────────── */
  function pisada(D, t, vol, pan, rev) {
    tono(D, t, { f: 95, f2: 55, glide: 0.08, vol: vol * 0.9, a: 0.004, c: 0.05, dur: 0.18, lp: 400, pan, rev });
    soplo(D, t, { tipo: 'lowpass', f: 700, q: 0.7, vol: vol * 0.7, a: 0.002, c: 0.03, dur: 0.05, pan, rev });
    soplo(D, t + 0.06, { tipo: 'bandpass', f: 1800, q: 1.2, vol: vol * 0.22, a: 0.01, c: 0.04, dur: 0.07, pan, rev });
  }
  function campana(D, t, f, vol, rev, dur) {
    [[0.5, 0.6], [1, 1], [1.19, 0.45], [1.56, 0.35], [2, 0.3], [2.51, 0.18], [3.01, 0.12]].forEach(([r, a]) =>
      tono(D, t, { f: f * r, vol: vol * a, a: 0.002, c: (dur || 1.5) / (r + 0.5), dur: (dur || 1.5) * 3, rev, lp: 5000 }));
  }
  function crujido(D, t, dur, vol, f0) {
    const fin = t + dur + 0.2, g = salida(D, 0.35, azar(-0.3, 0.3));
    const s = osc('sawtooth', f0 || 140, t, fin), lfo = osc('square', azar(9, 14), t, fin), lg = ctx.createGain(); lg.gain.value = 25; lfo.connect(lg); lg.connect(s.frequency);
    s.frequency.setValueAtTime(f0 || 140, t);
    for (let k = 0; k < 6; k++) s.frequency.linearRampToValueAtTime((f0 || 140) * azar(0.8, 1.5), t + dur * (k + 1) / 6);
    const b1 = filtro('bandpass', 1100, 7), b2 = filtro('bandpass', 2300, 9); s.connect(b1); s.connect(b2); b1.connect(g); b2.connect(g);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.08); g.gain.setValueAtTime(vol, t + dur * 0.8); g.gain.linearRampToValueAtTime(0.0001, t + dur);
  }

  // Cada efecto: (D = destino, t = instante, v = volumen relativo, o = opciones)
  const EFECTOS = {
    // Máquina de escribir y teclado
    tecleo(D, t, v, o) { const p = o.pan != null ? o.pan : azar(-0.15, 0.15);
      soplo(D, t, { tipo: 'bandpass', f: azar(2600, 4200), q: 1.4, vol: 0.32 * v, a: 0.001, c: 0.008, dur: 0.012, pan: p, rev: 0.08 });
      tono(D, t, { f: azar(170, 230), vol: 0.22 * v, a: 0.001, c: 0.018, dur: 0.06, pan: p, lp: 900 }); },
    espacio(D, t, v) { soplo(D, t, { tipo: 'bandpass', f: 1500, q: 1, vol: 0.25 * v, a: 0.001, c: 0.012, dur: 0.02 }); tono(D, t, { f: 120, vol: 0.2 * v, c: 0.03, dur: 0.08, lp: 600 }); },
    retorno(D, t, v) { for (let k = 0; k < 7; k++) soplo(D, t + k * 0.028, { tipo: 'bandpass', f: 3000, q: 2, vol: 0.12 * v, a: 0.001, c: 0.006, dur: 0.01 });
      campana(D, t + 0.22, 1975, 0.12 * v, 0.2, 0.25); },
    tecla(D, t, v) { soplo(D, t, { tipo: 'bandpass', f: 5000, q: 2, vol: 0.18 * v, a: 0.001, c: 0.005, dur: 0.008 }); tono(D, t, { f: 520, vol: 0.06 * v, c: 0.01, dur: 0.04 }); },
    // Interfaz
    clic(D, t, v) { tono(D, t, { f: 1700, f2: 900, glide: 0.02, vol: 0.14 * v, a: 0.001, c: 0.012, dur: 0.05 }); soplo(D, t, { tipo: 'highpass', f: 4000, vol: 0.08 * v, c: 0.004, dur: 0.006 }); },
    boton(D, t, v) { tono(D, t, { f: 640, f2: 380, glide: 0.04, tipo: 'triangle', vol: 0.18 * v, a: 0.002, c: 0.03, dur: 0.1, lp: 2500, rev: 0.1 }); },
    seleccion(D, t, v) { tono(D, t, { f: 880, vol: 0.09 * v, c: 0.05, dur: 0.15, rev: 0.25 }); tono(D, t + 0.045, { f: 1320, vol: 0.07 * v, c: 0.06, dur: 0.2, rev: 0.3 }); },
    ventana(D, t, v) { soplo(D, t, { tipo: 'bandpass', f: 400, f2: 2200, q: 1.2, vol: 0.12 * v, a: 0.08, c: 0.06, dur: 0.22, rev: 0.2 }); EFECTOS.papel(D, t + 0.12, v * 0.5, {}); },
    'ventana-cerrar'(D, t, v) { soplo(D, t, { tipo: 'bandpass', f: 2000, f2: 350, q: 1.2, vol: 0.1 * v, a: 0.05, c: 0.05, dur: 0.18, rev: 0.15 }); },
    // Papel, libreta, expediente
    papel(D, t, v) { for (let k = 0; k < 4; k++) soplo(D, t + k * azar(0.03, 0.06), { tipo: 'bandpass', f: azar(1500, 4500), q: 0.8, vol: azar(0.06, 0.12) * v, a: 0.01, c: 0.03, dur: 0.05, pan: azar(-0.3, 0.3), rev: 0.1 }); },
    pagina(D, t, v) { soplo(D, t, { tipo: 'bandpass', f: 900, f2: 3800, q: 0.7, vol: 0.14 * v, a: 0.12, c: 0.1, dur: 0.32, rev: 0.12 }); soplo(D, t + 0.3, { tipo: 'lowpass', f: 900, vol: 0.12 * v, c: 0.02, dur: 0.03 }); },
    lapiz(D, t, v, o) { const n = Math.round((o.dur || 0.5) / 0.07); for (let k = 0; k < n; k++) soplo(D, t + k * 0.07 + azar(0, 0.02), { tipo: 'bandpass', f: azar(2800, 4200), q: 3, vol: azar(0.04, 0.08) * v, a: 0.015, c: 0.025, dur: 0.05 }); },
    precinto(D, t, v) { // cinta de "no pasar" que se rasga
      let tt = t; for (let k = 0; k < 34; k++) { tt += 0.03 * Math.pow(0.95, k) + 0.004; soplo(D, tt, { tipo: 'bandpass', f: azar(1800, 6000), q: 1.5, vol: azar(0.05, 0.13) * v, a: 0.001, c: 0.006, dur: 0.008, pan: -0.5 + k / 34 }); }
      soplo(D, t, { tipo: 'bandpass', f: 1200, f2: 4000, q: 0.6, vol: 0.08 * v, a: 0.2, c: 0.05, dur: tt - t, rev: 0.1 }); },
    sello(D, t, v) { tono(D, t, { f: 110, f2: 45, glide: 0.1, vol: 0.5 * v, a: 0.002, c: 0.07, dur: 0.3, lp: 500, rev: 0.25 });
      soplo(D, t, { tipo: 'lowpass', f: 1500, vol: 0.35 * v, a: 0.001, c: 0.025, dur: 0.04, rev: 0.25 }); EFECTOS.papel(D, t + 0.09, v * 0.4, {}); },
    cajon(D, t, v) { soplo(D, t, { tipo: 'lowpass', f: 500, f2: 900, q: 2, vol: 0.18 * v, a: 0.05, c: 0.05, dur: 0.35, mantener: true }); tono(D, t + 0.38, { f: 140, f2: 80, vol: 0.3 * v, c: 0.05, dur: 0.2, lp: 500, rev: 0.2 }); },
    // Cerraduras, candados, puertas
    'candado-clic'(D, t, v) { soplo(D, t, { tipo: 'highpass', f: 3500, vol: 0.2 * v, a: 0.001, c: 0.004, dur: 0.006 });
      tono(D, t, { f: 3150, vol: 0.06 * v, c: 0.03, dur: 0.1 }); tono(D, t, { f: 4720, vol: 0.04 * v, c: 0.02, dur: 0.08 }); tono(D, t, { f: 260, vol: 0.12 * v, c: 0.015, dur: 0.05, lp: 1000 }); },
    'candado-girar'(D, t, v) { for (let k = 0; k < 3; k++) soplo(D, t + k * 0.035, { tipo: 'bandpass', f: 4200, q: 4, vol: 0.09 * v, a: 0.001, c: 0.004, dur: 0.005 }); },
    'candado-abrir'(D, t, v) { [0, 0.11, 0.2].forEach((dt, k) => EFECTOS['candado-clic'](D, t + dt, v * (0.7 + k * 0.15), {}));
      tono(D, t + 0.32, { f: 150, f2: 70, vol: 0.4 * v, a: 0.002, c: 0.06, dur: 0.3, lp: 600, rev: 0.3 }); soplo(D, t + 0.32, { tipo: 'bandpass', f: 2500, q: 2, vol: 0.2 * v, c: 0.01, dur: 0.02 });
      tono(D, t + 0.34, { f: 1480, vol: 0.06 * v, c: 0.25, dur: 1, vib: [7, 9], rev: 0.4 }); },
    'candado-error'(D, t, v) { [0, 0.09].forEach(dt => { soplo(D, t + dt, { tipo: 'bandpass', f: 1200, q: 2, vol: 0.2 * v, c: 0.01, dur: 0.015 }); tono(D, t + dt, { f: 180, vol: 0.2 * v, c: 0.03, dur: 0.08, lp: 700 }); }); },
    'puerta-abrir'(D, t, v) { crujido(D, t, 1.1, 0.12 * v, 130); EFECTOS['candado-clic'](D, t, v * 0.6, {}); },
    'puerta-cerrar'(D, t, v) { tono(D, t, { f: 75, f2: 45, vol: 0.5 * v, c: 0.12, dur: 0.6, lp: 300, rev: 0.6 }); soplo(D, t, { tipo: 'lowpass', f: 800, vol: 0.25 * v, c: 0.04, dur: 0.06, rev: 0.5 }); EFECTOS['candado-clic'](D, t + 0.1, v * 0.5, {}); },
    pasos(D, t, v, o) { const n = o.n || 4, pan = o.pan || 0; for (let k = 0; k < n; k++) pisada(D, t + k * azar(0.48, 0.56), 0.28 * v, pan + (k % 2 ? 0.06 : -0.06), 0.35); },
    // Investigación
    'pista-conseguida'(D, t, v) { [74, 78, 81, 86, 90].forEach((n, k) => INS.celesta(D, t + k * 0.075, n, 0.14 * v));
      soplo(D, t, { tipo: 'highpass', f: 6000, vol: 0.05 * v, a: 0.2, c: 0.3, dur: 0.6, rev: 0.6 }); tono(D, t, { f: m2f(50), vol: 0.18 * v, a: 0.05, c: 0.6, dur: 2, rev: 0.5 }); },
    'pista-falsa'(D, t, v) { tono(D, t, { f: m2f(62), tipo: 'triangle', vol: 0.18 * v, c: 0.18, dur: 0.6, lp: 1200, rev: 0.3 }); tono(D, t + 0.2, { f: m2f(56), f2: m2f(55), tipo: 'triangle', vol: 0.18 * v, c: 0.35, dur: 1.2, lp: 900, rev: 0.4 }); },
    acierto(D, t, v) { INS.celesta(D, t, 79, 0.13 * v); INS.celesta(D, t + 0.08, 84, 0.13 * v); },
    fallo(D, t, v) { tono(D, t, { f: 196, f2: 175, glide: 0.15, tipo: 'triangle', vol: 0.2 * v, c: 0.1, dur: 0.35, lp: 800, rev: 0.15 }); },
    lupa(D, t, v) { for (let k = 0; k < 6; k++) tono(D, t + k * 0.05, { f: azar(2200, 4400), vol: 0.035 * v, c: 0.2, dur: 0.8, rev: 0.7, pan: azar(-0.6, 0.6) }); },
    revelacion(D, t, v) { INS.timbal(D, t, 0.5 * v); [50, 56, 62, 63].forEach(n => tono(D, t, { f: m2f(n), tipo: 'sawtooth', vol: 0.05 * v, a: 0.01, c: 0.8, dur: 3, lp: 1400, rev: 0.6 })); },
    'caso-resuelto'(D, t, v) { [65, 69, 72, 77].forEach((n, k) => INS.vibrafono(D, t + k * 0.11, n, 0.12 * v)); [53, 60, 64, 69].forEach(n => INS.rhodes(D, t + 0.45, n, 0.09 * v, 2)); INS.bajo(D, t + 0.45, 41, 0.35 * v, 1.5); },
    subir(D, t, v) { [62, 66, 69, 74, 78, 81, 86].forEach((n, k) => INS.celesta(D, t + k * 0.06, n, 0.11 * v)); },
    'falta-encontrada'(D, t, v) { EFECTOS.lupa(D, t, v * 0.8, {}); tono(D, t, { f: m2f(69), vol: 0.1 * v, c: 0.12, dur: 0.4, rev: 0.3 }); tono(D, t + 0.09, { f: m2f(74), vol: 0.12 * v, c: 0.2, dur: 0.6, rev: 0.4 }); },
    'falsa-alarma'(D, t, v) { tono(D, t, { f: 330, f2: 300, glide: 0.1, tipo: 'triangle', vol: 0.12 * v, c: 0.06, dur: 0.2, lp: 1500 }); tono(D, t + 0.11, { f: 330, f2: 280, glide: 0.15, tipo: 'triangle', vol: 0.1 * v, c: 0.08, dur: 0.25, lp: 1200 }); },
    tachar(D, t, v) { for (let k = 0; k < 3; k++) soplo(D, t + k * 0.09, { tipo: 'bandpass', f: 2600 + k * 400, f2: 3800, q: 2.5, vol: 0.1 * v, a: 0.01, c: 0.03, dur: 0.07 }); },
    carta(D, t, v) { soplo(D, t, { tipo: 'bandpass', f: 1800, f2: 3500, q: 0.8, vol: 0.12 * v, a: 0.02, c: 0.03, dur: 0.08 }); soplo(D, t + 0.09, { tipo: 'lowpass', f: 1200, vol: 0.2 * v, c: 0.015, dur: 0.02, rev: 0.15 }); },
    'cartas-barajar'(D, t, v) { for (let k = 0; k < 10; k++) soplo(D, t + k * 0.035, { tipo: 'bandpass', f: azar(2000, 4500), q: 1.2, vol: 0.07 * v, a: 0.002, c: 0.01, dur: 0.015, pan: azar(-0.3, 0.3) }); EFECTOS.carta(D, t + 0.42, v, {}); },
    expediente(D, t, v) { soplo(D, t, { tipo: 'lowpass', f: 700, f2: 1600, q: 1, vol: 0.22 * v, a: 0.04, c: 0.08, dur: 0.18, rev: 0.15 }); EFECTOS.papel(D, t + 0.15, v * 0.8, {}); },
    pop(D, t, v) { tono(D, t, { f: 420, f2: 900, glide: 0.05, vol: 0.12 * v, a: 0.002, c: 0.05, dur: 0.15, rev: 0.2 }); },
    borrador(D, t, v, o) { soplo(D, t, { tipo: 'bandpass', f: 900, q: 0.8, vol: 0.12 * v, a: 0.05, c: 0.1, dur: o.dur || 0.8, mantener: true });
      for (let k = 0; k < 6; k++) soplo(D, t + k * ((o.dur || 0.8) / 6), { tipo: 'bandpass', f: 1400, q: 1, vol: 0.05 * v, a: 0.06, c: 0.04, dur: 0.06 }); },
    telex(D, t, v) { soplo(D, t, { tipo: 'bandpass', f: 1600, q: 2, vol: 0.2 * v, a: 0.001, c: 0.01, dur: 0.012 }); tono(D, t, { f: 140, tipo: 'square', vol: 0.05 * v, c: 0.015, dur: 0.04, lp: 800 }); },
    'ter-tecleo'(D, t, v) { tono(D, t, { f: elige([1568, 1760, 1976, 2093]), tipo: 'square', vol: 0.018 * v, a: 0.001, c: 0.012, dur: 0.03, lp: 4000 }); },
    'ter-ok'(D, t, v) { [1046, 1568].forEach((f, k) => tono(D, t + k * 0.07, { f, tipo: 'square', vol: 0.04 * v, a: 0.002, c: 0.05, dur: 0.12, lp: 3500 })); },
    'ter-error'(D, t, v) { tono(D, t, { f: 110, tipo: 'sawtooth', vol: 0.08 * v, a: 0.005, c: 0.15, dur: 0.35, lp: 900 }); tono(D, t, { f: 116, tipo: 'sawtooth', vol: 0.06 * v, a: 0.005, c: 0.15, dur: 0.35, lp: 900 }); },
    'crt-encender'(D, t, v) { tono(D, t, { f: 15000, vol: 0.015 * v, a: 0.05, c: 0.6, dur: 1.5 }); soplo(D, t, { tipo: 'lowpass', f: 300, vol: 0.2 * v, c: 0.05, dur: 0.06 }); [0.4, 0.62].forEach(dt => EFECTOS.bip(D, t + dt, v, { f: 1320 })); },
    interruptor(D, t, v) { soplo(D, t, { tipo: 'bandpass', f: 2500, q: 1.5, vol: 0.25 * v, c: 0.008, dur: 0.012 }); tono(D, t, { f: 300, vol: 0.15 * v, c: 0.02, dur: 0.06, lp: 1200 }); },
    rotativa(D, t, v, o) { const n = Math.round((o.dur || 2) / 0.19); for (let k = 0; k < n; k++) EFECTOS.imprenta(D, t + k * 0.19, v * (0.5 + 0.5 * Math.sin(Math.PI * k / n)), {}); },
    'sismo-pico'(D, t, v) { tono(D, t, { f: 880, f2: 1760, glide: 0.06, vol: 0.08 * v, a: 0.003, c: 0.06, dur: 0.2 }); soplo(D, t, { tipo: 'bandpass', f: 3000, q: 4, vol: 0.06 * v, c: 0.04, dur: 0.1 }); },
    dados(D, t, v) { [0, 0.07, 0.16, 0.22, 0.31].forEach(dt => tono(D, t + dt, { f: azar(900, 1600), vol: 0.1 * v, a: 0.001, c: 0.012, dur: 0.04, rev: 0.1 })); },
    entrenamiento(D, t, v) { [69, 74, 78].forEach((n, k) => INS.vibrafono(D, t + k * 0.1, n, 0.11 * v)); INS.celesta(D, t + 0.32, 86, 0.1 * v); },
    racha(D, t, v, o) { const n = Math.min(6, Math.max(2, Math.round((o.nivel || 3) / 2))); for (let k = 0; k < n; k++) INS.celesta(D, t + k * 0.06, 72 + [0, 4, 7, 12, 16, 19][k], 0.12 * v); },
    estrella(D, t, v) { INS.celesta(D, t, 88, 0.15 * v); INS.vibrafono(D, t, 76, 0.1 * v); soplo(D, t, { tipo: 'highpass', f: 7000, vol: 0.04 * v, a: 0.05, c: 0.2, dur: 0.3, rev: 0.6 }); },
    'nivel-arriba'(D, t, v) { [60, 64, 67, 72].forEach((n, k) => INS.vibrafono(D, t + k * 0.12, n + 12, 0.12 * v)); [48, 64, 67, 72, 76].forEach(n => INS.rhodes(D, t + 0.5, n, 0.07 * v, 2.5)); INS.timbal(D, t + 0.5, 0.25 * v); },
    empezar(D, t, v) { soplo(D, t, { tipo: 'bandpass', f: 500, f2: 3000, q: 1, vol: 0.12 * v, a: 0.15, c: 0.05, dur: 0.25, rev: 0.3 }); INS.celesta(D, t + 0.22, 79, 0.1 * v); INS.celesta(D, t + 0.3, 84, 0.1 * v); },
    animo(D, t, v) { INS.vibrafono(D, t, 67, 0.09 * v); INS.vibrafono(D, t + 0.15, 72, 0.08 * v); },
    // Objetos y lugares
    reloj(D, t, v) { INS.madera(D, t, 0.05 * v, 1900); },
    campana(D, t, v) { campana(D, t, 196, 0.25 * v, 0.6, 2.5); },
    timbre(D, t, v) { campana(D, t, 1318, 0.14 * v, 0.3, 0.6); campana(D, t + 0.18, 1046, 0.14 * v, 0.3, 0.8); },
    radio(D, t, v) { soplo(D, t, { tipo: 'bandpass', f: 2500, q: 0.8, vol: 0.12 * v, a: 0.02, c: 0.1, dur: 0.5, mantener: true });
      tono(D, t + 0.05, { f: 1200, f2: 2600, glide: 0.4, tipo: 'sine', vol: 0.04 * v, c: 0.1, dur: 0.5 }); },
    imprenta(D, t, v) { [0, 0.16].forEach((dt, k) => { soplo(D, t + dt, { tipo: 'lowpass', f: k ? 2500 : 1200, vol: 0.25 * v, c: 0.02, dur: 0.03, rev: 0.3 }); tono(D, t + dt, { f: k ? 900 : 300, vol: 0.06 * v, c: 0.03, dur: 0.1 }); }); },
    tiza(D, t, v) { soplo(D, t, { tipo: 'bandpass', f: 2600, q: 5, vol: 0.12 * v, a: 0.005, c: 0.03, dur: 0.06 }); tono(D, t, { f: 700, vol: 0.05 * v, c: 0.01, dur: 0.04 }); },
    bip(D, t, v, o) { tono(D, t, { f: o.f || 1046, tipo: 'square', vol: 0.035 * v, a: 0.002, c: 0.05, dur: 0.12, lp: 3000 }); },
    buho(D, t, v) { [0, 0.55, 0.85].forEach((dt, k) => tono(D, t + dt, { f: 360, f2: k === 2 ? 330 : 400, glide: 0.25, vol: 0.09 * v, a: 0.06, c: k === 2 ? 0.25 : 0.1, dur: k === 2 ? 0.8 : 0.35, lp: 700, rev: 0.8, pan: -0.6 })); },
    pajaro(D, t, v) { const p = azar(-0.7, 0.7); for (let k = 0; k < Math.floor(azar(2, 5)); k++) tono(D, t + k * 0.09, { f: azar(2800, 3600), f2: azar(4000, 5200), glide: 0.05, vol: 0.04 * v, a: 0.005, c: 0.03, dur: 0.08, pan: p, rev: 0.4 }); }
  };

  // Ajuste de volumen por efecto, medido para que todos suenen parecido de fuertes
  const REFUERZO = { precinto: 2.2, ventana: 2.2, 'ventana-cerrar': 2, lapiz: 2, tachar: 2, carta: 1.8, 'cartas-barajar': 1.8, 'candado-girar': 3, papel: 1.6, expediente: 1.6, 'ter-tecleo': 1.6, 'crt-encender': 1.8, lupa: 1.5, telex: 1.4, tecla: 1.4 };

  /* ── Fondos de ambiente ──────────────────────────────────────
     {capas(D, t) → nodos para parar, eventos: [[efecto o función, peso]], cada: [min, max] s, ritmo?: {d, paso(i,t,D)}} */
  function capaRuido(D, t, tipo, f, q, vol, lfoF, lfoProf, rev) {
    const s = ruido(t, t + 36000), fl = filtro(tipo, f, q), g = salida(D, rev || 0.2, 0);
    s.connect(fl); fl.connect(g); g.gain.setValueAtTime(vol, t);
    const nodos = [s];
    if (lfoF) { const l = ctx.createOscillator(); l.frequency.value = lfoF; const lg = ctx.createGain(); lg.gain.value = lfoProf; l.connect(lg); lg.connect(fl.frequency); l.start(t); nodos.push(l); }
    return nodos;
  }
  function pasosLejanos(D, t, v) { // se acercan por un lado y se van por el otro
    const n = Math.floor(azar(6, 11)), dir = elige([-1, 1]), paso = azar(0.5, 0.62);
    for (let k = 0; k < n; k++) { const x = k / (n - 1); pisada(D, t + k * paso, 0.16 * v * Math.sin(Math.PI * (0.15 + x * 0.7)), dir * (x * 1.6 - 0.8), 0.7); }
  }
  function maquinaLejana(D, t, v) {
    let tt = t; const n = Math.floor(azar(6, 16));
    for (let k = 0; k < n; k++) { tt += azar(0.09, 0.22); soplo(D, tt, { tipo: 'bandpass', f: 2200, q: 1.5, vol: 0.05 * v, c: 0.008, dur: 0.012, pan: 0.6, rev: 0.6 }); }
    if (Math.random() < 0.4) campana(D, tt + 0.3, 1975, 0.03 * v, 0.6, 0.25);
  }
  const FONDOS = {
    oficina: { nombre: 'Oficina (reloj, pasos en el pasillo, máquina lejana)', nivel: 3, cada: [9, 22],
      capas: (D, t) => capaRuido(D, t, 'lowpass', 300, 0.5, 0.02),
      ritmo: { d: 1, paso: (i, t, D) => INS.madera(D, t, i % 2 ? 0.014 : 0.018, i % 2 ? 1700 : 2000) },
      eventos: [[pasosLejanos, 3], [maquinaLejana, 2], [(D, t) => EFECTOS.pagina(D, t, 0.35, {}), 1]] },
    agencia: { nombre: 'Agencia (lluvia en la ventana, reloj, pasos, máquina lejana)', nivel: 2, cada: [10, 24],
      capas: (D, t) => [...capaRuido(D, t, 'highpass', 1500, 0.5, 0.012, 0, 0, 0.2), ...capaRuido(D, t, 'lowpass', 420, 0.6, 0.016, 0.05, 120)],
      ritmo: { d: 1, paso: (i, t, D) => { INS.madera(D, t, i % 2 ? 0.011 : 0.014, i % 2 ? 1700 : 2000); if (Math.random() < 0.25) tono(D, t + azar(0, 0.9), { f: azar(2500, 4500), vol: azar(0.003, 0.008), a: 0.001, c: 0.01, dur: 0.03, pan: azar(0.3, 0.9), rev: 0.3 }); } },
      eventos: [[pasosLejanos, 3], [maquinaLejana, 2], [(D, t) => EFECTOS.pagina(D, t, 0.35, {}), 1]] },
    calle: { nombre: 'Calle de noche (viento, pasos, búho, campanario)', cada: [8, 20],
      capas: (D, t) => capaRuido(D, t, 'lowpass', 450, 1.5, 0.06, 0.07, 260, 0.3),
      eventos: [[pasosLejanos, 4], [(D, t) => EFECTOS.buho(D, t, 1, {}), 2], [(D, t) => EFECTOS.campana(D, t, 0.6, {}), 1]] },
    mercado: { nombre: 'Mercado (murmullo, pasos)', cada: [7, 16],
      capas: (D, t) => [350, 620, 950, 1400].flatMap((f, k) => capaRuido(D, t, 'bandpass', f, 3, 0.03 - k * 0.004, 0.3 + k * 0.23, f * 0.25, 0.4)),
      eventos: [[pasosLejanos, 3], [(D, t) => EFECTOS.timbre(D, t, 0.4, {}), 1], [(D, t) => EFECTOS.cajon(D, t, 0.4, {}), 1]] },
    feria: { nombre: 'Feria apagada (viento suave, murmullo lejano)', nivel: 2, cada: [10, 22],
      capas: (D, t) => [...capaRuido(D, t, 'lowpass', 380, 1.2, 0.04, 0.05, 200, 0.4), ...capaRuido(D, t, 'bandpass', 700, 2.5, 0.012, 0.4, 150, 0.6)],
      eventos: [[pasosLejanos, 2], [(D, t) => EFECTOS.buho(D, t, 0.8, {}), 1], [(D, t) => EFECTOS['puerta-abrir'](D, t, 0.3, {}), 1]] },
    interior: { nombre: 'Interior en silencio (archivo, biblioteca, taller)', nivel: 2.5, cada: [12, 28],
      capas: (D, t) => capaRuido(D, t, 'lowpass', 220, 0.5, 0.025),
      ritmo: { d: 1.2, paso: (i, t, D) => INS.madera(D, t, 0.01, 1500) },
      eventos: [[pasosLejanos, 2], [(D, t) => EFECTOS.pagina(D, t, 0.3, {}), 2], [(D, t) => EFECTOS['puerta-abrir'](D, t, 0.25, {}), 1]] },
    radio: { nombre: 'Radio (estática suave)', nivel: 1.6, cada: [6, 14],
      capas: (D, t) => capaRuido(D, t, 'bandpass', 2600, 0.7, 0.018, 0.2, 600, 0.1),
      eventos: [[(D, t) => EFECTOS.radio(D, t, 0.5, {}), 2], [(D, t) => EFECTOS.bip(D, t, 0.6, { f: 1568 }), 1]] },
    imprenta: { nombre: 'Imprenta (máquina rítmica lejana)', nivel: 2.5, cada: [10, 20],
      capas: (D, t) => capaRuido(D, t, 'lowpass', 260, 0.5, 0.03),
      ritmo: { d: 0.75, paso: (i, t, D) => EFECTOS.imprenta(D, t, 0.16, {}) },
      eventos: [[pasosLejanos, 1], [(D, t) => soplo(D, t, { tipo: 'highpass', f: 3000, vol: 0.03, a: 0.3, c: 0.4, dur: 1, rev: 0.5 }), 1]] },
    patio: { nombre: 'Patio de la Academia (pájaros, brisa)', nivel: 1.8, cada: [3, 9],
      capas: (D, t) => capaRuido(D, t, 'lowpass', 600, 0.8, 0.02, 0.09, 250, 0.3),
      eventos: [[(D, t) => EFECTOS.pajaro(D, t, 1, {}), 5], [pasosLejanos, 1]] },
    lluvia: { nombre: 'Lluvia', cada: [14, 30],
      capas: (D, t) => [...capaRuido(D, t, 'highpass', 1200, 0.5, 0.05, 0, 0, 0.3), ...capaRuido(D, t, 'lowpass', 500, 0.5, 0.04)],
      ritmo: { d: 0.07, paso: (i, t, D) => { if (Math.random() < 0.35) tono(D, t, { f: azar(2500, 5000), vol: azar(0.004, 0.014), a: 0.001, c: 0.01, dur: 0.03, pan: azar(-0.9, 0.9), rev: 0.3 }); } },
      eventos: [[pasosLejanos, 1]] },
    tension: { nombre: 'Tensión (reloj marcado)', cada: [14, 26],
      capas: (D, t) => capaRuido(D, t, 'lowpass', 160, 0.5, 0.03),
      ritmo: { d: 1, paso: (i, t, D) => INS.madera(D, t, 0.03, i % 2 ? 1500 : 1800) },
      eventos: [[pasosLejanos, 1]] }
  };

  /* ── Piezas que suenan (música o fondo) con fundido ─────── */
  function pieza(tipo, def) {
    const B = buses[tipo === 'musica' ? 'musica' : 'fondo'];
    const entrada = ctx.createGain(), rev = ctx.createGain(); entrada.connect(B.entrada); rev.connect(B.rev);
    const nivel = def.nivel || 1, t = ctx.currentTime; [entrada, rev].forEach(g => { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(nivel, t + (tipo === 'musica' ? 2.2 : 1.5)); });
    const D = { entrada, rev };
    const p = { tipo, def, D, nodos: [], i: 0, proximo: t + 0.12 };
    if (tipo === 'musica') { p.paso = def.crear(); p.d = 60 / def.bpm / (def.subdiv || 4); p.swing = def.swing || 0; }
    else {
      p.nodos = def.capas ? def.capas(D, t) : [];
      p.siguiente = t + azar(def.cada[0] * 0.3, def.cada[0]);
      if (def.ritmo) { p.paso = def.ritmo.paso; p.d = def.ritmo.d; p.swing = 0; }
    }
    return p;
  }
  function fundirFuera(p, seg) {
    const t = ctx.currentTime;
    [p.D.entrada, p.D.rev].forEach(g => { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0.0001, t + seg); });
    p.muriendo = true;
    setTimeout(() => { p.nodos.forEach(n => { try { n.stop(); } catch (e) {} }); [p.D.entrada, p.D.rev].forEach(g => g.disconnect()); const a = activas[p.tipo]; const k = a.indexOf(p); if (k >= 0) a.splice(k, 1); }, seg * 1000 + 3500);
  }
  function aplicar(tipo) { try { aplicarSinRed(tipo); } catch (e) { console.warn('Sonido:', e); } }
  function aplicarSinRed(tipo) {
    if (!ctx || ctx.state !== 'running') return;
    const nombre = quiere[tipo], tabla = tipo === 'musica' ? MUSICAS : FONDOS;
    const viva = activas[tipo].find(p => !p.muriendo);
    if (viva && viva.def === tabla[nombre]) return;
    if (viva) fundirFuera(viva, tipo === 'musica' ? 2 : 1.5);
    if (nombre && tabla[nombre]) activas[tipo].push(pieza(tipo, tabla[nombre]));
  }
  function tic() {
    if (!ctx || ctx.state !== 'running') return;
    const ahora = ctx.currentTime;
    for (const tipo of ['musica', 'fondo']) for (const p of activas[tipo]) {
      if (p.muriendo) continue;
      if (p.paso) {
        if (p.proximo < ahora - 0.25) p.proximo = ahora + 0.05; // la pestaña estuvo dormida: no amontonar notas
        while (p.proximo < ahora + 0.18) {
          const ts = p.proximo + (p.swing && p.i % 4 === 2 ? p.swing * p.d * 0.66 : 0);
          try { p.paso(p.i, ts, p.d, p.D); } catch (e) {}
          p.i++; p.proximo += p.d;
        }
      }
      if (p.def.eventos && ahora >= p.siguiente) {
        const total = p.def.eventos.reduce((a, e) => a + e[1], 0); let r = Math.random() * total;
        const ev = p.def.eventos.find(e => (r -= e[1]) < 0) || p.def.eventos[0];
        try { ev[0](p.D, ahora + 0.05, 1); } catch (e) {}
        p.siguiente = ahora + azar(p.def.cada[0], p.def.cada[1]);
      }
    }
  }

  /* ── Desbloqueo con el primer gesto ──────────────────────── */
  function desbloquear() {
    if (!crearContexto()) return;
    if (prefs.silencio) return;
    if (ctx.state !== 'running') ctx.resume().then(() => { aplicar('musica'); aplicar('fondo'); }).catch(() => {});
    else { aplicar('musica'); aplicar('fondo'); }
  }
  function escucharGestos() {
    ['pointerdown', 'keydown', 'touchend'].forEach(ev => document.addEventListener(ev, desbloquear, { capture: true, passive: true }));
    document.addEventListener('visibilitychange', () => {
      if (!ctx) return;
      if (document.hidden) ctx.suspend().catch(() => {});
      else if (!prefs.silencio) ctx.resume().catch(() => {});
    });
  }

  /* ── Control de volumen (botón 🔊) ───────────────────────── */
  const CSS = `.snd-control{position:fixed;right:14px;bottom:14px;z-index:9999;font-family:system-ui,sans-serif}
.snd-control.snd-en-linea{position:relative;right:auto;bottom:auto}
.snd-boton{width:46px;height:46px;border-radius:50%;border:0;background:var(--snd-fondo,#1c1a24e6);color:var(--snd-tinta,#f3ead7);font-size:22px;line-height:46px;padding:0;cursor:pointer;box-shadow:0 4px 14px #0005}
.snd-panel{position:absolute;right:0;bottom:56px;width:220px;background:var(--snd-fondo,#1c1a24f2);color:var(--snd-tinta,#f3ead7);border-radius:14px;padding:12px 14px;box-shadow:0 8px 30px #0007;font-size:14px}
.snd-control.snd-arriba .snd-panel{bottom:auto;top:56px}
.snd-panel[hidden]{display:none}
.snd-panel label{display:flex;flex-direction:column;gap:4px;margin:6px 0 10px;font-weight:700}
.snd-panel input[type=range]{width:100%;accent-color:var(--snd-acento,#d9a441)}
.snd-panel button{width:100%;border:0;border-radius:10px;padding:8px;font-weight:800;cursor:pointer;background:var(--snd-acento,#d9a441);color:#1c1a24}`;
  function control(padre, o) {
    o = o || {};
    if (!document.getElementById('snd-css')) { const s = document.createElement('style'); s.id = 'snd-css'; s.textContent = CSS; document.head.appendChild(s); }
    const el = document.createElement('div'); el.className = 'snd-control' + (padre ? ' snd-en-linea' : '') + (o.arriba ? ' snd-arriba' : '');
    el.innerHTML = `<button class="snd-boton" type="button" aria-label="Sonido" title="Sonido"></button>
<div class="snd-panel" hidden><label>🎵 Música<input type="range" min="0" max="100" data-v="musica"></label><label>🔔 Efectos<input type="range" min="0" max="100" data-v="efectos"></label><button type="button" data-silencio></button></div>`;
    const boton = el.querySelector('.snd-boton'), panel = el.querySelector('.snd-panel'), bSil = el.querySelector('[data-silencio]');
    const pintar = () => { boton.textContent = prefs.silencio ? '🔇' : '🔊'; bSil.textContent = prefs.silencio ? '🔊 Activar sonido' : '🔇 Silenciar todo';
      el.querySelectorAll('input[data-v]').forEach(i => { i.value = Math.round(prefs[i.dataset.v] * 100); }); };
    boton.addEventListener('click', e => { e.stopPropagation(); if (o.soloSilencio) { silenciar(!prefs.silencio); pintar(); return; } panel.hidden = !panel.hidden; });
    bSil.addEventListener('click', e => { e.stopPropagation(); silenciar(!prefs.silencio); pintar(); });
    el.querySelectorAll('input[data-v]').forEach(i => i.addEventListener('input', () => { volumen(i.dataset.v, i.value / 100); if (prefs.silencio && i.value > 0) { silenciar(false); pintar(); } }));
    el.addEventListener('pointerdown', e => e.stopPropagation());
    document.addEventListener('pointerdown', () => { panel.hidden = true; });
    pintar(); (padre || document.body).appendChild(el);
    return el;
  }

  /* ── API pública ─────────────────────────────────────────── */
  function silenciar(si) {
    prefs.silencio = !!si; guardarPrefs();
    if (!ctx) { if (!si) desbloquear(); return; }
    const t = ctx.currentTime, g = buses.maestro.gain;
    g.cancelScheduledValues(t); g.setValueAtTime(g.value, t);
    if (si) { g.linearRampToValueAtTime(0, t + 0.25); setTimeout(() => { if (prefs.silencio) ctx.suspend().catch(() => {}); }, 300); }
    else { ctx.resume().then(() => { g.linearRampToValueAtTime(1, ctx.currentTime + 0.4); aplicar('musica'); aplicar('fondo'); }).catch(() => {}); }
  }
  function volumen(tipo, v) {
    v = Math.max(0, Math.min(1, v)); prefs[tipo] = v; guardarPrefs();
    if (!ctx) return;
    const t = ctx.currentTime;
    if (tipo === 'musica') { buses.musica.vol.gain.setTargetAtTime(v, t, 0.05); buses.fondo.vol.gain.setTargetAtTime(volFondo(v), t, 0.05); }
    else buses.efectos.vol.gain.setTargetAtTime(v, t, 0.05);
  }
  const Sonido = {
    MUSICAS, FONDOS, EFECTOS,
    iniciar(o) {
      o = o || {}; if (o.prefijo) clave = o.prefijo + '-sonido';
      cargarPrefs(); if (o.porDefecto) { /* valores iniciales del juego si el alumno aún no ha tocado nada */
        try { if (!localStorage.getItem(clave)) Object.assign(prefs, o.porDefecto); } catch (e) {} }
      if (!iniciado) { iniciado = true; escucharGestos(); }
      return Sonido;
    },
    efecto(nombre, o) {
      o = o || {};
      if (prefs.silencio || !EFECTOS[nombre] || document.hidden) return;
      if (!ctx) desbloquear();
      if (!ctx) return;
      if (ctx.state !== 'running') { ctx.resume().then(() => { if (ctx.state === 'running') Sonido.efecto(nombre, o); }).catch(() => {}); return; }
      const ahora = ctx.currentTime, min = o.min != null ? o.min : (nombre === 'tecleo' || nombre === 'tecla' ? 0.03 : 0.04);
      if (ultimoEfecto[nombre] && ahora - ultimoEfecto[nombre] < min) return; // no saturar
      ultimoEfecto[nombre] = ahora;
      try { EFECTOS[nombre](buses.efectos, ahora + (o.retraso || 0) + 0.005, (o.vol != null ? o.vol : 1) * (REFUERZO[nombre] || 1), o); } catch (e) {}
    },
    musica(nombre) { quiere.musica = nombre || null; aplicar('musica'); },
    fondo(nombre) { quiere.fondo = nombre || null; aplicar('fondo'); },
    contexto(musica, fondo) { Sonido.musica(musica); Sonido.fondo(fondo); },
    agachar(si) { agachado = !!si; if (!ctx) return; buses.agache.gain.setTargetAtTime(si ? 0.18 : 1, ctx.currentTime, si ? 0.15 : 0.6); },
    silenciar, volumen, control,
    silenciado: () => prefs.silencio,
    actual: () => ({ musica: quiere.musica, fondo: quiere.fondo }),
    listo: () => !!ctx && ctx.state === 'running',
    _depurar: () => ({ ctx, buses })
  };
  global.Sonido = Sonido;
})(window);
