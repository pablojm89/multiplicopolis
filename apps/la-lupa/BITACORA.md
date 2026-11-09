# Bitácora de Agencia La Lupa

Resumen de lo hablado con Pablo, sesión a sesión, para que **nadie tenga que recordarlo**. Las decisiones formales van en `PLAN.md`; aquí queda el contexto: qué pidió, qué le gustó, qué no y por qué.
Claude actualiza este archivo al terminar cada tarea importante.

---

## 3 de noviembre de 2026

**Arranque.** Pablo quiere montar en este repo un sistema de juegos educativos, conectados en el futuro con su cuaderno de Séneca. Se reorganizó el repo para que cada juego tenga su carpeta y su `CLAUDE.md` y las sesiones no gasten contexto en lo demás.

**Encargo del juego**, por fases:
1. Investigar todo sobre «Las aventuras de Sherlock Ort» (Fernando Martí) y recomponerlo para el 3.er ciclo.
2. Completar con los contenidos de Lengua del 3.er ciclo que falten.
3. Aventura gráfica con personajes y escenarios generados con IA (Gemini/ChatGPT).

**Investigación (fase 1):** Sherlock Ort, referentes y didáctica, y currículo andaluz. Ver `docs/investigacion/`. Hallazgo clave: el alumno debe **escribir** la corrección (no elegir entre formas mal escritas) y recibir feedback inmediato.

**Decisiones de Pablo:**
- Identidad **Agencia La Lupa** (opción C: el alumno es parte del equipo).
- Reparto de 5.º y 6.º por defecto, adaptable más adelante a la programación de su libro de texto.
- Juego individual de momento.

**Prototipo v1 → descartado.** Pablo: «no tiene la sensación y experiencia de las actividades de Sherlock Ort… ¿has hecho la prueba del juego?». Tenía razón: se había construido a partir de un resumen, sin jugar el original. **Lección:** jugar de verdad los referentes antes de diseñar. Se jugó Sherlock Ort en directo (`docs/investigacion/sherlock-ort-experiencia.md`): la fuerza está en la puesta en escena (pantalla completa, ritmo lento, retos dentro de la imagen y momentos de resultado).

**v2:** motor de escenas a pantalla completa y caso 1 «El pregón desaparecido» rehecho. Pablo pide que **lo que funcione y le guste se convierta en el procedimiento para crear más casos**.

**Arte:**
- Primero se propuso un estilo de álbum ilustrado. Pablo lo encontró «ñoño»: quiere algo **más actual e impactante, hacia el anime, con un aire oscuro de detectives estilo Sherlock Holmes**, porque los chavales «están curados de espanto con series como Stranger Things», y manteniendo el barrio andaluz.
- Ideas de Pablo: **guiños a su cultura** (farmear aura, six seven, Fortnite, Among Us, memes) y un **malo con la mandíbula «sigma» y pose de mewing** (de ahí El Tachón).
- GPT se conectó al repo y hace las ilustraciones. Se le habla por issues de GitHub ([#1](https://github.com/pablojm89/multiplicopolis/issues/1)). No puede escribir en el repo (error 403), así que entrega zips a través de Pablo.
- Lote 1 (Lola y la oficina): Pablo: «brutales». Lote 2: las 36 imágenes del caso 1 integradas.

## 4 de noviembre de 2026

**Valoración del caso 1 con arte:** «me gusta bastante».

**Pablo pide:**
- **Que todo lo que hablemos quede en GitHub**, para no tener que recordarlo → esta bitácora, más la sección «Forma de trabajar con Pablo» del `CLAUDE.md` raíz.
- **Recuperar la libreta del alumno**, que era la gracia de Sherlock Ort: investigar apuntando en su propia libreta. Se había perdido al pasarlo todo a digital → propuesta en `LIBRETA.md`.
- **Una trama de temporada**: hilo conductor entre casos, un primer caso de **evaluación inicial** que enganche con la historia y los personajes, y un **final cerrado**, como la primera temporada de una serie → borrador en `TEMPORADA-1.md`.

**Decidido:** El Tachón es la opción C, Bruno el repartidor: un antiguo aspirante del que se rieron por sus faltas, que acaba uniéndose al equipo.
**Pablo pregunta qué es el «código de sello»** de la libreta: se le explican las opciones (bloquear el avance, que el sello sume puntos sin bloquear, o solo rúbrica). Pendiente de su elección.

**Decidido:** libreta con **opción B** (el sello premia sin bloquear).
**Pablo, con prisa porque su plan semanal de GPT se reiniciaba:** «aprovecha ahora si necesitas imágenes». Se encargó el lote 3 (13 imágenes: Bruno, El Tachón, la oficina saboteada, el callejón y 4 objetos) en la [issue #2](https://github.com/pablojm89/multiplicopolis/issues/2). Llegó en 3 zips y se integró.

**Hecho:**
- **Piloto «La prueba de acceso»** (evaluación inicial): sabotaje nocturno de la agencia, Bruno reparte un periódico lleno de faltas, ficha de ingreso, placa de prácticas y, al final, El Tachón: «Bienvenido, novato».
- **Modo libreta de papel**, sello de la directora y rangos de detective.
- **Gancho de El Tachón** al final del caso 1.

**Pablo pide continuar con los casos** → caso 2 «El mercado del revés» (b/v) escrito y jugable; arte pedido en la [issue #3](https://github.com/pablojm89/multiplicopolis/issues/3).

**Pablo pide una «Academia de detectives»:** un sitio al que ir a entrenar al terminar un caso, con «miles de propuestas» de actividades del estilo del juego. Que no sea solo hacer actividades, sino también explicación y aprendizaje. Con una estética muy currada y distinta según la actividad: un pupitre visto desde arriba con un documento delante, un ordenador con estética retro, una pizarra… Pidió que un subagente Fable imaginara las actividades → `docs/investigacion/academia-actividades.md`.

- Caso 3 «La carta sin haches» (h) escrito y jugable. Sus 6 imágenes se añaden al encargo de la issue #3.
- Lluvia de ideas de la Academia terminada (`docs/investigacion/academia-actividades.md`): la antigua escuela del barrio como academia, 8 salas, 35 actividades, «turno de hoy» con repaso espaciado y bancos de datos. Pendiente de las decisiones de Pablo (§7).

**Decisiones de Pablo sobre la Academia:** siempre abierta («tiene mucho más sentido»); que se registre y ya se verá si se usa para la nota; don Anselmo, de acuerdo; el testigo seseante «me encanta»; sin libreta; sí se puede usar en casa.
**Hecho:** primera versión de la Academia: patio con turno de hoy, cola de repaso espaciado y 3 salas (Archivo, Pupitre, Laboratorio), con bancos de datos y un validador. Arte de la Academia pedido en la issue #4 (9 fondos + don Anselmo).

- Caso 4 «El panel de azulejos» (c/z/s) escrito y jugable. Nuevo `herramientas/validar_casos.py` (encontró una posición de hueco mal puesta). Sus 6 imágenes se añaden a la issue #3.
- Academia: Sala de Interrogatorios con «el testigo seseante». Lola lo explica con orgullo («yo lo digo así… y lo escribo así»); nunca se habla de error. Banco ampliado a 111 palabras.

**Pablo: «Sigue con el caso 5»** → caso 5 «La noche de los farolillos» (ll/y), la mitad de la temporada.
**Pablo: «Pon si quieres a varios subagentes para hacerlas todas»** → se escribieron los casos 6-10 a la vez, con 5 subagentes, uno por caso. Para que no se pisaran, cada uno dejó lo que añadía a los archivos compartidos en `datos/pendiente/` (ahora `fusionar_pendientes.py` lo pasa a su sitio). Después se revisaron y se jugaron todos con un jugador automático nuevo (`herramientas/jugar_caso.js`), que juega cualquier caso con aciertos y con fallos.
- **Temporada 1 completa:** piloto + 10 casos. Resumen de cada episodio en `TEMPORADA-1.md`. Final: Bruno desenmascarado, Robles le pide perdón, Mateo: «Los errores se corrigen. Las personas no se tachan», Bruno entra como aprendiz. Gancho para 6.º: una carta de lejos con una tilde diacrítica dudosa.
- **Arreglos que salieron al probar:** las cartas del careo temblaban con el ratón encima (no se podían pulsar bien); la pista al fallar la carta hablaba siempre de «la sílaba fuerte», ahora depende de la regla; en el caso de repaso (28 cartas), las cartas salen agrupadas por regla; «el Tachón» con el artículo en minúscula en mitad de frase, como pide la RAE para los apodos.
- **Arte:** 34 imágenes nuevas de los casos 5-10 (69 pendientes en total, sumando las de las issues #3 y #4).

**Arte de los lotes 4 y 5** (GPT, 35 imágenes en 6 zips): integrado con las firmas verificadas. Los casos 2-4 y la Academia ya tienen todas sus ilustraciones. El Pupitre escribe ahora el documento sobre la hoja en blanco del fondo cenital. Issues #3 y #4 cerradas.

**Pablo pide, para más adelante, sonido en los juegos:** «un hilo musical de ambiente, misterioso, que vaya cambiando según el contexto; sonidos de fondo recurrentes, como de pasos, para darle misterio; clic cuando se abren las cerraduras, puertas… un efecto de sonido que tenga sentido con lo que hay en cada momento». Sirve música de uso gratuito o creada por nosotros. Queda como pendiente en `PLAN.md`.

**Arte de los casos 5-10** (issue #5, 34 imágenes): integrado. La temporada 1 ya tiene todas sus ilustraciones. Al revisarlo salió un detalle: el motor volteaba a Bruno para que mirara a su bocadillo, y eso le pasaba la pulsera a la muñeca derecha, cuando la pista es «muñeca izquierda». Ahora Bruno y el Tachón no se voltean nunca (`no_voltear`).

**Pablo: «el profe soy yo, un hombre; ¿no tendría sentido que el director fuera un avatar mío con el nombre cambiado? Así, cuando dice lo del sello, vienen a mi mesa».** Le gusta Robles y toda su trama, así que se queda: pasa a ser **el director Robles**. Añade: «además de Lengua o Mates soy profe de Educación Física; por darle un punto gracioso, que aparezca a veces con ropa normal y otras con outfits más atléticos, como que llego de hacer deporte». → 7 expresiones (4 normales y 3 deportivas) y la foto del tribunal rehecha, pedidas a GPT en la issue #6. Pablo mandó fotos suyas como referencia. Algunas salían con niños, así que no se guardan ni se reenvían: el encargo lleva solo una descripción en texto, y si quiere más parecido, él le pasa a GPT una foto en la que salga solo. Los textos de los 11 casos se pasaron a masculino con 3 subagentes, con unas pocas escenas del guiño deportivo.

**Idea de Pablo: avatares del alumnado.** Quiere que, solo cuando lo use él con sus alumnos, haya una primera actividad tras la evaluación inicial: una ficha impresa en la que cada alumno dibuje su cara y haga una descripción de sí mismo (gustos, etc.) coherente con el juego. GPT crearía con eso su personaje, y cada jugador se vería en el juego con su avatar. Propuesta en `PLAN.md`; pendiente de sus decisiones (sobre todo, privacidad y consentimiento).

**Pablo: «adelante con todo»** (avatares, alias, paquete privado, ficha y autorización). Hecho:
- `clase.js`: el paquete de clase se importa en la zona del maestro y se guarda solo en ese dispositivo. Al crear su ficha, el alumno pulsa su avatar, que luego sale en la entrada, en la placa, en el informe y en la foto de equipo del final de cada caso. Probado con un paquete de prueba hecho con personajes del juego.
- `herramientas/paquete_clase.py`, que convierte los PNG de GPT en el paquete (unos 45 KB por avatar).
- `imprimibles/ficha-aspirante.html` (A4 a doble cara, con una tira para recortar el nombre antes de escanear) e `imprimibles/autorizacion-familias.html` (borrador para revisar con la dirección o el DPD).
- `arte/AVATARES-ALUMNADO.md`: el procedimiento y el encargo tipo para ChatGPT. Pablo sube las fichas directamente en el chat de ChatGPT, nunca por GitHub.

**Idea de Pablo: misiones secundarias.** «Va a haber una campaña o historia principal con sus misiones principales, la zona de entrenamiento y luego un apartado de historia secundaria o misiones secundarias, con encargos que llegan a la agencia». Apuntado en `PLAN.md` con una propuesta de diseño; pendiente de sus decisiones.

**Pablo: «para que los aprendices puedan ir haciendo, y según suben su rango de detective haya más misiones y más difíciles».** Hecho:
- Buzón de **Encargos** desde el tablón. Cada encargo se abre con su rango; los cerrados se ven como sobres lacrados que dicen con qué rango se abren.
- Tres escenas nuevas para el resto de la Lengua: preguntas sobre un documento, escribe la respuesta y ordena los fragmentos.
- Primer encargo: «La receta perdida» (Julián), sobre el texto instructivo.
- Por ahora, sin libreta ni sello, y registrados aparte de la nota; Pablo puede cambiarlo.

**La Academia, completa:** las 4 salas que faltaban, hechas por 4 subagentes en paralelo y revisadas:
- Terminal ORTO-3000: la máquina del tiempo verbal.
- Pizarra: descubre la regla.
- Centralita: dictado por radio, o «relámpago» si el equipo no tiene voz.
- Imprenta del Eco: galeradas con reglas mezcladas.

Además, la **libreta imprimible** (`imprimibles/libreta.html`).

**Encargos: ya hay 10** (3 subagentes y revisión), del rango Novato al de Detective de élite. Trabajan el texto instructivo, el cartel, la postal, los sinónimos y las familias de palabras, la noticia, la concordancia, los refranes, el lenguaje figurado, los bulos y el diccionario. Solo usan arte que ya existe. En la revisión se corrigió una variante de refrán que no existía («dentado») y una pregunta que delataba la respuesta.

**Pablo: «quiero que todo sirva o pueda servir para nota si lo decido; y que antes de las misiones principales, que pueden servir como evaluación, los alumnos tengan que hacer lo de la Academia tomando apuntes en su libreta con reglas, esquemas, apuntes y tablas que puedan estudiar y repasar, para que antes de la misión ya estén preparados, con muchos ejercicios diferentes».** Hecho:
- **Nota:** en la zona del maestro se marca qué cuenta (casos, encargos y Academia), con la media por criterio de cada alumno y el CSV con todo.
- **Preparación:** ruta de 5 pasos antes de cada caso, obligatoria por defecto (también puede ser opcional o desactivarse):
  - descubre la regla en la Pizarra;
  - copia los apuntes en la libreta (esquemas con huecos para sus ejemplos; también en hojas imprimibles);
  - dos prácticas elegidas para cada regla;
  - el dictado por radio.
- **Ejercicios:** 6 nuevos, hechos por 4 subagentes en paralelo, más los apuntes de las 9 reglas. Las salas tienen ahora un menú de ejercicios.
- **Arreglo:** «Corrige el documento» se rompía con g/j, diptongos y mayúsculas por falta de textos; afectaba también al «turno de hoy».

**Pablo: «no tengas reparo en pedir más imágenes a GPT».** Lote 7 pedido en la issue #7: 15 imágenes (el buzón de encargos, los objetos de los encargos y los aparatos de los ejercicios nuevos).

**Pablo: «actividades de escuchar o hablar, de momento no; o, si están, que sean extras opcionales, porque el niño tiene que venir con cascos o tener un dispositivo con micrófono».** El sonido queda desactivado por defecto y se activa en la zona del maestro («Actividades con sonido»). Sin él, todo funciona en modo visual: dictado relámpago, deletreo en pantalla y sin botones de escuchar. No hay ninguna actividad con micrófono.
**Sonido, primera versión** (sesión aparte, rama `claude/sonido`): un agente repasó todo el juego y sacó el catálogo de puntos donde debe sonar algo (más de 100, con fichero:línea), ahora en `SONIDO.md`. Todo está hecho con Web Audio: 7 músicas (agencia, noche, tensión, academia, feria, amanecer, triunfo), 11 ambientes de fondo (con pasos que se acercan y se alejan, lluvia en la ventana, búho, campanario, máquina de escribir lejana…) y unos 60 efectos. Se engancha sin tocar el código del juego. La Centralita va sin música, para el dictado. Pablo tiene el laboratorio publicado para escuchar y votar antes de dar nada por bueno.

**Pablo: «adelante, ve montándolo absolutamente todo; no tengo prisa por la parte del colegio. Me preocupa que haya pocas actividades de repaso en la Academia: que cada una tenga niveles (1, 2, 3 y un nivel maestro) con nombres de detective, que se vayan ganando, porque en casa se las comen muy rápido».** Hecho:
- **Lupas por ejercicio:** de bronce, plata y oro, y de diamante, la de «Maestro detective». Se gana la siguiente con 2 rondas seguidas al 80 %.
- **Carné de la Academia**, con un sello de oro por sala.
- **Banco de palabras ampliado y niveles en cada sala**, con subagentes.
- **Modo revisión y PIN** para la zona del maestro.
- **Sin internet:** el juego funciona sin conexión.
- **Nube opcional**, con un Apps Script propio.
- **Séneca:** se investigó y no hay forma de importar, así que se hizo una exportación por n.º de lista y un botón para copiar la columna de cada criterio.
- **Propuesta de la temporada 2**, con 3 opciones.

Además, **otra sesión hizo la música y los efectos** (rama `claude/sonido`: motor común `shared/sonido.js`), integrados aquí.

**Niveles en toda la Academia, terminados** (5 subagentes y revisión). Los 14 ejercicios tienen sus 4 lupas, y cada una cambia de verdad el ejercicio: más elementos, palabras más difíciles, menos ayudas y menos tiempo. El contenido se ha multiplicado:

| Banco | Contenido |
|---|---|
| Palabras | 670 |
| Textos | 57 |
| Verbos / frases de la Terminal | 75 / 94 |
| Galeradas | 32 |
| Pizarra (ejemplos / subreglas) | 1142 / 41 |
| Frases de la coma | 66 |
| Dictados | 126 |
| Pistas de los partes | 205 |
| Hojas sin tilde | 32 |
| Grupos de homófonos | 65 |
| Familias de palabras | 89 |

Arreglados al revisar:
- La falta de mayúscula desaparecía en el documento y en la Imprenta («sevilla» pasaba a «Sevilla»).
- Las fichas de mayúsculas no se comparaban respetando la mayúscula.

**Arte de Robles (lote 6) y del lote 7, integrados** (zips de GPT, firmas SHA-256 correctas).
- **Robles**: ocho imágenes (ropa normal, de deporte y la foto del tribunal). Cinco traían la transparencia rota: un halo gris o naranja alrededor del personaje, que venía ya en los PNG originales. Se rehicieron con recorte automático (`rembg`, modelo para anime). Pablo vio fallos en el pelo y le ha pedido a GPT, que ya puede escribir en GitHub, que las vuelva a subir. Cuando lleguen, se sustituyen.
- **Lote 7**:
  - cada encargo enseña su objeto cuando el cliente cuenta el problema (en el 4 no hay objeto);
  - el buzón de encargos va de fondo;
  - el menú de cada sala muestra el aparato de cada ejercicio, y la máquina sin tilde del Pupitre es ya el dibujo;
  - el carné de la Academia es la tarjeta dibujada, con la foto del detective y un sello de oro en cada uno de sus 8 círculos (uno por sala).
- **Arreglado**: en 21 relatos con objeto, el bocadillo tapaba parte del objeto. Ahora el objeto se ajusta al hueco libre y, si queda pequeño, sale el botón «🔍 Ver en grande».

**Robles, corregido por GPT por GitHub.** GPT ya puede escribir en el repo y ha subido la entrega a su rama `gpt/arte-lotes-6-7-robles-aprobado` (solo `arte/entrega/` + manifiesto; las 23 firmas son correctas). Las 5 imágenes con la transparencia rota vienen ya limpias y conservan mejor los rizos que el recorte automático, así que lo sustituyen; las otras 18 eran idénticas. La rama de GPT no se fusiona: se sacan los PNG, se convierten y se borran. Instrucciones de entrega para GPT actualizadas en `AGENTS.md`.

**Temporada 2: opción A, «La Tilde Azul».** Pablo la elige el 4/11. Queda escrita la biblia en `TEMPORADA-2.md`:
- un caso por provincia, más el piloto y el tren de vuelta;
- la Tilde Azul es doña Victoria Aldana, fundadora de la agencia y maestra de Robles, que corregía en azul porque «corregir no es castigar»;
- una pista por caso sobre su identidad;
- el arte necesario.

Las 9 reglas de 6.º ya tienen su ficha del Archivo y sus cartas.

Decisiones por defecto, pendientes de que Pablo las confirme:
- El piloto evalúa las reglas de 5.º, lo que traen del curso anterior.
- Mismo grupo con continuidad, pero el piloto presenta al equipo.
- Bruno sigue de aprendiz.

Siguiente sesión: escribir los casos con subagentes.

## 9 de noviembre de 2026

**Repaso general del proyecto** (Pablo: «pégale un repaso completo, aporta ideas, arregla lo que detectes»). Se hizo con seis revisores en paralelo, cada uno con una parte, y después cada uno aplicó sus propias correcciones con las decisiones tomadas aquí:

| Revisor | Qué miró | Resultado |
|---|---|---|
| Corrector de los casos 0-5 | Los seis JSON enteros | Ortografía limpia. 65 cambios de fondo |
| Corrector de los casos 6-10 | Los cinco JSON enteros | Ortografía limpia. Unos 40 cambios de fondo |
| Corrector de reglas y encargos | `reglas.json`, `apuntes.json` y los 10 encargos | Reglas de letras con «siempre» falsos y excepciones que faltaban |
| Lingüista de los bancos | Los 12 bancos de la Academia, elemento a elemento | Sin errores de sílabas, tónica ni conjugación. Palabras raras y frases dudosas |
| Revisor del código de la Academia | `academia.js`, `preparacion.js` y las salas | 13 fallos, casi todos reproducidos |
| Revisor de nube, sin internet y datos | `nube.js`, el `.gs`, `sw.js`, `clase.js` y la zona del maestro | 20 hallazgos, casi todos reproducidos |

El motor (`motor.js`, `escenas.js`, `app.js`) y la prueba en móvil y tablet se hicieron aparte.

**Lo más importante que salió y ya está arreglado**

- **El tablón se veía mal**: la cabecera se partía en dos líneas, los botones se recortaban, el globo de encargos nuevos flotaba suelto y la etiqueta «Prepárate» se salía de las tarjetas con el título largo.
- **Un caso a medias se perdía** al salir, recargar o quedarse sin batería. Ahora se guarda al entrar en cada escena y se continúa otro día, también en los encargos.
- **Volver a jugar un caso quitaba el sello y podía bajar los puntos**, porque contaba el último intento. Ahora cuenta el mejor intento y el sello es del caso.
- **Todos los casos estaban abiertos desde el principio**, incluido el final que desenmascara al Tachón. Ahora cada caso se abre al resolver el anterior (`ajustes.orden`, se puede dejar libre).
- **El modo sin internet no guardaba el código**: la copia de cada respuesta se pedía demasiado tarde y fallaba en silencio. Solo funcionaba sin red tras «Descargar todo», y esa copia no se actualizaba nunca.
- **Si el dispositivo se quedaba sin sitio, el progreso se perdía sin avisar.** Ahora sale un aviso fijo. Hay copia de seguridad en un archivo.
- **El juego llamaba a Google Fonts** desde los dispositivos del alumnado. Las fuentes van ya en el repo.
- **En la escena «escribe» de los encargos, el segundo alumno del mismo dispositivo no puntuaba**, porque el primer intento se apuntaba en los datos del caso.
- **En móvil en vertical no se veía nada.** Ahora pide girarlo.
- **El botón de sonido tapaba «Zona maestro/a»** en pantallas 16:9 (no se había visto porque el sonido se apaga en las pruebas automáticas).
- **Reglas mal enunciadas**: «detrás de m va siempre b», «el pasado de los verbos en -ar termina en -aba», «las formas de estar llevan v» (contradecía a «estaba»), «magia» como ejemplo de -gía, «hipopótamo» como ejemplo de hipo- = debajo, -cc- sin sus excepciones (ficción, cocción), bu- sin avisar de vuelo y vuelta, y una ficha de x/s que un alumno no podía aplicar.
- **Huecos con dos soluciones válidas**: cayó/calló (justo la pareja que enseña el caso), taza/tasa, queso/ceso y peces/peses.
- **Incoherencias de la historia**: el caso 10 decía «ayer, jueves» y el 9 pasa en viernes; trece y catorce azulejos; la feria empezaba dos veces; el mismo código de candado (386) en los casos 8 y 9.
- **Respuestas abiertas con listas cortas** en los encargos («inventa una comparación», saludos y despedidas de una carta).
- **Palabras demasiado raras** para 10-11 años en los niveles altos de los bancos (contumaz, áspid, terraplén…), cambiadas por otras de la misma regla.

**Plan de exploración** (Pablo: «como Monkey Island, que siempre haya algo que descubrir»). Plan en `EXPLORACION.md` y prueba jugable de la oficina de la agencia (26 zonas, una llave, una nota en tinta invisible, una falta escondida y una salamanquesa): https://claude.ai/artifact/STqGPLNLq8qUDzapsa9mZt. Nada está todavía en el juego.

**Pendiente de que Pablo decida**

1. Exploración: cuándo se explora, qué se gana, la mascota escondida y el tono (`EXPLORACION.md`).
2. Faltas que forman otra palabra válida. Lista completa:
   - En `palabras.json`: medico, musica, pagina, silaba, domino, lagrima, kilometro, ultimo, arboles, arbitro, futbol, compas, naufrago, beisbol, cuidate, izo (por hizo), peses (por peces) e iva (por iba).
   - En `galeradas.json`: grito, publico, maquina, musica, arboles, asta, oras, ora, ice, izo, rallo, peses, jamas e iva.
   - Las más delicadas son «asta» y «rallo», porque el banco de homófonos las enseña como palabras correctas.
3. «Oquedad» y «orfandad» siguen en la ficha de la h y en los bancos. Son raras, pero son el ejemplo clásico de la familia de hueco y huérfano.
4. Si «Academia de detectives» pasa a «Academia de Detectives» (es el nombre del sitio y sale 6 veces).
5. El orden de los casos queda cerrado por defecto. Si prefieres todo abierto, es un ajuste.
6. Nube: no usarla con alumnado real hasta probarla con un Apps Script de verdad y decidir el código de recuperación por alumno (`NUBE.md`).
7. Publicar: la rama `claude/educational-repo-system-as2c4u` va muy por delante de `main`, así que GitHub Pages sigue enseñando la versión antigua. Hace falta un pull request cuando Pablo quiera.

**Ideas que dejo apuntadas** (ninguna hecha): letra y tamaño a elegir, con una letra pensada para dislexia; «Anteriormente, en La Lupa…» al empezar cada caso; escenarios con vida (lluvia, farolillos, vapor); insignias; «mi mesa» con lo encontrado; la falta del día; un informe para casa imprimible; un diploma de fin de temporada; modo proyector para jugar un caso con toda la clase; ocultar 6.º en la entrada hasta que tenga casos.

**Encargo para un corrector** (para repetirlo cuando se escriban casos nuevos): leer los archivos enteros; todo lo que está fuera del marcado `{mal|bien}` tiene que estar impecable; comprobar que cada falta responde a la regla del caso, que los huecos solo admiten una solución, que las explicaciones son verdad y que las pistas cuentan bien las faltas; anotar incoherencias de la historia. Primero informa y después aplica lo aprobado; al final, validador y jugador automático.

**Nube, rehecha tras el repaso** (cliente `nube.js` y servidor `la-lupa.gs`, protocolo 2). Antes, la cola se vaciaba aunque el servidor no hubiera guardado nada; el progreso de la nube se sustituía entero, así que dos alumnos con el mismo alias se pisaban; y sellar un caso duplicaba filas en la hoja. Ahora:
- la cola solo se vacía cuando el servidor confirma, y guarda referencias en vez de copias (162 resultados sin conexión ocupan 5 KB, antes unos 4 MB);
- servidor y «Recuperar» fusionan por `id` y no pierden puntos, lupas ni sellos;
- la hoja no interpreta fórmulas ni convierte «007» en un número;
- lo que baja se valida antes de guardarse;
- del perfil ya no sube el n.º de lista.

Probado con el `.gs` real ejecutado en Node sobre unas hojas simuladas (58 comprobaciones) y con el juego contra ese servidor (44). **No está probado con un Apps Script de verdad**: `NUBE.md` trae la lista de 8 comprobaciones. Sigue pendiente el código de recuperación por alumno, porque hoy con el alias basta para bajarse la ficha de otro.

**Código de la Academia, arreglado tras el repaso** (13 fallos y dos más que salieron por el camino):
- Las fichas del Archivo de palabras que no están en el banco (casi la mitad de lo que entra en la cola) no tenían pista y eran imposibles sin sonido. Ahora cada palabra fallada guarda su pista: la frase del dictado, del parte o del caso con un hueco, o «pretérito imperfecto de cantar, yo» en la Terminal.
- La Terminal perdía la ronda si se salía al patio en la pantalla de cierre, y pedía «saltar» de presente a pasado con formas idénticas (miramos, jugamos).
- El sismógrafo llamaba «agudas» a los monosílabos, con una explicación que se contradecía.
- Dobles pulsaciones y temporizadores que pintaban sobre otra pantalla o cerraban la ronda dos veces.
- Para subir de lupa, el «80 %» exigía rondas perfectas en la Pizarra y regalaba aciertos en la Imprenta. Ahora no cuentan las faltas solo detectadas y se permite un fallo de cada cinco.
- El turno de hoy podía marcar como entrenada una regla que el ejercicio elegido no trabajaba.
- «Dame una idea» de la Pizarra daba ejemplos que la propia Pizarra rechazaba; en «La coma», «No,es tarde.» se daba por mala.
- El dictado relámpago se colgaba con «movimiento reducido» activado.
- Los registros de la Academia crecían sin límite: se guardan los detalles solo de las últimas 20 rondas de cada alumno.
- Dianas táctiles más grandes en el parte, la coma y la Terminal. En la Imprenta, en pantallas táctiles, un toque elige la palabra y otro la marca. Quedan pequeñas las galeradas de diamante y el teclado de la Terminal.

Sin probar en un dispositivo real: el teclado virtual (por si tapa campos de la mitad inferior) y el zoom por doble toque de iOS.
