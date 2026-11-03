# Diseño v1: casos de ortografía (fase 1)

> Síntesis de las tres investigaciones de la fase 1 (`docs/investigacion/`):
> [sherlock-ort.md](../../docs/investigacion/sherlock-ort.md),
> [referentes-juegos-detective-lengua.md](../../docs/investigacion/referentes-juegos-detective-lengua.md) y
> [curriculo-lengua-tercer-ciclo-andalucia.md](../../docs/investigacion/curriculo-lengua-tercer-ciclo-andalucia.md).
> Las decisiones que tome Pablo se trasladan a `PLAN.md`.

## Resumen

Juego web de detectives para 5.º y 6.º. Cada **caso** trabaja una regla ortográfica: los textos del caso (declaraciones, notas, pistas) tienen errores sembrados, y **detectarlos y escribir la forma correcta** es lo que hace avanzar la investigación. De Sherlock Ort se toma la mecánica (el error como pista, un episodio por regla, espiral entre temporadas y catálogo de retos). De la investigación didáctica se corrigen dos cosas: el alumno **escribe** siempre la corrección y recibe feedback inmediato, y nunca elige entre varias formas mal escritas. Todo el contenido son **datos** (casos y bancos de palabras en JSON) y el juego registra aciertos **por regla y por criterio de evaluación** (5.1, 9.1 y 9.2) para el cuaderno del maestro y para Séneca.

## 1. Identidad (pendiente de decisión)

Nombre, personajes y mundo **propios**. Nada del original: ni "Sherlock", ni "Ort", ni Grafson, Malorty ni los Tilde (ver `sherlock-ort.md` §8.2).
Recomendación: ambientación **andaluza ficticia**, que da identidad propia y conecta con el criterio 1.3 (modalidad andaluza).

Propuestas para elegir o mezclar:

| Opción | Juego | Detective | Villano o conflicto | Mundo |
|---|---|---|---|---|
| A | **Brigada Errata** | La inspectora Lupe Lupa y su ayudante, un loro que se sabe todas las reglas | "El Borrón", que emborrona los textos de la ciudad | Puerto Palabra, ciudad costera |
| B | **Caso Cerrado en Villaletras** | El detective Paco Pista | Una banda de ladrones de letras | Pueblo blanco de sierra |
| C | **Agencia La Lupa** | Equipo de 3 detectives alumnos (el jugador es uno) | Misterios distintos en cada caso, sin villano fijo | Barrio con mercado, faro, feria… |

La C pone al alumnado como protagonista y deja más sitio a casos variados en la fase 2, que ya no serán solo de ortografía.

## 2. Principios de diseño (con su porqué)

1. **Detectar y luego escribir.** El alumno toca la palabra sospechosa y **escribe** la forma correcta. Se muestra enseguida la forma buena y la regla. Leer formas mal escritas puede fijarlas (Jacoby y Hollingshead), y escribir de memoria con feedback inmediato funciona (da Silva, 2023).
2. **Pocos errores por texto**: de 2 a 4 por pantalla, y la forma correcta siempre visible al cerrar.
3. **Nada de "elige la bien escrita entre tres mal escritas".** Del reto de Sherlock Ort "frase correcta entre casi idénticas" se pasa al **careo**: hay una sola frase, se señala el error y se presenta la regla que lo demuestra.
4. **La ortografía es la mecánica, no un peaje** (Habgood y Ainsworth): cada corrección desbloquea algo visible, como una cifra del candado, una letra de la clave o una puerta.
5. **Sin callejones sin salida** (Gilbert). Fallar no devuelve al principio del caso: se ofrece un reintento con pista progresiva y el error queda registrado.
6. **Pistas en 4 niveles**: zona, tipo de palabra, regla y palabra marcada. Se registra cuántas se usan.
7. **Espiral e intercalado.** Cada regla vuelve en casos posteriores mezclada con otras, y las palabras que falla cada alumno vuelven en su cola de repaso.
8. **Andalucía**: se da prioridad a c/s/z, ll/y, h, -s y -d finales, siempre como diferencias "lo digo así, se escribe así", nunca como "hablas mal" (CE 1).
9. **Sin reloj en la práctica.** Como mucho, un tiempo opcional en el reto final.

## 3. Estructura de un caso (≈ 20-30 min)

1. **Aviso**: llega el caso, con un texto corto que ya trae errores sembrados de la regla.
2. **Ficha de la regla** (el ayudante): se puede consultar siempre. Un mini reto inicial de "descubre la regla" (hipótesis y contraejemplo) evalúa el criterio **9.1**.
3. **3 a 5 escenas de investigación**, cada una con un tipo de reto (ver §4). Cada escena superada da una **pieza** (cifra, letra u objeto).
4. **Careo final**: el sospechoso declara, el alumno señala los errores, presenta la regla y escribe las correcciones.
5. **Candado**: las piezas abren el desenlace.
6. **Revisa el expediente**: hay que encontrar los errores sembrados en los textos del propio caso. Es la meta-tarea del original, aquí puntuada automáticamente, y evalúa el criterio **9.2**.
7. **Informe**: resumen para el alumno (reglas, aciertos, palabras para repasar) y registro para el maestro.

## 4. Catálogo de retos v1

Todos se generan a partir de datos: cada caso indica qué regla y qué palabras usa.

| Reto | Mecánica | Origen | Notas |
|---|---|---|---|
| **Caza del error** | Texto con 2-4 errores: tocar y escribir la forma correcta | Sherlock Ort (declaración con errores) | El reto principal |
| **Careo** | Frase de un testigo: señalar el error y elegir la carta de regla que lo prueba | Mecánica tipo careo judicial | Evalúa también 9.1 (justificar) |
| **Clasifica las pruebas** | Arrastrar palabras **bien escritas** a categorías (aguda, llana, esdrújula…) | Sherlock Ort (clasificar) | Solo formas correctas |
| **Laberinto** | Avanzar por casillas: hay que decidir si cada palabra cumple la regla | Sherlock Ort (laberinto) | Las mal escritas se corrigen al pisarlas |
| **Dictado del soplo** | Audio corto (voz del navegador) que se escribe | Sherlock Ort (dictado) | Requiere comprobar la voz `es-ES` en los equipos del cole |
| **Contar para la cifra** | "¿Cuántas palabras de esta nota deberían llevar tilde?" → cifra del candado | Sherlock Ort | Corrección posterior de las palabras |
| **Acróstico** | Las iniciales de las palabras corregidas forman la clave | Sherlock Ort | |
| **Descubre la regla** | Ver 6 ejemplos, formular la regla eligiendo entre hipótesis y encontrar el contraejemplo | Criterio 9.1 | Al principio de cada caso |
| **Revisa el expediente** | Encontrar los errores sembrados en los textos del caso | Sherlock Ort (meta-tarea) | Al final de cada caso |

Se quedan para más adelante: combate por turnos, homófonos con imagen (fase 2, léxico) y exploración de escenario (fase 3).

## 5. Mapa de contenidos (propuesta, a validar)

La norma de 3.er ciclo no fija qué regla va en 5.º y cuál en 6.º (ver `curriculo…` §5.2). El reparto sigue la práctica de los libros de texto y la prioridad que marca la evidencia.

**Temporada 1, 5.º**
1. Sílaba tónica y agudas, llanas y esdrújulas
2. Tilde en agudas (el error más frecuente)
3. b/v I (-aba, -bir, mb, nv…)
4. h I (hie-, hue-, haber, hacer)
5. c/z/s (seseo y ceceo)
6. ll/y (yeísmo)
7. g/j y diéresis
8. Diptongo y monosílabos
9. -d / -z finales y plurales
10. Mayúsculas y puntuación básica
11. **Caso especial de repaso** (mezcla de todas)

**Temporada 2, 6.º:** hiato, tilde diacrítica, interrogativos y exclamativos, b/v II y h II (excepciones, prefijos), -cc-/-c-, x/s, puntuación (coma, punto y coma, diálogo), *solo* y la tilde potestativa, adverbios en -mente, y caso de repaso.

Cada regla queda ligada a su saber (LCL.3.B.3.5, LCL.3.D.6 o LCL.3.D.7) y a sus criterios (5.1, 9.1 y 9.2, con `.a` para 5.º y `.b` para 6.º).

## 6. Datos y evaluación

```text
reglas/<id>.json  → { id, nombre, curso, saber, criterios[], ficha, ejemplos[], contraejemplos[] }
banco/<id>.json   → palabras y frases correctas, con su forma errónea típica: [{ ok:"camión", mal:"camion" }, ...]
casos/<id>.json   → { id, titulo, regla(s), escenas:[{ tipo, texto, errores:[...] }], careo, candado, expediente }
```

- Por intento se registra: alumno, caso, regla, criterio, palabra, acierto o fallo, pistas usadas y fecha.
- Nota por criterio de 1 a 10 con su equivalente IN/SU/BI/NT/SB. Mismo peso dentro de cada competencia salvo que el centro diga otra cosa.
- **Séneca:** queda pendiente investigar si se pueden importar notas o hay que meterlas a mano, y en qué formato. Mientras tanto, CSV por criterio, ya preparado para ese paso.
- Perfiles, XP y sincronización: se reutiliza el patrón de Multiplicópolis con `app: "detective"` en el backend. Si ambos juegos lo necesitan, ese código se extraerá a `shared/`.

## 7. Técnica

- JS vanilla + DOM/CSS/SVG, sin build, con el contenido en JSON. Funciona en GitHub Pages, en tablets y en PCs modestos.
- Diálogos ramificados con **inkjs** (≈31 KB comprimido, copiado al repo) cuando hagan falta. En la v1 basta con diálogos lineales.
- Phaser solo si la fase 3 necesita sprites animados o cámara. Habría que probarlo antes en los equipos del cole.

## 8. Prototipo (siguiente paso)

**Un caso completo**: "Tilde en agudas, llanas y esdrújulas". Lleva 1 aviso, 1 reto "descubre la regla", 3 escenas (caza del error, clasifica y contar para la cifra), 1 careo, el candado, "revisa el expediente" y el informe. Va con un perfil local, sin backend, y con arte provisional: emojis y CSS, hasta la fase 3.

## 9. Decisiones que necesito de Pablo

1. Identidad: A, B, C o una idea propia.
2. ¿Validas el mapa de contenidos de 5.º y 6.º o lo ajustamos a la programación del centro o al libro de texto que uséis?
3. ¿Jugarán individualmente, por parejas (el original tenía dos roles) o en las dos modalidades?
