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
