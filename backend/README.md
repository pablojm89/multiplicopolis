# Backend: Google Apps Script + Google Sheets

El código del Apps Script **todavía no está en el repo**: vive en el proyecto de Apps Script de Pablo.
Cuando se traiga, irá en `backend/apps-script/` (por ejemplo, con `clasp`).

Un único despliegue sirve a todos los juegos, que se distinguen por el campo `app`.

## Protocolo (deducido del cliente de Multiplicópolis)

**GET** `<URL>?app=<juego>&classCode=<código de aula>&type=<tipo>`
- `type=config` → `{ ok, config: { missions, exams, groups, limits } }`
- `type=progress&studentId=<id>` → `{ ok, progress: {...snapshot del alumno, updatedAt} }`

**POST** (`mode: "no-cors"`, `Content-Type: text/plain`), cuerpo JSON `{ app, classCode, type, ... }`:
- `type: "batch"`, `items: [{ type, payload, app, at }]`, donde el `type` de cada elemento es `student` | `attempt` | `grade` | `progress`.
- `type: "config"`, `payload: { missions, exams, groups, limits, settings }`: el maestro/a publica la configuración del aula.
- `type: "ping"`: prueba de conexión.

Al ir en `no-cors`, el cliente no puede leer la respuesta del POST: no sabe si se guardó.


## Agencia La Lupa

Tiene su propio Apps Script en `apps-script/la-lupa.gs` (`app: "lalupa"`), con las hojas Alumnos, Notas y Progreso. Pasos, privacidad y lo que queda pendiente en `apps/la-lupa/NUBE.md`.

Su protocolo es la **versión 2** y se aparta del de arriba en lo que hacía perder datos:

- **POST legible**: `Content-Type: text/plain` y **sin** `no-cors`. El cliente lee la respuesta y solo da el envío por hecho con `{ ok: true }`. Falta comprobarlo con un Apps Script real (botón «Probar conexión» de la zona del maestro).
- Cuerpo: `{ app: "lalupa", classCode, type: "batch", items: [{ id, type, payload, at }] }`, con `type` = `student` | `grade` | `progress`. Un lote sin elementos sirve de prueba de conexión.
  - `student`: `{ studentId, alias, curso }`.
  - `grade`: `{ resultId, studentId, alias, curso, tipo, unidad, titulo, nivel, fecha, libreta, diagnostico, notas: [{ criterio, nota, calificacion, aciertos, intentos }] }`.
  - `progress`: `{ studentId, alias, curso, updatedAt, snapshot: { perfil: { id, nombre, curso, avatar?, creado? }, resultados: [...], academia: {...}, registrosAca: [...] } }`. Puede traer solo una parte del historial: el servidor **fusiona por id**, nunca sustituye.
- Respuesta: `{ ok: true, recibidos, rechazados: [{ id, error }], version: 2 }` o `{ ok: false, error, reintentar? }`. Siempre JSON, también en los errores.
- **Idempotente**: repetir un lote no duplica nada (Alumnos por aula + `studentId`; Notas por `resultId` + criterio; Progreso por aula + `studentId`).
- **GET** `?app=lalupa&classCode=…&type=progress&studentId=…` → `{ ok, progress: { snapshot, updatedAt } }`; `type=ping` → `{ ok: true, version: 2 }`.
- `studentId` es el alias normalizado (`normAlias` en `apps/la-lupa/nube.js`, `normAlias_` en el `.gs`); el servidor lo vuelve a normalizar, igual que el código de aula (mayúsculas).
- Límites: 1 MB por envío, 60 elementos, 900 KB de progreso por alumno.
