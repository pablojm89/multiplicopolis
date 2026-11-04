# Aula de juegos educativos (Primaria)

Repo con varios juegos educativos de Pablo (maestro de Primaria, Andalucía), servidos como web estática en GitHub Pages.
Idioma de trabajo: **español** (código, comentarios, commits y textos de la interfaz).

## Regla de oro: contexto mínimo

Este archivo se carga en TODAS las sesiones, así que se mantiene corto.
Cada sesión trabaja en **una sola cosa**:

- Si la tarea es de un juego → trabaja solo dentro de `apps/<juego>/` y lee su `CLAUDE.md`.
  **No leas ni explores otras carpetas de `apps/`** salvo que la tarea lo pida explícitamente.
- No hagas barridos de todo el repo (`grep -r`, `find .`, leer todo). Acota siempre a la carpeta de la tarea.
- Los ficheros grandes (p. ej. `apps/multiplicopolis/app.js`) se leen por trozos usando el mapa de su `CLAUDE.md`, no enteros.
- `docs/` solo se lee cuando la tarea es de investigación o pide un documento concreto (ver `docs/README.md`).

## Mapa

| Carpeta | Qué hay | Cuándo entrar |
|---|---|---|
| `apps/<juego>/` | Cada juego, autocontenido (HTML+JS+CSS) con su propio `CLAUDE.md` | Tareas de ese juego |
| `apps/la-lupa/` | Agencia La Lupa: detectives de Lengua (5.º y 6.º) | Tareas de ese juego |
| `apps/README.md` | Cómo crear un juego nuevo + plantilla de `CLAUDE.md` | Al crear un juego |
| `shared/` | Código común entre juegos (aún vacío) | Solo si la tarea es extraer/usar código común |
| `backend/` | Backend Apps Script + Google Sheets (protocolo documentado) | Tareas de sincronización/datos |
| `docs/` | Investigaciones y decisiones (Séneca, RGPD, ideas…) | Tareas de investigación |
| `index.html` | Redirige a Multiplicópolis (mantiene la URL antigua de Pages) | Casi nunca |
| `AGENTS.md` | Instrucciones para otros agentes (ChatGPT/Codex): hoy, el encargo de ilustraciones | Casi nunca |
| `.claude/serve.js` | Servidor estático local en el puerto 4321 | Para probar en local |

## Forma de trabajar con Pablo

- **Todo lo hablado queda en GitHub**: las decisiones en el `PLAN.md` del juego y el contexto en su `BITACORA.md`. Actualízalos al terminar cada tarea importante; Pablo no tiene por qué recordarlo.
- **Antes de diseñar a partir de un referente, pruébalo de verdad** (jugarlo o abrirlo), no te quedes en resúmenes.
- Pablo suele revisar desde el móvil: enséñale los resultados como Artifact o con capturas.
- El arte lo hace GPT (issues de GitHub; entrega zips a través de Pablo).

## Convenciones

- Web estática sin build ni dependencias: HTML + JS vanilla + CSS. Nada de npm salvo que se decida explícitamente.
- Cada juego usa rutas relativas y su propio prefijo en `localStorage` (`<juego>-...`).
- Alumnado menor de edad: no meter datos personales reales en el repo (nombres, notas, etc.).
- Probar en local: `node .claude/serve.js` y abrir `http://localhost:4321/apps/<juego>/`.
- Si añades un juego o carpeta, actualiza la tabla de arriba (una línea, no más).
