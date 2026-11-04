# Guardar en la nube (Google Apps Script + Hojas de Google)

**Opcional.** Sin configurarlo, el juego funciona igual y todo se guarda solo en cada dispositivo.

Con la nube activada:
- Cada resultado (caso, encargo o Academia), con sus notas por criterio, llega a una **hoja de cálculo de Pablo**.
- El progreso de cada detective también se guarda allí, así que un alumno puede **seguir en otro dispositivo** con el botón «☁️ Recuperar mi detective» de la entrada.
- Si no hay internet, todo espera en una cola y se envía cuando vuelve la conexión.

## Privacidad
- Se envía el **alias** de detective, nunca el nombre real.
- La hoja está en la cuenta de Google de Pablo. Antes de usarla con alumnado real, hay que confirmar con el centro qué cuenta usar; lo prudente es una cuenta educativa del centro, no una personal. Ver `docs/investigacion/seneca-exportacion.md` (privacidad) y `arte/AVATARES-ALUMNADO.md`.
- El código de aula funciona como una contraseña sencilla: quien lo tenga puede leer el progreso de un alias. No sirve para datos sensibles.

## Ponerlo en marcha (unos 10 minutos)
1. Crea una **hoja de cálculo** nueva en Google Drive, por ejemplo «La Lupa · 5.º A».
2. En la hoja, ve a **Extensiones → Apps Script**. Borra lo que haya y pega el contenido de `backend/apps-script/la-lupa.gs`. Guarda.
3. **Implementar → Nueva implementación → Tipo: Aplicación web.**
   - Ejecutar como: *yo*.
   - Quién tiene acceso: *cualquier usuario*. Hace falta para que las tablets puedan enviar sin iniciar sesión.
4. Autoriza los permisos (solo los de esa hoja) y copia la **URL de la aplicación web**, la que termina en `/exec`.
5. En el juego, en la zona del maestro → «Guardar en la nube»: pega la URL, inventa un **código de aula** (por ejemplo `5A-2027`) y guarda. Repítelo en cada dispositivo del aula; el código tiene que ser el mismo en todos.
6. La hoja crea sola tres pestañas:
   - **Alumnos**: alias y curso.
   - **Notas**: una fila por criterio de cada partida, con la fecha, el tipo (caso, encargo o Academia), el nivel, la nota y la calificación. Desde aquí se puede hacer una tabla dinámica por alumno y criterio para Séneca.
   - **Progreso**: la copia de seguridad de cada detective.

## Cómo funciona por dentro
- Cliente: `apps/la-lupa/nube.js`. Usa el mismo protocolo que el resto de juegos (`backend/README.md`): POST por lotes (`no-cors`) y GET `type=progress`.
- Servidor: `backend/apps-script/la-lupa.gs`, un proyecto **propio** de La Lupa que no sustituye al de Multiplicópolis.
- Probado con un servidor que imita al Apps Script: envío, notas, progreso y recuperación en otro dispositivo. **Falta probarlo con un Apps Script de verdad.**
