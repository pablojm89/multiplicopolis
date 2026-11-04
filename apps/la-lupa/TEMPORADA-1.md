# Temporada 1 (5.º): «Las faltas de La Alameda»

> Borrador del 4/11/2026 para que Pablo lo revise. Idea de Pablo: que toda la temporada tenga un hilo conductor, que empiece con un caso de evaluación inicial que enganche y que termine con un final cerrado, como la primera temporada de una serie.

## Resumen

Desde que empezó el curso aparecen **faltas de ortografía por todo el barrio**: en los carteles, en los menús, en el periódico y en las invitaciones de la feria. Detrás está **El Tachón**, un villano misterioso que firma con un tachón y unas gafas de sol. El alumno entra en la Agencia La Lupa con una **prueba de acceso** (la evaluación inicial). Cada caso es un misterio cerrado que además le da **una pieza del gran misterio**: quién es El Tachón y por qué lo hace. A mitad de temporada se le ve en persona y en el último caso se le desenmascara.

## Principio técnico: trama por posición, contenido por regla

La programación puede cambiar (libro de texto, centro…), así que **el orden de las reglas no puede romper la historia**:
- Cada caso tiene su misterio y su regla, y no depende de los demás.
- La **trama de temporada** va en un archivo aparte (`datos/temporada-1.json`, por hacer) con escenas «gancho» asociadas al **número de episodio**: la escena del gancho 3 se muestra al final del tercer caso que juegue el alumno, sea cual sea su regla.
- Así, si mañana el libro pone b/v antes que las tildes, la historia sigue en orden.

## Personajes y sus arcos

| Personaje | Papel | Arco en la temporada |
|---|---|---|
| **El alumno** | Detective novato | Entra en prácticas y termina la temporada con la placa oficial |
| **Lola** | Detective estrella del equipo | Quiere atrapar a El Tachón ella sola; aprende a fiarse del equipo |
| **Mateo** | Archivero, cerebro de las reglas | Esconde que antes cometía muchas faltas: «los errores se corrigen» |
| **Directora Robles** | Jefa (en la vida real, el maestro) | Sabe más de El Tachón de lo que cuenta… |
| **El Tachón** | Villano recurrente | Mandíbula cuadrada «sigma», pose de mewing, gafas de sol de noche, gabardina negra y flequillo perfecto. Deja notas con faltas a propósito y firma con un tachón |
| **Vecinos** | Testigos y sospechosos de cada caso | Algunos repiten. Uno de ellos es El Tachón (ver «La revelación») |

## Estructura de la temporada (10 episodios + piloto)

| Ep. | Caso (regla según la programación actual) | Pieza del gran misterio |
|---|---|---|
| **0 · Piloto** | **«La prueba de acceso»**: evaluación inicial de todas las reglas | De noche alguien sabotea la propia agencia y llena de faltas todos los expedientes. El alumno los corrige para ganarse la placa de prácticas. Al final, en la ventana: «Bienvenido, novato. Nos veremos. —T.» |
| 1 | El pregón desaparecido (tildes) | ¿Quién entró corriendo en la panadería y tiró los papeles? En uno aparece un tachón con gafas de sol |
| 2 | b/v (I) | El Tachón cambia los letreros del mercado. Primera foto suya, borrosa, para el tablón |
| 3 | h (I) | Deja un mensaje con todas las haches borradas. Se descubre que conoce la agencia por dentro |
| 4 | c/z/s | Un testigo describe su voz: seseante, como alguien del barrio |
| 5 | ll/y | **Mitad de temporada**: careo cara a cara con El Tachón… y se escapa. Deja caer una pista física |
| 6 | «La orla recortada» (g/j y diéresis) | La llave abre la antigua escuela (hoy la Academia). Don Anselmo recuerda a «un niño del que se reían por sus faltas»; en la orla de clase falta una cara. Bruno: «yo estudié aquí… los dictados se me daban fatal» |
| 7 | «El guion de la radio» (diptongos y monosílabos) | El Tachón saca a la luz un cuaderno de Mateo de pequeño. Mateo confiesa que se reían de sus faltas («los errores se corrigen»). Lola deja de querer atraparlo sola |
| 8 | «La foto que faltaba» (-d/-z finales) | Robles estaba en el tribunal de la prueba de acceso el día que se rieron de un aspirante, y no lo defendió. En la foto, ese aspirante sale movido. Bruno: «yo salgo movido en todas» |
| 9 | «¡Parad las máquinas!» (mayúsculas y puntuación) | El golpe final: cambiar la portada del número especial de «El Eco de La Alameda». Se frustra, pero escapa en bicicleta por la puerta del reparto. «Mañana, en la plaza, delante de todo el barrio. Sin máscaras» |
| **10 · Final** | **«Sin máscaras»**: repaso de las 9 reglas | Retos encadenados en la plaza; el tablón corregido da el retrato (pulsera roja, seseo, bicicleta, periódico) y el alumno deduce que es Bruno. En la cartera, la cara de la orla y su ficha de aspirante. Robles le pide perdón, Mateo: «Los errores se corrigen. Las personas no se tachan». Bruno entra como aprendiz y tacha «venganza». Gancho: una carta de lejos con una tilde diacrítica dudosa |

Ortografía: «el Tachón» es un apodo, así que en mitad de frase el artículo va en minúscula (el Tachón, del Tachón, al Tachón), como pide la RAE (el Greco).

## El piloto como evaluación inicial

- **Historia que engancha**: presentación de la agencia, del barrio y de los personajes, el sabotaje nocturno y el primer mensaje de El Tachón.
- **Diagnóstico**: 2-3 elementos por cada regla de la temporada, mezclados dentro de los retos de la historia, **sin pistas** y sin que fallar tenga consecuencias en la historia. Solo se anota.
- **Para el maestro**: un mapa por alumno y por clase de qué reglas domina y cuáles no («evaluación inicial» de Séneca), y el punto de partida de la cola de repaso de cada alumno.
- **Para el alumno**: termina con su placa de detective en prácticas y su libreta estrenada.
- Al final de la temporada se puede repetir una versión del piloto («la prueba de ascenso») para comparar antes y después.

## La revelación: **decidida la opción C** (4/11/2026)

Opciones para la identidad de El Tachón:
- **A. Un vecino que aparece de fondo en varios casos**, por ejemplo Bruno, el repartidor del periódico. Se puede descubrir antes de tiempo atando cabos, lo que premia la atención.
- **B. Un antiguo aspirante a la agencia** al que suspendieron la prueba de acceso y del que se rieron por sus faltas. Final con mensaje: los errores se corrigen y nadie debería burlarse. Acaba uniéndose al equipo.
- **C. Combinación**: es Bruno, y su motivo es el de la B. **← Elegida por Pablo.** Bruno tiene que aparecer de fondo, sin llamar la atención, desde el piloto: reparte el periódico, se cruza con el equipo y deja alguna pista sutil.

## Guiños actuales

El Tachón es el personaje ideal para los guiños (aura, sigma, mewing, «six seven»…): su arrogancia «sigma» es parte del humor. Siempre en los textos y como parodia, sin marcas (ver `PLAN.md` § Ideas).

## Encaje con lo que ya está hecho

- El caso 1 ya tiene el gancho: Julián cuenta que «alguien entró corriendo y tiró los papeles». Basta con añadir al final la escena de la nota con el tachón y las gafas.
- El tablón de la agencia puede convertirse en el **tablón de la temporada**, con las piezas del misterio clavadas e hilo rojo entre ellas.
