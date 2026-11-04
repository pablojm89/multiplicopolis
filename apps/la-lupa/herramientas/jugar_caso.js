// Jugador automático de La Lupa: juega cualquier caso entero leyendo la escena actual del propio juego.
// Necesita el servidor local (node .claude/serve.js) y Playwright (ya instalado en las sesiones en la nube).
// Uso (desde apps/la-lupa/): [PAQUETE=x.lalupa-clase.json] node herramientas/jugar_caso.js <unidad> <carpeta-capturas> [perfecto|fallos] [digital]
//   perfecto: todo a la primera (las notas deben salir completas). fallos: un error en cada reto (prueba los caminos de fallo).
// Comprueba: que cada escena avanza, que las cifras conseguidas son el código del candado, textos fuera de pantalla y errores de JS.
const { chromium } = require('playwright');
const fs = require('fs');
const [UNIDAD, DIR, MODO = 'perfecto', LIBRETA = 'papel'] = process.argv.slice(2);
const FALLOS = MODO === 'fallos';
fs.mkdirSync(DIR, { recursive: true });

(async () => {
  const b = await chromium.launch();
  const p = global.pagina = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [], desbordes = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  let n = 0;
  const shot = async name => { n++; await p.waitForTimeout(300); await p.screenshot({ path: `${DIR}/${String(n).padStart(2, '0')}-${name}.png` }); };
  const seguir = async () => { await p.waitForSelector('#momentoSeguir', { timeout: 8000 }); await p.waitForTimeout(150); await p.click('#momentoSeguir'); };
  const corregir = async bien => {
    await p.waitForSelector('#corr');
    if (FALLOS) { await p.fill('#corr', 'zzz'); await p.click('#corrOk'); }
    await p.fill('#corr', bien); await p.click('#corrOk');
    await p.waitForSelector('#corr', { state: 'detached' });
  };
  const escena = () => p.evaluate(() => ({ i: P.i, e: P.caso.escenas[P.i] }));
  // Desbordes: elementos de texto que se salen de la pantalla o tienen scroll oculto
  const revisarDesbordes = async (i, tipo) => {
    const r = await p.evaluate(() => {
      const out = [];
      document.querySelectorAll('.momento-texto, .bocadillo, .documento, .hoja-libreta, .corcho, .momento, .hoja, .tira-maquina, .opcion, .instruccion, .titulo-escena, .cartel, .tira-pista, .manchada, .cubo, .etiqueta-colgante, .bocadillo-final').forEach(el => {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        const rc = el.getBoundingClientRect();
        if (!rc.width || el.closest('.momento, .cartel') && !el.matches('.momento-texto')) return;
        for (let a = el.parentElement; a; a = a.parentElement) if (['auto', 'scroll'].includes(getComputedStyle(a).overflowY)) return;
        if (rc.bottom > 722 || rc.right > 1282 || rc.top < -10 || rc.left < -10) out.push(`${el.className} fuera de pantalla (${Math.round(rc.left)},${Math.round(rc.top)},${Math.round(rc.right)},${Math.round(rc.bottom)})`);
        if (['hidden', 'clip'].includes(cs.overflowY) && el.scrollHeight > el.clientHeight + 4) out.push(`${el.className} texto cortado (${el.scrollHeight}>${el.clientHeight})`);
      });
      return out;
    });
    r.forEach(x => desbordes.push(`escena ${i} (${tipo}): ${x}`));
  };
  // Pulsa las faltas de un texto interactivo: btnSel = botones de palabra en orden de tokens
  const resolverTexto = async (textos, btnSel, conCarta) => {
    const toks = await p.evaluate(ts => ts.flatMap(t => tokenizar(t)).filter(t => t.palabra).map(t => ({ t: t.t, error: !!t.error, bien: t.bien, carta: t.carta })), textos);
    const btns = p.locator(btnSel);
    const nb = await btns.count();
    if (nb !== toks.length) throw new Error(`botones ${nb} ≠ palabras ${toks.length}`);
    if (FALLOS) { const k = toks.findIndex(t => !t.error); if (k >= 0) await btns.nth(k).click(); }
    for (let k = 0; k < toks.length; k++) {
      const t = toks[k];
      if (!t.error) continue;
      await btns.nth(k).click({ timeout: 5000 });
      if (conCarta && t.carta) {
        await p.waitForSelector('#capaModal .carta');
        if (FALLOS) { const otra = p.locator(`#capaModal .carta:not([data-id="${t.carta}"])`).first(); if (await otra.count()) await otra.click(); }
        await p.click(`#capaModal .carta[data-id="${t.carta}"]`);
      }
      await corregir(t.bien);
    }
  };

  await p.goto('http://localhost:4321/apps/la-lupa/');
  // El jugador entra directo al caso (sin la ruta de preparación de la Academia)
  await p.evaluate(l => { localStorage.setItem('lalupa-ajustes', JSON.stringify({ libreta: l, preparacion: 'no' })); }, LIBRETA);
  await p.reload();
  if (process.env.PAQUETE) { // PAQUETE=<ruta.lalupa-clase.json>: juega con el avatar del primer alias
    await p.click('#irMaestro'); await p.setInputFiles('#pqArchivo', process.env.PAQUETE); await p.waitForTimeout(600);
    await p.click('#volver'); await p.click('.ficha-clase');
  } else { await p.fill('#nNombre', 'Robot ' + UNIDAD); await p.click('#nuevo button'); }
  if (UNIDAD.startsWith('enc-')) await p.evaluate(id => iniciarEncargo(id), UNIDAD); // los encargos se abren por rango: se entra directo
  else await p.click(`[data-unidad="${UNIDAD}"]`);
  let ultimo = -1, eventos = [];
  for (let vuelta = 0; vuelta < 80; vuelta++) {
    await p.waitForTimeout(250);
    const { i, e } = await escena();
    if (i === ultimo) throw new Error(`la escena ${i} (${e.tipo}) no avanza`);
    ultimo = i;
    await p.waitForTimeout(250);
    await revisarDesbordes(i, e.tipo);
    const nombre = `${i}-${e.tipo}`;
    switch (e.tipo) {
      case 'portada': await shot(nombre); await p.click('#precinto'); await p.waitForTimeout(800); await p.click('#abrir'); break;
      case 'relato': await p.click('#txt'); await revisarDesbordes(i, e.tipo); await shot(nombre); await p.click('#sig'); break;
      case 'descubre':
        for (let q = 0; q < e.preguntas.length; q++) {
          const pr = e.preguntas[q];
          await p.waitForSelector(`.opcion[data-k="${pr.correcta}"]`);
          if (q === 0) await shot(nombre);
          if (FALLOS) await p.click(`.opcion[data-k="${pr.correcta === 0 ? 1 : 0}"]`);
          await p.click(`.opcion[data-k="${pr.correcta}"]`);
          await revisarDesbordes(i, 'descubre-momento'); await seguir();
          await p.waitForTimeout(200);
        }
        await seguir(); break;
      case 'papeles': {
        await shot(nombre);
        if (FALLOS) await p.locator('#mostrador button', { hasText: new RegExp(`^${e.palabras[0]}$`) }).first().click();
        for (const f of e.faltas) { await p.locator('#mostrador button:not(.resuelta)', { hasText: new RegExp(`^${f.mal}$`) }).first().click(); await corregir(f.bien); }
        await revisarDesbordes(i, 'papeles-final'); await shot(nombre + '-hecho'); await seguir(); break;
      }
      case 'caza': await shot(nombre); await resolverTexto([e.declaracion], '#decl .w', false); await seguir(); break;
      case 'careo': await shot(nombre); await resolverTexto([e.declaracion], '#decl .w', true); await revisarDesbordes(i, 'careo-aclarado'); await shot(nombre + '-aclarado'); await seguir(); break;
      case 'hipotesis':
        await shot(nombre);
        if (FALLOS) { await p.click(`.tira-maquina[data-k="${e.correcta === 0 ? 1 : 0}"]`); await seguir(); }
        await p.click(`.tira-maquina[data-k="${e.correcta}"]`); await revisarDesbordes(i, 'hipotesis-momento'); await seguir(); break;
      case 'clasifica':
        await shot(nombre);
        for (let k = 0; k < e.palabras.length; k++) {
          if (FALLOS && k === 0) { const otra = e.categorias.find(c => c.id !== e.palabras[0].cat); await p.click(`.cubo[data-id="${otra.id}"]`); }
          await p.click(`.cubo[data-id="${e.palabras[k].cat}"]`);
        }
        await seguir(); break;
      case 'manchas': case 'huecos': {
        await shot(nombre);
        const resp = await p.evaluate(e => e.palabras.map(w => e.tipo === 'manchas' ? (llevaTilde(w.p, w.pos) ? '1' : '0') : w.letra), e);
        if (FALLOS) {
          const w0 = e.palabras[0];
          const mal = e.tipo === 'manchas' ? (resp[0] === '1' ? '0' : '1') : w0.opciones.find(o => o !== w0.letra);
          await p.click(`.manchada[data-k="0"] button[data-v="${mal}"]`);
          for (let k = 1; k < resp.length; k++) await p.click(`.manchada[data-k="${k}"] button[data-v="${resp[k]}"]`);
          await p.click('#comprobar'); await p.waitForTimeout(300);
          await p.click(`.manchada[data-k="0"] button[data-v="${resp[0]}"]`);
        } else for (let k = 0; k < resp.length; k++) await p.click(`.manchada[data-k="${k}"] button[data-v="${resp[k]}"]`);
        await p.click('#comprobar'); await shot(nombre + '-hecho'); await seguir(); break;
      }
      case 'candado': {
        await shot(nombre);
        const piezas = await p.evaluate(() => P.piezas.join(''));
        if (piezas !== e.codigo) throw new Error(`las cifras conseguidas ${piezas} no son el código ${e.codigo}`);
        const ruedas = p.locator('.rueda');
        if (FALLOS) { for (let k = 0; k < e.codigo.length; k++) await ruedas.nth(k).fill(String((+e.codigo[k] + 1) % 10)); await p.click('#abrir'); }
        for (let k = 0; k < e.codigo.length; k++) await ruedas.nth(k).fill(e.codigo[k]);
        await p.click('#abrir'); await seguir(); break;
      }
      case 'expediente': {
        await shot(nombre);
        const textos = await p.evaluate(() => P.caso.escenas.slice(0, P.i).flatMap(x => [x.texto, x.intro].filter(tieneFaltas)));
        await resolverTexto(textos, '#hojas .w', false);
        await shot(nombre + '-hecho'); await p.click('#entregar'); break;
      }
      case 'apunta': await shot(nombre); if (LIBRETA === 'digital') for (const t of await p.locator('.nota-digital').all()) await t.fill('Respuesta de prueba'); await p.click('#hecho'); break;
      case 'final': await p.click('#txt'); await shot(nombre); await p.waitForSelector('#informe:not([hidden])'); eventos = await p.evaluate(() => P.eventos); await p.click('#informe'); break;
      case 'pregunta':
        for (let q = 0; q < e.preguntas.length; q++) {
          const pr = e.preguntas[q];
          await p.waitForSelector(`.opcion[data-k="${pr.correcta}"]`);
          if (q === 0) await shot(nombre);
          if (FALLOS) await p.click(`.opcion[data-k="${pr.correcta === 0 ? 1 : 0}"]`);
          await p.click(`.opcion[data-k="${pr.correcta}"]`);
          await revisarDesbordes(i, 'pregunta');
          if (pr.explicacion) await seguir();
          await p.waitForTimeout(200);
        }
        if (e.recompensa) await seguir(); break;
      case 'escribe':
        for (let k = 0; k < e.items.length; k++) {
          const it = e.items[k];
          await p.waitForSelector('#resp');
          if (k === 0) await shot(nombre);
          if (FALLOS) { await p.fill('#resp', 'zzz'); await p.click('#respOk'); }
          await p.fill('#resp', it.respuestas[0]); await p.click('#respOk');
          await revisarDesbordes(i, 'escribe');
          if (it.explicacion) await seguir(); else await p.waitForTimeout(900);
        }
        if (e.recompensa) await seguir(); break;
      case 'ordena': {
        await shot(nombre);
        const n = e.fragmentos.length;
        if (FALLOS) { for (const k of [1, 0, ...Array.from({ length: n - 2 }, (_, j) => j + 2)]) await p.click(`.frag[data-i="${k}"]`); await p.click('#compOrden'); await p.waitForTimeout(1200); }
        for (let k = 0; k < n; k++) await p.click(`.frag[data-i="${k}"]`);
        await revisarDesbordes(i, 'ordena'); await shot(nombre + '-hecho');
        await p.click('#compOrden');
        if (e.recompensa) await seguir(); break;
      }
      default: throw new Error('tipo sin jugador: ' + e.tipo);
    }
    if (e.tipo === 'final') break;
  }
  await p.waitForSelector('.notas'); await shot('informe');
  const resumen = await p.evaluate(ev => {
    const por = {};
    ev.forEach(x => { const k = `${x.criterio}/${x.regla}`; por[k] ??= [0, 0]; por[k][x.ok ? 0 : 1]++; });
    return { notas: document.querySelector('.notas').textContent.replace(/\s+/g, ' ').trim(), por };
  }, eventos);
  console.log('NOTAS:', resumen.notas);
  console.log('EVENTOS (bien/mal por criterio/regla):', JSON.stringify(resumen.por));
  console.log('DESBORDES:', desbordes.length ? '\n  ' + [...new Set(desbordes)].join('\n  ') : 'ninguno');
  console.log('ERRORES:', errs.length ? errs : 'ninguno');
  await b.close();
})().catch(async e => { console.error('FALLO', e.message.split('\n').slice(0,12).join('\n')); try { await global.pagina.screenshot({ path: `${DIR}/zz-fallo.png` }); } catch {} process.exit(1); });
