# Referentes y mecánicas para un juego de detectives de Lengua (3.er ciclo de Primaria)

> Investigación hecha el 3 de noviembre de 2026. El proyecto «Sherlock Ort» se estudia en otro documento y aquí no se analiza.
> Convención de este texto: lo que dicen las fuentes va citado. Lo marcado como **Propuesta** es una inferencia de diseño mía a partir de esas fuentes, no un dato.

## Resumen

1. **El error es la pista, pero la corrección tiene que escribirla el alumno.** Primero detecta el error, luego escribe la forma correcta de memoria y recibe feedback correctivo inmediato. Leer palabras mal escritas puede empeorar la ortografía de esas mismas palabras (Jacoby y Hollingshead, 1990). La recuperación de memoria solo ganó a la copia cuando había feedback inmediato (da Silva et al., 2023). Por eso conviene poner pocos errores por texto, enseñar siempre la forma correcta enseguida y no usar opciones múltiples entre varias faltas.
2. **La ortografía tiene que ser la mecánica central, no un peaje.** Los juegos con el contenido integrado en la mecánica enseñan más y enganchan más (Habgood y Ainsworth, 2011). En GAUBI, los juegos de «investigación» y «ficción» se asociaron a la mejora y los de tipo arcade no. Mecánicas que encajan: careos al estilo *Ace Attorney* (señalar la frase con el error y presentar la regla como prueba), tablero de deducción con verificación por bloques, pistas progresivas y un cierre (*debriefing*) guiado por el docente.
3. **Contenido priorizado por la evidencia:** tildes (sobre todo en agudas), b/v, h, c/s/z, verbos frecuentes (*haber*, *hacer*) y, en Andalucía, la influencia del seseo y el ceceo. Los casos deben mezclar reglas (práctica intercalada), repetirse espaciados y volver a sacar las palabras falladas.
4. **Tecnología:** para empezar, JS vanilla con DOM/CSS/SVG (escenas con *hotspots*, eventos de puntero, `localStorage`), que encaja con la regla del repo de no usar build. Los diálogos ramificados pueden ir en Ink con **inkjs** (≈129 KB minificado, ≈31 KB gzip), copiado al repo. **Phaser** solo merece la pena si más adelante hacen falta sprites animados o cámara: pesa ≈1,2-1,4 MB minificado, y en Phaser 4 el modo Canvas está obsoleto, lo que importa en equipos sin buena WebGL. Godot, AGS y Narrat no encajan con la idea de una web estática ligera sin build.

---

## 1. Juegos y propuestas educativas de detectives, misterio o escape room para Lengua

### 1.1 Propuestas en español

| Propuesta | Nivel | Mecánica | Qué se sabe de su efecto |
|---|---|---|---|
| **GAUBI** (app gamificada de ortografía; UNED, URJC, US y UPO) | 4.º y 5.º de Primaria, 114 alumnos de 6 grupos en 3 centros urbanos y rurales | Tres tipos de juego: *arcade*, «investigación» (explorar y aprender indagando) y «ficción» (escenarios narrativos). 3 sesiones por semana durante 3 semanas: 20 min en clase y 15 en casa | Pretest-postest con un solo grupo: la media pasa de 66,50 a 68,51, con *t* significativa y *d* = 0,80 (el tamaño del efecto se calcula sobre la diferencia emparejada; la subida absoluta es de unos 2 puntos). La frecuencia de juego se correlaciona con el postest en «investigación» (r = 0,19) y «ficción» (r = 0,21), pero no en *arcade* (r = 0,009). [Vázquez-Cano et al., 2024] |
| **«Súper detectives» con escape room final** (CEIP San Gabriel, Zuera) | 4.º de Primaria | Paisaje de aprendizaje «Súper detectives de palabras y textos» (diptongos, determinantes, figuras poéticas). Al final, un escape room para recuperar un cuadro robado, que arranca con una noticia de periódico. Equipos cooperativos y puntos en ClassDojo | Solo la valoración de la docente: más cooperación, debate y toma de decisiones. No hay datos de aprendizaje. [Educación 3.0, 2017] |
| **«Detectives de la Ortografía»** (secuencia publicada en EDTK) | Primaria | Clasificar tarjetas de palabras con y sin error y explicar la regla | Es material docente, sin evaluación. [EDTK] |
| **«Escape room ortográfico»** y otros materiales comerciales | Primaria | Narrativa (castillo, tesoro) con retos que abren candados | Es material de venta y no se ha evaluado. [Gumroad] |

**Estudios con medición en el aula.** Montaner Bueno y Cánovas Herrero (2025) estudiaron a 117 alumnos de 6.º de tres centros de Murcia con 59 ítems de b/v: hubo una media de 5,71 errores (DT 5,28) y diferencias significativas entre centros, con más errores en los rurales. Todos los docentes usan el dictado. La corrección se hace entre iguales, sobre todo por parejas. Los docentes creen que conviene trabajar la ortografía con juegos, pero los libros de texto (Santillana, Anaya y SM) siguen dominados por ejercicios de repetición. El estudio también recoge el método de memoria visual de Gabarró: ver, pronunciar y escribir la palabra. [Montaner y Cánovas, 2025]

### 1.2 Propuestas en otros idiomas

- **SPaG mysteries (Reino Unido y EE. UU.):** packs para el aula en los que cada respuesta de gramática u ortografía es una pista que descarta sospechosos hasta dar con el culpable. Llevan una hoja de registro de pistas, versiones de 3 y 5 pistas que llegan a la misma solución (para diferenciar sin que se note), certificados y la «lupa» del docente que muestra la regla al grupo que se atasca. [Creating Lifetime Learners; TES; Twinkl] Son productos comerciales sin evaluación independiente.
- **Jo Wilder and the Capitol Case** (Field Day Lab, Wisconsin): juego *point-and-click* de indagación histórica para 3.º-5.º, en el que hay que localizar y analizar artefactos. Un estudio con 15 docentes describió cinco usos didácticos distintos: el docente decide cómo integrarlo. [Wardrip et al., 2022]
- **Ficción interactiva en Primaria:** el caso «The Haunted School on Horror Hill» (4.º-5.º) señala que crear el juego mejoró habilidades literarias y sociales, y que el papel del docente es crucial. [IGI Global]

### 1.3 Qué dice la investigación sobre los escape rooms educativos

- **Revisión de Veldkamp et al. (2020), con 39 estudios:** solo 3 midieron el aprendizaje con pretest y postest. Hay una **discrepancia entre el aprendizaje percibido y el real**. Recomiendan diseñar los puzles para que obliguen a discutir el contenido y hacer un *debriefing* sobre proceso y contenido. Las reglas de pistas más usadas son tres: un número limitado de pistas, las primeras gratis y las siguientes con penalización de tiempo, o pistas que se ganan con una minipregunta. Los candados dan feedback inmediato y sin ambigüedad, pero la presión del tiempo resta feedback del docente. El *debriefing* aparece en 25 de los 39 estudios. [Veldkamp, 2022, cap. 2]
- **Revisión de Makri et al. (2021), con 45 escape rooms digitales:** solo 4 usaron pretest y postest. [Makri et al., 2021]
- **Conclusión práctica:** la motivación está bien documentada; el aprendizaje de contenido mucho menos. **Propuesta:** el juego debe registrar sus propios datos de acierto por regla y por palabra, y cada caso debe acabar con un cierre explícito que diga qué regla se ha usado y por qué.

---

## 2. Mecánicas de aventura gráfica e investigación aplicables al aula

Los juegos se citan solo como ejemplo de mecánica.

| Mecánica | Ejemplo de referencia | Cómo funciona allí | Aplicación a ortografía y Lengua (**Propuesta**) |
|---|---|---|---|
| **Careo o contradicción** | *Ace Attorney* | Se elige la frase exacta del testimonio que choca con una prueba del expediente y se presenta esa prueba. Tener que elegir frase y prueba a la vez evita que la respuesta sea obvia. [Medium, MDA; legal ludology] | El testigo «declara» un texto. El alumno señala la palabra o frase con el error y presenta la **regla** (una carta del inventario de reglas) que lo demuestra. Así se trabaja la metacognición: no basta con notar que algo suena mal. |
| **Tablero de deducción con huecos** | *The Case of the Golden Idol* | Se exploran escenas congeladas haciendo clic y se recogen palabras clave (nombres, verbos, objetos). Luego se rellena un relato con huecos. El juego confirma un bloque cuando está entero bien y avisa si el número de errores no es el esperado. [Wikipedia] | Para comprensión lectora: rellenar quién, qué, dónde y por qué con palabras halladas en los textos del caso. Para ortografía: el «informe del caso» se completa **escribiendo** las palabras corregidas. |
| **Verificación por bloques** | *Return of the Obra Dinn* | Las respuestas se confirman de tres en tres: dificulta el tanteo, pero sigue permitiendo descartar a ciegas. [Film Stories, 2021] | Validar 3 correcciones a la vez reduce el ensayo-error. Hay que combinarlo con feedback inmediato por palabra, que es lo que pide la evidencia del punto 3. Equilibrio sugerido: feedback inmediato en práctica y por bloques en el «caso final». |
| **Testigos, viaje y orden de arresto** | *Where in the World Is Carmen Sandiego?* | Se interroga a testigos en cada lugar, que dan pistas sobre el sospechoso y su destino. Los rasgos se meten en una base de datos que reduce sospechosos hasta poder emitir la orden. Hay un almanaque de consulta, un reloj y un mapa de ciudades. [Wikipedia] | Mapa del barrio o del colegio como selector de escenas. Un «fichero de sospechosos» que se filtra con rasgos lingüísticos (por ejemplo, «siempre olvida la tilde en las agudas»). El **diccionario** o **libro de reglas** hace el papel del almanaque: consultar está permitido y cuesta tiempo. |
| **Inventario** | Aventuras clásicas | Objetos que se recogen y combinan. | **Inventario de reglas** (cartas: «agudas en vocal, -n, -s llevan tilde», «mb siempre con b»…) que se desbloquean al resolver casos y se usan como prueba en los careos. |
| **Diálogo ramificado** | Aventuras con árboles de diálogo; Ink como herramienta | Opciones que cambian la información obtenida. | Interrogatorios donde preguntar bien (con el vocabulario o el tipo de texto adecuado) da más pistas. Sirve para fases posteriores: tipos de texto, registro, conectores. |
| **Pistas progresivas** | InvisiClues, Universal Hint System | De 3 a 5 niveles, de la pista vaga a la concreta, y el jugador decide cuánta ayuda quiere. Se recomienda detectar el atasco por tiempo o por conducta. [Wikipedia UHS; Adventure Game Designer Handbook] | Nivel 1: «Fíjate en el segundo párrafo». Nivel 2: «Hay una palabra aguda». Nivel 3: la regla. Nivel 4: la palabra marcada. Encaja con las reglas de pistas de los escape rooms (las primeras gratis, luego con coste). |
| **Diseño sin callejones sin salida** | Ron Gilbert, *Why Adventure Games Suck* (1989) | Objetivo claro, subobjetivos evidentes, sin muertes ni bloqueos, recompensa incremental, puzles que hacen avanzar la historia y sin puzles arbitrarios. [Grumpy Gamer] | Imprescindible con 10-12 años: no se puede perder un objeto necesario ni quedarse sin salida. Cada error corregido desbloquea algo visible. |
| **Diagrama de dependencias de puzles** | Ron Gilbert, 2014 | Grafo de qué puzle depende de cuál. Se diseña hacia atrás desde la meta: un puzle abre 2 o 3 en paralelo que luego convergen, y cada acto acaba en un cuello de botella. [Grumpy Gamer] | Herramienta de diseño para que cada caso tenga ramas paralelas (varios alumnos o equipos avanzan a la vez) y un cierre común que coincide con el *debriefing*. |

Notas para el aula, a partir de Veldkamp (2022) y el tercer punto:
- Con varios equipos jugando a la vez, los escape rooms educativos suelen usar estructuras más secuenciales porque facilitan la guía del docente (Cain, 2017, citado en Veldkamp). **Propuesta:** estructura de «actos» con ramas cortas en paralelo y cuellos de botella comunes.
- El cronómetro estricto reduce el feedback y Gilbert lo desaconseja («Real time is bad drama»). **Propuesta:** sin reloj en la práctica; como mucho, un «tiempo de caso» para el reto final.

---

## 3. Evidencia didáctica sobre la ortografía y el juego

### 3.1 Errores frecuentes entre los 10 y los 12 años

- **Tildes**, sobre todo en **palabras agudas**: es el problema más recurrente en 3.º, 5.º y 7.º básico, seguido del uso erróneo de **b/v, s/c/z y h**. Los errores se concentran en el 17 % de las palabras y aparecen mucho en verbos frecuentes como *haber*, *hacer* y *estar*. Entre 5.º y 7.º no hubo diferencias significativas, es decir, no mejoran solos. [Sotomayor et al., 2013, corpus chileno de 250 textos]
- **b/v en 6.º (Murcia):** media de 5,71 errores en 59 ítems, con mucha dispersión (0 a 27) y diferencias entre centros. [Montaner y Cánovas, 2025]
- **Andalucía:** los niños que empiezan a escribir se guían por la pronunciación y cometen más errores, que bajan al tomar conciencia de la diferencia entre su habla y la norma escrita. Es un TFG de la Universidad de Sevilla, así que vale como indicio. [Núñez Román y Espínola Guzmán, 2018] González Montero (1998) propone un instrumento de diagnóstico ortográfico para el contexto andaluz. **Propuesta:** dar prioridad a s/c/z (seseo y ceceo) y a los finales en -s y -d, y que el juego permita configurar un diagnóstico inicial por clase.

### 3.2 Detectar el error frente a dictado o reglas

- **Riesgo de exponer errores:** leer palabras bien o mal escritas cambia la precisión posterior al escribir **esas mismas palabras**, y escribirlas no añade más efecto que leerlas. [Jacoby y Hollingshead, 1990] Brown (1988, *Journal of Educational Psychology*) apunta en la misma dirección; no he podido leer el texto completo. Un trabajo sobre aprendizaje ortográfico incidental indica que el efecto es mayor en palabras poco consolidadas. **Implicación de diseño:**
  - pocos errores por texto y en palabras que ya se han trabajado;
  - mostrar siempre la forma correcta justo después;
  - **no** ofrecer opciones múltiples entre formas erróneas («¿aber, haver o haber?»), porque multiplican la exposición a faltas;
  - que la última imagen de la palabra en pantalla sea la correcta.
- **Detectar no es producir:** en niños de 7 años, buenos y malos lectores identificaron la grafía correcta en una prueba de ortografía, pero los malos lectores cometieron muchos más errores al revisar un texto (Supramaniam, 1983). En lectores iniciales neerlandeses, los errores que «suenan bien» (pseudohomófonos, como b/v o h en español) se detectan peor que otros errores, y la diferencia se reduce con el curso (Van Assche et al., 2013). Solo he visto resúmenes y registros de estos dos trabajos. **Implicación:** el bucle del juego tiene que ser *detectar → escribir la forma correcta → feedback*, y de vez en cuando *producir* (por ejemplo, redactar el informe del caso).
- **Recuperación frente a copia o técnicas decorativas:** en 1.º y 2.º, escribir de memoria superó a la *rainbow writing* (copiar en colores) en tres experimentos, también a las 5 semanas (en un experimento, +34 % frente a +9 %). [Jones et al., 2016] En 5.º (Brasil), escribir de memoria superó a copiar a los 4 días **solo cuando había feedback correctivo inmediato**. [da Silva, Ekuni y Jaeger, 2023]
- **La instrucción formal funciona:** el metaanálisis de Graham y Santangelo (2014), con 53 estudios y 6.037 alumnos, muestra que la enseñanza explícita de la ortografía mejora la ortografía, el efecto se mantiene y se transfiere a la escritura. El juego debe enseñar la regla, no solo practicarla.
- **Dictado:** sigue siendo la técnica universal en 6.º según los docentes entrevistados. Los autores critican que se use más para contar errores que para aprender. [Montaner y Cánovas, 2025] **Propuesta:** el juego complementa el dictado y no lo sustituye. Un «dictado del testigo» con audio (Web Speech o grabaciones) puede ser una mecánica más.

### 3.3 Feedback inmediato

- Recuperación con feedback correctivo inmediato: es la condición en la que apareció la ventaja en 5.º. [da Silva et al., 2023]
- *Spell2win* (4.º, inglés como lengua extranjera): con feedback inmediato el dictado salió mejor que con feedback demorado. Solo he visto el resumen. [EAEC, 2022]
- Los candados de un escape room dan feedback inmediato y sin ambigüedad. Es uno de sus puntos fuertes según Nicholson, citado en Veldkamp. [Veldkamp, 2022]
- **Propuesta de feedback:** marcar acierto o error por palabra al momento, enseñar la forma correcta y la **regla** (carta de inventario), y guardar la palabra fallada para que vuelva a salir más tarde.

### 3.4 Repetición espaciada e intercalado

- **Intercalar reglas:** en un experimento prerregistrado con 147 alumnos de 3.º (Alemania), practicar mezclando reglas dio menos errores que practicarlas en bloques, tanto justo después como a las 8 semanas. La guía con indicaciones que destacan las diferencias entre reglas ayudó con palabras nuevas. Su efecto dependió del conocimiento previo: con poco conocimiento ayudó en bloque; con mucho, al intercalar. [Klimovich y Richter, 2025]
- **Espaciado:** en vocabulario con niños, la práctica espaciada superó a la concentrada (30 niños). [SAGE Open, 2016] La evidencia específica de ortografía es más escasa; un estudio de 2024 con preescolares con TDL encontró que el espaciado expandido ayuda al principio y luego se iguala con el espaciado uniforme. [Leonard et al., 2024]
- **Propuesta:**
  - casos introductorios por regla (bloque y guía) y después casos «mixtos» que intercalan reglas;
  - una cola de palabras falladas por alumno que reaparecen en casos posteriores con intervalos crecientes (por ejemplo 1, 3 y 7 días o sesiones), guardada en `localStorage` con el prefijo del juego.

### 3.5 Narrativa e integración

- **Integración intrínseca:** en *Zombie Division* (matemáticas, 7-11 años), la versión con el contenido dentro de la mecánica principal enseñó más con el mismo tiempo, y en tiempo libre se jugó 7 veces más. [Habgood y Ainsworth, 2011]
- **GAUBI:** los juegos narrativos y de investigación se asociaron con la mejora ortográfica y el *arcade* no. Son correlaciones bajas, en torno a 0,2. [Vázquez-Cano et al., 2024]
- **Conclusión:** la investigación detectivesca no puede ser un adorno entre ejercicios. Corregir el error tiene que ser el acto que resuelve el caso.

---

## 4. Herramientas técnicas para una aventura 2D en web estática sin build

Contexto del repo: HTML + JS vanilla + CSS, sin npm y servido en GitHub Pages. Los tamaños los he medido descargando los ficheros de jsDelivr el 3 de noviembre de 2026; las versiones y fechas salen del registro de npm.

| Opción | Versión y peso | Pros | Contras |
|---|---|---|---|
| **JS vanilla + DOM/CSS/SVG** | 0 KB de librerías | Encaja con la convención del repo. Las escenas son imágenes con *hotspots* (`<button>` posicionados o SVG). Los eventos de puntero unifican ratón y táctil. Texto real en el DOM: accesible, se puede ampliar y leer con lector de pantalla, y es ideal para un juego de **leer y escribir**. Ligerísimo en PCs viejos. Se guarda en `localStorage`. | Las animaciones de sprites, la cámara y el pathfinding hay que programarlos a mano. Hay que estructurar bien los datos (casos en JSON o JS) para que no se desordene. |
| **Ink + inkjs** (diálogos y narrativa) | inkjs 2.4.0 (feb. 2026, MIT): `ink.min.js` ≈129 KB, ≈31 KB gzip. `ink-full.js` (incluye compilador) ≈249 KB, ≈61 KB gzip | Lenguaje de guion pensado para diálogo ramificado. Sin dependencias y funciona en todos los navegadores. Guarda y carga el estado con `state.toJson()` y `LoadJson()`, observa variables (`ObserveVariable`), tiene funciones externas (`EXTERNAL` / `BindExternalFunction`) y etiquetas `#` para disparar efectos (cambiar retrato o abrir el inventario). Se usa con una etiqueta `<script>`. | Hay que compilar el `.ink` a JSON con Inky (editor de escritorio) o inklecate, o usar la versión «full» que compila en el navegador. Cargar el JSON con `fetch` necesita servidor (en Pages no hay problema; en local, `node .claude/serve.js`). Es otra sintaxis que aprender. |
| **Phaser** | 3.90.0 (may. 2025): ≈1,20 MB minificado, ≈315 KB gzip. 4.2.1 (jul. 2026): ≈1,38 MB, ≈352 KB gzip. MIT | Motor 2D maduro: escenas, sprites, animaciones, tweens, entrada táctil, audio y cámara. Se usa desde CDN con `<script>`, sin bundler. | Pesa unas 10 veces más que inkjs. En **Phaser 4 el renderizador Canvas está obsoleto** y casi todo lo nuevo es solo WebGL, lo que importa en PCs de colegio con gráficos o drivers pobres. El texto queda dentro del canvas (peor accesibilidad y selección de texto). Para una aventura con mucho texto, es más motor del que hace falta. |
| **PixiJS** | 8.22.0 (oct. 2026): ≈841 KB, ≈237 KB gzip. MIT | Renderizador 2D rápido, útil si solo se quieren efectos o animación sobre las escenas. | No es un motor de juego: escenas, diálogos y guardado van por tu cuenta. Tiene los mismos problemas de texto en canvas. |
| **KAPLAY** | 3001.0.19 (jun. 2025): ≈189 KB, ≈70 KB gzip. MIT | Ligero y con API sencilla. Se usa con `<script>` desde CDN. | Orientado a arcade y plataformas; no aporta nada específico de aventura gráfica. |
| **Twine (SugarCube o Harlowe)** | Exporta un único HTML | Muy rápido de prototipar, incluso por un docente. SugarCube trae sistema de guardado. | Las imágenes enlazadas dan problemas si no se gestionan rutas; *point-and-click* limitado; hay elementos poco accesibles con lector de pantalla; difícil de integrar con el resto del repo. |
| **Monogatari** (novela visual) | MIT | Funciona abriendo el HTML, sin build. Sintaxis parecida a Ren'Py. PWA y modo offline. | Es novela visual: no trae escenas *point-and-click* con objetos. |
| **Narrat** | MIT | Trae inventario, misiones, *viewport* con sprites clicables y salida web. | **Requiere Node 22 y pnpm** (`pnpm create narrat@latest`), lo que choca con la regla de no usar build. |
| **Godot 4.3+** | Editor externo | Motor completo. Desde la 4.3 hay exportación web de un solo hilo que no necesita las cabeceras COOP/COEP, así que funciona en GitHub Pages. | El audio puede chisporrotear con FPS bajos. El proyecto pasa a ser binario y externo al flujo del repo. Mucho más pesado de cargar que JS vanilla (no lo he medido). |
| **Adventure Game Studio (AGS 3.6)** | Editor para Windows | Pensado justo para aventuras *point-and-click*; tiene exportación web desde el editor. | El motor web es más lento que el nativo y en móvil solo va el clic izquierdo, según la comunidad. Los juegos grandes cargan muy despacio. Es un flujo de trabajo ajeno a HTML/JS. |

**Recomendación técnica (Propuesta):**
1. **Fase 1 (juego de casos):** vanilla. Cada caso es un objeto de datos (texto, errores con su forma correcta y regla, pistas por niveles), y un motor pequeño hace tres cosas: pinta el texto como palabras clicables, pide la corrección escrita y da el feedback. Además guarda la cola de repaso y las métricas por regla en `localStorage`.
2. **Fase 2 (aventura):** añadir escenas como imagen + SVG de *hotspots* y un inventario en el DOM. Los interrogatorios, en **Ink + inkjs**, copiando `ink.min.js` a `shared/` o al juego en vez de depender del CDN. Así no hay dependencia externa y se evitan bloqueos de la red del colegio. Esto último es una inferencia mía, no lo he verificado.
3. **Phaser solo si** se necesitan personajes animados que caminan, cámara o *parallax*. En ese caso, probar antes en los equipos reales del centro (WebGL disponible y FPS).
4. Diseño para tablets y PCs modestos: imágenes WebP de tamaño moderado, *hotspots* grandes (dedos de 10-12 años), sin depender del *hover* y con texto ampliable.

---

## Fuentes

**Propuestas educativas y escape rooms**
- [Vázquez-Cano, Bernal-Bravo, Ballesteros-Regaña y López-Meneses (2024). *Exploring the role of interactive games in improving Spanish spelling skills: a mobile app study* (GAUBI). EDMETIC, 14(1)](https://journals.uco.es/edmetic/article/download/17374/15799?inline=1)
- [Ficha de GAUBI en el portal de la UPO](https://investiga.upo.es/documentos/67acf70e0e686026b29c67fa)
- [Montaner Bueno y Cánovas Herrero (2025). *Estudio de los métodos y sus repercusiones académicas empleados en la enseñanza de la ortografía en el tercer ciclo de la Educación Primaria*. Didáctica. Lengua y Literatura, 37](https://revistas.ucm.es/index.php/DIDA/article/download/94083/4564456572594/4564456745770)
- [Educación 3.0 (2017). *Un escape room como prueba final de un aprendizaje basado en proyectos* (Zuera, 4.º)](https://www.educaciontrespuntocero.com/experiencias/scape-room-aprendizaje-basado-proyectos/)
- [EDTK: actividad «Detectives de la Ortografía»](https://edtk.co/p/6a03da3c2b225a55e30f2b02/pdf)
- [Gumroad: «Escape room ORTOGRÁFICO» (comercial)](https://pedagogiaild.gumroad.com/l/hhkxy)
- [Creating Lifetime Learners: guía de *grammar mysteries* (comercial)](https://creatinglifetimelearners.com/grammar-mysteries-complete-guide/)
- [TES: *Spelling and punctuation practice game* (detective)](https://www.tes.com/teaching-resource/spelling-and-punctuation-practice-game-12729099)
- [Twinkl: *The Great Word Mystery* (SPaG, Year 4)](https://www.twinkl.com/resource/year-4-the-great-word-mystery-spag-problem-solving-mystery-game-t-e-1695634809)
- [Wardrip, Gagnon, Mathews y Scianna (2022). *Jo Wilder and the Capitol Case: a taxonomy of uses…* arXiv](https://arxiv.org/abs/2210.09433)
- [*The Haunted School on Horror Hill: a case study of interactive fiction in an elementary classroom* (IGI Global)](https://www.igi-global.com/chapter/haunted-school-horror-hill/49457)
- [Veldkamp (2022). Tesis *No Escape!*, cap. 2: revisión sistemática «Escape education» (Veldkamp et al., 2020, *Educational Research Review*)](https://www.fisme.science.uu.nl/publicaties/literatuur/2022_thesis_veldkamp.pdf)
- [Makri, Vlachopoulos y Martina (2021). *Digital Escape Rooms as Innovative Pedagogical Tools in Education: A Systematic Literature Review*. Sustainability, 13(8)](https://ideas.repec.org/a/gam/jsusta/v13y2021i8p4587-d539815.html)

**Mecánicas de juego**
- [Ron Gilbert (1989). *Why Adventure Games Suck And What We Can Do About It*](https://grumpygamer.com/why_adventure_games_suck/)
- [Ron Gilbert (2014). *Puzzle Dependency Charts*](https://grumpygamer.com/puzzle_dependency_charts/)
- [Adventure Game Designer Handbook (FAQ, sistemas de pistas)](https://brycecovert.github.io/adventure-game-designer-handbook/docs/faq.html)
- [Wikipedia: Universal Hint System](https://en.wikipedia.org/wiki/Universal_Hint_System)
- [MDA and Fun of the Ace Attorney series (Medium)](https://medium.com/game-design-fundamentals/mda-and-fun-of-the-ace-attorney-series-original-trilogy-a18dd45dcd2)
- [*Towards a Legal Ludology: Language Games* (capítulo, USC)](https://research.usc.edu.au/esploro/outputs/bookChapter/Towards-a-Legal-Ludology-Language-Games/99749698402621)
- [Wikipedia: *The Case of the Golden Idol*](https://en.wikipedia.org/wiki/The_Case_of_the_Golden_Idol)
- [Antony de Fault (2021). *Exploring Return of the Obra Dinn's rule of three*. Film Stories](https://filmstories.co.uk/?p=83249)
- [Wikipedia: *Where in the World Is Carmen Sandiego?* (1985)](https://en.wikipedia.org/wiki/Where_in_the_World_Is_Carmen_Sandiego%3F_(1985_video_game))

**Didáctica de la ortografía**
- [Sotomayor, Molina, Bedwell y Hernández (2013). *Caracterización de problemas ortográficos recurrentes en alumnos de escuelas municipales chilenas de 3.º, 5.º y 7.º básico*. Signos, 46(81)](https://repositorio.uchile.cl/handle/2250/123068)
- [Núñez Román y Espínola Guzmán (2018). *¿Cómo influye el andaluz en el aprendizaje de la ortografía de los alumnos andaluces de primaria?* TFG, Universidad de Sevilla (registro idUS)](https://idus.us.es/signposting/describedby/d2c905e4-b5de-4e6d-bb61-3a6961bbc87c)
- [González Montero. *Diagnosis ortográfica en contexto andaluz*. Escuela Abierta, 1](https://investiga.upo.es/documentos/5eb288e029995203e240da54)
- [Jacoby y Hollingshead (1990). *Reading student essays may be hazardous to your spelling*. Canadian Journal of Psychology, 44 (resumen en Scilit)](https://scilit.com/publications/21f5623daba18b197942be53625ba192)
- [Referencia a Brown (1988), *Encountering misspellings and spelling performance: Why wrong isn't right* (lista de referencias, Springer)](https://rd.springer.com/chapter/10.1007/978-94-017-3054-9_9)
- [Supramaniam (1983) y otros: *Proofreading errors in good and poor readers* (registro)](https://bvbvf1.bib-bvb.de/vufind/PrimoRecord/cdi_proquest_miscellaneous_80630632)
- [Van Assche, Duyck y Hartsuiker (2013). Detección de errores con pseudohomófonos en lectores iniciales (PLoS ONE, DOAJ)](https://doaj.org/article/fd9903beebf04886a04709dae491df9a)
- [Trabajo sobre aprendizaje ortográfico incidental que discute el efecto de leer faltas según lo consolidada que esté la palabra (CORE)](https://core.ac.uk/download/15125798.pdf)
- [Jones et al. (2016). *Beyond the Rainbow: Retrieval Practice Leads to Better Spelling than Does Rainbow Writing*. Educational Psychology Review, 28](https://link.springer.com/article/10.1007/s10648-015-9330-6)
- [The Learning Scientists (2018). Resumen de Jones et al.](https://www.learningscientists.org/blog/2018/8/16-1)
- [da Silva, Ekuni y Jaeger (2023). *Retrieval practice benefits for spelling performance in fifth-grade children*. Memory, 31(9)](https://informahealthcare.com/doi/epub/10.1080/09658211.2023.2248420)
- [Estudio previo de la UFMG: *A prática de lembrar e a aprendizagem ortográfica em crianças de escola pública*](https://repositorio.ufmg.br/bitstream/1843/48345/1/A%20pr%c3%a1tica%20de%20lembrar%20e%20a%20aprendizagem%20ortogr%c3%a1fica%20em%20crian%c3%a7as%20de%20escola%20p%c3%bablica.pdf)
- [Graham y Santangelo (2014). *Does spelling instruction make students better spellers, readers, and writers? A meta-analytic review*. Reading and Writing, 27 (resumen en Reading Rockets)](https://www.readingrockets.org/resources/resource-library/does-spelling-instruction-make-students-better-spellers-readers-and)
- [*Spell2win*: feedback inmediato frente a demorado en un juego de ortografía (EAEC, 2022)](https://eaec.journals.ekb.eg/article_268781.html?lang=en)
- [Klimovich y Richter (2025). *Spelling acquisition in children through interleaved practice: the role of instructional guidance*. Cognitive Research: Principles and Implications (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12511507/)
- [Práctica espaciada en vocabulario infantil (SAGE Open, 2016)](https://journals.sagepub.com/doi/10.1177/2158244016646148)
- [Leonard et al. (2024). Recuperación con espaciado expandido en niños con TDL. JSLHR](https://pubs.asha.org/doi/10.1044/2024_JSLHR-23-00528)
- [Habgood y Ainsworth (2011). *Motivating children to learn effectively: exploring the value of intrinsic integration in educational games*. Journal of the Learning Sciences, 20(2)](https://shura.shu.ac.uk/3556/)

**Herramientas técnicas**
- [inkjs (GitHub)](https://github.com/y-lohse/inkjs)
- [Ink: *Running your ink* (guardado, observadores, funciones externas, etiquetas)](https://github.com/inkle/ink/blob/master/Documentation/RunningYourInk.md)
- [Ink (repositorio y editor Inky)](https://github.com/inkle/ink)
- [Phaser: instalación y uso desde CDN](https://docs.phaser.io/phaser/getting-started/installation)
- [Phaser 4 Rendering Concepts](https://phaser.io/tutorials/phaser-4-rendering-concepts)
- [Phaser v3 → v4 Migration Guide (Canvas obsoleto)](https://cdn.jsdelivr.net/npm/phaser@4.2.0/changelog/v4/4.0/MIGRATION-GUIDE.md)
- [KAPLAY (GitHub)](https://github.com/kaplayjs/kaplay)
- [Monogatari (GitHub)](https://www.GitHub.com/Monogatari/Monogatari)
- [Narrat: Getting started](https://docs.narrat.dev/guides/getting-started.html)
- [Godot: *Progress report: Web export in 4.3*](https://godotengine.org/article/progress-report-web-export-in-4-3/)
- [AGS: hilo del port web del motor](https://www.adventuregamestudio.co.uk/forums/engine-development/ags-engine-web-port/20)
- [Opensource.com: *How to use Twine and SugarCube to create interactive adventure games*](https://opensource.com/article/18/2/twine-gaming)
- [MDN: Pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
- Tamaños medidos con los ficheros de [jsDelivr](https://www.jsdelivr.com/) y fechas de publicación del [registro de npm](https://registry.npmjs.org/) (3 de noviembre de 2026).
