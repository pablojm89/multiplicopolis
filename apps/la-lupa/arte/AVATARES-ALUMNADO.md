# Avatares del alumnado: procedimiento e instrucciones para la IA de imágenes

Solo para la clase de Pablo. **Aquí no hay datos de ningún alumno**: este archivo explica el proceso y da el encargo tipo.
Las fichas escaneadas, los PNG y el paquete **nunca** se suben al repositorio (que es público) ni a issues de GitHub.

## Proceso

1. **Autorización**: cada familia firma `imprimibles/autorizacion-familias.html`, un borrador que hay que revisar con la dirección o el DPD antes de repartirlo. Sin autorización no se hace avatar: ese alumno juega con su alias y la ficha 🕵️.
2. **Ficha**: después del piloto, cada alumno rellena `imprimibles/ficha-aspirante.html` (A4 a doble cara) con su alias, su dibujo, su especialidad, su objeto y su descripción. Es una actividad de escritura de verdad (texto descriptivo), así que pasa por la mesa del director para el sello.
3. **Antes de escanear**: Pablo recorta la tira con el nombre. A la IA solo llegan el alias, el número de aspirante, el dibujo y la descripción.
4. **Generación**: Pablo sube los escaneos **directamente en el chat de ChatGPT** (con «Mejorar el modelo para todos» desactivado) y le pega el encargo de abajo. GPT entrega un zip con los PNG y su `MANIFIESTO.json`.
5. **Paquete**: el zip llega a Claude a través de Pablo. Se extrae en una carpeta temporal del scratchpad, nunca dentro del repo, y se genera el paquete:
   `python3 -I herramientas/paquete_clase.py <carpeta> <clase>.lalupa-clase.json --clase "5.º A"`.
   El paquete se le entrega a Pablo como archivo, nunca como Artifact ni subido a GitHub, y después se borran las copias de trabajo.
6. **En el aula**: en cada dispositivo, Zona maestro/a → «Importar paquete…». Al crear su ficha, cada alumno pulsa su avatar.
   Sale en su ficha de la entrada, en la placa del tablón, en el informe y en la foto de equipo del final de cada caso.
   Al acabar el curso: «Quitar paquete de este dispositivo».

## Encargo tipo para ChatGPT (copiar y pegar)

> Eres el ilustrador de **Agencia La Lupa**, un juego educativo de detectives para alumnos de 10-12 años. Te paso escaneadas las **fichas de aspirante** de mis alumnos. Cada una tiene un número de aspirante, un alias, un dibujo hecho por el propio alumno y su descripción escrita.
>
> Crea **un avatar por ficha**, de cuerpo entero, con el estilo de los personajes del juego: anime/manga moderno de misterio, línea limpia y cel-shading, aire de serie juvenil de detectives (no infantil), con luz cálida ámbar y acentos de azul noche. Mismas proporciones que el resto del reparto: un niño o una niña de unos 11 años.
>
> - Básate **solo en su dibujo y en su descripción**: peinado y color de pelo, ojos, gafas o pecas si las ha puesto, su ropa de detective, sus colores y su **objeto de detective**. Que su especialidad se note en la pose (ojo de lince: lupa en alto; oído fino: mano en la oreja…).
> - Que el resultado sea **favorecedor y respetuoso**: nada de caricaturas burlonas ni de exagerar rasgos físicos. Cada alumno tiene que verse genial.
> - Sin nombres, letras ni números dibujados en la imagen.
> - PNG de 1024 × 1536 con **fondo transparente**, el personaje entero y centrado, mirando ligeramente hacia la derecha del espectador.
> - Nombre de cada archivo: `aspirante-<número>.png` (por ejemplo, `aspirante-07.png`).
> - Entrega un zip con los PNG y un `MANIFIESTO.json` con una lista de `{"archivo": "aspirante-07.png", "alias": "<alias tal como lo ha escrito el alumno>", "sha256": "…"}`. Si un alias tiene alguna falta de ortografía, corrígela en el manifiesto.
> - No guardes estas imágenes ni las uses para nada más.

## Notas

- Si un avatar no le gusta a su dueño, se rehace solo ese y se vuelve a generar el paquete.
- El paquete de una clase de 25 alumnos ocupa poco más de 1 MB (unos 45 KB por avatar).
- En `.gitignore` están bloqueados `*.lalupa-clase.json` y `apps/*/privado/`.
