# Sherlock Ort: cómo se vive al jugarlo (prueba directa)

## Resumen

Jugado en navegador el 3/11/2026: el episodio 1x01 completo (con un caso fallado y otro resuelto) y el arranque del 3x02. La fuerza de Sherlock Ort no está en sus retos, que son sencillos, sino en la **puesta en escena**: cada pantalla es una escena a pantalla completa, con fondo ilustrado o fotográfico, tipografía de cartel y personajes grandes. El texto aparece poco a poco y no se puede avanzar hasta que termina, así que el ritmo es lento y dramático. Al acertar o fallar, la respuesta ocupa la pantalla entera («¡Caso resuelto!» / «¡Caso NO resuelto!»). El prototipo v1 de La Lupa era un formulario con decorado: tenía la mecánica, pero no esta experiencia. Este documento corrige lo que el resumen del agente no recogía.

**Corrección importante:** los Geniallys llevan la insignia **CC BY-NC** (Creative Commons, reconocimiento y uso no comercial). `sherlock-ort.md` decía que no había licencia; esto lo corrige. Aun así, usan fotos de la serie *Sherlock* de la BBC, que no son del autor, así que mantenemos la decisión de crear una identidad propia.

## Lo que se ve y se siente, pantalla a pantalla (1x01)

1. **Aviso de entrada**, a modo de clasificación por edades: «El siguiente episodio contiene palabras criminalmente mal escritas…», con tres iconos falsos (ortografía criminal, +7, adicción a resolverlo todo). Humor y complicidad desde el primer segundo.
2. **Portada**: foto grande de los dos detectives, título enorme con tipografía de cartel y tres botones (Introducción, Misión, Personajes) más «Empezar». Se siente como abrir un episodio de una serie.
3. **Introducción**: ilustración de la puerta del 221B y texto en máquina de escribir sobre una caja oscura translúcida. Fondo de papel envejecido en tonos sepia.
4. **Misión**: el detective a tamaño grande y una consigna corta. La flecha para avanzar se activa al acabar la animación del texto.
5. **Presentación del caso** («El caso de la cartera invisible»): título gigante, un objeto recortado y grande (la cartera) y el relato del cliente.
6. **El reto**: la **silueta del cliente hecha de palabras** (nube de palabras). Las faltas están camufladas entre decenas de palabras correctas y en tamaños distintos. El alumno **mira**, no pulsa: busca las que están mal («Lá», «perdio», «én», «sú», «apartaménto») y deduce la frase que forman. Arriba a la derecha, una **carpeta «TOP SECRET»** con la foto del ayudante abre la ficha de la regla.
7. **«Y la solución al caso es…»**: cuatro hipótesis en máquina de escribir. Elegir es decidir quién tiene razón.
8. **Resultado a pantalla completa**:
   - Al fallar: el detective pensativo y «¿Cómo he podido fallar? ¡Caso NO resuelto!». La palabra «fallar» aparece mal escrita a propósito («falalr»), y la palabra «NO» en rojo. Se vuelve al principio del caso.
   - Al acertar: los dos detectives y «Elemental, mi querido Grafson. ¡Caso resuelto!». Una lupa abre la explicación de la deducción.
9. Siguiente caso, con otro cliente y otro objeto. Un episodio son 3-4 casos cortos.

**3x02** (temporada posterior, mismo tema): portada ilustrada a todo color (volcán, selva, cartelería de aventura). La **misión es subir un volcán** con un marcador «+» en la ladera. El primer reto, «Subida tónica», pone palabras con sus sílabas separadas sobre la ladera: hay que tocar la sílaba tónica de cada una y validar. Cada temporada cambia de mundo visual.

## Qué hace que funcione (y faltaba en La Lupa v1)

| Ingrediente | Sherlock Ort | La Lupa v1 |
|---|---|---|
| Escena a pantalla completa | Cada pantalla es una ilustración o foto de fondo con elementos grandes | Tarjeta blanca de aplicación con panel lateral |
| Ritmo | Texto que se revela despacio; una idea por pantalla; navegar con flechas | Todo a la vez en una pantalla larga |
| Tipografía | Cartel enorme para títulos y máquina de escribir para relatos | Tipografía de interfaz |
| Personajes | Grandes, con expresión (pensativo al fallar, satisfecho al acertar) | Emoji pequeño en un círculo |
| Objeto del caso | Un objeto protagonista y grande (cartera, corona…) | Ninguno |
| El reto como imagen | Palabras dentro de una silueta, sobre un volcán… El reto ES la escena | Texto en una caja con botones |
| Momentos de resultado | Pantalla completa, frase de marca, humor | Aviso pequeño en la parte inferior |
| Humor y guiños | Aviso de «ortografía criminal», faltas a propósito en los mensajes | Neutro |
| Identidad por temporada | Cada temporada tiene su mundo visual | Una sola estética de aplicación |
| Elementos de juego | Carpeta «TOP SECRET», lupa, cifras para el candado | Botones de interfaz («Pedir pista») |

## Lo que mantenemos de nuestro diseño (la evidencia sigue valiendo)

- Escribir la corrección y recibir feedback inmediato. En Sherlock Ort, en 1x01 solo se mira y se elige una hipótesis; no se escribe nada.
- No mandar al principio del caso al fallar: se mantiene la pantalla «¡Caso NO resuelto!», pero con reintento y pista.
- Registro por criterio para el cuaderno del maestro.

## Implicaciones para La Lupa v2

1. **Motor de escenas**: pantallas completas en 16:9 que se escalan, con fondo, personajes, objeto, texto animado y navegación con flechas. Sustituye a la vista de aplicación.
2. **Retos integrados en la escena**: nube o silueta de palabras, objetos de la escena que esconden pistas, recorridos sobre un mapa o ladera, candado físico, etc.
3. **Pantallas de resultado** con personaje, frase de marca de la agencia y humor.
4. **Arte**: es lo que más pesa. Hace falta antes de lo previsto (adelantar parte de la fase 3: fondos, personajes con 2-3 expresiones y objetos).
5. El cuaderno, las pistas y la ficha pasan a ser **objetos de la escena** (carpeta, lupa, libreta), no paneles de interfaz.
