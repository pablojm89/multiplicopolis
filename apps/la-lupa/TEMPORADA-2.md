# Temporada 2 (6.º): «La Tilde Azul»

> Elegida por Pablo el 4/11/2026: **opción A**, un viaje por Andalucía. Las otras dos opciones (la Agencia Borrón y el Autocorrector) quedan como ideas para encargos o para otra temporada.
> **Por defecto, mientras Pablo no diga otra cosa:**
> - Lo juega el mismo grupo que hizo 5.º, con continuidad, pero el piloto presenta al equipo para que también sirva a un grupo nuevo.
> - Bruno sigue de aprendiz.
> - Lola y Mateo mantienen sus papeles.

## Resumen

Al final de la temporada 1 llegó una carta sin remite: «Detective: tú próximo caso te espera lejos de La Alameda». En lugar de firma, lleva una tilde dibujada con tinta azul.

Detrás está **la Tilde Azul**, una examinadora misteriosa, no un villano. Cada carta trae un billete de tren y un enigma, y lleva a la agencia a una provincia andaluza donde la espera un caso. Mientras lo resuelve, la Tilde Azul observa sin que nadie se dé cuenta.

Al final se descubre quién es:
- **Doña Victoria Aldana**, la maestra que **fundó la Agencia La Lupa** hace 45 años en la vieja escuela, la que hoy es la Academia.
- Fue la maestra del director Robles.
- La llamaban «la Tilde Azul» porque corregía con tinta azul y no roja: «Corregir no es castigar».

Ha vuelto para comprobar si su agencia sigue siendo lo que soñó. Al final entrega al alumno la **insignia de la Tilde Azul**, la de los grandes detectives de la lengua.

Mensaje de la temporada (sigue al de la 1, «las personas no se tachan»): **los errores se corrigen con cariño, no con tinta roja**. Y viajar, leer y escribir bien sirven para entender a la gente.

## Principio técnico (igual que en la temporada 1)

Cada caso es un misterio cerrado, con su regla y su ciudad. Lo que une la temporada son las cartas y las pistas sobre la identidad de la Tilde Azul, que siguen **el orden de los casos**. Si la programación cambia el orden de las reglas, hay que reordenar las ciudades o reescribir las cartas. Está anotado en `PLAN.md`.

## El equipo

| Personaje | Papel en la temporada 2 |
|---|---|
| **El alumno** | Detective oficial desde el final de la temporada 1. Es quien lee mejor las pistas de la Tilde Azul |
| **Lola** | Jefa de la expedición y mentora de Bruno. Arco: tiene tantas ganas de desenmascarar a la Tilde Azul que al principio la trata como a un villano; aprende que no todo misterio esconde a un culpable |
| **Mateo** | Lleva el «Archivo portátil» (una maleta llena de fichas). Arco: descubre que las fichas más antiguas del Archivo, las que heredó, las escribió la fundadora con tinta azul |
| **Bruno** | Aprendiz. Conoce mapas y calles por su trabajo de repartidor y siempre lleva su bici plegable. Le dan miedo los dictados. Arco: mejora caso a caso y en el final repite la prueba de acceso… y la aprueba. Es nombrado detective |
| **Director Robles** | Avatar del maestro: el sello del expediente sigue siendo en su mesa. Casi siempre está en la agencia (al teléfono o por el walkie), pero aparece en algunas ciudades con ropa de deporte (carrera del puerto en Málaga, ruta en bici por el desierto en Almería). Arco: reconoce poco a poco la letra de las cartas y en el final se emociona al reencontrarse con su maestra |
| **La viajera del pañuelo azul** | Doña Victoria Aldana, unos 75 años, elegante, con un pañuelo de seda azul, una pluma estilográfica de tinta azul y una maleta antigua de cuero. Aparece **de fondo** en cada ciudad como turista, sin llamar la atención, igual que Bruno en la temporada 1. No se adelanta quién es |

## Pistas de la identidad (una por caso, juego limpio)

| Caso | Pista |
|---|---|
| Piloto | La carta tiene una tilde de más («tú próximo caso»). Era la primera prueba: solo quien la corrige recibe el billete |
| 1 Cádiz | Un testigo vio a «una señora con un pañuelo azul» en el ensayo. La carta huele a azahar |
| 2 Córdoba | En la tetería, una clienta deja una propina con una notita en tinta azul, sin faltas, que alaba el té |
| 3 Granada | El papel de la carta lleva el **primer logotipo** de la agencia, una lupa antigua. Mateo solo lo ha visto en las fichas más viejas del Archivo |
| 4 Málaga | Robles, que ha venido a correr la carrera del puerto, ve la carta: «Esta letra… me suena de algo» |
| 5 Huelva | En el muelle aparece una maleta antigua con una etiqueta: «V. A.» |
| 6 Jaén | Don Anselmo, por teléfono: «La fundadora de la agencia escribía siempre con pluma azul. Se jubiló y se fue de viaje. Nunca volvió» |
| 7 Almería | La viajera sale por casualidad como figurante en el rodaje del wéstern. Corrige el guion sin pestañear, «como una maestra» |
| 8 Sevilla | En el Archivo aparece el **acta de fundación** de la agencia, firmada por Victoria Aldana con una tilde azul dibujada junto al nombre |
| 9 Tren | La viajera va en el mismo tren nocturno. El alumno ve el pañuelo y la pluma. Ella baja antes de tiempo y deja la última carta: «Mañana, donde empezó todo» |
| 10 Final | En la vieja escuela, hoy la Academia: el retrato del tablón (pañuelo, pluma, letra, logotipo, iniciales, acta) da su nombre. Don Anselmo la reconoce |

## Los casos

| Ep. | Id | Regla | Lugar | Título y misterio |
|---|---|---|---|---|
| **0 · Piloto** | `caso-11` (6-00) | **Evaluación inicial**: las 9 reglas de 5.º, lo que traen del curso pasado | La Alameda y la estación de tren | **«La carta sin remite»**. Bruno trae la carta. El equipo (presentado desde cero) descubre la tilde de más y, al corregirla, el sobre revela un segundo papel: un mensaje con faltas de 5.º que hay que corregir para descifrar el andén y la hora. En la estación, una consigna guarda los billetes a Cádiz. Diagnóstico: 2 faltas por regla, sin pistas, como el piloto de 5.º |
| 1 | `caso-12` (6-01) | El hiato | Cádiz (la Caleta y el Gran Teatro Falla) | **«El tipo de la chirigota»**. La víspera del concurso desaparece el baúl con los disfraces (el «tipo») y el libreto de una chirigota del barrio de la Viña. Sospechosos: la autora, el del bombo y una comparsa rival. Palabras del carnaval: día, baúl, poesía, país, reír, oído, ataúd, búho, teatro, poeta |
| 2 | `caso-13` (6-02) | La tilde diacrítica | Córdoba (un patio de flores y una tetería de la judería) | **«El patio de más»**. En el concurso de patios, las notas del jurado aparecen cambiadas: «el» por «él», «si» por «sí», «te» por «té»… y un patio sale descalificado. ¿Quién cambió las notas y por qué? |
| 3 | `caso-14` (6-03) | Interrogativos y exclamativos | Granada (el mirador de San Nicolás y un carmen del Albaicín) | **«Las preguntas de la Alhambra»**. Una guía del Albaicín ha perdido el cuaderno con las preguntas de su ruta-acertijo para turistas. Las que aparecen están sin signos ni tildes, y alguien las usa para despistar. Pregunta directa e indirecta |
| 4 | `caso-15` (6-04) | b y v (II) | Málaga (el puerto y el aula del mar) | **«La biznaga perdida»**. Robles corre la carrera del puerto. Desaparece la biznaga de un biznaguero y, en el aula del mar, los carteles de los animales (herbívoro, carnívoro…) aparecen cambiados. Palabras: biblioteca, buscar, burbuja, amabilidad, vagabundo, distribuir, octavo, nuevo, activo, herbívoro, adverbio, evitar, evolución |
| 5 | `caso-16` (6-05) | La h (II) | Huelva (el muelle de las carabelas y la ría) | **«La carabela sin rumbo»**. Alguien ha tocado el cuaderno de bitácora de la réplica de una carabela y nadie sabe por dónde se fue el barco de la ruta escolar. Palabras: hidroavión, hipermercado, hemisferio, hexágono, helicóptero; hecho/echo, hola/ola, hay/ahí/ay, haya/halla, a ver/haber |
| 6 | `caso-17` (6-06) | -cc- y -c- | Jaén (el mar de olivos y una almazara) | **«La cosecha perdida»**. En el concurso del mejor aceite, las etiquetas y el acta del jurado tienen faltas («dirección», «producción», «selección»…) y una botella ganadora ha desaparecido. La familia de cada palabra da la pista |
| 7 | `caso-18` (6-07) | x y s | Almería (un poblado del oeste en el desierto de Tabernas y el Cabo de Gata) | **«Duelo en Tabernas»**. En el rodaje de un wéstern desaparece una página del guion y la estrella del sheriff. Robles llega en bici por el desierto. Palabras: explicar, explorar, explosión, extraordinario, exalumno, texto, sexto; espléndido, estupendo, estrategia, escalera |
| 8 | `caso-19` (6-08) | Puntuación: coma, punto y coma y diálogo | Sevilla (el Archivo de Indias y la Torre del Oro) | **«El legajo del Archivo»**. Una carta antigua cambia de sentido según dónde se pongan las comas, y la declaración de un testigo hay que pasarla a diálogo con rayas. Al final aparece el acta de fundación de la agencia |
| 9 | `caso-20` (6-09) | «solo» y los adverbios en -mente | El tren nocturno de vuelta | **«El tren de medianoche»**. Desaparece la maleta del Archivo portátil de Mateo. La revisora y los viajeros declaran con muchos adverbios: rápidamente, tranquilamente, fácilmente, solo… La viajera del pañuelo azul va en el tren |
| **10 · Final** | `caso-21` (6-10) | Repaso de las 9 reglas de 6.º | La Alameda: la vieja escuela (la Academia) | **«La tilde azul»**. Retos encadenados por la escuela. El tablón da el retrato y doña Victoria se presenta: fundadora, maestra de Robles, «la Tilde Azul». Explica por qué corregía en azul. Bruno repite la prueba de acceso y la aprueba. El alumno recibe la insignia de la Tilde Azul. Final cerrado y emotivo |

**Estructura de cada caso**, la de la temporada 1:
1. Portada y aviso.
2. Descubre la regla.
3. Dos o tres lugares, cada uno con un relato y un reto que da una cifra.
4. Hipótesis, careo y candado.
5. Expediente.
6. Después del expediente, para que no se evalúe: la **carta de la Tilde Azul** con el enigma de la siguiente ciudad.
7. Apunta y final.

Y con la Academia y la libreta de siempre: cada caso tiene su preparación en la Academia, sus momentos de libreta y el sello en la mesa del director.

**Cultura andaluza** (criterio 1.3 y saberes de Andalucía): cada caso puede tener un momento breve sobre el habla o las costumbres de la provincia, con respeto. Por ejemplo: el carnaval de Cádiz, la convivencia de culturas en Córdoba o el aceite de Jaén. Las variedades del andaluz (seseo, ceceo, aspiración) se tratan como riqueza, nunca como falta. En la escritura, la norma es la misma para todos.

## Arte necesario (lo pide cada caso en su `pendiente/`)

- **Personaje recurrente**: `viajera` (doña Victoria Aldana), con las expresiones neutral, contento, pensativo, sorprendido y misteriosa. En la misteriosa está medio de espaldas, con el pañuelo tapándole parte de la cara.
- **Por ciudad**: dos fondos, dos personajes locales y uno o dos objetos.
- **Pilot y tren**: estación de tren, vagón nocturno, billetes y maleta.
- **Final**: la insignia de la Tilde Azul y las postales del viaje.
- Monumentos reales (la Alhambra, la Torre del Oro, el Gran Teatro Falla…): siempre sin letras ni carteles legibles y vistos con el aire de misterio de la serie. Ningún personaje está basado en personas reales.

Total aproximado: 20 fondos, 19 personajes nuevos y 20 objetos. Se encargan a GPT en una issue por bloque de casos.

**Ya encargado (lote 9, 9/11/2026): lo que no depende de cómo se escriban los casos.** Al escribir cada caso, usa estos ids:

| Caso | Fondos |
|---|---|
| Piloto | `estacion-tren` (y los de La Alameda que ya existen) |
| 1 Cádiz | `caleta-cadiz`, `teatro-falla` |
| 2 Córdoba | `patio-cordobes`, `teteria-juderia` |
| 3 Granada | `mirador-granada`, `carmen-albaicin` |
| 4 Málaga | `puerto-malaga`, `aula-del-mar` |
| 5 Huelva | `muelle-carabelas`, `marismas-huelva` |
| 6 Jaén | `olivar-jaen`, `almazara` |
| 7 Almería | `poblado-oeste`, `cabo-de-gata` |
| 8 Sevilla | `archivo-indias`, `torre-rio` |
| 9 Tren | `vagon-nocturno`, `estacion-tren` |
| 10 Final | `aula-antigua` (y la Academia) |

- Personaje: `viajera` (neutral, contento, pensativo, sorprendido y misteriosa).
- Objetos de la trama: `billetes-tren`, `maleta-viajera` (la etiqueta va en blanco: las iniciales «V. A.» las pone el juego), `pluma-azul`, `papel-membrete` (el primer logotipo), `acta-fundacion`, `foto-fundadora`, `archivo-portatil`, `postales-viaje` e `insignia-tilde-azul`. La carta de cada caso reutiliza `carta-lejana`.
- **Falta por encargar**, cuando se escriban los casos: los dos personajes locales de cada ciudad, la revisora del tren y los objetos propios de cada misterio.

## Qué falta después de escribir los casos

1. **Academia para 6.º**:
   - palabras y textos de las 9 reglas nuevas;
   - esquemas de apuntes;
   - prácticas de la ruta de preparación (`PRACTICAS` en `preparacion.js`);
   - dictados, galeradas, pizarra y homófonos de h (II).
2. Encargo de arte a GPT.
3. Jugador automático para toda la temporada.
4. Que Pablo la juegue.
