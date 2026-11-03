# Agencia La Lupa

Juego de detectives de Lengua para 5.º y 6.º de Primaria (Andalucía). El alumno es detective del equipo de la agencia, junto a Lola y Mateo, con la directora Robles al frente, en el barrio ficticio de La Alameda. Cada caso trabaja una o varias reglas: encontrar y corregir faltas hace avanzar la investigación. Modo individual.

- **Lee primero `PLAN.md`**: fases, estado y decisiones.
- **Referencia de experiencia:** `docs/investigacion/sherlock-ort-experiencia.md`. Describe cómo se vive Sherlock Ort al jugarlo: escenas a pantalla completa, ritmo lento, retos dentro de la imagen. La v1 de este juego fracasó por no tenerlo en cuenta.
- `DISEÑO.md` resume la investigación didáctica y curricular.
- Identidad propia: no se copia nada de Sherlock Ort (nombre, personajes, textos, imágenes ni listas de palabras). Solo se toma la idea de la mecánica.

## Ficheros

| Fichero | Qué es |
|---|---|
| `motor.js` | Escenario 16:9 de 1280×720 escalado a la pantalla, arte (o hueco marcado), texto que se escribe solo, HUD (libreta, archivo, lupa de pistas), ventanas, pantallas de «¡Pista conseguida!» / «¡Pista falsa!», registro y notas, palabras pulsables |
| `escenas.js` | `ESCENAS.<tipo>`: una función por tipo de escena |
| `app.js` | Entrada, tablón de corcho, partida, informe, zona maestro/a (página normal) y arranque |
| `styles.css` | Todo en px del escenario de 1280×720. Mundo visual único: papel envejecido, tinta, albero y azulejo |
| `datos/programacion.json` | **Qué caso va en qué curso, trimestre y orden.** Es lo único que se cambia para adaptarse a una programación |
| `datos/reglas.json` | Reglas: nombre, saberes, criterios, ficha del Archivo de Mateo y cartas de los careos |
| `datos/arte.json` | Catálogo de arte con su prompt. `_estilo` es el estilo común. `listo` (o `listas`, para las expresiones) cuando la imagen existe |
| `datos/casos/<id>.json` | Un caso: `numero`, `titulo`, `resumen`, `reglas` y `escenas[]` |
| `arte/` | Imágenes `.webp` (aún no existe). Fondos y objetos: `<id>.webp`; personajes: `<id>-<expresion>.webp` |

## Tipos de escena

Campos comunes: `fondo`, `personaje {id, expresion, lado: izq|der}`, `objeto`, `titulo`, `instruccion`, `quien`, `pistas[]`.
Marcado de faltas: `{mal|bien}`; en los careos, `{mal|bien|carta}`. Las faltas de `texto` e `intro` se repasan después en `expediente`.

| Tipo | Campos propios | Evalúa |
|---|---|---|
| `portada` | (usa número, título y resumen del caso) Precinto que hay que romper | — |
| `relato` | `texto` (se escribe solo; la flecha aparece al terminar) | — |
| `descubre` | `preguntas[{grupos, pregunta, opciones, correcta, explicacion}]`, `desbloquea:"cartas"` | 9.1 |
| `papeles` | `palabras[]` correctas, `faltas[{mal,bien}]`, `frase` con `{0}…`: las correcciones rellenan la pista | 9.2 + 5.1 |
| `hipotesis` | `opciones[]`, `correcta`, `acierto`, `fallo` | — |
| `clasifica` | `categorias[]`, `palabras[{p, cat, silabas}]` | 9.1 |
| `manchas` | `palabras[{p, pos (índice de la vocal tapada), silabas}]` | 5.1 |
| `careo` | `declaracion` con `{mal|bien|carta}` | 9.2 + 9.1 + 5.1 |
| `candado` | `codigo` (cifras de las `recompensa.digito`, en orden), `exito` | — |
| `expediente` | — (recoge las faltas sembradas antes) | 9.2 + 5.1 |
| `final` | `texto` → informe | — |

Los retos con `recompensa {texto, digito}` muestran «¡Pista conseguida!» y guardan la cifra en la libreta.
Notas: solo cuenta el primer intento. Nota = aciertos / intentos × 10 (mínimo 1), escala IN/SU/BI/NT/SB, código del criterio con `.a` (5.º) o `.b` (6.º).

## Cómo crear un caso nuevo (borrador; se consolida cuando Pablo dé por bueno el caso 1)

1. **Regla y unidad**: elige la unidad de `programacion.json` y sus reglas. Si la regla no tiene `ficha` ni `cartas` en `reglas.json`, escríbelas.
2. **Historia**: un misterio pequeño en un lugar del barrio, con 3 o 4 sospechosos o testigos y un objeto protagonista. La solución sale de las palabras corregidas.
3. **Escenas**: copia la estructura del caso 1: portada → aviso → descubre → 2-3 lugares (relato + reto con cifra) → hipótesis → careo → candado → expediente → final. Pon 2-4 faltas por texto y siembra 3-5 en los relatos para el expediente.
4. **Arte**: añade a `arte.json` los fondos, personajes (con expresiones) y objetos nuevos, con su `prompt`. Reutiliza siempre Lola, Mateo, Robles y la oficina.
5. **Prueba**: juega el caso entero en el navegador (Playwright) con aciertos y fallos. Revisa capturas de cada escena y comprueba las notas del informe.
6. **Revisión de Pablo** antes de darlo por cerrado.

## Probar

`node .claude/serve.js` → `http://localhost:4321/apps/la-lupa/`.

## Pendiente / conocido

- Todo el arte son huecos marcados: faltan las imágenes, que se generarán con Gemini o ChatGPT a partir de `arte.json`.
- Los datos se guardan solo en `localStorage`. La zona del maestro/a no tiene PIN. No hay sincronización con el backend.
