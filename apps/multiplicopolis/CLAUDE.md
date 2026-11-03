# Multiplicópolis

Juego para aprender las tablas y la multiplicación (de 1º a 6º de Primaria): mapa de mundos por curso, niveles con estrellas, jefes, XP, rangos, insignias, misiones y exámenes que pone el maestro/a, y sincronización con Google Sheets.

Ficheros: `index.html` (todas las vistas), `app.js` (toda la lógica, ~460 líneas pero muy largas, ~58 KB), `styles.css`.

## Cómo leer `app.js` sin gastar contexto

**No lo leas entero.** Las líneas son larguísimas (una función por línea). Busca la sección con
`grep -n "── " app.js` o la función con `grep -n "function nombre" app.js` y lee solo ese rango.

Secciones en orden (las cabeceras son comentarios `/* ── ... */`):

1. **Constantes**: `DEFAULT_BACKEND_URL`, `TEACHER_PIN`, `APP`, `GROUPS_DEFAULT`, `AVATARS`, `RANKS`, `MODES`.
2. **CURRÍCULO 1º-6º**: `CURRICULUM` (cursos → `levels[]` + `boss`), cada uno con su `spec`
   (`kind`: `fact` | `concept` | `column` | `mixed`; `render`: `step` | `result`). Derivados: `LEVELS`, `BOSSES`.
3. **Utilidades y estado**: `$`, `$$`, `uid`, `shuffle`, `pick`… y las variables globales cargadas de `localStorage`.
4. **Núcleo/UI**: `init`, `bind`, `renderLogin`, `loginStudent`, `showApp`, `renderApp`, `renderWorldMap`, `renderProgress`…
5. **Motor de problemas**: `makeProblem(spec)`, `buildQuestions`, `makeQuestion`, `startGame`, `renderQuestion`, `checkAnswer`.
6. **Multiplicación en columna**: `renderColumn*`, `columnSteps`, `finishColumn`. Al final, `finishGame` (XP, estrellas, notas, cola de sincronización).
7. **Contenido de misiones/exámenes**: `COLUMN_CONTENT`, `contentSpec`, `contentLabel`.
8. **Insignias**: `BADGES`, `evaluateBadges`, `renderBadges`, `renderAvatarPicker`.
9. **Laboratorio de la columna**, **Límite de curso por grupo**, **Mapa de calor**.
10. **Mochila en la nube**: `snapshotProgress`, `pushProgress`, `mergeProgress`, `pullStudentProgress`.
11. **Panel del maestro/a**: `renderTeacher`, misiones, exámenes, grupos, alumnado, fichas imprimibles.
12. **Sincronización**: `enqueue`, `post`, `syncQueue`, `publishConfig`, `syncPullConfig`. **Exportación CSV**: `exportProgress`, `exportGrades`.

## Datos

- Claves de `localStorage`: `multiplicopolis-{students,groups,settings,missions,exams,grades,sync-queue,limits}`.
- Alumno (`studentBase`): `id, name, group, password, avatar, xp, attempts[], mistakes{"7x8":n}, mastery{tabla:%}, levels{id:{stars,best}}, badges, days, examsDone`.
- Backend: protocolo en `backend/README.md` (este juego envía `app: "multiplicopolis"`).

## Problemas conocidos

- `TEACHER_PIN` y la URL del backend están escritos tal cual en el código, y las contraseñas de los alumnos se guardan en claro. Cualquiera que vea el repo o el JS puede leerlos.
- No hay tests. Para comprobar un cambio, sirve en local y ábrelo en el navegador (Playwright está disponible en las sesiones en la nube).
