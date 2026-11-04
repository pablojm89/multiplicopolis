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
- [x] **Libreta de papel** como herramienta central (`LIBRETA.md`): modo papel o digital, momentos «¡Apúntalo!» (escena `apunta`), sello de la directora con rúbrica y código (opción B: premia, no bloquea), puntos y rangos
- [ ] Plantilla imprimible de la libreta
- [x] **Piloto «La prueba de acceso»** (`caso-00`): evaluación inicial de las 9 reglas de 5.º, debut de Bruno y El Tachón, informe con el punto de partida y tabla de evaluación inicial en la zona del maestro. Arte del lote 3 integrado (issue #2)
- [x] Gancho de El Tachón al final del caso 1
- [ ] **Trama de temporada**: pasar los ganchos a `datos/temporada-1.json` por número de episodio (`TEMPORADA-1.md`)
- [ ] Caso 2 (b/v) con El Tachón
- [ ] Pablo prueba la v2 y la da por buena → **consolidar el procedimiento para crear casos** (`CLAUDE.md` § Cómo crear un caso nuevo)
- [ ] Más casos de 5.º según `datos/programacion.json`

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
| 2026-11-04 | Libreta: el sello de la directora **premia sin bloquear** (opción B de `LIBRETA.md`). |
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
