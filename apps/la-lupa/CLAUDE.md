# Agencia La Lupa

Juego de detectives de Lengua para 5.º y 6.º de Primaria (Andalucía). El alumno es detective del equipo de la agencia, junto a Lola y Mateo, con el director Robles al frente (avatar del maestro, que también es profe de Educación Física: a veces sale con ropa de deporte, expresiones `deporte`, `deporte-contento` y `agotado`), en el barrio ficticio de La Alameda. Cada caso trabaja una o varias reglas: encontrar y corregir faltas hace avanzar la investigación. Modo individual.

- **Lee primero `PLAN.md`**: fases, estado y decisiones.
- `BITACORA.md`: lo hablado con Pablo, sesión a sesión. **Actualízala** al terminar cada tarea importante.
- `TEMPORADA-1.md`: trama de la temporada de 5.º (hilo conductor, piloto de evaluación inicial, El Tachón). `LIBRETA.md`: cómo se usa la libreta de papel del alumno.
- **Referencia de experiencia:** `docs/investigacion/sherlock-ort-experiencia.md`. Describe cómo se vive Sherlock Ort al jugarlo: escenas a pantalla completa, ritmo lento, retos dentro de la imagen. La v1 de este juego fracasó por no tenerlo en cuenta.
- `DISEÑO.md` resume la investigación didáctica y curricular.
- Identidad propia: no se copia nada de Sherlock Ort (nombre, personajes, textos, imágenes ni listas de palabras). Solo se toma la idea de la mecánica.

## Ficheros

| Fichero | Qué es |
|---|---|
| `motor.js` | Escenario 16:9 de 1280×720 escalado a la pantalla, arte (o hueco marcado), texto que se escribe solo, HUD (libreta, archivo, lupa de pistas), ventanas, pantallas de «¡Pista conseguida!» / «¡Pista falsa!», registro y notas, palabras pulsables |
| `escenas.js` | `ESCENAS.<tipo>`: una función por tipo de escena |
| `academia.js` | **Academia de detectives**: patio con «turno de hoy», cola de repaso espaciado por alumno (`actualizarCola`, intervalos 1-3-7-15-30 sesiones), salas (`SALAS`) y actividades (`ACTIVIDADES.<id>`). Las 8 salas están activas: Archivo (`fichas`), Pupitre (`documento`), Laboratorio (`sismografo`), Interrogatorios (`testigo`: el testigo seseante; `pronunciar()` pasa una palabra a cómo se dice con seseo, yeísmo y -d final) y, en `salas/<id>.js` + `.css`, Terminal (`conjugar`: máquina del tiempo verbal), Pizarra (`descubrir`: descubre la regla), Centralita (`dictado`: radio o relámpago) e Imprenta (`pruebas`: galeradas con reglas mezcladas). Una sala nueva se añade en su propio archivo con `Object.assign(sala(id), {activa, instructor, actividad, leccionFija?, reglas?})` + `ACTIVIDADES[id]`. **Más ejercicios en una sala**: `salas/<sala>-extra.js` con `nuevaActividad(sala, {id, nombre, desc, reglas?}, fn)`; al entrar se elige en un menú. Hay extra en el Pupitre (`parte`: rellena el parte; `sintilde`: la máquina sin tilde), el Laboratorio (`homofonos`: el microscopio; `familias`: la centrifugadora), la Centralita (`deletreo`) y la Pizarra (`coma`: la coma que cambia el culpable). Toda actividad acepta `regla` (la que le pasa la ruta de preparación). Diseño en `docs/investigacion/academia-actividades.md` |
| `datos/academia/` | Bancos de la Academia: `palabras.json` (forma correcta, forma errónea típica, sílabas, tónica y frase con hueco), `textos.json` (documentos con `[palabras]` marcadas), `testigos.json` (testigo seseante), `verbos.json` (Terminal), `pizarra.json` (Pizarra), `dictados.json` (Centralita), `galeradas.json` (Imprenta), `apuntes.json` (esquemas para la libreta), `partes.json`, `sintilde.json`, `homofonos.json`, `familias.json` y `comas.json` (ejercicios extra). Cada uno tiene su validador en `herramientas/validar_<nombre>.py` |
| `app.js` | Entrada, tablón de corcho, partida, informe, zona maestro/a (página normal) y arranque |
| `encargos.js` | **Encargos** (misiones secundarias): buzón desde el tablón; cada encargo se abre al llegar a su rango (`encargo.rango` 0-4 = Novato…Detective de élite). Índice en `datos/encargos.json`; cada uno en `datos/encargos/<id>.json`, con el mismo formato que un caso más `encargo: {cliente, rango, contenido, dificultad}`. Trabajan el resto de la Lengua (comprensión, tipos de texto, gramática, vocabulario, literatura), se registran como resultados con `encargo: true` y van sin libreta ni sello. Solo usan arte que ya existe |
| `clase.js` | **Paquete de clase** (avatares del alumnado, solo en la clase de Pablo): se importa desde la zona del maestro y se guarda solo en ese dispositivo (IndexedDB). El alumno elige su avatar por su alias al crear su ficha; sale en la entrada, la placa, el informe y la foto de equipo del final. Sin paquete, todo funciona igual. Proceso y privacidad: `arte/AVATARES-ALUMNADO.md` |
| `preparacion.js` | **Preparación de cada caso** en la Academia (decisión de Pablo): descubre la regla (Pizarra) → apuntes en la libreta (`datos/academia/apuntes.json`: esquemas y tablas por regla) → dos prácticas elegidas por regla (`PRACTICAS`) → dictado. En el caso de repaso: imprenta, dictado mezclado y fichas. `ajustes.preparacion`: obligatoria (por defecto), opcional o no. El piloto no lleva preparación |
| `imprimibles/` | `apuntes.html?reglas=…` (los esquemas de cada regla para completar en la libreta), `libreta.html?casos=…` (libreta del alumno: portada y una doble página por caso, generada desde los datos; las cifras nunca se imprimen), `ficha-aspirante.html` (A4 a doble cara: alias, dibujo y descripción, con tira del nombre para recortar) y `autorizacion-familias.html` (borrador para el centro). Enlazados desde la zona del maestro |
| `styles.css` | Todo en px del escenario de 1280×720. Mundo visual único: papel envejecido, tinta, albero y azulejo |
| `datos/programacion.json` | **Qué caso va en qué curso, trimestre y orden.** Es lo único que se cambia para adaptarse a una programación |
| `datos/reglas.json` | Reglas: nombre, saberes, criterios, ficha del Archivo de Mateo y cartas de los careos |
| `datos/arte.json` | Catálogo de arte con su prompt. `_estilo` es el estilo común. `listo` (o `listas`, para las expresiones) cuando la imagen existe |
| `datos/casos/<id>.json` | Un caso: `numero`, `titulo`, `resumen`, `reglas` y `escenas[]` |
| `arte/` | Imágenes `.webp`. Fondos y objetos: `<id>.webp`; personajes: `<id>-<expresion>.webp`. `arte/ENCARGO.md` es el pedido para la IA de imágenes, generado automáticamente. `arte/entrega/` es donde llegan los PNG |
| `herramientas/` | `encargo_arte.py` (genera `ENCARGO.md` desde `arte.json`) e `integrar_arte.py [--borrar]` (convierte lo entregado a `.webp` y lo marca como listo; necesitan Pillow), `validar_casos.py`, `validar_academia.py`, `fusionar_pendientes.py`, `jugar_caso.js` (jugador automático con Playwright; `PAQUETE=…` para jugar con avatar) y `paquete_clase.py` (crea el paquete de clase desde los PNG de GPT) |

## Tipos de escena

Campos comunes: `fondo`, `personaje {id, expresion, lado: izq|der}`, `objeto`, `titulo`, `instruccion`, `quien`, `pistas[]`.
Marcado de faltas: `{mal|bien}` o `{mal|bien|etiqueta}`. La etiqueta es un id de `reglas.json` (para evaluar por regla) o, en los careos, la carta que demuestra la falta (la regla se deduce de la carta). Si el caso tiene más de 9 cartas, la ventana del careo las agrupa por regla. Las faltas de `texto` e `intro` se repasan después en `expediente`. Un caso con `"diagnostico": true` (el piloto) muestra al alumno su punto de partida por regla y alimenta la tabla de evaluación inicial de la zona del maestro.

| Tipo | Campos propios | Evalúa |
|---|---|---|
| `portada` | (usa número, título y resumen del caso) Precinto que hay que romper | — |
| `relato` | `texto` (se escribe solo; la flecha aparece al terminar) | — |
| `descubre` | `preguntas[{grupos, pregunta, opciones, correcta, explicacion}]`, `desbloquea:"cartas"` | 9.1 |
| `papeles` | `palabras[]` correctas, `faltas[{mal,bien,regla?}]`, `frase` opcional con `{0}…`: las correcciones rellenan la pista | 9.2 + 5.1 |
| `caza` | `declaracion` (documento: periódico, ficha, nota…) con faltas, `objeto` opcional, `recompensa` | 9.2 + 5.1 |
| `apunta` | `cabecera`, `apuntar[]`: momento de libreta. En modo papel el alumno lo escribe en su libreta; en modo digital, en el juego | — (lo valora el maestro con el sello) |
| `hipotesis` | `opciones[]`, `correcta`, `acierto`, `fallo` | — |
| `clasifica` | `categorias[]`, `palabras[{p, cat, silabas | pista}]` (`pista` es el consejo si falla; si no hay, se usan las sílabas), `contador` opcional («Ramo», «Azulejo»…; por defecto «Ficha»), `criterio` opcional | 9.1 (o `criterio`) |
| `huecos` | `palabras[{p, pos, letra, opciones[], pista, regla?}]`: a cada palabra le falta una letra y se elige cuál (nunca se ve una forma mal escrita) | 5.1 |
| `manchas` | `palabras[{p, pos (índice de la vocal tapada), silabas}]` | 5.1 |
| `careo` | `declaracion` con `{mal|bien|carta}`, `aclarado` (texto al terminar) | 9.2 + 9.1 + 5.1 |
| `candado` | `codigo` (cifras de las `recompensa.digito`, en orden), `exito` | — |
| `expediente` | — (recoge las faltas sembradas antes) | 9.2 + 5.1 |
| `pregunta` | `documento` opcional, `preguntas[{pregunta, opciones, correcta, criterio, explicacion?, pista?}]` (encargos) | el criterio de cada pregunta (4.1 por defecto) |
| `escribe` | `items[{enunciado, respuestas[], criterio, explicacion?, pista?, regla?}]`: respuesta corta, sin mayúsculas y con tildes (encargos) | el criterio de cada ítem |
| `ordena` | `fragmentos[]` en el orden correcto (se muestran mezclados), `criterio`, `pista?` (encargos) | `criterio` (4.1 por defecto) |
| `final` | `texto` → informe; `sello` opcional («¡ENCARGO CUMPLIDO!») | — |

Los retos con `recompensa {texto, digito}` muestran «¡Pista conseguida!» y guardan la cifra en la libreta.
**Libreta** (ver `LIBRETA.md`): `ajustes.libreta` es `papel` (por defecto: el juego no muestra las cifras; si el alumno las consulta, queda anotado) o `digital`. Al acabar el caso, el maestro **sella** el expediente en el propio dispositivo: rúbrica de 4 puntos + código de sello (zona del maestro, por defecto `LUPA`). El sello no bloquea; suma puntos para el rango (`puntosResultado`, `RANGOS` en `motor.js`).
Notas: solo cuenta el primer intento. Nota = aciertos / intentos × 10 (mínimo 1), escala IN/SU/BI/NT/SB, código del criterio con `.a` (5.º) o `.b` (6.º).

## Cómo crear un caso nuevo (borrador; se consolida cuando Pablo dé por bueno el caso 1)

1. **Regla y unidad**: elige la unidad de `programacion.json` y sus reglas. Si la regla no tiene `ficha` ni `cartas` en `reglas.json`, escríbelas.
2. **Historia**: un misterio pequeño en un lugar del barrio, con 3 o 4 sospechosos o testigos y un objeto protagonista. La solución sale de las palabras corregidas.
3. **Escenas**: copia la estructura del caso 1: portada → aviso → descubre → 2-3 lugares (relato + reto con cifra) → hipótesis → careo → candado → expediente → final. Pon 2-4 faltas por texto y siembra 3-5 en los relatos para el expediente.
4. **Arte**: añade a `arte.json` los fondos, personajes (con expresiones) y objetos nuevos, con su `prompt`. Reutiliza siempre Lola, Mateo, Robles y la oficina. Ejecuta `python3 herramientas/encargo_arte.py`. La IA de imágenes (ChatGPT o Gemini) lee `arte/ENCARGO.md` y deja los PNG en `arte/entrega/`. GPT no puede escribir en el repo (le da error 403), así que entrega zips con un `MANIFIESTO.json` de SHA-256 a través de Pablo. Extráelos en una carpeta del scratchpad (comprobando que ninguna ruta se sale de ella), verifica las firmas, copia los PNG a `arte/entrega/` y ejecuta `python3 herramientas/integrar_arte.py --borrar`. Revisa a mano que no haya **números o letras dibujados** que contradigan el caso (pasó con el candado del caso 1), indica hacia dónde mira cada personaje (`mira`), revisa las capturas y sube los cambios. Cada lote de un caso nuevo va en su propia issue.
5. **Prueba**: ejecuta `python3 herramientas/validar_casos.py` (huecos, código del candado = cifras en orden, cartas, imágenes, programación) y después `node herramientas/jugar_caso.js <unidad> <carpeta> perfecto` y `... fallos` (juega el caso entero; avisa de textos fuera de pantalla y errores de JS). Revisa las capturas de cada escena y las notas del informe.

**Varios casos a la vez (subagentes):** cada uno escribe solo `datos/casos/<caso>.json` y `datos/pendiente/<caso>.json` (`unidad`, `reglas`, `arte`), sin tocar los archivos compartidos; el validador ya los tiene en cuenta. Al terminar, `python3 herramientas/fusionar_pendientes.py --borrar` los pasa a `reglas.json`, `arte.json` y `programacion.json`.
6. **Revisión de Pablo** antes de darlo por cerrado.

## Academia (decisiones de Pablo, 4/11/2026)

Siempre abierta desde el tablón (y desde el informe de cada caso). Se registra aparte de los casos (`academia-registros`, `contexto: "academia"`). **Nota**: en la zona del maestro se marca qué cuenta (casos, encargos y Academia); la tabla y el CSV lo reflejan. La Academia es donde se aprende y se apunta; el caso, donde se demuestra. Sin libreta. Se puede usar en casa. Los puntos suman al rango con un tope diario (`TOPE_DIARIO`). Las palabras falladas en los casos y en la Academia entran en la cola de repaso. Para añadir contenido: palabras y textos nuevos en `datos/academia/`, y después el validador. Para añadir una sala: entrada en `SALAS` + función en `ACTIVIDADES`.

**Avatares del alumnado = datos de menores:** las fichas, los PNG y los `*.lalupa-clase.json` nunca van al repo (los bloquea `.gitignore`), ni a issues, ni a Artifacts. Se trabajan en el scratchpad, se le entrega el paquete a Pablo y después se borran las copias.

## Probar

`node .claude/serve.js` → `http://localhost:4321/apps/la-lupa/`.

## Pendiente / conocido

- Arte de la temporada 1 completo, salvo el director Robles y la foto del tribunal (issue #6).
- Los datos se guardan solo en `localStorage`. La zona del maestro/a no tiene PIN (el código de sello sí protege el sello). No hay sincronización con el backend.
