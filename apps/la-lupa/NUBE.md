# Guardar en la nube (Google Apps Script + Hojas de Google)

**Opcional.** Sin configurarlo, el juego funciona igual y todo se guarda solo en cada dispositivo.

> **Estado (9/11/2026): todavía NO está listo para usarlo con alumnado real.** Está probado con un servidor de pruebas que ejecuta el `la-lupa.gs` de verdad sobre unas hojas simuladas, pero falta comprobarlo con un Apps Script real y falta decidir lo de «Pendiente antes de usarlo con alumnado real» (más abajo).

Con la nube activada:
- Cada resultado (caso, encargo o Academia), con sus notas por criterio, llega a una **hoja de cálculo de Pablo**.
- El progreso de cada detective también se guarda allí, así que un alumno puede **seguir en otro dispositivo** con el botón «☁️ Recuperar mi detective» de la entrada.
- Si no hay internet, lo pendiente espera en una cola y se envía cuando vuelve la conexión.
- **Un envío solo se da por hecho cuando el servidor contesta que lo ha guardado.** Si no se puede confirmar, no se borra nada de la cola, se reintenta solo y la zona del maestro lo avisa («No se ha podido confirmar el último envío»). Repetir un envío nunca duplica filas.
- **Nada se sustituye: todo se fusiona.** Si un detective juega en dos dispositivos, la nube junta los resultados de los dos; al recuperar, lo de la nube se une a lo que haya en el dispositivo (sin perder puntos, lupas ni sellos).

## Qué sale del dispositivo (y qué no)
- **Sale** (solo si la nube está configurada), hacia la hoja de cálculo: el **alias**, el curso, las notas por criterio de cada partida (con su fecha y hora, el título del caso y el nivel), las palabras que hay que repasar, los minutos, las pistas pedidas, el sello de la libreta y el estado de la Academia (puntos, lupas, cola de repaso).
- **No sale**: el n.º de lista de Séneca, los avatares, las partidas a medias, lo escrito en la libreta digital, el detalle de cada respuesta, el PIN ni el código de sello.
- El alias es lo único que identifica al alumno: **no puede ser su nombre real**. Con el paquete de clase, los alias los reparte el maestro.
- La hoja está en la cuenta de Google de quien la crea. Antes de usarla con alumnado real, hay que confirmar con el centro qué cuenta usar; lo prudente es una cuenta educativa del centro, no una personal. Ver `docs/investigacion/seneca-exportacion.md` (privacidad) y `arte/AVATARES-ALUMNADO.md`.
- «Borrar datos de este dispositivo» **no borra la hoja**: para quitar a un alumno de la nube, se borran sus filas de las tres pestañas.

## Ponerlo en marcha (unos 10 minutos)
1. Crea una **hoja de cálculo** nueva en Google Drive, por ejemplo «La Lupa · 5.º A».
2. En la hoja, ve a **Extensiones → Apps Script**. Borra lo que haya y pega el contenido de `backend/apps-script/la-lupa.gs`. Guarda.
3. **Implementar → Nueva implementación → Tipo: Aplicación web.**
   - Ejecutar como: *yo*.
   - Quién tiene acceso: *cualquier usuario*. Hace falta para que las tablets puedan enviar sin iniciar sesión.
4. Autoriza los permisos (solo los de esa hoja) y copia la **URL de la aplicación web**, la que termina en `/exec`.
5. En el juego, en la zona del maestro → «Guardar en la nube»: pega la URL, inventa un **código de aula** (por ejemplo `5A-2027`) y guarda. Repítelo en cada dispositivo del aula; el código tiene que ser el mismo en todos (da igual mayúsculas o minúsculas).
6. Pulsa **«Probar conexión»**. Tiene que decir «✔ Conexión correcta: el servidor confirma los envíos». Si no, dice qué falla.
7. La hoja crea sola tres pestañas:
   - **Alumnos**: alias y curso (una fila por alumno).
   - **Notas**: una fila por criterio de cada partida, con la fecha, el tipo (caso, encargo o Academia), el nivel, la nota y la calificación. Al sellar un caso, se actualiza su fila (columna `libreta`); no se añade otra. Desde aquí se puede hacer una tabla dinámica por alumno y criterio para Séneca.
   - **Progreso**: la copia de seguridad de cada detective (texto partido en celdas; no se toca a mano).
8. Si se cambia el código del `.gs`: **Implementar → Gestionar implementaciones → editar → Versión: nueva**. Así la URL no cambia. (Con «Nueva implementación» la URL cambia y hay que volver a ponerla en todos los dispositivos.)

Botones de la zona del maestro: «Enviar ahora» (no espera al reintento automático) y «Volver a enviar todo» (vuelve a subir todo lo de ese dispositivo; no duplica nada).

## Comprobar con un Apps Script de verdad (pendiente, obligatorio)
Todo esto está probado solo en local. Con el Apps Script real hay que ver, con un alias de prueba:
1. **«Probar conexión» da ✔.** Es la prueba de que el navegador puede *leer* la respuesta del envío (un POST `text/plain` sin `no-cors`). Si diera «Se puede leer, pero el envío no se confirma», Google no estaría dejando leer la respuesta: en ese caso **la cola no se vacía nunca** (no se pierde nada, pero tampoco se confirma nada) y habría que cambiar la forma de confirmar (por ejemplo, preguntando después por GET).
2. Jugar un caso: aparecen 1 fila en «Alumnos», 1 fila por criterio en «Notas» y 1 fila en «Progreso»; «Pendientes de enviar» vuelve a 0.
3. Sellarlo: las filas de «Notas» pasan a tener la columna `libreta` rellena y **no hay filas nuevas**.
4. Pulsar «Volver a enviar todo» dos veces: **no hay filas nuevas**.
5. Crear un detective con el alias `007`: en «Alumnos» y «Progreso» su `studentId` sigue siendo `007` (texto, alineado a la izquierda) y «Recuperar mi detective» lo encuentra. Repetirlo con un código de aula solo de números (por ejemplo `1234`).
6. Recuperar ese alias en otro dispositivo (o en una ventana privada): baja el progreso; jugar algo allí y recuperar en el primero: están las dos cosas.
7. **25 tablets a la vez** (o 25 pestañas): que todos terminen algo en el mismo minuto y que al rato todas tengan «Pendientes de enviar: 0». Si alguna muestra «El servidor estaba ocupado», se reintenta sola.
8. Mirar en el editor de Apps Script → **Ejecuciones** que no hay errores y cuánto tarda cada una.

## Pendiente antes de usarlo con alumnado real
- **Quién es quién (decisión del maestro).** Hoy basta con saber el alias de un compañero para bajarse su ficha con «Recuperar mi detective» en un dispositivo del aula, y dos alumnos con el mismo alias (en dispositivos distintos) se mezclan en la nube: ya no se pisan, pero sus resultados se juntan. La propuesta es un **código de recuperación por alumno** (3 o 4 cifras o una palabra, creado con la ficha y apuntado en la libreta de papel), que el servidor exija para leer y para escribir. No está hecho.
- **El código de aula no es una contraseña.** El servidor acepta cualquier código: con solo la URL, cualquiera puede añadir filas (basura) a la hoja. Y la URL y el código están a la vista en la zona del maestro (ponle PIN) y guardados en cada dispositivo. Propuesta: una lista de aulas válidas o una clave en las propiedades del script. No está hecho.
- **Cuenta de Google y permiso del centro** (arriba, en privacidad), y que las familias estén informadas de que las notas van a una hoja de Google.
- **La comprobación con un Apps Script real** del apartado anterior.
- Si un alumno cambia de alias, en la nube es otro alumno (no hay forma de unirlos más que a mano en la hoja).

## Cómo funciona por dentro
- Cliente: `apps/la-lupa/nube.js`. Servidor: `backend/apps-script/la-lupa.gs`, un proyecto **propio** de La Lupa que no sustituye al de Multiplicópolis. Protocolo: cabecera del `.gs` y `backend/README.md`.
- **Identidad:** `studentId = normAlias(alias)` (sin mayúsculas ni tildes; lo que no es letra o número, guion). La misma función está en el cliente (`normAlias`) y en el servidor (`normAlias_`); en un mismo dispositivo, el juego no deja crear dos fichas cuyo alias dé el mismo resultado.
- **Cola** (`lalupa-nube-cola`): no guarda copias de los datos, solo qué falta por subir (alumnos, resultados y detectives con progreso nuevo). Lo que se envía se arma en el momento con lo que hay en el dispositivo. Por eso ocupa muy poco (162 resultados sin conexión: unos 5 KB) y no puede llenar el almacenamiento. Tope: 6.000 notas pendientes; si se supera, se sueltan las más antiguas (siguen en el dispositivo y en la copia de progreso) y la zona del maestro lo avisa.
- **Envío:** lotes de hasta 40 elementos y unos 300 KB; el historial largo de un alumno sube por tandas de 100 resultados. Si falla, se reintenta a los 1, 2, 4… minutos (máximo 10), al volver la conexión o con «Enviar ahora».
- **Sin duplicados:** «Alumnos» va por aula + alias; «Notas», por id del resultado + criterio (si vuelve, se actualiza); «Progreso», por aula + alias, y lo que llega se fusiona por id con lo que había. La función que fusiona el estado de la Academia es la misma en los dos archivos (`fusionarAcademia` / `fusionarAcademia_`): si se cambia una, hay que cambiar la otra.
- **La hoja no interpreta nada:** las columnas de texto van como «texto sin formato» y lo que empieza por `=`, `+`, `-` o `@` lleva un apóstrofo delante; los trozos del progreso empiezan por `~`.
- **Límites del servidor:** 1 MB por envío, 60 elementos, 30 criterios por resultado y 900 KB de progreso por alumno. Siempre contesta en JSON, también cuando hay un error o la hoja está ocupada.
- **Lo que baja se valida** antes de guardarlo (`nubeValidar`): se reconstruye campo a campo con su tipo, el curso tiene que existir y el alias tiene que corresponder; lo que no tiene forma válida se descarta y se avisa. Si se añade un campo nuevo a los resultados y debe viajar, hay que añadirlo en `resultadoNube` / `academiaNube`.
- No viajan: las partidas a medias (`lalupa-partidas-…`), el n.º de lista, los eventos de cada partida ni lo escrito en la libreta digital.
- Pruebas (no están en el repo): el `.gs` real ejecutado en Node sobre unas hojas simuladas que imitan las conversiones de Hojas de Google (números, fechas, fórmulas, apóstrofo), y el juego en Chromium contra ese servidor: caídas, respuestas ilegibles, reintentos, sellos, dos dispositivos, dos pestañas, copias manipuladas e historiales largos.
