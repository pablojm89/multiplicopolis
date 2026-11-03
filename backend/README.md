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
