# Código común

Aquí irá lo que compartan varios juegos: perfiles y login de alumnos, XP/rangos/insignias, sincronización con el backend, exportación de notas (incluida la compatible con Séneca) y estilos base.

**Regla:** algo se mueve aquí solo cuando lo necesitan **dos o más juegos**, no antes. Hasta entonces, cada juego tiene su propia copia.

Cuando haya módulos, cada uno tendrá una línea en este archivo explicando qué hace y su API, para que una sesión pueda usarlo sin leer el código.

## Módulos

- **`sonido.js`** · música, ambientes de fondo y efectos, todo sintetizado con Web Audio (sin archivos). Se carga con `<script src="../../shared/sonido.js">` y expone `window.Sonido`:
  `iniciar({prefijo, porDefecto})` · `efecto(nombre, {vol, pan, min})` · `musica(nombre|null)` · `fondo(nombre|null)` · `contexto(musica, fondo)` · `agachar(bool)` (bajar la música mientras habla una voz) · `control(padre?)` (botón 🔊 con volúmenes) · `silenciar(bool)` · `volumen('musica'|'efectos', 0..1)`.
  Catálogos: `Sonido.MUSICAS`, `Sonido.FONDOS`, `Sonido.EFECTOS`. No suena nada hasta el primer toque (lo exige el navegador); lo pedido antes empieza entonces. Las preferencias se guardan en `<prefijo>-sonido`.
  Para escuchar y afinar: `laboratorio-sonido.html` (`http://localhost:4321/shared/laboratorio-sonido.html`). Usos: `apps/la-lupa/sonido.js` (ver `apps/la-lupa/SONIDO.md`) y `apps/multiplicopolis/sonido.js`.
