# La libreta del detective (papel + juego)

> Propuesta del 4/11/2026, pendiente del visto bueno de Pablo. Sale de cómo lo hacía Sherlock Ort (`docs/investigacion/sherlock-ort.md` §3.1) y de la crítica de Pablo: la gracia era que **los niños investigaran con su propia libreta**.

## Resumen

La libreta de papel es la herramienta principal del detective, no un extra. El juego **no apunta las pistas por el alumno**: le pide que lo haga él en su libreta, y sin esas notas no se resuelve el caso. Al cerrar cada caso, el alumno escribe en la libreta su informe y la regla con sus palabras. El maestro (el «director Robles» en la ficción) lo revisa, lo sella y lo puntúa. Esa nota entra en el cuaderno del maestro junto a la del juego, como evidencia escrita para los criterios 5.1 y 9.1.

## Lo que hacía Sherlock Ort (y lo que no se sabe)

- El alumnado anotaba en su cuaderno **pistas, claves y soluciones**; sin apuntarlas no avanzaba.
- Al final de cada episodio buscaba las faltas sembradas en la historia, las **escribía bien en el cuaderno** y se lo presentaba al docente («inspector jefe») para completar el «informe de la misión».
- El cuaderno daba **puntos** para subir de rango hasta el nivel máximo de detective.
- **No está publicado**: la plantilla del cuaderno, la tabla de puntos ni la rúbrica. Lo nuestro es diseño propio.

## Cómo lo integramos

### 1. Modo libreta de papel (por defecto en clase)
- El juego **no guarda las cifras ni las pistas**: aparece un momento «📓 ¡Apúntalo en tu libreta!» y el dato se ve solo en ese momento (el alumno puede volver a verlo si lo pide, y queda registrado).
- El candado final, los sospechosos y la conclusión dependen de lo que el alumno haya apuntado.
- La libreta digital del juego queda como **modo digital**: lo activa el maestro para casa, para alumnado con necesidades específicas o para quien haya olvidado la libreta.

### 2. Momentos de libreta dentro de cada caso
| Momento | Qué apunta el alumno | Para qué sirve |
|---|---|---|
| Al abrir el expediente | Número y título del caso, fecha, lugar | Ritual de inicio |
| Descubre la regla | **La regla con sus propias palabras + un ejemplo y un contraejemplo propios** | Criterio 9.1 (formular generalizaciones, contraejemplos) |
| Cada reto superado | La cifra o pista conseguida | La necesitará para el candado |
| Testigos y sospechosos | Nombre y una frase de lo que dijo | Deducción y comprensión |
| Palabras corregidas | Cada palabra **bien escrita** y la regla que la explica | Escribir de memoria fija la forma correcta |
| Cierre del caso | **Informe para el director**: 3-5 líneas contando quién, qué y por qué, sin faltas | Criterio 5.1 (producción escrita real) |

### 3. Plantilla propia de la libreta (imprimible)
Una portada y una doble página por caso, para pegar en la libreta del alumno o usar como cuadernillo:
- **Portada**: «Libreta de detective · Agencia La Lupa», con nombre, número de placa, curso y huella o dibujo.
- **Doble página del caso**: expediente (n.º, lugar, fecha), testigos y sospechosos, pistas y cifras, palabras corregidas + regla, «la regla con mis palabras», conclusión e informe, y un hueco para el **sello del director**.
- **Hecho:** `imprimibles/libreta.html` la genera desde los datos de cada caso: los avisos de «apúntalo», los testigos y tantas casillas como cifras tenga el candado (vacías: las cifras nunca se imprimen). Se abre desde la zona del maestro («Imprimibles»), para un caso o para toda la temporada con portada.

### 4. El sello del director (puente papel ↔ juego)
- Al terminar un caso, el juego dice: «Enseña tu libreta al director Robles para que selle el expediente».
- El maestro revisa la libreta y lo puntúa en la zona del maestro con una **rúbrica rápida de 4 puntos**: pistas apuntadas, regla formulada, palabras corregidas e informe.
- Opcional: el maestro da un **código de sello** que desbloquea el caso siguiente. Así la libreta forma parte del avance, como en el original.

### 5. Puntos y rangos
- Los puntos salen de **juego + libreta**: resolver retos, pedir pocas pistas y tener la libreta sellada.
- Rangos propios (nombres por decidir; no usar los del original). Por ejemplo: Novato → Agente → Detective → Inspector/a → Detective de élite.
- Aquí encajan los guiños actuales: «+1000 de aura» por resolver sin pistas.

## Decisiones
1. **Decidido (4/11): opción B.** El sello premia (puntos y rango) pero no bloquea el avance. Implementado: el maestro sella en el dispositivo del alumno con la rúbrica de 4 puntos y el código de sello.
2. ¿Libreta propia del alumno o cuadernillo impreso con nuestra plantilla?
3. Nombres de los rangos.
