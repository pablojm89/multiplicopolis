# Juegos

Cada carpeta es un juego **autocontenido**: se puede abrir y modificar sin mirar los demás.

| Juego | Área | Estado |
|---|---|---|
| [multiplicopolis](multiplicopolis/) | Matemáticas · tablas y multiplicación | En uso |

## Crear un juego nuevo

1. Crea `apps/<nombre>/` (minúsculas, sin tildes ni espacios) con `index.html`, `app.js` y `styles.css`.
2. Usa solo rutas relativas. Prefijo de `localStorage`: `<nombre>-`.
3. Si se sincroniza con el backend, envía `app: "<nombre>"` (ver `backend/README.md`).
4. Crea `apps/<nombre>/CLAUDE.md` con la plantilla de abajo.
5. Añade una fila a la tabla de arriba y otra al mapa del `CLAUDE.md` raíz si hace falta.

Plantilla de `CLAUDE.md`. Debe ser corta: es lo que una sesión lee antes de tocar el juego.

```markdown
# <Nombre del juego>

Qué es en 2-3 líneas: área, curso o cursos, mecánica principal.

Ficheros: qué hay en cada uno.

## Mapa del código
Secciones o funciones principales, en orden, para leer solo lo necesario.

## Datos
Claves de localStorage, forma de los objetos principales y qué se envía al backend.

## Problemas conocidos / pendientes
```
