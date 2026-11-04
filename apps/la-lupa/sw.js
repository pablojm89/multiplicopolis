/* ============================================================
   AGENCIA LA LUPA · funcionar sin internet (service worker)
   - Código y datos (html, js, css, json): primero la red, para que siempre llegue la última versión;
     si no hay conexión, lo guardado.
   - Imágenes y fuentes: primero lo guardado (pesan y no cambian).
   - Desde la zona del maestro se puede descargar todo de una vez (mensaje «precargar»).
   ============================================================ */
const CACHE = "la-lupa-v1";

self.addEventListener("install", ev => { self.skipWaiting(); });
self.addEventListener("activate", ev => {
  ev.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("la-lupa-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

const esEstatico = url => /\.(webp|png|jpg|jpeg|svg|woff2?|ttf)$/i.test(url.pathname) || url.hostname.includes("fonts.gstatic.com");

self.addEventListener("fetch", ev => {
  const req = ev.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (esEstatico(url)) {
    ev.respondWith(caches.open(CACHE).then(async c => {
      const guardada = await c.match(req);
      if (guardada) return guardada;
      const r = await fetch(req);
      if (r.ok || r.type === "opaque") c.put(req, r.clone());
      return r;
    }));
    return;
  }
  if (url.origin !== location.origin && !url.hostname.includes("fonts.googleapis.com")) return;
  ev.respondWith(fetch(req).then(r => {
    if (r.ok) caches.open(CACHE).then(c => c.put(req, r.clone()));
    return r;
  }).catch(() => caches.match(req, { ignoreSearch: req.mode === "navigate" })));
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
