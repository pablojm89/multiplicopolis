# Plan · Agencia La Lupa

Juego para 3.er ciclo de Primaria (5.º y 6.º) en Andalucía, inspirado en la **mecánica** de "Las aventuras de Sherlock Ort" (Fernando Martí): el alumnado resuelve casos detectando y corrigiendo errores.
El nombre, el personaje, los textos y las ilustraciones serán **propios**: se toma la idea, no la obra del autor.

Orquesta: la sesión principal. Cada fase genera documentos en `docs/investigacion/` y decisiones en este archivo.

## Fase 1: Investigación y recomposición

**Estado:** prototipo listo, pendiente de prueba en el aula

- [x] Todo lo publicado sobre Sherlock Ort → `docs/investigacion/sherlock-ort.md`
- [x] Referentes de juegos de detectives y aventura gráfica, didáctica de la ortografía y herramientas técnicas → `docs/investigacion/referentes-juegos-detective-lengua.md`
- [x] Currículo de Lengua del 3.er ciclo en Andalucía (criterios con código para Séneca) → `docs/investigacion/curriculo-lengua-tercer-ciclo-andalucia.md`
- [x] Síntesis: diseño de la v1 (casos de ortografía) → `apps/la-lupa/DISEÑO.md`
- [x] Decisiones de Pablo sobre `DISEÑO.md` §9
- [x] Prototipo jugable: motor por datos + caso 1 «El pregón desaparecido» (tildes generales), informe por criterio y CSV
- [x] ~~Probar el prototipo v1~~ → Pablo lo descarta: no transmite la experiencia de Sherlock Ort. Se juega Sherlock Ort en directo (`docs/investigacion/sherlock-ort-experiencia.md`)
- [x] **v2**: motor de escenas 16:9 (pantalla completa, texto que se escribe solo, retos dentro de la escena, pantallas de pista conseguida / pista falsa, HUD de objetos) y caso 1 rehecho
- [x] Arte del caso 1: 36 ilustraciones de GPT integradas (issue #1). Retocado el candado de `caja-musica`, que traía números dibujados
- [x] Pablo prueba el caso 1 con arte: «me gusta bastante» (4/11)
- [x] **Libreta de papel** como herramienta central (`LIBRETA.md`): modo papel o digital, momentos «¡Apúntalo!» (escena `apunta`), sello del director con rúbrica y código (opción B: premia, no bloquea), puntos y rangos
- [x] Plantilla imprimible de la libreta (`imprimibles/libreta.html`): portada y una doble página por caso, generada desde los datos; se abre desde la zona del maestro
- [x] **Piloto «La prueba de acceso»** (`caso-00`): evaluación inicial de las 9 reglas de 5.º, debut de Bruno y El Tachón, informe con el punto de partida y tabla de evaluación inicial en la zona del maestro. Arte del lote 3 integrado (issue #2)
- [x] Gancho de El Tachón al final del caso 1
- [ ] **Trama de temporada**: pasar los ganchos a `datos/temporada-1.json` por número de episodio (`TEMPORADA-1.md`)
- [x] Caso 2 «El mercado del revés» (b/v): primera foto de El Tachón. Arte pendiente (issue #3)
- [x] Caso 3 «La carta sin haches» (h): El Tachón conoce la agencia por dentro; desaparece su ficha de aspirante; Bruno cuenta que suspendió la prueba. Arte pendiente (issue #3)
- [x] Caso 4 «El panel de azulejos» (c/z/s): El Tachón habla con seseo → es del barrio. Seseo tratado como forma de hablar, no como error. Arte pendiente (issue #3)
- [x] Caso 5 «La noche de los farolillos» (ll/y): mitad de temporada, careo cara a cara con el Tachón, que escapa y deja caer la llave de la antigua escuela
- [x] **Casos 6-10 escritos en paralelo por 5 subagentes** (uno por caso, con archivos «pendiente» para no pisarse) y revisados:
  - 6 «La orla recortada» (g/j y diéresis): la antigua escuela (hoy la Academia) y la orla con una cara recortada
  - 7 «El guion de la radio» (diptongos y monosílabos): Mateo confiesa que se reían de sus faltas
  - 8 «La foto que faltaba» (-d/-z finales): Robles estaba en el tribunal de la prueba y no defendió al chico
  - 9 «¡Parad las máquinas!» (mayúsculas y puntuación): el golpe final contra el periódico, frustrado
  - 10 «Sin máscaras» (repaso de las 9 reglas): Bruno desenmascarado, perdón, aprendiz de la agencia y gancho para 6.º
- [x] Jugador automático (`herramientas/jugar_caso.js`): la temporada entera (piloto + 10 casos) se juega sin errores
- [ ] Arte de los casos 5-10 (pedido a GPT)
- [ ] Pablo juega la temporada y da su visto bueno
- [x] **Academia, primera versión**: patio con turno de hoy, cola de repaso espaciado y 3 salas (Archivo, Pupitre, Laboratorio) con bancos de 79 palabras y 9 documentos (tildes, b/v, h). Arte pedido (issue #4)
- [x] Academia: Sala de Interrogatorios con «el testigo seseante» (seseo, yeísmo y -d final como forma de hablar; se escribe la norma) y banco ampliado a 111 palabras (c/z/s, ll/y, -d/-z)
- [x] Academia: las 8 salas activas. Terminal (T2, máquina del tiempo verbal), Pizarra (Z1, descubre la regla), Centralita (R1, dictado por radio o relámpago) e Imprenta (E3, pruebas de imprenta), escritas por 4 subagentes en paralelo y revisadas
- [ ] Academia: más actividades por sala (T1, T3, T4, Z2-Z5, R2-R4, E1, E2, E4, E5…) y niveles N2/N3
- [ ] ~~**Academia de detectives**~~ (idea original): zona de entrenamiento con muchas actividades generadas desde bancos de datos, con explicación y aprendizaje, y salas con estéticas distintas (pupitre en vista cenital, ordenador retro, pizarra…). Lluvia de ideas en `docs/investigacion/academia-actividades.md`
- [ ] Pablo prueba la v2 y la da por buena → **consolidar el procedimiento para crear casos** (`CLAUDE.md` § Cómo crear un caso nuevo)
- [x] ~~Más casos de 5.º según `datos/programacion.json`~~ → temporada 1 completa (11 casos)
- [ ] Temporada 2 (6.º): empieza con la carta de la tilde diacrítica
- [x] **Avatares del alumnado: motor, ficha imprimible, borrador de autorización y procedimiento hechos** (Pablo: «adelante con todo»). Falta: autorización del centro y las familias, las fichas de la clase y los primeros avatares de GPT. Idea original:: después del piloto, actividad en papel «Ficha de aspirante» en la que cada alumno dibuja su cara de detective y escribe su descripción (texto descriptivo: rasgos, carácter y gustos, con alias de detective). Con eso, GPT crea su avatar y el alumno se ve en el juego. Solo para la clase de Pablo, nunca para otros profes: los avatares **no van al repo** (es público), sino en un «paquete de clase» privado que se importa en los dispositivos de clase desde la zona del maestro. Requisitos: consentimiento de las familias, alias en vez de nombre, se envían a GPT dibujos y no fotos, y GPT con la opción de entrenar con los datos desactivada
- [x] **Encargos: motor hecho** (buzón, apertura por rango, escenas `pregunta`, `escribe` y `ordena`) y el primero, «La receta perdida». Pablo: «que según suben su rango de detective haya más misiones y más difíciles». Pendiente: más encargos por rango y las decisiones de nombre, nota y libreta (por ahora: «Encargos», aparte de la nota y sin libreta). Idea original: además de la historia principal (los casos de la temporada) y la zona de entrenamiento (la Academia), un apartado de **historias o misiones secundarias**: encargos que llegan a la agencia (por el buzón, el teléfono o una visita) de los vecinos del barrio. Son casos cortos y autocontenidos, hechos con el mismo motor de escenas
- [ ] **Sonido (pendiente, pedido por Pablo el 4/11)**: hilo musical de ambiente misterioso que **cambie según la pantalla y el contexto** (agencia, calle de noche, careo, Academia, final…). Encima, **sonidos de fondo recurrentes** de vez en cuando (pasos, para dar misterio) y **efectos con sentido en cada momento**: clic de las cerraduras y los candados, puertas, papeles, precinto, pista conseguida o falsa… Fuentes: música de uso libre (CC0 o licencia gratuita, con su atribución si la pide) o música y efectos creados por nosotros (por ejemplo, generados con Web Audio). Vale para todos los juegos del repo, no solo La Lupa. Antes de decidir, probar opciones y enseñárselas a Pablo. Detalles a decidir: botón de silencio y volumen (en clase), que no suene hasta el primer toque (los navegadores lo exigen) y peso de los archivos

## Fase 2: Completar con los contenidos de Lengua del 3.er ciclo

**Estado:** pendiente

- [ ] Análisis de huecos: qué saberes básicos y criterios no cubre la fase 1
- [ ] Banco de casos por criterio (ortografía, gramática, léxico, comprensión, puntuación…)
- [ ] Evaluación por criterio y exportación compatible con Séneca

## Fase 3: Aventura gráfica

**Estado:** pendiente

- [ ] Biblia visual: estilo, paleta, fichas de personajes y escenarios
- [ ] Generación de imágenes con Gemini y ChatGPT (requiere claves de API en el entorno)
- [ ] Motor de aventura point-and-click: escenarios, inventario, diálogos y tablero de pistas

## Decisiones

| Fecha | Decisión |
|---|---|
| 2026-11-03 | Inspirado en la mecánica de Sherlock Ort, con identidad propia (nombre y personajes originales). |
| 2026-11-03 | Identidad: **Agencia La Lupa** (opción C). El alumno es detective del equipo, en el barrio ficticio de La Alameda. Carpeta `apps/la-lupa/`. |
| 2026-11-03 | Reparto de 5.º y 6.º: la propuesta de `DISEÑO.md` §5, guardada en `datos/programacion.json`. Se sustituirá por la programación del libro de texto cuando Pablo la pase. |
| 2026-11-03 | Modo de juego: individual (el de parejas queda para más adelante). |
| 2026-11-03 | La v1 (formulario) se descarta. La v2 se hace con escenas a pantalla completa al estilo de un episodio, y el arte se adelanta. |
| 2026-11-03 | Estilo visual: ilustración de álbum o cómic de detectives, papel envejecido y paleta andaluza (albero, azulejo, cal). |
| 2026-11-03 | Lo que funcione y guste a Pablo se convierte en un procedimiento para crear más casos. |
| 2026-11-04 | Academia: **siempre abierta**; se **registra aparte** (ya se verá si cuenta); **don Anselmo** entra como personaje; **el testigo seseante** le encanta; **sin libreta**; **se puede usar en casa**. |
| 2026-11-04 | Libreta: el sello del director **premia sin bloquear** (opción B de `LIBRETA.md`). |
| 2026-11-04 | **Robles pasa a ser el director Robles, avatar de Pablo**: así el «enseña tu libreta al director» lleva a los alumnos a su mesa. Se mantiene toda su trama (estuvo en el tribunal y pide perdón a Bruno). Guiño: Pablo también es profe de Educación Física, y el director aparece a veces con ropa de deporte. Arte en la issue #6. |
| 2026-11-04 | **Avatares del alumnado**: ficha de aspirante en papel después del piloto, con alias, dibujo y descripción. GPT hace el avatar a partir del dibujo, nunca de fotos. Paquete de clase privado, solo en los dispositivos del aula y nunca en el repo, y autorización de las familias. |
| 2026-11-04 | Trama de temporada: El Tachón es **Bruno, el repartidor del periódico**, un antiguo aspirante a la agencia del que se rieron por sus faltas. Al final se une al equipo (opción C de `TEMPORADA-1.md`). |
| 2026-11-03 | **Cambio de estilo:** anime moderno con tono de misterio (noir de detectives, serie juvenil de suspense), sin aire infantil, ambientado en el barrio andaluz de La Alameda. Tensión sí; sangre, violencia y terror no. La interfaz del juego se oscurecerá para encajar cuando llegue el arte. |

## Ideas para más adelante

### Guiños a la cultura actual de los chavales
Pablo quiere meter referencias a su mundo: farmear aura, el «six seven», Fortnite, Among Us y sus memes.
- Siempre en los **textos de los casos** (datos), nunca en el código ni en las imágenes, para poder cambiarlos rápido cuando pasen de moda.
- **Parodia genérica**, sin logotipos, personajes ni nombres comerciales en el arte (Fortnite, Among Us o Stranger Things son marcas).
- Ideas: «+1000 de aura» al resolver un reto sin pistas; un candado con la clave 6-7; «hay un impostor entre los testigos» (el que miente es el que tiene las faltas); el baile de victoria de un sospechoso; frases meme en los bocadillos.
- Revisarlos con Pablo caso a caso: que sumen y no distraigan de la ortografía.

### Villano recurrente (idea de Pablo)
Un malo que aparece caso tras caso, dibujado como parodia del rollo «sigma»: mandíbula cuadrada exagerada, pose de mewing, gafas de sol de noche, gabardina negra y flequillo perfecto. Va dejando por el barrio notas con faltas a propósito. Nombre provisional: **El Tachón**. Se diseña cuando escribamos el caso 2; se añade entonces a `datos/arte.json`.
