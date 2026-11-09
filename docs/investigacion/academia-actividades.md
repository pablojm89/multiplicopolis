# La Academia de detectives: concepto, salas y catálogo de actividades

> Propuesta de diseño del 4/11/2026 para que Pablo la revise. Parte de `apps/la-lupa/CLAUDE.md` (motor y tipos de escena), `DISEÑO.md` (principios), `TEMPORADA-1.md`, `LIBRETA.md`, `docs/investigacion/sherlock-ort-experiencia.md`, el §3 de `referentes-juegos-detective-lengua.md` y los §4, §6 y §8 de `curriculo-lengua-tercer-ciclo-andalucia.md`. Los códigos de criterio son los del Anexo II (`.a` para 5.º, `.b` para 6.º); los saberes, los `LCL.3.X.N` del mismo anexo. Lo que decida Pablo pasa a `PLAN.md`.

## 1. Resumen

La Academia es la **antigua escuela de La Alameda**, reabierta por la directora Robles como centro de entrenamiento de la agencia: un patio andaluz con ocho puertas, y detrás de cada puerta una **sala con su propia estética** (pupitre cenital, terminal retro, pizarra de tiza, laboratorio forense, sala de interrogatorios, centralita de radio, archivo del sótano e imprenta del periódico del barrio). Al terminar un caso, el alumno recibe un **pase de entrenamiento** con las palabras que ha fallado y la regla del caso ya cargadas, y la Academia le propone un turno corto de tres actividades. Las actividades no se escriben a mano: **se generan** a partir de bancos de datos etiquetados (palabras con su forma errónea típica y su análisis, frases y textos con palabras marcadas, verbos, oraciones analizadas, léxico, literatura), de modo que cada ronda es distinta y la **explicación también se genera** («*camión* es aguda y termina en -n → lleva tilde»). El catálogo cubre toda la Lengua del 3.er ciclo (ortografía, gramática, léxico, comprensión, producción y literatura) y respeta las tres reglas de oro: el alumno **escribe** la forma correcta, nunca elige entre faltas, y lo que falla vuelve espaciado en su cola personal.

## 2. Concepto de la Academia

### 2.1 En la ficción

- **Lugar**: la antigua escuela del barrio, cerrada hace años, al final de la calle Alameda. Un edificio encalado de dos plantas con patio de azulejos, naranjo y aljibe. Robles la ha reabierto como **Academia de Detectives de La Alameda**. Encaja con la temporada: el episodio 6 lleva al equipo precisamente a la antigua escuela, así que la Academia puede «existir» desde el piloto y ganar peso narrativo a mitad de temporada (El Tachón también estudió allí).
- **Quién la lleva**: Robles la dirige y firma el carné. Cada instructor ocupa las salas que le pegan: **Mateo** el Archivo y la Terminal (reglas, datos, diccionario), **Lola** la Sala de Interrogatorios y la Centralita (acción, oído, careos), y un personaje nuevo y opcional, **don Anselmo**, el conserje: antiguo maestro de la escuela, jubilado, que lo sabe todo del barrio y lleva el Pupitre, la Pizarra y la Imprenta. Si no se quiere un personaje más, esas salas las llevan Robles y Mateo. (Guiño posible para la trama: don Anselmo fue maestro de Bruno y recuerda «a un niño al que se reían por sus faltas». Decisión de Pablo.)
- **El adversario de entrenamiento**: en la Academia no hay caso que resolver, pero hay un **«Simulador del Tachón»**: un maniquí con gabardina y gafas de sol que «siembra» las faltas de los ejercicios. Da humor («el Simulador ha vuelto a atacar el periódico») y permite los guiños sigma sin que el villano real pierda misterio.

### 2.2 Cómo se entra

1. Al terminar un caso, tras el informe, aparece la escena **«Pase de entrenamiento»**: Robles entrega un pase con el número del caso y dice cuántas palabras han ido a la cola («Has fallado 4 palabras: te esperan en el Archivo»). Botón «Ir a la Academia» y botón «Volver al tablón». El tablón de corcho también lleva siempre una chincheta «Academia» para entrar sin caso previo (lo decide el maestro en ajustes: `academia.acceso: "tras-caso" | "libre"`).
2. En el **Patio** (pantalla *hub*), un tablón de anuncios muestra el **Turno de hoy**: tres actividades propuestas (ver 2.4) y, debajo, las ocho puertas para entrar libremente en cualquier sala.
3. Un **turno** dura unos 8-12 minutos. Al acabar las tres, Robles sella el pase, se suman los puntos de entrenamiento y se vuelve al Patio.

### 2.3 Estructura y progresión

- **Salas** = estéticas y tipos de tarea (sección 3). Cada sala tiene su instructor y de 3 a 5 actividades.
- **Módulos** = contenidos (los ids de `reglas.json` más los nuevos de gramática, léxico, comprensión, producción y literatura). Un módulo se **domina** cuando la cola del alumno no tiene palabras de ese módulo y lleva ≥ 10 aciertos seguidos en actividades intercaladas (no en bloque). Lo que se muestra al alumno es un **carné de la Academia** con un cuadro de módulos: casilla vacía → en entrenamiento → dominado.
- **Insignias por sala** (bronce, plata, oro) según aciertos acumulados y niveles jugados: «Pluma de bronce» (Pupitre), «Chip de plata» (Terminal), «Tiza de oro» (Pizarra), «Probeta» (Laboratorio), «Lámpara» (Interrogatorios), «Antena» (Centralita), «Llave del Archivo», «Rotativa» (Imprenta).
- **Puntos de entrenamiento** → alimentan los rangos ya definidos en `motor.js` (`RANGOS`, `puntosResultado`), con un **tope diario** (p. ej. 150) para que nadie suba de rango a base de repetir lo fácil. Resolver sin pistas da «+100 de aura»; acertar un nivel 3 sin fallos, «racha sigma».
- **Niveles de dificultad** comunes a todas las actividades:
  - **N1 Novato**: una sola regla o contenido; 2 elementos por ronda; palabras frecuentes; pistas en 4 niveles disponibles; demostración guiada la primera vez.
  - **N2 Agente**: dos reglas intercaladas; 3 elementos; aparecen las primeras excepciones; pistas limitadas (2).
  - **N3 Inspector**: mezcla de tres o más reglas (intercalado puro); 4 elementos; excepciones y palabras poco frecuentes; sin pistas; textos más largos.
  - El nivel lo propone el juego por módulo (sube tras 2 rondas limpias, baja tras 2 rondas con ≥ 50 % de fallos) y el alumno puede bajarlo siempre.
- **Prueba de ascenso** (opcional, mensual): un turno especial de 5 actividades mixtas, sin pistas, que el maestro puede usar como evidencia de 5.1 y 9.2. No bloquea nada.

### 2.4 Conexión con el caso y con la cola de palabras falladas

El **Turno de hoy** lo genera un planificador con tres huecos:

| Hueco | Qué propone | Peso |
|---|---|---|
| **Repaso** | Una actividad del Archivo (A1) con las fichas de la cola cuyo `proximo` ya ha vencido; si no hay, una actividad cualquiera con palabras del módulo más flojo | 40 % |
| **Del último caso** | Una actividad de la sala que mejor encaje con la regla del último caso jugado, con sus palabras falladas incluidas | 40 % |
| **Sorpresa** | Una actividad de otro contenido (gramática, léxico, comprensión, literatura) para intercalar y para que la Academia no sea «solo ortografía» | 20 % |

La **cola de repaso** (`la-lupa-cola`, en `localStorage` con el prefijo del juego) guarda cada palabra fallada con su módulo, dónde se falló, cuántas veces y cuándo toca: intervalos crecientes **1 → 3 → 7 → 15 → 30 sesiones**; un fallo devuelve la ficha al intervalo 1. Cualquier actividad de la Academia puede «pedir» palabras a la cola: el generador reserva siempre al menos un hueco para una palabra de la cola si la hay para ese módulo. Las palabras que se fallan **en la Academia** entran también en la cola, y las que se dominan salen de ella y quedan en «Palabras archivadas» del carné.

### 2.5 La libreta en la Academia

La Academia pide menos libreta que un caso, pero la mantiene como herramienta:

- Cada turno abre una **«Página de entrenamiento»** en la libreta (fecha, salas visitadas) donde el alumno copia **tres cosas**: las palabras que ha fallado (bien escritas), la regla o contenido que ha trabajado con sus palabras, y una frase propia con una de esas palabras. Son los momentos `apunta` que ya existen en el motor.
- Al final del turno el juego muestra el **«Parte de entrenamiento»**: lo que debería estar en la libreta. En modo papel no lo guarda; en modo digital sí.
- El maestro sella la página de entrenamiento con la rúbrica rápida ya existente, de forma semanal o cuando quiera (no por turno: sería inviable en clase). El sello de la Academia da «Llave del Archivo» antes.

## 3. Salas y estéticas

El **Patio** (pantalla *hub*) es la única escena nueva de navegación: patio andaluz nocturno de la antigua escuela, suelo de azulejo, naranjo central, aljibe, galería con arcos y ocho puertas o accesos (una escalera baja al sótano del Archivo, una antena en la azotea señala la Centralita…). Encima, en HTML/CSS: un tablón de anuncios con el Turno de hoy, el carné (icono) y rótulos sobre cada puerta al pasar el cursor. El personaje instructor de la sala aparece a un lado al entrar, como ya hacen los casos.

Todas las salas comparten la convención técnica del motor: fondo de 1280×720 sin texto, personaje a un lado, interfaz dibujada con HTML y CSS en coordenadas del escenario, botón «lupa» para las pistas y una **barra de caracteres** siempre visible junto a cualquier campo de escritura (á é í ó ú ü ñ ¿ ¡ « »), imprescindible en tablets y en teclados de aula sin acentos cómodos.

| # | Sala | Fondo que se encarga a la IA (sin texto) | Interfaz HTML/CSS encima | Contenidos que encajan |
|---|---|---|---|---|
| 1 | **El Pupitre** (aula 1) | Vista cenital de un pupitre de madera gastada con una hoja en blanco centrada (sin letras), lápiz, goma, sacapuntas, lupa, un flexo que proyecta luz cálida, una taza y un cuaderno cerrado; al borde, la mano del alumno fuera de plano. Luz nocturna azul en los márgenes | La hoja es un `div` papel con textura CSS, texto en tipografía de máquina de escribir; el cursor es un lápiz; las palabras pulsables se subrayan en rojo al pulsarlas; un bocadillo-regla sale de la esquina (la ficha de Mateo) | Ortografía de letras y acentuación sobre documentos: caza de errores, completar, memoria |
| 2 | **La Terminal ORTO-3000** (sala de informática) | Ordenador de los años 80 con monitor de fósforo verde apagado (pantalla negra, sin texto), teclado beige grueso, disquetes, cables, una cinta de casete y un póster de circuitos; habitación en penumbra con luz verde del monitor | La pantalla del monitor es un `div` con `text-shadow` verde, *scanlines* CSS, cursor parpadeante y texto que se escribe solo (ya existe en el motor); los comandos son botones con aspecto de teclas; al acertar, el monitor «parpadea» | Diccionario y acepciones, conjugación, descifrados, etiquetado de clases de palabras, familias léxicas |
| 3 | **La Pizarra** (aula de gramática) | Aula antigua con pizarra verde de tiza vacía (sin letras), tarima, mesa del maestro, mapa enrollado, globo terráqueo, tizas y borrador; ventana con la luna; sillas de madera | Texto en fuente «tiza» blanca y de colores (amarillo para sujeto, rosa para predicado…), corchetes y flechas dibujados con SVG como a mano, arrastrar fichas magnéticas de palabras; el borrador anima el reinicio | Gramática: descubre la regla, análisis de oraciones y sintagmas, puntuación y significado, transformaciones (número, tiempo, pasiva), orden de un texto |
| 4 | **El Laboratorio forense** | Mesa de acero con microscopio grande, tubos de ensayo con líquidos de colores, pinzas, balanza de precisión de dos platos, lámpara ultravioleta, lupa con brazo, bandejas con etiquetas en blanco; luz fría con reflejos azul y violeta | Paneles de instrumento con bordes metálicos: «muestra» (la palabra en grande), pinzas que separan sílabas (clic entre letras), «sismógrafo» CSS que marca la tónica, balanza que se inclina según el peso de los sinónimos, visor del microscopio para comparar dos palabras | Sílabas y acentuación, morfología (prefijos, sufijos, familias), homófonos, sinónimos y antónimos con gradación |
| 5 | **La Sala de Interrogatorios** | Habitación gris con mesa metálica, dos sillas, lámpara que cuelga, espejo unidireccional grande al fondo (reflejo difuso, sin texto), grabadora de cinta sobre la mesa, vaso de agua, carpeta cerrada | La declaración aparece en bocadillos de un testigo (los vecinos del banco de personajes, con expresiones); la grabadora tiene botones (play, rebobinar) que releen fragmentos; las preguntas y la escritura van en una «hoja de acta» a la derecha | Comprensión lectora e inferencias, contradicciones, modalidad oracional e intención, sustituciones pronominales ambiguas, transcripción de la grabadora (mayúsculas y puntuación), testigo seseante |
| 6 | **La Centralita** (azotea) | Mesa con una radio antigua de válvulas, micrófono de sobremesa, auriculares, walkie-talkie, mapa del barrio con chinchetas e hilo (sin rótulos), antena y cielo nocturno de La Alameda por la ventana | Onda de audio animada en CSS, botón grande de «escuchar» (síntesis de voz `es-ES`), contador de repeticiones, indicador de «interferencias» que fija la dificultad; campo de escritura tipo cinta de télex | Dictado, comprensión oral, deletreo, conectores en mensajes cortos; todo con alternativa sin voz («relámpago») |
| 7 | **El Archivo** (sótano) | Sótano abovedado con estanterías de expedientes hasta el techo, fichero metálico de cajones, escalera de biblioteca, lámpara de mesa verde, cajas de cartón, telarañas discretas | Fichero de cajones (uno por letra o módulo) que se abren; **fichas de cartulina** con la palabra, su regla y un sello de fecha; una ficha «vence» con un borde rojo; al dominarla pasa al cajón «Archivado» con un sello verde | Repaso espaciado de la cola personal, orden alfabético y diccionario, campos semánticos e intrusos, origen del léxico |
| 8 | **La Imprenta del Eco** | Redacción del periódico del barrio «El Eco de La Alameda» (sin rótulo): mesa con máquina de escribir, hojas, café, rotativa pequeña al fondo, bobinas de papel, tablero de titulares en blanco, luz de amanecer | La hoja en la máquina de escribir se va llenando con lo que escribe el alumno (tecla a tecla, con sonido opcional); una «galerada» con texto para corregir; maqueta de periódico con hueco de titular; las secciones (Sucesos, Cultura, Refranero) ordenan las actividades | Producción escrita, titulares y resumen, corrección de pruebas con reglas mezcladas, lenguaje figurado y literatura, refranes y cultura popular andaluza |

## 4. Catálogo de actividades

Convenciones del catálogo. **Criterios** con el código del Anexo II (el juego añade `.a` o `.b` según el curso). **Datos**: bancos de la sección 5. **Generación**: cómo sale cada ronda. **Explicación generada**: muchas actividades usan la plantilla `explicacion` de cada módulo en `reglas.json`, que rellena huecos con los metadatos de la palabra (`{p}`, `{silabas}`, `{tonica}`, `{tipo}`, `{terminacion}`): por ejemplo `"{p} es {tipo} y termina en {terminacion} → {conclusion}"` da «*compás* es aguda y termina en -s → lleva tilde». Así la explicación es exacta para cada palabra sin escribirla a mano.

**Mecanismos de aprendizaje comunes** (se nombran en cada actividad como D, F, R o P):

- **D · Demostración de la instructora**: la primera vez que se juega una actividad (y siempre a petición), Lola o Mateo resuelven un elemento en pantalla, con el texto que se escribe solo: señalan, escriben, explican. Dura 20 segundos. Es la «mini lección» viva.
- **F · Ficha del Archivo**: la ficha de Mateo del módulo, siempre consultable con un toque (ya existe en `reglas.json`). Consultarla no penaliza; se registra.
- **R · Regla descubierta**: antes de practicar un módulo nuevo, la actividad Z1 (Descubre la regla) pide formular la generalización con ejemplos y contraejemplos. El carné marca el módulo como «con regla formulada».
- **P · El porqué**: tras cada respuesta, acierto o fallo, aparece una línea con la explicación generada para esa palabra o estructura. La última imagen en pantalla es siempre la forma correcta.

### Sala 1 · El Pupitre

#### P1. La corrección del documento
- **Gancho**: «El Simulador ha colado faltas en este parte. Encuéntralas y déjalo limpio.»
- **Contenido y criterios**: ortografía de letras y acentuación (cualquier módulo de `reglas.json`); **9.2** (revisar textos ajenos) y **5.1** (forma correcta escrita). Saberes LCL.3.B.3.5, D.6.
- **Mecánica**: 1) sobre la hoja aparece un documento corto (6-10 líneas: parte de la agencia, nota de un vecino, cartel) con 2-4 faltas; 2) el alumno toca la palabra sospechosa; 3) se abre el campo y **escribe la palabra entera correcta**; 4) feedback inmediato (sello verde o rojo); 5) al corregir todas, la hoja recibe el sello «Documento limpio». Tocar una palabra correcta cuenta como «pista falsa» (no resta nota, resta aura).
- **Aprendizaje**: D la primera vez; F siempre; P tras cada palabra. Antes de empezar, una línea de Mateo recuerda qué regla(s) hay en juego en N1 («Hoy, tildes en agudas»); en N3 no se dice.
- **Feedback**: por palabra, inmediato; segundo intento permitido con pista de nivel 1-2; al fallar dos veces, se muestra la forma correcta y el alumno la **vuelve a escribir** (copia de cierre) para que la última escritura sea la buena.
- **Libreta**: cada palabra fallada, bien escrita, con su regla.
- **Datos**: `textos.json` (documentos con palabras marcadas `[palabra]`) y `palabras.json` (forma errónea `mal` por palabra). **Generación**: se elige un texto con ≥ 3 palabras marcadas de los módulos activos; se reemplazan N de ellas por su `mal` (prioridad a palabras de la cola); los nombres de vecinos y lugares se rellenan desde `plantillas.json` para que el texto cambie. Con 60 textos y 400 palabras marcadas salen miles de combinaciones.
- **Dificultad**: N1: 2 faltas, un módulo, el texto más corto. N2: 3 faltas de dos módulos. N3: 4 faltas de tres módulos más una «trampa» (palabra rara pero correcta, como *hiena* o *exhausto*) que no hay que tocar.

#### P2. Rellena el parte
- **Gancho**: «El parte llegó mojado y faltan letras. Reconstrúyelo.»
- **Contenido y criterios**: ortografía de letras en contexto; **5.1**, **9.1** (aplicar la regla). LCL.3.B.3.5.
- **Mecánica**: un texto con 3-5 palabras «borrosas» (solo se ve la silueta: una mancha de agua en CSS sobre la palabra, con la primera letra y el número de letras como guía). El alumno pulsa y **escribe la palabra completa**; nunca ve una forma errónea. Si duda, la pista 1 lee la frase en voz (síntesis) para oír la palabra; la 2 da la regla; la 3 la definición; la 4, las letras alternas.
- **Aprendizaje**: D; antes de la ronda, en N1, aparece un **contraste**: dos palabras correctas del módulo («*recibir* / *vivir*: ¿cuál es la excepción?») que fija la regla y su excepción.
- **Feedback**: inmediato por palabra, con P. Un fallo → la forma correcta se «seca» en la mancha y el alumno la escribe otra vez.
- **Libreta**: palabras reconstruidas del módulo, con regla.
- **Datos**: `textos.json` + `palabras.json` (`def` y `silabas` para pistas). **Generación**: igual que P1 pero las palabras marcadas se tapan en lugar de sustituirse; se garantiza que la palabra sea deducible por contexto (campo `contexto_fuerte: true` en la marca o la frase).
- **Dificultad**: N1 muestra 2 letras y la longitud; N2 solo la inicial; N3 solo la mancha.

#### P3. Dictado relámpago
- **Gancho**: «Lee la frase, memorízala… y escríbela cuando desaparezca.»
- **Contenido y criterios**: acentuación y letras; **5.1**. LCL.3.B.3.5, D.6. Es la práctica de **recuperación de memoria con feedback inmediato** (da Silva et al., 2023) sin necesidad de voz.
- **Mecánica**: la frase correcta (8-14 palabras) se escribe sola en la hoja; el alumno la lee; pulsa «Lista»; se tapa con la mano del detective; la escribe de memoria; se compara palabra a palabra.
- **Aprendizaje**: antes de taparla, el juego **subraya** las 2-3 palabras «peligrosas» (las del módulo) y P explica una de ellas: la atención va a donde hay regla.
- **Feedback**: las palabras acertadas en verde, las falladas en rojo con la correcta debajo; el alumno reescribe solo las falladas.
- **Libreta**: la frase entera, bien escrita (una por ronda).
- **Datos**: `frases.json`. **Generación**: frases con ≥ 2 palabras marcadas de los módulos activos; variables de nombres y lugares.
- **Dificultad**: N1 frases de 8 palabras y 8 segundos de lectura; N2 11 palabras, 6 s; N3 14 palabras con dos módulos, 5 s.

#### P4. La máquina sin tilde
- **Gancho**: «La máquina de escribir de la agencia no tiene tecla de tilde. Devuélveselas a este aviso.»
- **Contenido y criterios**: acentuación (agudas, llanas, esdrújulas, diptongo, hiato, diacrítica, interrogativos); **5.1**, **9.1**. LCL.3.D.6.
- **Mecánica**: un aviso de 4-6 líneas «mecanografiado» en el que **ninguna palabra lleva tilde** (es una transformación conocida y declarada, no faltas camufladas; aun así se mantienen pocas candidatas: 3-5 palabras que deben llevarla). 1) El alumno escribe primero cuántas tildes faltan (cifra, como en «Contar para la cifra»); 2) toca cada palabra que debe llevarla y la **escribe con la tilde**; 3) al terminar, el aviso aparece íntegro y correcto.
- **Aprendizaje**: F y P. En N1 el aviso lleva las sílabas tónicas marcadas con un punto bajo la vocal; en N2 el alumno marca él la tónica antes de escribir (puente con L1).
- **Feedback**: por palabra; «palabra sin tilde pulsada» → P explica por qué no la lleva (esto es valioso: aprender a **no** poner tildes).
- **Libreta**: las palabras con tilde y su tipo (aguda/llana/esdrújula).
- **Datos**: `textos.json` con palabras marcadas de acentuación; `palabras.json` (`silabas`, `tonica`, `tipo`). **Generación**: texto → quitar tildes a todo → la lista de respuestas se calcula sola.
- **Dificultad**: N1 solo agudas/llanas/esdrújulas; N2 + diptongos e hiatos; N3 + diacrítica e interrogativos indirectos («no sé *qué* quiere»).

### Sala 2 · La Terminal ORTO-3000

#### T1. Consulta al diccionario
- **Gancho**: «ORTO-3000 tiene todas las palabras del barrio. Encuentra la que buscamos.»
- **Contenido y criterios**: diccionario (orden alfabético, palabras guía, acepciones, abreviaturas), polisemia; **9.2**, LCL.3.D.8, D.3.
- **Mecánica** (tres modos que se alternan): a) **Localizar**: la pantalla muestra dos palabras guía («*casa – castillo*») y pregunta si la palabra buscada está en esa «página» (sí/no/antes/después) y luego pide **escribirla**; b) **Acepción**: se muestra la entrada de una palabra polisémica con sus 2-4 acepciones numeradas (todas correctas) y una frase; el alumno teclea el número de la acepción que encaja; c) **Definir para encontrar**: se da una definición breve y el alumno escribe la palabra (`> BUSCAR: _`).
- **Aprendizaje**: D de Mateo sobre cómo se lee una entrada (abreviaturas *m., f., adj., v.*); P explica la acepción.
- **Feedback**: la terminal responde `OK` o `ERROR: ¿quizá quisiste decir…?` mostrando siempre la forma correcta.
- **Libreta**: una palabra nueva con su definición con las propias palabras.
- **Datos**: `lexico.json` (entradas con acepciones, clase, ejemplos). **Generación**: se eligen entradas del nivel del curso; las palabras guía se calculan ordenando el banco; las frases de acepción vienen del campo `ejemplo` de cada acepción.
- **Dificultad**: N1 orden por 1.ª letra y 2 acepciones; N2 por 2.ª-3.ª letra, 3 acepciones; N3 abreviaturas y palabras derivadas que no tienen entrada propia («busca *panaderas* → *panadero, -a*»).

#### T2. La máquina del tiempo verbal
- **Gancho**: «Viaja al pasado o al futuro: conjuga la coartada.»
- **Contenido y criterios**: conjugación (persona, número, tiempo, modo), raíz y desinencia, regulares e irregulares, tiempos compuestos; **9.1**, LCL.3.D.5. Enlaza con ortografía (pretérito imperfecto en *-aba* → b; *tuve, estuve, anduve* → v; *dije, traje* → j).
- **Mecánica**: la terminal pide `CONJUGAR: cantar · 3.ª persona · plural · pretérito imperfecto · indicativo` y el alumno escribe la forma (*cantaban*). Al acertar, la pantalla descompone **raíz | desinencia** en colores. Variante «viaje»: una frase en presente («Lola *investiga* el caso») y hay que reescribir el verbo en el tiempo que marca el dial.
- **Aprendizaje**: mini lección generada: tabla del tiempo con 6 casillas, 5 rellenas y una vacía (la que se pide), para que el alumno vea el patrón antes de escribir en N1; en N2 solo 2 casillas rellenas; en N3 ninguna. Para irregulares, P nombra el tipo («*tuve*: irregular, lleva v como *estuve* y *anduve*»).
- **Feedback**: inmediato; al fallar, se muestra la correcta con la desinencia resaltada y se vuelve a escribir.
- **Libreta**: el verbo conjugado en el tiempo trabajado (6 formas) una vez por turno.
- **Datos**: `verbos.json` (paradigmas regulares por conjugación y tiempo; irregulares con sus formas). **Generación**: producto de verbo × tiempo × persona filtrado por curso: con 80 verbos y 10 tiempos salen 4.800 preguntas distintas sin contar frases.
- **Dificultad**: N1 presente, pretérito imperfecto y futuro de verbos regulares; N2 pretérito perfecto simple e irregulares frecuentes (*ser, ir, tener, hacer, decir*); N3 tiempos compuestos, subjuntivo e imperativo, voz pasiva (puente con Z4).

#### T3. Descifrado
- **Gancho**: «Mensaje interceptado. Cada pista es una palabra; sus iniciales forman la clave.»
- **Contenido y criterios**: léxico (definiciones, sinónimos, antónimos) y ortografía de la palabra escrita; **9.2**, LCL.3.D.3.
- **Mecánica**: la pantalla lista 5-7 pistas (`1. Sinónimo de "rápido" (5 letras)`, `2. Lo contrario de "lleno"`, `3. Lugar donde se hace el pan`…). El alumno escribe cada palabra; las iniciales se iluminan y forman la clave (un lugar o nombre del barrio: `KIOSCO`, `FERIA`…). Al completarla, «mensaje descifrado».
- **Aprendizaje**: P explica la relación (sinónimo/antónimo/hiperónimo) y, si la palabra es de un módulo ortográfico, su regla.
- **Feedback**: por pista; una letra incorrecta deja la casilla de la clave apagada.
- **Libreta**: la clave y dos palabras del descifrado.
- **Datos**: `lexico.json` (sinónimos, antónimos, definición), `claves.json` (palabras clave del barrio). **Generación**: se elige una clave; para cada letra se busca una palabra del banco que empiece por esa letra y tenga pista disponible, preferentemente de la cola; se evita repetir pista en 10 rondas.
- **Dificultad**: N1 claves de 4-5 letras con definiciones; N2 sinónimos y antónimos; N3 claves de 7 letras con pistas de polisemia y palabras de reglas difíciles.

#### T4. El etiquetador
- **Gancho**: «ORTO-3000 indexa el archivo: dile qué clase de palabra es cada una.»
- **Contenido y criterios**: clases de palabras (sustantivo, adjetivo, determinante, pronombre, verbo, adverbio, preposición, conjunción, interjección); **9.1**, LCL.3.D.2.
- **Mecánica**: una frase en la pantalla; se resalta una palabra y el alumno pulsa la tecla de su clase (botones-tecla con las 9 clases); en N2-N3 además escribe un **rasgo** que se pide («género y número», «persona», «grado»). Modo «todas»: etiqueta la frase completa, palabra a palabra, como una barra de progreso.
- **Aprendizaje**: D de Mateo con el «truco» de cada clase (sustituir por *él/ella* → pronombre; añadir *muy* → adjetivo o adverbio…); P generado desde la etiqueta: «*rápidamente* es adverbio: no cambia y responde a *¿cómo?*».
- **Feedback**: inmediato; al fallar, la clase correcta se ilumina y se explica el truco.
- **Libreta**: una frase con cada palabra y su clase debajo.
- **Datos**: `oraciones.json` (tokens etiquetados). **Generación**: se eligen oraciones con la clase objetivo; se barajan; las variables de nombres se rellenan sin romper las etiquetas (los nombres propios siempre son sustantivo).
- **Dificultad**: N1 sustantivo/adjetivo/verbo; N2 + determinante, pronombre y adverbio; N3 todas, con casos ambiguos (*bajo* preposición o adjetivo; *más* adverbio) y rasgos.

### Sala 3 · La Pizarra

#### Z1. Descubre la regla
- **Gancho**: «Seis pruebas en la pizarra. Formula la hipótesis… y busca el contraejemplo.»
- **Contenido y criterios**: cualquier módulo con regla (ortografía, acentuación, puntuación, gramática); **9.1** de forma directa (hipótesis, contraejemplo, terminología). LCL.3.D.1, D.6, D.7.
- **Mecánica**: 1) aparecen 6 palabras o frases correctas en la pizarra; 2) el alumno **arrastra** las que tienen algo en común a un círculo de tiza (observación); 3) elige una hipótesis entre 3 formuladas con terminología correcta (todas son frases correctas; una es la buena, una demasiado amplia y una demasiado estrecha); 4) la pizarra añade 3 palabras nuevas y pide tocar el **contraejemplo** que rompe la hipótesis mala o confirma la buena; 5) el alumno **escribe un ejemplo propio**, que se valida contra el banco (si no está en el banco, se acepta provisionalmente y queda para el maestro con un icono de interrogación).
- **Aprendizaje**: la actividad entera es la fase de aprendizaje de un módulo; sustituye la lección expositiva. Termina con la ficha de Mateo como «confirmación».
- **Feedback**: en cada paso; la hipótesis equivocada se tacha y se dice por qué («demasiado amplia: *vivir* termina en -ir y no lleva b»).
- **Libreta**: **la regla con sus palabras + un ejemplo y un contraejemplo propios** (ya previsto en `LIBRETA.md`).
- **Datos**: `reglas.json` ampliado con `ejemplos[]`, `contraejemplos[]`, `hipotesis[{texto, valor: buena|amplia|estrecha}]`. **Generación**: se muestrean 6 ejemplos y 1-2 contraejemplos distintos cada vez; las hipótesis se escriben una vez por módulo (son 20-30 módulos, no miles).
- **Dificultad**: N1 un módulo nuevo con hipótesis muy distintas; N2 hipótesis más parecidas; N3 «reglas rivales»: dos módulos a la vez (b/v: *-aba* frente a *-ivo*), hay que separar en dos círculos.

#### Z2. Análisis en la pizarra
- **Gancho**: «Separa sujeto y predicado, marca los núcleos y encierra los sintagmas.»
- **Contenido y criterios**: sujeto y predicado, concordancia, sujeto omitido, sintagmas (nominal, verbal, preposicional…), núcleo y complementos (CD, CI, CC, atributo en 6.º); **9.1**, LCL.3.D.2.
- **Mecánica** por capas: 1) el alumno arrastra una barra vertical de tiza para separar sujeto y predicado (o pulsa «sujeto omitido» y **escribe** el pronombre que correspondería: *nosotros*); 2) toca el núcleo de cada parte; 3) encierra con corchetes los sintagmas (toca primera y última palabra); 4) en 6.º, etiqueta la función de cada sintagma con fichas magnéticas. 
- **Aprendizaje**: D con el método de preguntas («¿quién? → sujeto; cambia el verbo a plural y mira qué palabra tiene que cambiar»); en N1 la oración trae colores de ayuda; P explica cada paso.
- **Feedback**: la tiza de color se queda fija al acertar y se borra con el borrador al fallar; al segundo fallo, se dibuja la solución y el alumno la **reproduce** (vuelve a colocar la barra o el corchete).
- **Libreta**: una oración analizada con el esquema de corchetes.
- **Datos**: `oraciones.json` con `sujeto`, `predicado`, `nucleos`, `sintagmas[{de, a, tipo, funcion}]`. **Generación**: se eligen oraciones por nivel; se **recombinan** sintagmas compatibles de distintas oraciones (un SN sujeto + un SV + un SPrep de lugar) manteniendo la concordancia marcada en los datos, lo que multiplica las oraciones disponibles.
- **Dificultad**: N1 sujeto/predicado y núcleos; N2 sintagmas y sujeto omitido; N3 funciones, oraciones con dos complementos y atributo.

#### Z3. La coma que cambia el culpable
- **Gancho**: «Una coma mal puesta y acusamos a quien no es. Puntúa la nota.»
- **Contenido y criterios**: puntuación (coma de vocativo, enumeración, inciso; punto; dos puntos; signos ¿? ¡!; raya de diálogo) y su relación con el significado y la intención; **9.1**, **5.1**, LCL.3.D.7, D.4.
- **Mecánica**: 1) la pizarra muestra una frase sin puntuar y **dos dibujos** (objetos o personajes del banco de arte) que representan las dos lecturas posibles («*Vamos a comer niños*»: ilustración del grupo comiendo frente a la de los niños asustados, siempre en clave de humor); 2) el alumno toca el dibujo que quiere expresar; 3) coloca la coma o el signo pulsando entre palabras (tecla de signos); 4) **reescribe** la frase completa con la puntuación. Variante diálogo: reconstruir una conversación de dos vecinos con rayas e incisos.
- **Aprendizaje**: la propia comparación visual es la explicación; P añade la regla («coma de vocativo: separa a quien llamamos»).
- **Feedback**: la frase bien puntuada se lee con la **síntesis de voz** (con pausa) si está disponible, para asociar signo y entonación.
- **Libreta**: la frase puntuada y la regla.
- **Datos**: `puntuacion.json` (frases con dos lecturas, signos obligatorios y opcionales, ilustraciones asociadas) y `dialogos.json`. **Generación**: hay un banco de patrones (vocativo, enumeración, inciso) con huecos para nombres y objetos del barrio; se rellenan con `plantillas.json`.
- **Dificultad**: N1 coma de vocativo y signos ¿? ¡!; N2 enumeraciones, dos puntos y rayas de diálogo; N3 incisos, punto y coma, comillas, y «frase con dos puntuaciones válidas» que pide explicar la diferencia eligiendo la paráfrasis correcta.

#### Z4. Transformaciones
- **Gancho**: «Cambia el número, el tiempo o la voz sin que la oración se rompa.»
- **Contenido y criterios**: concordancia, correlación temporal, voz activa y pasiva, modalidad oracional, sustitución pronominal; **9.1**, **8.2** (en la correlación temporal), LCL.3.D.4, D.5.
- **Mecánica**: la pizarra muestra una oración correcta y una **orden** en una ficha magnética («Pásala a plural», «Cuéntala en pasado», «Pásala a voz pasiva», «Conviértela en pregunta», «Sustituye el complemento por un pronombre»). El alumno **escribe la oración transformada**. El juego compara con la(s) respuesta(s) válidas generadas desde `oraciones.json` y `verbos.json`.
- **Aprendizaje**: D con el procedimiento («en la pasiva, el CD pasa a sujeto y el verbo lleva *ser* + participio»); en N1 la pizarra marca con tiza qué palabras van a cambiar.
- **Feedback**: comparación palabra a palabra; se resaltan las palabras que no concuerdan (en rojo) y se muestra la oración modelo; el alumno vuelve a escribir solo las palabras falladas.
- **Libreta**: la pareja oración original → transformada.
- **Datos**: `oraciones.json` (con `transformaciones` precalculadas o derivables: número, tiempo, pasiva, pronominalización, modalidad) + `verbos.json`. **Generación**: la transformación se calcula en el cliente con reglas morfológicas simples sobre los tokens etiquetados (plural de sustantivos y adjetivos regulares, conjugación desde `verbos.json`); las excepciones vienen precalculadas en el dato.
- **Dificultad**: N1 número y tiempo; N2 modalidad y pronombres; N3 pasiva y combinaciones («a plural y en pasado»).

#### Z5. El esquema del relato
- **Gancho**: «Las notas del caso se han desordenado. Reconstruye el relato con sus conectores.»
- **Contenido y criterios**: coherencia y cohesión, conectores y marcadores, tipologías textuales; **4.1**, **5.1**, LCL.3.B.2.1, B.2.2, D.5.
- **Mecánica**: 4-6 fragmentos de un relato breve, en fichas magnéticas desordenadas; el alumno los ordena arrastrando; después, 2 conectores se han borrado de la pizarra y hay que **escribirlos** eligiendo entre una lista corta de conectores correctos (*sin embargo, por eso, después, aunque*). Al final, pregunta de tipología: «¿Es una narración, una descripción o un diálogo?».
- **Aprendizaje**: D explica las señales de orden (tiempos verbales, marcadores temporales, pronombres que remiten a algo anterior); P justifica cada posición.
- **Feedback**: los fragmentos bien colocados se fijan; los mal colocados vibran y vuelven.
- **Libreta**: el esquema del relato en tres líneas (inicio, nudo, desenlace).
- **Datos**: `relatos.json` (relatos breves fragmentados, con conectores marcados y tipología). **Generación**: fragmentos con variables; a veces se intercala un fragmento «intruso» de otro relato que hay que descartar.
- **Dificultad**: N1 4 fragmentos con marcadores explícitos; N2 5 fragmentos y conectores que escribir; N3 6 fragmentos, un intruso y conectores de contraste y consecuencia.

### Sala 4 · El Laboratorio forense

#### L1. El sismógrafo de sílabas
- **Gancho**: «Pon la palabra en el sismógrafo: separa sus sílabas, encuentra el golpe de voz y decide si lleva tilde.»
- **Contenido y criterios**: sílaba, sílaba tónica, agudas/llanas/esdrújulas, diptongo e hiato, tilde; **9.1**, **5.1**, LCL.3.D.6. Es el error más frecuente de 10-12 años (Sotomayor et al., 2013): la actividad más rentable del catálogo.
- **Mecánica**: 1) la palabra aparece en el visor **sin tilde y en mayúsculas de laboratorio** (la mayúscula evita que se lea como «falta»: es una muestra, no una escritura); 2) el alumno pulsa entre letras para cortar con las pinzas las sílabas (se validan contra `silabas`); 3) pulsa la sílaba tónica: el sismógrafo dibuja un pico en ella; 4) clasifica (aguda, llana, esdrújula) con tres botones; 5) **escribe la palabra en minúscula con o sin tilde**; 6) el visor muestra la palabra correcta en grande y P explica. Modo síntesis de voz: el botón «escuchar» pronuncia la palabra para oír el golpe de voz.
- **Aprendizaje**: D de Mateo con tres palabras; en N1 el sismógrafo ya muestra el pico y solo hay que clasificar y escribir; la clasificación hace explícita la regla antes de escribir (la regla como herramienta, no como peaje).
- **Feedback**: por paso; el paso 5 es el que puntúa 5.1; los pasos 2-4, 9.1.
- **Libreta**: tres palabras con sus sílabas separadas, la tónica subrayada y el tipo.
- **Datos**: `palabras.json` (`silabas`, `tonica`, `tipo`, `diptongo/hiato`). **Generación**: se muestrean palabras del módulo activo + cola, equilibrando con tilde y sin tilde al 50 % (para que «siempre poner tilde» no funcione); nunca dos palabras con la misma terminación seguidas.
- **Dificultad**: N1 bisílabas y trisílabas sin diptongos; N2 diptongos y palabras de 4 sílabas; N3 hiatos (*raíz, baúl*), monosílabos y diacríticos (*él/el*) con una frase de contexto.

#### L2. El microscopio de homófonos
- **Gancho**: «Dos muestras idénticas al oído. El microscopio distingue cuál es cuál.»
- **Contenido y criterios**: homófonos y parejas que se confunden (*tubo/tuvo, hecho/echo, haya/halla, a ver/haber, porque/por qué, casa/caza* en zona de seseo); **9.2**, LCL.3.D.3 (homónimas), B.3.5.
- **Mecánica**: 1) el visor muestra las dos palabras de la pareja, **ambas correctas**, cada una con su definición y una ilustración de objeto cuando la hay (un tubo, una vaca, una baca…); 2) debajo, una frase con un hueco; 3) el alumno **escribe** la palabra que corresponde; 4) P explica con el truco de sustitución («si puedes decir *tenía*, es *tuvo* con v»). Ronda de 4 frases por pareja, intercaladas con otra pareja.
- **Aprendizaje**: la pantalla inicial es una mini lección visual (dos muestras, dos sentidos); D muestra un truco de sustitución por pareja.
- **Feedback**: inmediato; nunca se muestra la pareja «equivocada» como falta, sino como «la otra muestra», con su sentido.
- **Libreta**: la pareja con una frase propia para cada una.
- **Datos**: `homofonos.json` (pareja, definiciones, trucos, frases con hueco, ilustración). **Generación**: frases por pareja con variables; se eligen parejas del curso; en Andalucía se priorizan las de seseo/ceceo cuando el maestro activa `ajustes.andaluz`.
- **Dificultad**: N1 parejas con objeto ilustrable (*vaca/baca, hola/ola*); N2 verbales (*hecho/echo, haya/halla*); N3 secuencias (*a ver/haber, porque/por qué/porqué, sino/si no*).

#### L3. La centrifugadora de palabras
- **Gancho**: «Separa la palabra en sus piezas y vuelve a montarla con otras.»
- **Contenido y criterios**: palabras simples, derivadas y compuestas; prefijos y sufijos; familias de palabras; aumentativos, diminutivos y despectivos; la h y la b/v que **se conservan** en la familia; **9.1**, **9.2**, LCL.3.D.3, C.5.
- **Mecánica** (dos modos): a) **Desmontar**: la palabra gira en la centrifugadora y se separa en piezas (prefijo | raíz | sufijo); el alumno coloca cada pieza en su bandeja y escribe el significado del prefijo eligiendo entre significados (todos correctos: «*des-* = negación»); b) **Montar**: se dan una raíz y una pieza (*in-* + *útil*, *pan* + *-ería*, *hueso* → adjetivo) y el alumno **escribe** la palabra resultante; el laboratorio avisa de los «cambios químicos» (*in-* + *posible* → *imposible*; *hueso* → *óseo* sin h).
- **Aprendizaje**: D con una familia completa en pantalla (*flor, florero, floristería, florecer*); P generado con el significado del afijo del banco.
- **Feedback**: por palabra; al fallar, la palabra correcta se monta sola pieza a pieza y el alumno la reescribe.
- **Libreta**: una familia de palabras de 4 miembros.
- **Datos**: `lexico.json` (campo `familia`, `morfologia: {prefijo, raiz, sufijo}`), `afijos.json` (prefijos y sufijos con significado y ejemplos). **Generación**: producto afijo × raíz validado contra el banco (solo se piden combinaciones que existen).
- **Dificultad**: N1 diminutivos, aumentativos y sufijos de oficio; N2 prefijos de negación y cantidad, familias con h; N3 compuestas (*sacapuntas, pelirrojo* con rr), prefijos griegos (*hidro-, geo-* que explican la h y la g) y despectivos.

#### L4. La balanza de sinónimos
- **Gancho**: «Equilibra la balanza: busca una palabra que pese lo mismo… o justo lo contrario.»
- **Contenido y criterios**: sinónimos, antónimos, gradación de significado, campo semántico, hiperónimos; **9.2**, LCL.3.D.3, C.5.
- **Mecánica**: en un plato hay una palabra; el alumno **escribe** en el otro un sinónimo (la balanza se equilibra) o un antónimo (se inclina del todo), según pida el instrumento. Modo **gradación**: cuatro platos con palabras de intensidad creciente (*frío, helado, gélido…*) y hay que colocar la que falta escribiéndola. Modo **intruso**: cinco palabras en bandejas, una no es del campo semántico; se retira con las pinzas y se escribe el **nombre del campo** (hiperónimo).
- **Aprendizaje**: D con el truco de la sustitución en una frase («si la frase sigue significando lo mismo, es sinónimo»); P muestra la frase de ejemplo con las dos palabras.
- **Feedback**: acepta **cualquier sinónimo de la lista** del banco; si el alumno escribe una palabra real que no está, el juego la marca como «pendiente de Mateo» (se guarda para el maestro) y no la cuenta como fallo.
- **Libreta**: tres pares sinónimo/antónimo.
- **Datos**: `lexico.json` (`sinonimos[]`, `antonimos[]`, `campo`, `intensidad`). **Generación**: palabras con ≥ 2 sinónimos en el banco; los intrusos se toman de otro campo cercano para que no sea trivial.
- **Dificultad**: N1 sinónimos directos y antónimos con prefijo (*feliz/infeliz*); N2 gradación de 4; N3 intrusos de campos cercanos y antónimos sin prefijo, con registro («*colega*, informal, frente a *compañero*»).

### Sala 5 · La Sala de Interrogatorios

#### I1. El interrogatorio
- **Gancho**: «El testigo habla. Tú escucha, lee entre líneas y descubre lo que no dice.»
- **Contenido y criterios**: comprensión lectora (sentido global, información relevante, inferencias directas e indirectas, ideas implícitas); **4.1**, **4.2**, LCL.3.B.3.4.
- **Mecánica**: 1) un vecino (del banco de personajes, con expresiones) declara en 3-4 bocadillos que se escriben solos (la grabadora permite releer cada uno); 2) el alumno responde en el acta a 3 preguntas: una **literal** («¿A qué hora cerró el kiosco?»), una **inferencial** («¿Por qué dice que no vio la nota?») y una de **vocabulario o intención** («¿Qué significa aquí *me quedé de piedra*?»); las literales e inferenciales se responden **escribiendo** una palabra o dato clave (hora, lugar, nombre, objeto) y se validan contra los hechos; las de intención, eligiendo entre paráfrasis correctas; 3) remate: «Hay algo que no encaja con lo que dijo antes: tócalo» (contradicción entre dos bocadillos).
- **Aprendizaje**: D de Lola con la estrategia «antes-durante-después» (qué espero oír, qué subrayo, qué no me ha dicho); P explica la inferencia señalando las palabras del texto que la sostienen (se iluminan en el bocadillo).
- **Feedback**: inmediato; en inferencias, si falla, se iluminan las palabras clave y se da un segundo intento.
- **Libreta**: nombre del testigo y una frase de lo que dijo (ya previsto en `LIBRETA.md`), más «lo que no dijo» (la inferencia).
- **Datos**: `declaraciones.json`: plantillas narrativas con **hechos estructurados** (`{quien, donde, cuando, objeto, motivo}`) y variantes de frase para cada hecho (literal o implícito), más una lista de contradicciones posibles. **Generación**: se instancian los hechos con `plantillas.json`; las preguntas literales se generan desde los hechos explícitos, las inferenciales desde los hechos expresados de forma implícita (el banco marca qué frases implican qué hecho), y la contradicción se siembra cambiando un hecho en un bocadillo posterior. Esto da comprensión lectora **infinita y corregible automáticamente**, a costa de textos algo formularios; por eso el banco incluye también 30-40 declaraciones escritas a mano con preguntas propias para N3.
- **Dificultad**: N1 solo literales + 1 inferencia muy marcada; N2 inferencias y vocabulario en contexto; N3 declaraciones largas escritas a mano, ironía, dos testigos que se contradicen entre sí.

#### I2. El detector de intenciones
- **Gancho**: «¿Pregunta, ordena, desea o duda? El detector lo revela… y tú lo reescribes.»
- **Contenido y criterios**: modalidades oracionales (enunciativa, interrogativa, exclamativa, exhortativa, desiderativa, dubitativa) e intención comunicativa; signos ¿? ¡!; **9.1**, **5.1**, LCL.3.D.4, D.7.
- **Mecánica**: el sospechoso dice una frase; la aguja del detector (CSS) oscila; el alumno pulsa la modalidad; luego recibe una orden de reescritura («Conviértela en una pregunta», «Dilo como un deseo») y **escribe la nueva frase** con sus signos de apertura y cierre. La síntesis de voz, si existe, lee la frase original con su entonación.
- **Aprendizaje**: D con una misma frase dicha de seis maneras; P explica las marcas de cada modalidad (*ojalá, quizá*, el imperativo, los signos).
- **Feedback**: la aguja se clava en verde o rojo; en la reescritura, se comprueba la presencia de los signos de apertura y cierre, el verbo y la palabra clave de la modalidad; al fallar, modelo + reescritura.
- **Libreta**: una frase en tres modalidades.
- **Datos**: `oraciones.json` con `modalidad` y `variantes_modalidad` (precalculadas por frase). **Generación**: frases × modalidades pedidas, filtrando las que el banco tiene variante.
- **Dificultad**: N1 enunciativa/interrogativa/exclamativa; N2 + exhortativa y desiderativa; N3 dubitativa, interrogativas indirectas (con tilde en *qué*: puente con P4) e intención irónica.

#### I3. El pronombre traidor
- **Gancho**: «“Ella la vio salir con él.” ¿Quién? ¿A quién? Deshaz la ambigüedad.»
- **Contenido y criterios**: sustituciones pronominales, referencia y cohesión; **9.2**, **9.1**, LCL.3.D.5.
- **Mecánica**: una declaración de dos frases con un pronombre ambiguo; el alumno 1) toca el pronombre; 2) toca a qué palabra se refiere en cada lectura posible (dos fotos de sospechosos en el espejo se iluminan); 3) **reescribe** la frase sin ambigüedad sustituyendo el pronombre por el nombre (o al revés: una declaración repetitiva donde hay que **sustituir** un nombre repetido por el pronombre adecuado: *lo, la, le, les*).
- **Aprendizaje**: D con el método de la flecha (dibujar de cada pronombre a su referente); P indica persona, género y número del pronombre.
- **Feedback**: la flecha se dibuja en verde o rojo; en la reescritura, comparación con las respuestas válidas.
- **Libreta**: la frase ambigua y su versión clara.
- **Datos**: `oraciones.json` (pares con `pronombre`, `referentes[]`, `reescrituras[]`). **Generación**: plantillas con dos personajes del mismo género para forzar la ambigüedad, con nombres variables.
- **Dificultad**: N1 *él/ella* con dos personajes; N2 *lo/la/le*; N3 *se, les, su* (posesivo ambiguo) y leísmo frecuente en la zona (como diferencia, no como «hablar mal»).

#### I4. La transcripción de la grabadora
- **Gancho**: «La grabadora lo pasa todo a letra corrida, sin mayúsculas ni puntos. Devuélvele la forma.»
- **Contenido y criterios**: mayúsculas (inicio, nombres propios, tras punto), punto y seguido, punto y aparte, signos de pregunta y exclamación en diálogos; **5.1**, **9.2**, LCL.3.B.3.5, D.7.
- **Mecánica**: la transcripción aparece en la cinta como una línea continua en minúsculas sin puntuación (es una transformación declarada, como la máquina sin tilde). El alumno pulsa entre palabras para poner puntos y toca las palabras que deben ir en mayúscula y **las reescribe**; al final, el texto se ve en limpio. Modo N3: separar en párrafos y poner rayas de diálogo.
- **Aprendizaje**: F (ficha de mayúsculas y puntuación); P razona cada mayúscula («*Inés*: nombre propio»; «*lunes*: los días van en minúscula»). Antes de la ronda, en N1, aparece una lista de «trampas» (meses, días, gentilicios) que **no** llevan mayúscula.
- **Feedback**: por marca; las trampas pulsadas se explican.
- **Libreta**: dos frases en limpio.
- **Datos**: `textos.json` (cualquier texto correcto sirve: la transformación es automática). **Generación**: texto → minúsculas y sin puntos → la lista de respuestas se calcula sola; se eligen textos con ≥ 2 nombres propios y ≥ 1 trampa.
- **Dificultad**: N1 3 oraciones, nombres de persona; N2 5 oraciones, lugares, días y meses; N3 diálogo con rayas y signos.

#### I5. El testigo seseante (opcional, lo activa el maestro)
- **Gancho**: «Habla como habla el barrio. Escríbelo como se escribe.»
- **Contenido y criterios**: modalidad lingüística andaluza y norma escrita (seseo, ceceo, yeísmo, -s aspirada, -d final), como diferencia y no como error; **1.3**, **9.2**, LCL.3.A.2, B.3.5.
- **Mecánica**: el testigo «habla»: su bocadillo muestra la frase en **notación de pronunciación** (entre corchetes, fuente distinta, color de voz: `[la casuela de arró]`), nunca como escritura; la síntesis de voz no sirve aquí (no sesea), así que la notación es la pista. El alumno **escribe la frase en norma escrita**. P explica: «En La Alameda muchos pronuncian *s* donde se escribe *z*: *cazuela*, *arroz*. Las dos cosas están bien: una es hablar, la otra es escribir». 
- **Aprendizaje**: D de Lola, que sesea con orgullo: «yo lo digo así, y lo escribo así». Ficha propia del módulo con los rasgos andaluces y su correspondencia escrita.
- **Feedback**: inmediato; cuidado de no usar nunca la palabra «error» para la pronunciación.
- **Libreta**: dos palabras «como las digo / como se escriben».
- **Datos**: `frases.json` con palabras marcadas de c/z/s, ll/y y -d; `pronunciacion.json` con las reglas de transformación a notación oral (z→s, ll→y, -d final → ´, -s final → h). **Generación**: frase correcta → notación oral automática.
- **Dificultad**: N1 solo seseo; N2 + yeísmo y -d final; N3 todo a la vez con palabras de la cola. **Riesgo** reconocido de exposición a formas no normativas: por eso es opcional, la notación es claramente «oral» y cada ronda termina con la frase en limpio (ver §7).

### Sala 6 · La Centralita

#### R1. Dictado por radio
- **Gancho**: «Mensaje de Lola desde el kiosco. Hay interferencias: escríbelo bien a la primera.»
- **Contenido y criterios**: ortografía de letras, acentuación y puntuación en producción; **5.1**, LCL.3.B.3.5, D.6, D.7.
- **Mecánica**: 1) el botón de la radio lee la frase con `speechSynthesis` (`es-ES`, velocidad 0,85 en N1); 2) el alumno la escribe en la cinta de télex; 3) puede repetir la escucha hasta 3 veces (se registran); 4) corrección palabra a palabra. Los signos ¿? ¡! y las comas se dictan con la entonación que da la voz y, en N1, con una indicación («coma») leída. **Sin voz disponible**, la actividad pasa automáticamente al modo relámpago (P3) con la misma frase, así nunca se rompe.
- **Aprendizaje**: F; P en cada palabra fallada. El dictado es la técnica habitual del aula (Montaner y Cánovas, 2025): aquí se usa para aprender, no para contar faltas, porque cada fallo lleva explicación y entra en la cola.
- **Feedback**: por palabra, inmediato; reescritura de las falladas.
- **Libreta**: la frase dictada en limpio.
- **Datos**: `frases.json`. **Generación**: frases con 2-3 palabras marcadas de los módulos activos y de la cola; se evita el mismo esquema sintáctico dos veces seguidas.
- **Dificultad**: N1 frases cortas a velocidad lenta y con «coma»/«punto» dictados; N2 velocidad normal, sin dictar signos; N3 dos frases seguidas con nombres propios y un diálogo breve.

#### R2. Mensaje entrecortado
- **Gancho**: «Solo llegan fragmentos del aviso. Completa la ficha con lo que entiendas.»
- **Contenido y criterios**: comprensión oral (ideas principales, datos explícitos e implícitos); **2.1**, LCL.3.B.3.2.
- **Mecánica**: la radio emite (voz) un aviso de 20-30 segundos (un vecino avisa de algo, da un lugar, una hora, una descripción); el alumno rellena la **ficha de aviso** con 4 campos escritos (quién, dónde, cuándo, qué) y responde a una pregunta de inferencia eligiendo entre paráfrasis correctas. Puede escuchar dos veces. Sin voz: se muestra el texto por fragmentos que desaparecen (como un télex que se borra), lo que lo convierte en comprensión lectora rápida.
- **Aprendizaje**: D de Lola sobre tomar notas mientras se escucha (la libreta otra vez: «apunta las palabras clave, no las frases»).
- **Feedback**: por campo; las respuestas se normalizan (horas, mayúsculas).
- **Libreta**: las palabras clave anotadas durante la escucha.
- **Datos**: `declaraciones.json` (las mismas plantillas con hechos estructurados que I1). **Generación**: idéntica a I1 pero en versión oral, más corta.
- **Dificultad**: N1 todos los datos explícitos; N2 un dato implícito; N3 dos avisos seguidos que hay que distinguir.

#### R3. El deletreo
- **Gancho**: «La agente deletrea una palabra por el walkie. Apúntala sin perder una letra.»
- **Contenido y criterios**: alfabeto, nombre de las letras (*be, uve, hache, i griega / ye, ce, zeta*), conciencia de la grafía; **5.1** (apoyo), LCL.3.D.2 (sonidos y letras), con el valor andaluz de distinguir el nombre de la letra de su sonido.
- **Mecánica**: la voz deletrea («hache, u, e, ese, o») una palabra del módulo activo; el alumno la escribe; luego el walkie «cambia de sentido»: aparece una palabra correcta en pantalla y el alumno pulsa las letras-tecla **nombrándolas** (toca «uve» para *v*). Sin voz: las letras aparecen una a una y desaparecen.
- **Aprendizaje**: F del alfabeto con nombres de letras y P: «la palabra lleva *hache* aunque no suene».
- **Feedback**: por letra, inmediato.
- **Libreta**: dos palabras deletreadas.
- **Datos**: `palabras.json`. **Generación**: palabras del módulo con letras «difíciles» (h, b/v, g/j, ll/y, c/z).
- **Dificultad**: N1 palabras de 5-6 letras; N2 8-9 letras con h intercalada; N3 palabras con diéresis y tildes (la voz dice «u con diéresis», «o con tilde»).

#### R4. El conector perdido
- **Gancho**: «Dos mensajes cortos. Únelos con la palabra que les da sentido.»
- **Contenido y criterios**: conectores y marcadores (causa, consecuencia, oposición, tiempo), cohesión; **5.1**, **9.2**, LCL.3.B.2.2, D.5.
- **Mecánica**: la radio da dos mensajes («El kiosco estaba cerrado» / «Volvimos a la agencia»); el alumno **escribe el mensaje unido** eligiendo primero el tipo de relación (causa, consecuencia, contraste, tiempo) en el dial y luego redactando con un conector adecuado; se acepta cualquier conector del tipo elegido que esté en el banco.
- **Aprendizaje**: D con un mismo par unido de tres maneras distintas y cómo cambia el sentido; P explica el valor del conector escrito.
- **Feedback**: validación del conector y de la puntuación mínima (coma tras *sin embargo*, por ejemplo).
- **Libreta**: un par de mensajes unidos.
- **Datos**: `conectores.json` (conector, tipo, puntuación asociada, ejemplos) y `frases.json` (pares compatibles por tipo de relación). **Generación**: pares etiquetados con la relación lógica que admiten.
- **Dificultad**: N1 tiempo y causa (*porque, después*); N2 consecuencia y contraste; N3 *sin embargo, por tanto, aunque, a pesar de que* con puntuación.

### Sala 7 · El Archivo

#### A1. Fichas pendientes (el repaso espaciado)
- **Gancho**: «Estas fichas han vencido. Si las escribes bien, pasan al cajón de archivadas.»
- **Contenido y criterios**: cualquier palabra fallada por el alumno, en cualquier sala o caso; **5.1**, **9.2**. Es el corazón didáctico de la Academia (espaciado e intercalado: Klimovich y Richter, 2025).
- **Mecánica**: el fichero abre el cajón «Pendientes»; salen 5-8 fichas vencidas, de módulos distintos y mezcladas. Cada ficha muestra **una pista de recuperación** (una frase con hueco, la definición o el audio) y el alumno **escribe la palabra**. Acierto → la ficha salta de intervalo (1→3→7→15→30) con un sello verde y, si llega al último, pasa al cajón «Archivadas» con una animación. Fallo → vuelve al intervalo 1, se muestra la forma correcta, P explica y el alumno la reescribe.
- **Aprendizaje**: P; además, cada ficha lleva en el reverso la regla con sus palabras **copiada de lo que el alumno escribió en Z1** si existe (su propia formulación). Las fichas de palabras «rebeldes» (≥ 3 fallos) desbloquean una **mini lección** de Mateo sobre esa palabra concreta (familia, truco mnemotécnico generado: «*haber* lleva h como *hubo* y *hay*»).
- **Feedback**: inmediato, y un contador visible de «fichas archivadas» que crece con el curso.
- **Libreta**: las palabras repasadas hoy (bien escritas), una línea por turno.
- **Datos**: cola local `la-lupa-cola` + `palabras.json` (para pistas) + `frases.json` (frases con hueco). **Generación**: solo depende de la cola; si está vacía, el cajón muestra «Sin pendientes» y propone 3 palabras «de riesgo» del módulo más débil del alumno (las más falladas por la clase si hay datos; si no, las marcadas `frec: alta` del módulo).
- **Dificultad**: la impone la cola. La pista de recuperación baja de ayuda con los intervalos: frase con hueco (1), definición (3-7), solo la regla (15-30).

#### A2. Archivar por orden
- **Gancho**: «Expedientes revueltos otra vez. Colócalos en su cajón: el orden alfabético es la ley del Archivo.»
- **Contenido y criterios**: orden alfabético (1.ª, 2.ª y 3.ª letra; ch y ll; palabras con tilde), uso del diccionario; **9.2**, LCL.3.D.8.
- **Mecánica**: 6-8 fichas desordenadas; el alumno las arrastra a la estantería en orden; luego el fichero le pide **escribir** «la palabra que iría entre *farol* y *feria*» (busca una en su cabeza: vale cualquier palabra real del banco en ese rango).
- **Aprendizaje**: D de Mateo: «misma primera letra → mira la segunda»; P indica la letra decisiva en cada pareja.
- **Feedback**: la estantería acepta o rechaza la posición al soltar.
- **Libreta**: cinco palabras del archivo en orden.
- **Datos**: `lexico.json`. **Generación**: se eligen palabras que comparten primeras letras según el nivel.
- **Dificultad**: N1 primera letra distinta; N2 misma primera letra; N3 misma raíz (*casa, casi, caso, cascada*) y palabras con mayúscula y tilde.

#### A3. Los expedientes por campos
- **Gancho**: «Cada cajón guarda una familia de cosas. Hay un expediente que no es de aquí.»
- **Contenido y criterios**: campos semánticos, hiperónimos e hipónimos, palabras derivadas y compuestas, gentilicios; **9.2**, LCL.3.D.3.
- **Mecánica**: un cajón abierto con 5 fichas; el alumno saca la intrusa, **escribe la etiqueta del cajón** (hiperónimo: *herramientas*, *oficios*…) y luego añade **una ficha nueva** de su cosecha (se valida contra el banco; si es palabra real no catalogada, queda «pendiente de Mateo»). Variante gentilicios: fichas de lugares andaluces y hay que escribir el gentilicio (*Córdoba → cordobés*), con enlace a mayúsculas (los gentilicios van en minúscula).
- **Aprendizaje**: P explica la relación hiperónimo-hipónimo con la frase «*X* es un tipo de *Y*».
- **Feedback**: inmediato.
- **Libreta**: un campo semántico con cinco palabras.
- **Datos**: `lexico.json` (`campo`, `hiperonimo`), `gentilicios.json`. **Generación**: campos con ≥ 6 miembros; el intruso de un campo vecino.
- **Dificultad**: N1 campos concretos (animales, ropa); N2 abstractos (sentimientos, oficios); N3 intrusos sutiles y gentilicios irregulares (*Huelva → onubense*, *Jaén → jiennense*).

#### A4. El origen de las palabras
- **Gancho**: «Cada palabra tiene pasaporte. Averigua de dónde vino y qué huella dejó en su ortografía.»
- **Contenido y criterios**: origen del léxico (latín, griego, árabe, préstamos), prefijos griegos (*hidro-, geo-, hiper-*), arabismos andaluces (*aceituna, alberca, azahar*), siglas y acrónimos; **9.1**, **1.1**, LCL.3.A.1, D.3. Curso típico: 6.º.
- **Mecánica**: una ficha con la palabra y tres «sellos de pasaporte» (latín, griego, árabe); el alumno estampa el que cree; P da la pista etimológica; después **escribe** otra palabra con el mismo origen o el mismo prefijo (validada por el banco: *hidro-* → *hidratar, hidroavión*). Modo siglas: escribe la expresión completa de una sigla del barrio o conocida y viceversa.
- **Aprendizaje**: mini lección por origen (3 pantallas con mapa del Mediterráneo, imagen sin texto) la primera vez; P conecta origen y ortografía: «las palabras con *hidro-* llevan h porque vienen del griego *hydor*».
- **Feedback**: inmediato.
- **Libreta**: tres palabras con su origen.
- **Datos**: `lexico.json` (`origen`, `etimo` breve), `afijos.json`, `siglas.json`. **Generación**: palabras con origen catalogado; prefijos con ≥ 3 derivados.
- **Dificultad**: N1 arabismos con *al-* y prefijos griegos evidentes; N2 latinismos y préstamos modernos; N3 siglas, acrónimos y dobletes (*hueso/óseo*).

### Sala 8 · La Imprenta del Eco

#### E1. Redacta el informe
- **Gancho**: «El Eco publica mañana tu informe. Tres datos, cinco líneas, cero faltas.»
- **Contenido y criterios**: producción escrita (planificar, redactar, revisar), adecuación al género (informe, noticia, carta), ortografía y puntuación en texto propio; **5.1** de forma directa, LCL.3.B.3.5, B.2.1.
- **Mecánica**: 1) la máquina de escribir muestra la **ficha de hechos** (quién, qué, dónde, cuándo, por qué: generados) y un **modelo** del género en N1 (una noticia de ejemplo, correcta); 2) el alumno teclea su texto en la hoja (mínimo y máximo de palabras); 3) **revisión automática parcial**: el juego comprueba mayúscula inicial y tras punto, puntos finales, presencia de los datos obligatorios (nombres y lugar bien escritos), palabras del banco mal escritas (solo las que puede reconocer: compara cada palabra con `palabras.json` y sus `mal`), repeticiones excesivas y longitud; 4) el alumno **revisa** lo marcado y reescribe; 5) el texto pasa a la «rotativa» y aparece maquetado en una página de periódico (recompensa visual fuerte); 6) queda en la bandeja del maestro para su valoración con la rúbrica.
- **Aprendizaje**: D de don Anselmo sobre la estructura del género (titular, entradilla, cuerpo; o fórmulas de la carta); un **planificador** previo de tres huecos (inicio, nudo, desenlace) que el alumno rellena con una palabra cada uno antes de escribir.
- **Feedback**: automático en lo mecánico (ortografía reconocible, puntuación, datos), diferido del maestro en lo demás; nunca se da nota automática a un texto libre.
- **Libreta**: el informe se escribe primero **en la libreta** (modo papel) y luego se pasa a la máquina; en digital, directamente en la máquina.
- **Datos**: `declaraciones.json` (hechos), `generos.json` (modelos y requisitos de cada género: noticia, carta, aviso, diario, descripción de sospechoso), `palabras.json`. **Generación**: hechos nuevos en cada ronda; género rotativo.
- **Dificultad**: N1 aviso de 3 líneas con modelo; N2 noticia de 5 líneas sin modelo, con dos conectores obligatorios; N3 carta formal o descripción con un tiempo verbal impuesto (pasado) y vocabulario obligatorio de la cola.

#### E2. El titular
- **Gancho**: «Resume el suceso en un titular de ocho palabras que no engañe a nadie.»
- **Contenido y criterios**: comprensión global, síntesis, idea principal, adecuación; **4.1**, **5.1**, LCL.3.B.3.4, B.2.2.
- **Mecánica**: un artículo breve (generado o del banco); el alumno **escribe un titular** (máximo 8-10 palabras); el juego comprueba que contiene la idea principal (presencia de 2 de las 3 palabras clave del artículo, o sus sinónimos del banco) y no datos secundarios marcados como «distractores». Variante inversa: dado un titular, elegir entre tres resúmenes correctos el que de verdad dice lo mismo (sin faltas en ninguno).
- **Aprendizaje**: D: regla de «quién hizo qué» para titular; P muestra las palabras clave del texto iluminadas.
- **Feedback**: semáforo del redactor jefe («falta el quién», «eso es un detalle»); la maqueta del periódico recibe el titular al aprobarse.
- **Libreta**: el titular propio.
- **Datos**: `textos.json` con `claves[]`, `distractores[]` y `idea_principal`. **Generación**: artículos con variables y palabras clave fijas.
- **Dificultad**: N1 textos de 4 líneas con la idea al principio; N2 idea en medio; N3 textos con dos ideas, hay que elegir la principal.

#### E3. Pruebas de imprenta (reglas mezcladas)
- **Gancho**: «Antes de rodar la rotativa, el corrector revisa la galerada. Hoy, el corrector eres tú.»
- **Contenido y criterios**: revisión de textos ajenos con **todas las reglas trabajadas hasta ahora intercaladas**, más errores de concordancia y repeticiones léxicas; **9.2**, **5.1**, LCL.3.B.3.5, D.2, D.3.
- **Mecánica**: igual que P1 pero sobre un artículo del Eco más largo (10-14 líneas) y con 4-5 marcas de tipos distintos: 2-3 faltas ortográficas de módulos distintos (nunca más), 1 error de concordancia (*los vecinos estaba*) y 1 palabra repetida que hay que sustituir por un sinónimo (escribiéndolo). Los signos de corrector de imprenta (CSS) se van estampando en el margen.
- **Aprendizaje**: es la actividad de **intercalado** por excelencia, para alumnos que ya tienen varios módulos en marcha; P nombra la regla cada vez y la terminología («concordancia de número»).
- **Feedback**: por marca; al terminar, el artículo se imprime limpio.
- **Libreta**: las palabras corregidas y la regla de cada una.
- **Datos**: `textos.json` (artículos largos con marcas de varios módulos y marcas `concordancia` y `repeticion`), `palabras.json`, `lexico.json`. **Generación**: como P1, con cuotas por tipo de error y prioridad a la cola.
- **Dificultad**: N2 y N3 solamente (requiere ≥ 3 módulos en entrenamiento). N3 añade una palabra correcta «sospechosa».

#### E4. Sección de Cultura: lenguaje figurado
- **Gancho**: «El poeta del barrio esconde pistas en sus versos. Descubre el truco… y escribe el tuyo.»
- **Contenido y criterios**: comparación, metáfora, personificación, hipérbole, juegos de palabras; géneros (narrativo, poético, dramático); **8.1**, **8.2**, LCL.3.C.4, C.5, C.9.
- **Mecánica**: 1) un fragmento breve (2-6 versos o 3 líneas de prosa, de dominio público o escrito para el juego) en la página de Cultura; 2) el alumno toca el verso con el recurso y pulsa su nombre (comparación, metáfora…); 3) P explica qué dos cosas se comparan o se identifican (se iluminan); 4) **taller**: una plantilla del recurso con huecos («La luna es ___ de ___» / «___ como ___») que el alumno rellena con palabras propias; el juego comprueba que no están vacíos, que las palabras existen y que no son la misma; el maestro valora la creatividad; 5) remate ocasional: «¿narrativo, poético o dramático?».
- **Aprendizaje**: mini lección por recurso con ejemplos del barrio («*Lola es un rayo*: metáfora; *Lola corre como un rayo*: comparación»); D de don Anselmo.
- **Feedback**: automático en el reconocimiento; en el taller, el verso del alumno se **imprime** en la sección de Cultura (recompensa) y queda para el maestro.
- **Libreta**: el verso propio.
- **Datos**: `literatura.json` (fragmentos con `recursos[{verso, tipo, a, b}]`, `genero`, `autor` o «escrito para el juego», `licencia`), `plantillas-figurado.json`. **Generación**: fragmentos por recurso y nivel; plantillas × palabras del campo semántico del fragmento.
- **Dificultad**: N1 comparación y personificación; N2 metáfora e hipérbole; N3 juegos de palabras, greguerías y aforismos, y mezcla de recursos en un mismo fragmento.

#### E5. El Refranero del Eco
- **Gancho**: «Cada semana el Eco publica un refrán a medias. Complétalo y di lo que quiere decir.»
- **Contenido y criterios**: refranes, cantinelas y poemas de la cultura popular andaluza y general, sentido literal y figurado, recursos estilísticos (rima, paralelismo); **8.3**, **8.1**, LCL.3.C.5, C.6, C.9, B.2.1.
- **Mecánica**: 1) la primera mitad del refrán aparece; el alumno **escribe** la segunda (se acepta la variante del banco; si escribe otra variante real, queda «pendiente del maestro»); 2) elige entre tres explicaciones correctas la que corresponde al sentido figurado; 3) escribe una **situación del barrio** en la que se diría (una línea; se guarda para el maestro); 4) en 6.º, nombra el recurso (rima consonante/asonante, paralelismo, hipérbole).
- **Aprendizaje**: P explica el sentido literal y el figurado y, cuando se sabe, el origen (oficios, campo, mar). Mini lección sobre rima.
- **Feedback**: inmediato en la escritura y el sentido; diferido en la situación.
- **Libreta**: el refrán completo y su sentido con las propias palabras.
- **Datos**: `refranes.json` (texto, variantes, sentido, recursos, origen andaluz si lo es, cantinelas). **Generación**: rotación por semana y curso; un refrán «de la semana» común a toda la clase para que lo comenten en el aula.
- **Dificultad**: N1 refranes muy conocidos con rima; N2 menos conocidos y cantinelas; N3 aforismos, greguerías y recursos.

### Ideas en la recámara (no detalladas)

«El laberinto de la regla» (recorrer un mapa del barrio decidiendo si cada palabra cumple la regla), «El aura del adjetivo» (grados del adjetivo: positivo, comparativo, superlativo con medidor de aura), «Bulo o noticia» (fiabilidad de dos fuentes, criterios 4.2 y 6.3), «Carta a la directora» (registro formal e informal), «Dramatiza la escena» (lectura expresiva con la síntesis de voz como compañero, 3.3), «La abreviatura» (abreviaturas y siglas en el archivo).

## 5. Bancos de datos

Todos en `apps/la-lupa/datos/academia/`. Formato JSON, UTF-8, correctamente acentuado. Las **marcas de palabra** en frases y textos usan corchetes `[palabra]` o `[palabra|modulo]` cuando una palabra está en varios módulos. Las **variables** usan llaves con tipo: `{vecino}`, `{vecina}`, `{lugar}`, `{objeto}`, `{hora}`, `{dia}`, que se rellenan desde `plantillas.json` (con concordancia de género marcada: `{vecino:el}`). Las formas erróneas (`mal`) solo existen en `palabras.json` y **el juego solo las muestra dentro de P1 y E3**, nunca en listas, pistas ni explicaciones.

### 5.1 `palabras.json`: la columna vertebral

```json
{
  "camión": {
    "modulos": ["tildes-generales"],
    "mal": ["camion"],
    "silabas": ["ca", "mión"], "tonica": 1, "tipo": "aguda", "terminacion": "-n",
    "diptongo": true, "hiato": false,
    "clase": "sustantivo", "genero": "m", "plural": "camiones",
    "def": "Vehículo grande para transportar cosas.",
    "frec": "alta", "curso": [5, 6]
  },
  "recibir": {
    "modulos": ["b-v-1"],
    "mal": ["recivir"],
    "silabas": ["re", "ci", "bir"], "tonica": 2, "tipo": "aguda", "terminacion": "-r",
    "clase": "verbo", "conjugacion": 3,
    "regla_detalle": "verbos en -bir",
    "def": "Tomar lo que te dan o te envían.",
    "frec": "alta", "curso": [5]
  },
  "vivir": {
    "modulos": ["b-v-1"],
    "excepcion": true,
    "mal": ["bibir"],
    "silabas": ["vi", "vir"], "tonica": 1, "tipo": "aguda", "terminacion": "-r",
    "clase": "verbo", "conjugacion": 3,
    "regla_detalle": "excepción de -bir",
    "frec": "alta", "curso": [5]
  }
}
```

Tamaño objetivo: 60-120 palabras por módulo ortográfico (≈ 1.500-2.000 en total). Usos: P1, P2, P4, L1, R3, A1, E3, y las pistas y explicaciones de todas.

### 5.2 `reglas.json` (ampliación del existente)

Se añaden a cada módulo: `ejemplos[]`, `contraejemplos[]`, `hipotesis[]` y la plantilla `explicacion`.

```json
"tildes-generales": {
  "nombre": "La sílaba tónica: agudas, llanas y esdrújulas",
  "saberes": ["LCL.3.D.6"], "criterios": ["5.1", "9.1", "9.2"],
  "ficha": { "...": "ya existe" },
  "ejemplos": ["sofá", "camión", "compás", "árbol", "lápiz", "música"],
  "contraejemplos": ["reloj", "papel", "mesa", "joven"],
  "hipotesis": [
    { "texto": "Las agudas llevan tilde si terminan en vocal, -n o -s.", "valor": "buena" },
    { "texto": "Todas las palabras agudas llevan tilde.", "valor": "amplia", "refuta": "reloj" },
    { "texto": "Solo llevan tilde las agudas que terminan en vocal.", "valor": "estrecha", "refuta": "camión" }
  ],
  "explicacion": {
    "con_tilde": "«{p}» es {tipo} y termina en {terminacion} → lleva tilde en «{silaba_tonica}».",
    "sin_tilde": "«{p}» es {tipo} y termina en {terminacion} → no lleva tilde."
  }
}
```

Módulos nuevos (sin forma errónea, con `tipo: "gramatica" | "lexico" | "comprension" | "produccion" | "literatura"`): `clases-palabras`, `sujeto-predicado`, `sintagmas`, `verbo-conjugacion`, `pasiva`, `modalidad`, `pronombres`, `conectores`, `familias-afijos`, `sinonimos-antonimos`, `homofonos`, `campos-semanticos`, `diccionario`, `origen-lexico`, `comprension-inferencias`, `comprension-oral`, `produccion-generos`, `titular-resumen`, `figurado`, `refranero`, `modalidad-andaluza`.

### 5.3 `frases.json` y `textos.json`

```json
// frases.json
[
  { "id": "f-0412", "texto": "El [camión] de la [panadería] llegó a la [plaza] al [anochecer].",
    "modulos": ["tildes-generales", "h-1"], "curso": [5], "palabras": 10,
    "relacion": null },
  { "id": "f-0413", "texto": "{vecina:la} [recibió] una [nota] sin [firma].",
    "modulos": ["b-v-1"], "curso": [5], "palabras": 7 },
  { "id": "f-0920", "par": ["El kiosco estaba cerrado", "volvimos a la agencia"],
    "relaciones": ["consecuencia", "tiempo"], "curso": [5, 6] }
]
```

```json
// textos.json
{
  "id": "t-0071", "genero": "parte", "titulo": "Parte de la noche del {dia}",
  "texto": "A las {hora}, {vecino:el} [avisó] de un ruido en la [floristería]. Cuando [llegamos], la [reja] estaba [abierta] y [había] [pétalos] por el suelo. Nadie [vio] salir a nadie.",
  "modulos": ["tildes-generales", "h-1", "b-v-1"],
  "claves": ["ruido", "floristería", "reja abierta"], "distractores": ["pétalos"],
  "idea_principal": "Alguien entró en la floristería de noche.",
  "marcas_extra": [ { "tipo": "concordancia", "de": "estaba", "mal": "estaban" } ],
  "curso": [5], "lineas": 4
}
```

Tamaño objetivo: 400 frases y 80 textos para empezar; el generador combina con variables y con la cola.

### 5.4 `verbos.json`

```json
{
  "paradigmas": {
    "1": { "presente": ["o", "as", "a", "amos", "áis", "an"],
           "imperfecto": ["aba", "abas", "aba", "ábamos", "abais", "aban"],
           "perfecto_simple": ["é", "aste", "ó", "amos", "asteis", "aron"],
           "futuro": ["aré", "arás", "ará", "aremos", "aréis", "arán"] }
  },
  "verbos": [
    { "inf": "cantar", "conj": 1, "regular": true, "participio": "cantado", "curso": [5] },
    { "inf": "tener", "conj": 2, "regular": false, "curso": [5, 6],
      "formas": { "perfecto_simple": ["tuve", "tuviste", "tuvo", "tuvimos", "tuvisteis", "tuvieron"] },
      "ortografia": "b-v-1", "nota": "Las formas con tuv- llevan v, como estuve y anduve." }
  ]
}
```

### 5.5 `oraciones.json`

```json
{
  "id": "o-0210",
  "tokens": [
    { "t": "Los", "clase": "determinante", "rasgos": "m. pl." },
    { "t": "vecinos", "clase": "sustantivo", "rasgos": "m. pl." },
    { "t": "del", "clase": "preposicion+determinante" },
    { "t": "barrio", "clase": "sustantivo", "rasgos": "m. sing." },
    { "t": "oyeron", "clase": "verbo", "rasgos": "3.ª pl. pret. perf. simple", "lema": "oír" },
    { "t": "un", "clase": "determinante" },
    { "t": "ruido", "clase": "sustantivo" },
    { "t": "anoche", "clase": "adverbio" }
  ],
  "sujeto": [0, 3], "predicado": [4, 7], "nucleos": { "sujeto": 1, "predicado": 4 },
  "sintagmas": [ { "de": 0, "a": 3, "tipo": "SN", "funcion": "sujeto" },
                 { "de": 2, "a": 3, "tipo": "SPrep", "funcion": "CN" },
                 { "de": 5, "a": 6, "tipo": "SN", "funcion": "CD" },
                 { "de": 7, "a": 7, "tipo": "SAdv", "funcion": "CC tiempo" } ],
  "modalidad": "enunciativa",
  "variantes_modalidad": { "interrogativa": "¿Oyeron los vecinos del barrio un ruido anoche?" },
  "transformaciones": {
    "pasiva": "Un ruido fue oído anoche por los vecinos del barrio.",
    "pronominal_cd": "Los vecinos del barrio lo oyeron anoche."
  },
  "curso": [5, 6]
}
```

### 5.6 `lexico.json`, `homofonos.json`, `afijos.json`

```json
// lexico.json
"banco": {
  "clase": "sustantivo", "genero": "m",
  "acepciones": [
    { "def": "Asiento largo para varias personas.", "ejemplo": "Se sentó en un banco de la plaza." },
    { "def": "Lugar donde se guarda el dinero.", "ejemplo": "Fue al banco a sacar dinero." },
    { "def": "Grupo grande de peces.", "ejemplo": "Un banco de sardinas pasó junto al barco." }
  ],
  "sinonimos": [], "antonimos": [], "campo": "mobiliario urbano", "hiperonimo": "asiento",
  "familia": ["banquero", "banquillo", "bancario"],
  "morfologia": { "raiz": "banc" }, "origen": "germánico", "curso": [5]
}
```

```json
// homofonos.json
{ "par": ["tubo", "tuvo"], "modulo": "homofonos", "regla_ortografica": "b-v-1",
  "defs": { "tubo": "Pieza hueca y alargada.", "tuvo": "Del verbo tener." },
  "trucos": { "tuvo": "Si puedes cambiarlo por «tenía», es del verbo tener: con v." },
  "frases": [ { "texto": "El fontanero cambió el ___ del lavabo.", "respuesta": "tubo" },
              { "texto": "{vecina:la} ___ que salir corriendo.", "respuesta": "tuvo" } ],
  "ilustracion": "tubo", "curso": [5, 6] }
```

```json
// afijos.json
{ "afijo": "des-", "tipo": "prefijo", "significado": "negación o inversión",
  "ejemplos": ["deshacer", "desorden", "descoser"], "nota_ortografica": "Conserva la h de la raíz: deshacer." }
```

### 5.7 `declaraciones.json` (comprensión generada)

```json
{
  "id": "d-0033", "escenario": "kiosco",
  "hechos": { "quien": "{vecino}", "donde": "kiosco", "cuando": "{hora}", "objeto": "{objeto}", "motivo": "buscaba el periódico" },
  "bocadillos": [
    { "texto": "Yo estaba en el kiosco a las {hora}, como todos los días.", "explicita": ["donde", "cuando"] },
    { "texto": "Siempre bajo a esa hora porque sin leer las noticias no desayuno.", "implica": ["motivo"], "vocabulario": { "expresion": "sin leer las noticias no desayuno", "sentido": "le gusta mucho leer el periódico por la mañana" } },
    { "texto": "Vi {objeto:el} en el suelo, pero no lo toqué.", "explicita": ["objeto"] }
  ],
  "contradicciones": [ { "bocadillo": 2, "cambiar": "cuando", "a": "{hora+2}" } ],
  "preguntas_extra": [],
  "curso": [5]
}
```

### 5.8 Otros bancos pequeños

| Banco | Esquema resumido | Ejemplo |
|---|---|---|
| `plantillas.json` | `{ vecinos: [{nombre, genero}], lugares[], objetos[{nombre, genero}], horas[], dias[] }` | `{ "nombre": "Inés", "genero": "f" }`, `"floristería"`, `{ "nombre": "pregón", "genero": "m" }` |
| `puntuacion.json` | `{ frase_sin, lecturas: [{puntuada, ilustracion, parafrasis}], regla }` | `"Vamos a comer niños"` → `"Vamos a comer, niños."` (ilustración `ninos-mesa`) / `"Vamos a comer niños."` (ilustración `ogro-comic`) |
| `dialogos.json` | `{ intervenciones: [{quien, texto, inciso?}] }` | `{ "quien": "Lola", "texto": "¿Has visto la nota?", "inciso": "preguntó Lola" }` |
| `conectores.json` | `{ conector, tipo, puntuacion, ejemplo }` | `{ "conector": "sin embargo", "tipo": "contraste", "puntuacion": "coma detrás" }` |
| `relatos.json` | `{ fragmentos[], conectores_marcados[], tipologia }` | 5 fragmentos de un relato breve con `[Después]` marcado |
| `generos.json` | `{ genero, modelo, requisitos: {min, max, obligatorio[]} }` | `"noticia"`: titular + quién + qué + dónde + cuándo, 40-80 palabras |
| `literatura.json` | `{ fragmento, autor, licencia, genero, recursos: [{verso, tipo, a, b}] }` | `"La luna es un queso de plata"` → metáfora (`a: "luna"`, `b: "queso"`) |
| `refranes.json` | `{ texto, mitad: índice de corte, variantes[], sentido, recursos[], andaluz: bool }` | `"A quien madruga, Dios le ayuda"` |
| `gentilicios.json`, `siglas.json`, `claves.json`, `pronunciacion.json` | listas simples | `{ "lugar": "Huelva", "gentilicio": "onubense" }` |

### 5.9 Estado del alumno (`localStorage`)

- `la-lupa-cola`: `[{ p, modulo, origen: "caso-01" | "P1", fallos, aciertos, intervalo, proximo (n.º de sesión), ultima }]`.
- `la-lupa-academia`: `{ sesiones, puntosHoy, fecha, modulos: { id: { nivel, rachas, aciertos, intentos, dominado, reglaFormulada } }, insignias: { sala: "bronce" | ... }, pendientesMaestro: [...] , archivadas: [...] }`.
- Registro de intentos para el cuaderno del maestro: mismo formato que los casos (`alumno, actividad, modulo, criterio, palabra, acierto, pistas, fecha`), con `contexto: "academia"` para que el maestro decida si cuenta en la nota o solo como entrenamiento.

### 5.10 Cómo se llenan los bancos

Los bancos los redacta la IA de texto por lotes (una issue por banco, como el arte) con una **plantilla de validación**: cada entrada tiene que pasar un script (`herramientas/validar_bancos.py`) que comprueba JSON válido, que cada palabra marcada existe en `palabras.json`, que `mal` difiere de la forma correcta solo en la grafía de la regla, que las sílabas concatenadas forman la palabra y que la tónica es coherente con el `tipo`. Pablo revisa muestras y los casos marcados como «dudosos» (*solo*, demostrativos, variantes de refranes). Sin esta validación, miles de propuestas se convierten en miles de errores.

## 6. Prioridad de implementación

Las cinco por las que empezaría, en orden:

| # | Actividad | Por qué | Coste |
|---|---|---|---|
| 1 | **A1 Fichas pendientes** (Archivo) | Es lo que convierte la Academia en algo distinto de un cuaderno de ejercicios: el repaso espaciado de lo que cada alumno falla, que la evidencia señala como lo más rentable. Sin ella, el resto son ejercicios sueltos | Medio: cola en `localStorage`, planificador de intervalos, una escena de fichero |
| 2 | **P1 La corrección del documento** (Pupitre) | Reutiliza casi íntegro el tipo de escena `caza` que ya existe; solo cambia que el texto y las faltas los genera un sembrador desde `textos.json` + `palabras.json`. Es la práctica principal de 9.2 y alimenta la cola | Bajo: generador + fondo cenital |
| 3 | **L1 El sismógrafo de sílabas** (Laboratorio) | Ataca el error más frecuente (tildes en agudas) con la cadena completa separar → tónica → clasificar → escribir, y evalúa 9.1 y 5.1 a la vez. Toda la temporada 1 de acentuación se apoya en él | Medio: tres interacciones nuevas (cortar, tocar, clasificar) y el escribir ya existente |
| 4 | **R1 Dictado por radio + P3 Dictado relámpago** (Centralita/Pupitre) | Son la misma actividad con dos entradas (voz o memoria): producción escrita con feedback inmediato, lo que da Silva et al. encontraron eficaz. El modo relámpago garantiza que funcione aunque los equipos del centro no tengan voz `es-ES` | Bajo: `speechSynthesis` + comparación palabra a palabra |
| 5 | **T2 La máquina del tiempo verbal** (Terminal) | Abre la Academia a la gramática (D.5, el saber con más peso en 6.º), con generación combinatoria pura (verbo × tiempo × persona) y un puente natural con la ortografía de *-aba*, *tuve*, *dije* | Medio: `verbos.json` con paradigmas y la estética de terminal |

Después, en este orden: Z1 Descubre la regla (ya existe parcialmente como escena `descubre`), I1 El interrogatorio (comprensión generada; es la que más «miles» da con menos texto manual), E3 Pruebas de imprenta (intercalado), L2 Homófonos, Z2 Análisis, E1 Redacta el informe (necesita la bandeja del maestro).

**Arte mínimo para lanzar** (todo sin texto, estilo de `arte.json`):

- **1 fondo del Patio** (hub) de la antigua escuela, con las ocho entradas reconocibles aunque al principio solo cinco estén abiertas (las otras con una cinta de «en obras»: se dibuja en CSS).
- **5 fondos de sala**: Pupitre cenital, Archivo, Laboratorio, Centralita y Terminal.
- **0 personajes nuevos**: Lola, Mateo y Robles con las expresiones que ya existen. Don Anselmo se encarga cuando se abran Pupitre, Pizarra e Imprenta, si Pablo lo aprueba.
- **3 objetos**: el carné de la Academia (una cartulina con hueco para los sellos), la ficha de cartulina del Archivo y el pase de entrenamiento. El resto de objetos de interfaz (pinzas, sismógrafo, cinta de télex, teclas) se hacen en CSS/SVG.
- Para Z3 harán falta más adelante **parejas de ilustraciones** de las frases con doble lectura (6-8 pares para empezar).

Total: 6 fondos y 3 objetos, una sola issue de arte.

## 7. Riesgos y decisiones abiertas para el maestro

### Riesgos

1. **Exposición a formas incorrectas.** P1 y E3 muestran faltas (pocas y controladas, como ya hacen los casos); P4, I4 y I5 muestran transformaciones declaradas (sin tildes, sin mayúsculas, notación oral). Mitigación: la última imagen es siempre la correcta, el alumno reescribe, y `mal` solo vive en `palabras.json`. I5 se deja **desactivado por defecto**.
2. **Síntesis de voz en los equipos del centro.** No está garantizada la voz `es-ES` (Chromebooks antiguos, tablets sin voces descargadas). Mitigación: todo lo oral tiene alternativa visual (relámpago, télex que se borra). Conviene probar en los equipos reales antes de prometer la Centralita.
3. **Producción libre no se corrige sola.** E1, E4 y E5 generan textos que necesitan la mirada del maestro. Mitigación: «bandeja del maestro» en la zona del maestro, con rúbrica rápida y filtro por fecha; la Academia solo automatiza lo mecánico.
4. **Bancos grandes y su calidad.** Miles de propuestas requieren cientos de entradas correctas, con sílabas y tildes bien puestas, variantes de refranes, sinónimos discutibles. Mitigación: el validador de la sección 5.10 y revisión por muestreo. Las dudas normativas (*solo*, demostrativos, *guion*) se marcan `dudoso: true` y no se usan como faltas.
5. **Datos solo en el dispositivo.** La cola de repaso vive en `localStorage`: si el alumno cambia de tablet, la pierde. Es el mismo problema que ya tienen los casos; la Academia lo hace más grave porque la cola es su razón de ser. Mitigación provisional: exportar/importar la cola con un código; definitiva: la sincronización con el backend que ya está planificada.
6. **Repetición y aburrimiento.** La generación da variedad de contenido, pero no de sorpresa. Mitigación: el planificador alterna salas, las insignias y el carné dan metas, y las «sorpresas» narrativas (una nota del Simulador, una visita de Robles) se reparten por número de sesión, como los ganchos de la temporada.
7. **Grinding de puntos.** Tope diario de puntos de entrenamiento y rangos que dependen sobre todo de los casos y del sello de la libreta.
8. **Tiempo de clase.** Un turno de 10 minutos es lo que cabe tras un caso o como rincón de Lengua; no se diseña para sesiones de 45 minutos seguidos en la Academia.

### Decisiones para Pablo

1. **Acceso**: ¿Academia solo tras cada caso (`tras-caso`) o siempre abierta desde el tablón (`libre`)? Propuesta: libre en clase, con el Turno de hoy como guía.
2. **¿Cuenta para la nota?** Propuesta: los intentos de la Academia se registran con `contexto: "academia"` y aparecen en el cuaderno **separados** de los casos; el maestro decide si los incorpora a 5.1/9.2 o los usa solo como seguimiento. La «prueba de ascenso» mensual sí podría contar.
3. **Don Anselmo**: ¿personaje nuevo (y su posible lazo con Bruno) o repartimos las salas entre los tres de siempre?
4. **I5 El testigo seseante**: ¿se activa en 5.º, en 6.º o se deja fuera? Y cómo lo nombramos para que quede claro que no juzga el habla.
5. **Nombres de insignias y del carné**; si los puntos de la Academia alimentan los rangos de los casos (propuesta: sí, con tope).
6. **Qué salas abrir primero**: la propuesta es Archivo, Pupitre, Laboratorio, Centralita y Terminal; la Imprenta (producción y literatura) e Interrogatorios (comprensión) en una segunda tanda, y la Pizarra cuando se programe la gramática.
7. **Libreta en la Academia**: ¿página de entrenamiento con sello semanal (propuesta) o sin libreta en la Academia para no cargar al alumno?
8. **Programación**: ¿los módulos de gramática y léxico siguen el libro de texto del centro (habría que replicar su orden en `programacion.json`) o el mapa de la sección 6 del documento de currículo?
9. **Uso en casa**: ¿se permite entrenar fuera del aula (modo libreta digital) o la Academia es solo de clase?
