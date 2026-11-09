/* ============================================================
   AGENCIA LA LUPA · funcionar sin internet (service worker)
   - Código y datos (html, js, css, json): primero la red, para que siempre llegue la última versión.
     Si no hay conexión, o la red tarda más de 4 segundos, lo guardado.
   - Imágenes y fuentes: primero lo guardado (pesan mucho) y, por detrás, se comprueba si hay una
     versión nueva para la próxima vez.
   - Desde la zona del maestro se puede descargar todo de una vez (mensaje «precargar»).
   ============================================================ */
const CACHE = "la-lupa-v2";
const LIMITE_RED = 4000;

self.addEventListener("install", () => { self.skipWaiting(); });
self.addEventListener("activate", ev => {
  ev.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("la-lupa-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

const esEstatico = url => /\.(webp|png|jpg|jpeg|svg|woff2?|ttf)$/i.test(url.pathname);
const prolongar = (ev, p) => { try { ev.waitUntil(p); } catch { /* el evento ya ha terminado: la copia se guarda igual */ } };
/* Pide a la red y guarda una copia. La copia se saca antes de devolver la respuesta: después ya no se puede. */
function pedirYGuardar(ev, cache, req) {
  return fetch(req).then(r => {
    if (r.ok) prolongar(ev, cache.put(req, r.clone()));
    return r;
  });
}
const conLimite = (promesa, ms) => new Promise((ok, mal) => {
  const t = setTimeout(() => mal(new Error("la red tarda demasiado")), ms);
  promesa.then(v => { clearTimeout(t); ok(v); }, e => { clearTimeout(t); mal(e); });
});

self.addEventListener("fetch", ev => {
  const req = ev.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  ev.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const guardada = await cache.match(req, { ignoreSearch: req.mode === "navigate" });
    const red = pedirYGuardar(ev, cache, req);
    if (!guardada) return red;
    if (esEstatico(url)) { prolongar(ev, red.catch(() => {})); return guardada; }
    try { return await conLimite(red, LIMITE_RED); } catch { return guardada; }
  })());
});

/* Descargar todo (lo pide la zona del maestro con la lista de archivos) */
self.addEventListener("message", ev => {
  if (ev.data?.tipo !== "precargar") return;
  const lista = ev.data.urls || [];
  ev.waitUntil(caches.open(CACHE).then(async c => {
    let hechos = 0, fallos = 0;
    for (let i = 0; i < lista.length; i += 8) {
      await Promise.all(lista.slice(i, i + 8).map(async u => {
        try { const r = await fetch(u, { cache: "reload" }); if (r.ok) { await c.put(u, r); hechos++; } else fallos++; } catch { fallos++; }
      }));
      ev.source?.postMessage({ tipo: "progreso", hechos, fallos, total: lista.length });
    }
    ev.source?.postMessage({ tipo: "precargado", hechos, fallos, total: lista.length });
  }));
});
