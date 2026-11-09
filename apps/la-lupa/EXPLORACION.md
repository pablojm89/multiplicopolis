# Exploración: que cada pantalla esconda algo

> Plan del 9/11/2026, pedido por Pablo: «ese punto que tenían las aventuras gráficas antiguas, tipo Monkey Island, de pasar el ratón por todo porque siempre había algo que descubrir». **Pendiente de sus decisiones** (al final). Nada de esto está todavía en el juego.
> Prueba jugable (la oficina de la agencia, con 26 zonas): https://claude.ai/artifact/STqGPLNLq8qUDzapsa9mZt. El código de esa prueba está en la bitácora de la sesión, no en el repo; sirve de semilla para `explorar.js`.

## La idea

Los fondos del juego son ricos (la oficina tiene una lámpara, un tablón con fotos, seis cajones, una ventana con lluvia…), pero hoy son un decorado. La propuesta es que se puedan **registrar**: tocar un objeto da un comentario, una palabra, una falta escondida, un secreto o una broma. Sin estorbar a la clase y sin tocar las notas.

## Qué se puede encontrar

| Tipo | Qué es | Para qué sirve |
|---|---|---|
| `comentario` | Lola, Mateo o Bruno dicen algo sobre el objeto | Da vida al equipo. Humor |
| `palabra` | Una palabra del lugar con su definición y, a veces, su origen (azahar, azulejo, reja, pesquisa) | Vocabulario. Va al glosario del alumno |
| `falta` | Un cartel, una lista o una nota con una falta que hay que cazar | Ortografía fuera del examen, de la regla del caso |
| `accion` | El objeto hace algo: la lámpara se apaga, un cajón se abre, la radio suena | El escenario responde |
| `secreto` | Algo que solo se consigue encadenando pasos: una llave que abre un cajón, una nota que solo se lee a oscuras | El placer de la aventura gráfica |
| `salamanquesa` | Una escondida en cada lugar | Colección de largo recorrido |
| `trama` | Un detalle que adelanta el misterio de la temporada | Premia la atención. Juego limpio |
| `guino` | Una broma sin más | Sonreír |

## Reglas

- **Cuándo se explora.** En los relatos de cada caso, un botón «Mirar» aparta el diálogo y el personaje y deja la escena libre. Fuera de los casos, en un paseo por el barrio (fase 3). En mitad de un reto, no.
- **Qué se gana.** Un **álbum** por alumno: lo encontrado en cada lugar, el glosario y las salamanquesas. No da nota. Opcional: unos pocos puntos de rango con tope diario.
- **Sin ratón.** En tablet no hay cursor que pasar por encima. Un botón de pista hace brillar un momento lo que falta por tocar. En ordenador, el cursor cambia sobre las zonas y aparece abajo una línea «Mirar la lámpara», como en las aventuras clásicas.
- **El maestro decide.** `ajustes.exploracion`: `siempre` (por defecto), `paseo` (solo fuera de los casos) o `no`. En la zona del maestro se ve cuánto ha curioseado cada alumno.
- **Todo es lengua.** Los textos se revisan con el mismo cuidado que los casos. Vocabulario, cultura andaluza (criterios 1.3 y 8.3) y ortografía.
- **Sin sonido obligatorio.** Los objetos que suenan funcionan también en silencio.

## Datos

Un archivo por lugar: `datos/lugares/<fondo>.json`. Las zonas van en px del escenario de 1280×720, igual que el resto del juego.

```json
{
  "fondo": "agencia",
  "nombre": "La oficina de la agencia",
  "zonas": [
    { "id": "cafe", "nombre": "el café", "zona": [215, 285, 70, 92], "tipo": "guino",
      "quien": "mateo", "texto": ["Es el café del director. Lleva ahí desde las ocho.", "Sigue frío. Sigue ahí."] },
    { "id": "naranjo", "nombre": "el naranjo", "zona": [45, 20, 150, 120], "tipo": "palabra",
      "palabra": "azahar", "definicion": "La flor blanca del naranjo. En primavera, todo el barrio huele a azahar." },
    { "id": "libreta", "nombre": "la libreta abierta", "zona": [158, 368, 142, 55], "tipo": "falta",
      "titulo": "La lista del director", "texto": "café, bolígrafos y una {vombilla|bombilla|b-v-1} para la lámpara" },
    { "id": "lampara", "nombre": "la lámpara", "zona": [55, 198, 165, 190], "tipo": "accion",
      "accion": "luz", "texto": { "apagar": "¿Quién ha apagado la luz?", "encender": "Así mejor." } },
    { "id": "lapices", "nombre": "el bote de lápices", "zona": [12, 308, 52, 88], "tipo": "secreto",
      "da": "llavecita", "texto": "Entre los lápices hay una llavecita dorada." },
    { "id": "cajon3", "nombre": "un cajón con cerradura", "zona": [1062, 278, 74, 80], "tipo": "secreto",
      "requiere": "llavecita", "cerrado": "Está cerrado con llave.", "texto": "Dentro hay una ficha escrita con tinta azul…" },
    { "id": "foto-fortaleza", "nombre": "la foto de la fortaleza", "zona": [923, 188, 126, 94], "tipo": "trama",
      "desde": "5-10", "quien": "lola", "texto": "Eso no es La Alameda. ¿Quién ha puesto aquí esta foto?" }
  ]
}
```

- `texto` puede ser una lista: cada vez que se toca, dice la siguiente frase.
- `desde` y `hasta` (ids de unidad): la zona solo existe a partir de un caso resuelto o hasta él. Así el tablón de la agencia cambia a lo largo de la temporada.
- `caso`: variante que solo vale dentro de un caso concreto.
- `requiere` y `da`: objetos del inventario de curiosidades, que es por alumno y vale entre lugares.
- El marcado de las faltas es el mismo de los casos, `{mal|bien|regla}`.
- Los 33 fondos se repiten en casos y encargos, así que cada lugar se escribe una vez.

**Estado por alumno** (`lalupa-curiosidades-<perfilId>`): zonas vistas por lugar, inventario, glosario y salamanquesas. Entra en la copia de seguridad y en la instantánea de la nube.

## Piezas de código

| Pieza | Qué hace |
|---|---|
| `explorar.js` | Se engancha a `pintarEscena` como `sonido.js`, sin tocar las escenas. Pinta la capa de zonas, el botón «Mirar», la línea de «Mirar…», la pista y los tipos de hallazgo |
| Álbum | Vista nueva desde el tablón: lugares con «7 de 12», glosario y salamanquesas |
| Editor de zonas | `?zonas=<fondo>`: se dibuja el rectángulo sobre el fondo y se copia el JSON. También enseña las zonas ya hechas para revisarlas con capturas |
| `herramientas/validar_lugares.py` | Zonas dentro de la imagen, ids únicos, secretos que se pueden completar, faltas con su regla, textos con las comillas y los signos correctos |
| Zona del maestro | El ajuste y una columna de «curiosidades» por alumno |
| Jugador automático | No toca las zonas, pero comprueba que la capa no tapa ningún botón de los retos |

## Fases

0. **La prueba.** La oficina de la agencia en un Artifact, para decidir tono y reglas. *Hecho.*
1. **El motor y ocho lugares.** `explorar.js`, álbum, ajuste, editor y validador. Lugares: agencia, fachada, calle, plaza de la feria, panadería, mercado, biblioteca y patio de la Academia. Unas 60 zonas. Se puede jugar el caso 1 entero explorando.
2. **Todo el barrio.** Los 33 lugares, las 33 salamanquesas, el glosario y una falta escondida por lugar, de la regla del caso que pasa allí. Unas 200 zonas. Arte: la salamanquesa en tres posturas (issue para GPT).
3. **El paseo y los secretos largos.** Un mapa de La Alameda que se abre con los casos, vecinos que entregan los encargos en persona (hoy salen de un buzón) y dos o tres secretos que cruzan la temporada. Arte: el mapa.
4. **La temporada 2.** Cada ciudad con sus zonas: monumentos, palabras y costumbres de la provincia. Las pistas de la Tilde Azul (el pañuelo, la pluma, la maleta con «V. A.») escondidas en los escenarios. Se escribe a la vez que los casos de 6.º.

Las zonas de cada lugar se pueden escribir con subagentes en paralelo (uno por grupo de fondos), con el editor para comprobar las coordenadas y un corrector al final, como se hizo con los casos.

## Arte encargado (lote 8, 9/11/2026)

| Para qué | Imágenes |
|---|---|
| La mascota escondida | `salamanquesa-recta`, `salamanquesa-curva`, `salamanquesa-asomada` (vistas desde arriba, para pegarlas en las paredes de cualquier fondo) y `salamanquesa-retrato` (para el álbum) |
| El paseo por el barrio (fase 3) | `mapa-alameda`: mapa ilustrado con quince edificios separados. Las zonas tocables se marcan cuando llegue |
| El álbum | `album-abierto`: páginas vacías vistas desde arriba |
| Secretos de la oficina | `llavecita` y `ficha-tinta-azul` |
| Mi mesa (idea) | `mesa-detective`: mesa casi vacía vista desde arriba |
| Insignias (idea) | ocho `insignia-…` con el mismo aro y un símbolo distinto |

En el mismo lote van mejoras de lo que ya existe: las cuatro lupas de nivel de la Academia (`lupa-bronce`, `lupa-plata`, `lupa-oro`, `lupa-diamante`, hoy emojis), las cinco placas de rango (`rango-1` a `rango-5`), el icono de la app (`icono-app`) y el objeto que le faltaba al encargo 4 (`azulejos-parejas`).

## Más ideas para que apetezca

| Idea | Qué aporta | Coste |
|---|---|---|
| Escenarios vivos: lluvia, farolillos que parpadean, vapor, luciérnagas | El barrio deja de ser una foto | Bajo |
| «Anteriormente, en La Lupa…» al empezar cada caso | Hilo de serie y comprensión lectora | Bajo |
| Transiciones entre escenas, como en el cine negro | Ritmo | Bajo |
| Letra y tamaño a elegir, con una letra pensada para dislexia | Llega a quien más le cuesta leer | Bajo |
| Mi mesa: el alumno coloca en su mesa lo que encuentra | Un motivo para coleccionar | Medio |
| Insignias por hitos | Metas cortas | Medio |
| La falta del día en el tablón | Un motivo para entrar a diario | Medio |

## Decisiones de Pablo

1. **Cuándo se explora.** Propuesta: «Mirar» en los relatos y paseo libre. Alternativa: solo en el paseo.
2. **Qué se gana.** Propuesta: álbum y glosario, sin nota ni puntos. Alternativa: puntos de rango con tope.
3. **La mascota escondida.** Propuesta: la salamanquesa. Alternativas: un gato, un vencejo.
4. **El tono.** Cuánto humor y cuántos guiños de moda. En la prueba, humor suave y ninguno de moda.
