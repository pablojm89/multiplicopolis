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
