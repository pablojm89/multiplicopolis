# Sonido de Agencia La Lupa

Pedido de Pablo (4/11): «un hilo musical de ambiente, misterioso, que vaya cambiando según el contexto; sonidos de fondo recurrentes, como de pasos, para darle misterio; clic cuando se abren las cerraduras, puertas… un efecto de sonido que tenga sentido con lo que hay en cada momento».

## Cómo está hecho

- **Motor común:** `shared/sonido.js`. Todo se sintetiza con Web Audio: no hay archivos de audio, ni licencias, ni peso. API en `shared/README.md`.
- **Integración:** `apps/la-lupa/sonido.js`, que se carga después de `app.js`. **No toca el resto del código**:
  - envuelve funciones globales del motor (`pintarEscena`, `maquina`, `momento`, `abrirModal`, `cerrarModal`, `verLibreta`, `verArchivo`, `pedirPista`, `sellar`, `vistaInicio`, `vistaTablon`, `vistaPatio`, `vistaInforme`, `vistaMaestro`, `iniciarCaso`, `iniciarEncargo`, `vistaEncargos`);
  - escucha con un `MutationObserver` las clases que ya ponen las escenas y salas (`falsa`, `sospechosa`, `resuelta`, `mal`, `sacude`, `roto`, `aprobada`, `rodeada`, `borrando`, `ter-destello`…);
  - escucha clics y teclas del escenario.
  Si una escena nueva usa esas mismas clases, suena sola. Cualquier error de sonido se captura: nunca rompe el juego.
- **Prioridad:** en un mismo instante solo suena el efecto más importante (un botón cede ante un fallo, un fallo ante una pista conseguida). Durante 450 ms después de un momento grande no suena nada pequeño encima.
- **Botón 🔊** abajo a la izquierda: volumen de música y de efectos, y «Silenciar todo». Se guarda por dispositivo (`la-lupa-sonido`).
- **Silencio automático:** en la zona del maestro, en la Centralita (para el dictado), con `?silencio` y con el jugador automático (Playwright). Para probar con sonido: `?sonido`.
- **Voz:** mientras `speechSynthesis` habla (Centralita, fichas, sismógrafo), la música se aparta sola.
- **Pestaña oculta:** el audio se suspende.
- **Laboratorio:** `shared/laboratorio-sonido.html` sirve para escuchar y votar cada música, fondo y efecto. Pablo tiene una copia publicada como Artifact.

## Lugar → música y fondo

La tabla está en `LUGARES`, dentro de `sonido.js`. El ambiente se decide en cada `pintarEscena` y solo hace fundido si cambia. Estos modificadores mandan sobre el lugar:

- `careo`, `candado` o el Tachón en escena → música `tension`.
- `final` e informe → `triunfo`.
- Entrada → `noche` + `calle`.

| Música | Lugares |
|---|---|
| `agencia` (jazz de cine negro) | agencia, tablón, radio-alameda, redaccion-eco, imprenta-eco |
| `noche` (colchón y celesta) | fachada, kiosco, feria-apagada, caseta, casa-feria, biblioteca, conserjería, mercado, centro-vecinal, estudio-fotos, agencia-saboteada |
| `amanecer` (suave) | calle-alameda, panadería, floristería, taller, plaza-azulejos, azotea-radio |
| `feria` (vals de caja de música) | plaza-feria |
| `tension` | almacen-mercado, sala de Interrogatorios + modificadores |
| `academia` (pizzicato) | patio y salas de la Academia |
| — (silencio) | sala-centralita |

Fondos: `agencia` (lluvia en la ventana, reloj, pasos, máquina lejana), `calle` (viento, pasos, búho, campanario), `mercado` (murmullo), `feria`, `interior`, `radio`, `imprenta`, `patio` (pájaros), `lluvia`, `oficina` y `tension`.

## Efectos que ya suenan

| Momento | Efecto | Enganche |
|---|---|---|
| Texto que se escribe solo | `tecleo` / `espacio` y `retorno` (ding) al acabar | envoltura de `maquina` (motor.js:101) |
| Romper el precinto / abrir el expediente | `precinto` / `expediente` | clase `roto` / clic en `#abrir` de la portada |
| Palabra con falta / bien escrita | `falta-encontrada` / `falsa-alarma` | clases `sospechosa` / `falsa` |
| Corrección, opción, cubo… bien o mal | `acierto` / `fallo` | clases `resuelta`, `bien`, `buena`, `acierto`, `arreglada`, `corregido` / `mal`, `error`, `sacude` |
| ¡Pista conseguida! / ¡Pista falsa! | `pista-conseguida` / `pista-falsa` | `momento` por título o tipo |
| Ruedas del candado / no se abre / ¡Clic! | `candado-girar` / `candado-error` / `candado-abrir` | `input` en `.rueda` / `sacude` en `.panel-candado` / `momento` |
| Ventana de cartas / elegir carta | `cartas-barajar` / `carta` | `abrirModal` / clic en `.carta` |
| ¡Declaración aclarada! | `revelacion` | `momento` |
| Otros momentos de acierto | `subir`; en la Academia, `entrenamiento` | `momento` |
| Libreta / Archivo de Mateo / lupa de pistas | `pagina` / `cajon` / `lupa` | envolturas |
| Abrir y cerrar ventanas | `ventana` / `ventana-cerrar` | `abrirModal` / `cerrarModal` |
| Sello del final / sello del director / informe | `sello` / `sello` / `caso-resuelto` | `.sello-resuelto` al aparecer / `sellar` / `vistaInforme` |
| Cambio de lugar en un caso | `pasos` (3 pasos) | cambio de `fondo` |
| Entrar o salir de una sala, entrar en la agencia | `puerta-abrir` | cambio de `fondo` |
| Salir al inicio | `puerta-cerrar` | `vistaInicio` |
| Cualquier otro botón | `boton` (el de menos prioridad) | clic |
| Escribir en un cuadro de texto | `tecla`; en la Terminal, `ter-tecleo` | `keydown` |
| Pizarra: rodear, tachar, borrar | `tiza`, `tachar`, `borrador` | clases `rodeada`, `tachada`, `borrando` |
| Terminal: correcto o error | `ter-ok` / `ter-error` | clases `ter-destello` / `ter-fallo` |
| Imprenta: marca, aprobar, imprimir | `lapiz` / `sello` / `rotativa` | `.imp-marca` / `aprobada` / `.imp-rotativa` |
| Centralita: emitir | `radio` | clase `emitiendo` |

## Catálogo de puntos pendientes

Viene del repaso completo del código del 4/11, con fichero:línea de entonces.

1. **Candado según el objeto** (`escenas.js:344`, `e.objeto`):
   - `caja-musica` → melodía de caja de música;
   - `cuadro-electrico` → palanca + zumbido + luces de la feria;
   - `cuadro-rotativa` → arranca la rotativa;
   - `grabadora` → cinta que rebobina;
   - el resto → bisagra.
2. **Tecleo de la pantalla de la Terminal**: `teclear()`, `terminal.js:204`, va a unos 300 caracteres por segundo y es una función interna. Hay que enganchar `ter-tecleo` limitado. También:
   - `crt-encender` en el arranque de la BIOS (`terminal.js:289`);
   - `dial-giro` en `mover` (`232`);
   - `salto-temporal` en los viajes en el tiempo (`329-338`).
3. **Télex de la Centralita** (`centralita.js:272`, cada 55 ms) → `telex` por palabra. Además:
   - aguja del dial (`181`) → barrido de radio;
   - modo radio o relámpago (`187`) → `interruptor`;
   - `cenParar` (`107`) debe cortar los efectos pendientes.
4. **Caza según el objeto**: periódico, sobre, nota (`escenas.js:143`).
5. **Clasifica según `e.contador`**: «Ramo» → hojas; «Azulejo» → cerámica (`escenas.js:202`).
6. **Leitmotiv del villano** (El Tachón), distinto de la tensión general.
7. **Más fondos** según la ilustración:
   - fuente (plaza de azulejos);
   - grillos (kiosco, patio de noche);
   - horno (panadería, taller);
   - torno;
   - goteo (estudio de fotos, archivo);
   - zumbido de fluorescentes (mercado);
   - teléfono (redacción).
8. **Ajuste del aula** en la zona del maestro (`app.js:201-206`): sonido sí o no y volumen por defecto para toda la clase. Hace falta tocar `app.js`.
9. **Movimiento reducido**: hoy no hay tecleo (no se anima el texto). Faltaría acortar los sonidos que van con animaciones: precinto, borrador, rotativa.

## Decisiones pendientes de Pablo

- Escuchar el laboratorio y votar 👍/👎 cada música, fondo y efecto.
- Volumen por defecto en clase (ahora: música 40 %, efectos 80 %). ¿Empieza en silencio en el aula?
- ¿Música o silencio en la sala de Interrogatorios (ahora, tensión)?
