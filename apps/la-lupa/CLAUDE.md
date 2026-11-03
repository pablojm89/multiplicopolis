# Agencia La Lupa

Juego de detectives de Lengua para 5.º y 6.º de Primaria (Andalucía). El alumnado forma parte del equipo de la agencia (con Lola y Mateo; la directora es Robles), en el barrio ficticio de La Alameda. Cada caso trabaja una o varias reglas: detectar y corregir faltas hace avanzar la investigación. Modo individual. En la fase 3 se convertirá en aventura gráfica.

- **Lee primero `PLAN.md`**: fases, estado y decisiones.
- `DISEÑO.md` resume las investigaciones de `docs/investigacion/`. Normalmente basta con él; no hace falta leer los documentos completos.
- Identidad propia: no se copia nada de "Sherlock Ort" (nombre, personajes, textos, imágenes ni listas de palabras). Solo se usa la idea de la mecánica.

## Ficheros

| Fichero | Qué es |
|---|---|
| `app.js` | Motor genérico, sin textos de casos. Secciones: Utilidades → Estado → Marcado de faltas → Registro y notas → Pantallas → Componentes → Pasos (`PASOS.<tipo>`) → Arranque |
| `datos/programacion.json` | **Qué caso va en qué curso, trimestre y orden.** Es lo único que se cambia para adaptarse a otra programación |
| `datos/reglas.json` | Catálogo de reglas: nombre, saberes, criterios, ficha del "Archivo de Mateo" y cartas para los careos |
| `datos/casos/<id>.json` | Un caso: título, reglas y lista de `pasos` |
| `index.html`, `styles.css` | Estructura y estilo (paleta albero/azulejo; arte provisional con emojis) |

## Cómo escribir un caso

Marcado de faltas dentro de los textos: `{mal|bien}`, y en los careos `{mal|bien|carta}`. Las faltas que aparecen en los campos `texto` e `intro` se repasan después en el paso `expediente`.

Tipos de paso (`tipo`) y lo que evalúa cada uno:

| Tipo | Campos | Criterio |
|---|---|---|
| `narracion` | quien, emoji, texto, boton | — |
| `descubre` | preguntas[{grupos, pregunta, opciones, correcta, explicacion}], desbloquea:"cartas" | 9.1 |
| `caza` | declaracion con faltas, recompensa{texto, digito} | 9.2 (detectar) + 5.1 (escribir) |
| `clasifica` | categorias[], palabras[{p, cat, silabas}], recompensa | 9.1 |
| `manchas` | palabras[{p, pos (índice de la vocal tapada), silabas}], recompensa | 5.1 |
| `careo` | declaracion con `{mal|bien|carta}` | 9.1 (carta) + 9.2 + 5.1 |
| `candado` | codigo (cifras de las recompensas, en orden), exito | — |
| `expediente` | intro | 9.2 + 5.1 |

Todos los pasos admiten `intro`, `lugar` y `pistas[]` (de vaga a concreta).
Solo cuenta el primer intento de cada elemento. La nota de cada criterio es aciertos / intentos × 10 (mínimo 1), con la escala IN/SU/BI/NT/SB. El código del criterio lleva `.a` en 5.º y `.b` en 6.º.

## Adaptar a la programación de un libro de texto

1. Reescribe `datos/programacion.json`: unidades por curso con su `trimestre`, `titulo`, `reglas` y, si existe, `caso`.
2. Las reglas nuevas se añaden a `reglas.json`. Las unidades sin caso aparecen como "Próximamente".
3. Haz una lista de las reglas que se han quedado sin caso: es el trabajo pendiente.

## Probar

`node .claude/serve.js` → `http://localhost:4321/apps/la-lupa/`. Con Playwright se puede jugar un caso entero (en las sesiones en la nube ya está instalado).

## Pendiente / conocido

- Los datos se guardan solo en `localStorage` del dispositivo. La zona del maestro/a no tiene PIN y no hay sincronización con el backend.
- El arte es provisional: emojis y CSS (fase 3).
