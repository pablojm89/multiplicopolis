# Pasar las notas por criterio de La Lupa al cuaderno de Séneca

## Resumen

**Hoy no hay ninguna forma oficial de importar un archivo (CSV, Excel o XML) al cuaderno de Séneca, ni una API pública.** La única vía oficial que lleva notas de otra herramienta al cuaderno es **Moodle Centros**: exporta las notas del calificador a los criterios de una actividad «no diaria» que antes se ha creado en Séneca. Las extensiones de navegador de otros docentes (AutoNotas Séneca, Séneca Fácil…) ahorran tiempo, pero no son oficiales, y la guía del CTPDA pide usar «exclusivamente aplicaciones corporativas autorizadas». **Lo más realista para Pablo** es una exportación «para Séneca»: una tabla por grupo y trimestre, con los alumnos en el orden de Séneca (por número de lista, nunca por nombre real), una columna por criterio y una nota entera de 1 a 10. Además, un botón que copie la columna de un criterio, para pasarla a mano o pegarla. La conexión «automática» solo podría llegar por Moodle Centros, y eso hay que probarlo con una cuenta docente.

Fecha de la investigación: 4/11/2026 (curso 2026-27).

**Cómo leer este documento.** **[C]** = confirmado con una fuente enlazada. **[S]** = suposición o deducción mía. **[?]** = no se ha podido confirmar.
Limitación: desde este entorno, los servidores de la Junta (`juntadeandalucia.es`, `blogsaverroes.juntadeandalucia.es`) devolvían 503 o cortaban la conexión. Varias guías de centros solo se han podido leer **a través del resumen del buscador**, y lo marco como «(vía buscador)». Las páginas de eAprendizaje, la guía de Moodle Centros (edea), la guía del CTPDA, el BOE y las fichas de las extensiones sí se han leído directamente.

---

## 1. El cuaderno de Séneca hoy

### 1.1 Cómo se registran las notas por criterio

- **[C] Estructura.** Hay *categorías* (agrupaciones de actividades, no instrumentos) → *actividades evaluables* → *criterios* asociados a cada actividad. Ruta: *Alumnado › Seguimiento académico › Cuaderno de clase › Actividades evaluables*. Al crear la actividad se eligen curso, evaluación, categoría y los criterios ([guía 25-26 de un IES, vía buscador](https://www.scribd.com/document/923893232/Guia-Cuaderno-Seneca-2526); [Olicasares](https://sites.google.com/g.educaand.es/olicasares/cuaderno-de-clase-de-s%C3%A9neca); [Seritium](https://www.seritium.es/wordpress/index.php/contenidos-sobre-el-cuaderno-de-seneca-lo-basico/)).
- **[C] Una nota por criterio.** Si una actividad tiene varios criterios, «tendremos que poner en cada uno de ellos una calificación» (guía 25-26, vía buscador). En guías más antiguas, la nota de la actividad se copiaba a todos los criterios elegidos ([IES La Laguna, 2019, vía buscador](https://blogsaverroes.juntadeandalucia.es/ieslalaguna/files/2019/11/02_CUADERNO_SENECA.pdf)). Las actividades de tipo *check* (sí/no) no dan nota.
- **[C] Desde 2023 se califica criterio a criterio** y primero hay que pulsar el *indicador de logro* (rúbrica). Docentes en el [foro de USTEA (octubre de 2023)](https://ustealdia.org/foro/index.php?topic=124216.20): «ya no deja calificar criterios masivamente», «me obliga a pulsar primero en el indicador de logro correspondiente». Por eso pasar notas a mano cuesta tanto.
- **[C] Pantalla de calificar.** *Cuaderno › Calificar actividad criterial*, con «guardar y continuar», que pasa al siguiente alumno ([CEIP San José Artesano, vía buscador](https://blogsaverroes.juntadeandalucia.es/ceipsanjoseartesano/proyecto-educativo/cuaderno-seneca-docx/)). **[?]** No he podido comprobar en qué orden aparece el alumnado (es de suponer que por apellidos, como en el resto de Séneca).
- **[C] Cálculo.** Séneca propone la nota del área como **media aritmética de todos los criterios calificados**. Cuando un criterio se califica varias veces, se usa el método que fija la programación (media, última nota o la más alta). La evaluación ordinaria **no** es la media de los trimestres, sino la de todos los criterios del curso. No se pueden ponderar instrumentos ni criterios, y el docente tiene la última palabra ([REA «Evaluación con el cuaderno de Séneca»](https://juanmale14.github.io/REAcuadernov1/preguntas_frecuentes.html)). Todo esto encaja con el art. 10.5 de la Orden de 30/5/2023: los criterios «tendrán el mismo valor» (ver [currículo](curriculo-lengua-tercer-ciclo-andalucia.md)).
- **[C] Uso del cuaderno.** La evaluación criterial es obligatoria. El cuaderno de Séneca, en sí, no lo es, salvo que lo diga el plan de centro (REA citado). Se puede usar en la web o en la app **iSéneca**, aunque se recomienda configurarlo en la web (Olicasares).
- **[C] Lo que viene.** El Decreto 483/2026 anuncia medidas de simplificación en Séneca que se implantarán de forma gradual durante dos años (ver [currículo](curriculo-lengua-tercer-ciclo-andalucia.md), §1). **[?]** No se sabe si traerán importación de notas.

### 1.2 ¿Se pueden importar notas desde un archivo?

- **[C] No he encontrado ninguna función de importación** (CSV, hoja de cálculo ni XML) en el cuaderno: ni en las guías de centros, ni en el REA, ni en los manuales de la Junta. El REA dice que, para el alumnado que llega de otro centro, hay que «introducir manualmente sus calificaciones». El autor del script de 2019 escribe que, mientras Séneca no lo traiga «de serie», hay que «inyectar» código ([andalinux](https://andalinux.wordpress.com/2019/04/23/introducir-las-notas-en-seneca-automaticamente/)). Un usuario de AutoNotas pide en su reseña que Séneca lo haga de forma nativa ([reseñas de Firefox](https://addons.mozilla.org/sk/firefox/addon/autonotas-séneca/reviews)).
- **[C] Séneca sí exporta** algunos listados (p. ej., los datos del claustro a Excel, CSV u ODS, según la [guía Educaand](https://edea.juntadeandalucia.es/bancorecursos/file/49522d2d-e6ce-4001-a25b-d661549c47ef/2/Guia_Educaand.zip/Vision_de_los_datos_esenciales_del_claustro_a_traves_de_una_hoja_de_calculo.pdf), vía buscador) y los informes en PDF. **[?]** Un manual de 2025 menciona que se pueden exportar los criterios a una hoja de cálculo ([IES Huerta del Rosario](https://www.ieshuertadelrosario.com/wp-content/uploads/2025/03/ManualCuadernoSeneca.pdf), vía buscador; no he podido abrirlo). No hay vuelta: no se importa.
- **Conclusión [C+S]:** como no hay importación oficial, **no existe un «formato exacto» de Séneca** (columnas, identificador, separador, codificación) al que adaptar el CSV. Lo que hay que optimizar es el **paso manual** (o el pegado asistido).

---

## 2. Otras vías

### 2.1 API pública

- **[C] No hay API pública de Séneca para calificaciones.** Las integraciones con servicios de la Junta se tramitan con la Oficina Técnica de Interoperabilidad de la Agencia Digital de Andalucía ([manual de solicitud de integración](https://desarrollo.juntadeandalucia.es/sites/default/files/2024-12/OT-I_MAN_Manual%20de%20solicitud%20de%20integraci%C3%B3n_v02r05.pdf), vía buscador). **[S]** Esa vía es para organismos y proveedores con convenio, no para la app de un docente.

### 2.2 Moodle Centros → cuaderno de Séneca (la única vía oficial)

- **[C] Qué hace.** Desde el 10/12/2021, «cualquier calificación en un item o actividad en Moodle puede ser exportada a uno o varios criterios de evaluación» de una actividad **no diaria** creada antes en el cuaderno de Séneca ([eAprendizaje, Junta](https://www.juntadeandalucia.es/educacion/eaprendizaje/exportacion-de-calificaciones-de-moodle-centros-a-criterios-del-cuaderno-de-clase-seneca/)).
- **[C] Requisitos.** El curso de Moodle tiene que haberse creado desde el bloque **«Gestión de Aulas»** (sincronizado con Séneca). En el campo *info item* hay que poner «cuaderno». El tipo de calificación tiene que coincidir con el de la actividad de Séneca (numérica o alfanumérica) (misma fuente). También se puede exportar un ítem a la **nota final** de la evaluación: *info item* «seneca», *Número ID* `1e`/`2e`/`3e`/`fj`/`fs`, escala «Valor», máximo 10, con la convocatoria abierta en Séneca ([guía básica de Moodle Centros 23-24, 6.13](https://edea.juntadeandalucia.es/bancorecursos/file/c45ea16a-740d-4f4d-84ca-3f4cc4966e21/2/Guia_basica_Moodle_Centros23-24.Rol_Docente.zip/613_exportar_notas_del_calificador_a_sneca.html)).
- **[C] Pasos.** *Calificaciones › Exportar › Exportación Séneca / Cuaderno de clase* → se elige la actividad y el alumnado → previsualización (nombre, apellidos y notas) → *Sincronizar* → se escriben el usuario y la contraseña de Séneca en una ventana, válidos 30 minutos. Las notas del alumnado elegido **se sobrescriben** en Séneca. El primer uso obliga a configurar los grupos ([IES Juan Sebastián Elcano](https://blogsaverroes.juntadeandalucia.es/ieselcano/2022/05/17/como-exportar-las-calificaciones-de-moodle-centros-al-cuaderno-de-seneca/), vía buscador; guía 6.13).
- **[C] Alcance.** Moodle Centros está disponible para los centros sostenidos con fondos públicos. Cada docente puede activar sus aulas con su usuario IdEA si su horario está en Séneca (guía básica, introducción). Hay CEIP que lo usan en Primaria ([plan digital de un CEIP, 2020-21](https://blogsaverroes.juntadeandalucia.es/ceiplainmaculada/files/2020/12/Plan-de-Actuacio%CC%81n-Digital-20-21.pdf), vía buscador).
- **[S] Cadena posible para La Lupa:** CSV del juego → **importación de calificaciones en CSV del calificador de Moodle** (función estándar de Moodle, que pide emparejar cada fila con un usuario del curso; [docs.moodle.org](https://docs.moodle.org/es/Importar_calificaciones)) → un ítem de Moodle por criterio, con *info item* «cuaderno» → exportación a la actividad de Séneca. **[?]** No he confirmado que Moodle Centros tenga activada la importación de CSV para el rol docente; su guía no la menciona. Además, emparejar exige el usuario o el correo de Moodle de cada alumno, que son datos identificativos. Esta cadena **no debe meter esos identificadores en el juego**: el emparejamiento se haría dentro de Moodle.

### 2.3 Google Classroom, Microsoft 365, iPASEN e iSéneca

- **[C] No he encontrado ninguna integración** de Classroom con el cuaderno de Séneca. Los docentes trasladan las notas a mano (búsqueda sin resultados oficiales). Google Workspace y Microsoft 365 son plataformas corporativas de la Consejería ([Microsoft 365 Educación](https://www.juntadeandalucia.es/educacion/eaprendizajeservicios-educativos-digitales-2/microsoft365/); [aviso de protección de datos de Google Workspace](https://www.juntadeandalucia.es/protecciondedatos/detalle/627241.html)), pero ninguna de las dos conecta con el cuaderno.
- **[C] iSéneca** es la app del cuaderno, para calificar y pasar lista. **iPASEN** es para las familias. Ninguna importa notas (no aparece nada en las guías).

### 2.4 Herramientas de terceros que usan los docentes

| Herramienta | Qué hace | Datos y estado | Fuente |
|---|---|---|---|
| **AutoNotas Séneca** (Dani García, «El profe de la bata»). Extensión para Chrome y Firefox, v2.8 | En la pantalla *Calificar actividad criterial* se pega un bloque copiado de una hoja de cálculo. Empareja **por nombre del alumno**: la columna de nombres se elige y los que no coinciden se asocian a mano. Asocia los encabezados de columna con los criterios de la actividad. Una columna «*» pone esa nota en todos los criterios que no tienen columna propia | Política del 20/11/2025: no transmite datos y lo guarda en `localStorage` hasta pulsar «Limpiar». Se declara «no oficial». Solo menciona las escalas de la ESO (1-10) y del Bachillerato (0-10). **[?]** No dice si funciona en Primaria | [elprofedelabata.es](https://elprofedelabata.es/autonotas-seneca/) |
| **Séneca Fácil** (Gregorio Gutiérrez del Moral). Unos 9000 usuarios | Oculta criterios y rúbricas, clona notas de criterios y pasa rápido al siguiente alumno | Permiso `storage` y actúa sobre las páginas de Séneca. No es de la Consejería, aunque su descripción hable del «sistema Séneca de la Consejería» | [extscope](https://extscope.org/extension/edgcbhmjccjhjalfhpjihlliddflclbl) |
| **Cuaderno Séneca** (IgniEduTech). v1.1, 23/2/2026, 29 usuarios | Rúbricas propias sobre Séneca: calcula la nota y rellena el campo «en tiempo real» | Muy pocos usuarios y ningún permiso detallado | [Chrome Web Store](https://chromewebstore.google.com/detail/cuaderno-s%C3%A9neca/aelmbinadioegilacakejkegklalpjjb) |
| **Planilúa** (jcmdev) | Cuaderno de escritorio que dice volcar las notas a Séneca «con un solo clic» | Guarda los datos en el ordenador. No explica cómo se comunica con Séneca | [itch.io](https://jcmdev.itch.io/planilua) |
| **Script de consola** (andalinux, 2019) | Se pega código JavaScript en la consola del navegador con Séneca abierto y reparte las notas del portapapeles por las casillas | Antiguo. El propio autor pide revisar a mano el primer alumno, el último y algunos al azar | [andalinux](https://andalinux.wordpress.com/2019/04/23/introducir-las-notas-en-seneca-automaticamente/) |

**Riesgos de estas herramientas:**

- **Legales [C].** No son aplicaciones corporativas. La guía del CTPDA recomienda «emplear exclusivamente aplicaciones corporativas autorizadas en el tratamiento de datos personales» (§4) y dice que el profesorado trata los datos «solo siguiendo instrucciones del responsable del tratamiento» (§10). El decálogo de la AEPD pide que el docente solicite «previamente a su utilización, la autorización del centro» (ver §3).
- **De seguridad [S].** Una extensión que se ejecuta dentro de Séneca puede leer todo lo que ve el docente (los datos de todo su alumnado) y actuar con su sesión. Se actualiza sola, así que una versión futura o una cuenta de desarrollador robada podría cambiar su comportamiento sin aviso. Pegar código en la consola es justo lo que piden los ataques de *self-XSS*: no conviene acostumbrarse a hacerlo.
- **De integridad [S].** Si el emparejamiento por nombre falla o cambia la página de Séneca, una nota puede acabar en otro alumno o en otro criterio. La nota oficial es responsabilidad del docente, así que siempre hay que revisarla.
- **[S] Balance.** AutoNotas es la mejor documentada (política de privacidad clara y sin conexiones externas). Aun así, solo debería usarse **con el visto bueno de la dirección o de la persona delegada de protección de datos (DPD)**, en el ordenador del centro o en un perfil de navegador protegido.

---

## 3. Límites legales y de privacidad

### 3.1 Qué dice la norma [C]

- **LOE, DA 23.ª** ([BOE consolidado](https://www.boe.es/buscar/act.php?id=BOE-A-2006-7899)): los centros pueden recabar los datos «necesarios para el ejercicio de su función educativa», incluido el «desarrollo y resultados de su escolarización». La información «será la estrictamente necesaria para la función docente y orientadora, no pudiendo tratarse con fines diferentes del educativo sin consentimiento expreso». Se aplicarán «normas técnicas y organizativas que garanticen su seguridad y confidencialidad» y el profesorado «quedará sujeto al deber de sigilo». Es la base del art. 6.1.e del RGPD (misión de interés público): **evaluar no necesita el consentimiento de las familias**, pero sí medidas de seguridad.
- **[Guía del CTPDA para centros educativos de Andalucía (2024)](https://www.ctpdandalucia.es/sites/default/files/inline-files/guia-proteccion-datos-centros-educativos-andalucia.pdf):**
  - Ordenadores particulares (§10): «no resulta conveniente tratar datos personales en ordenadores (u otros dispositivos) particulares […] Se deberían usar únicamente recursos facilitados por el centro docente».
  - Plataformas (§15): «Sólo se emplearán aquellas plataformas que hayan sido aprobadas ya sea por la Consejería […] y siguiendo los protocolos de uso establecidos». Para lo que no sea estrictamente educativo hace falta consentimiento.
  - Sacar datos del centro (§10): se recomienda anonimizar o seudonimizar y cifrar.
  - Calificaciones (§12): solo para el propio alumno y su familia.
  - Responsabilidades del profesorado por un mal uso (§10): disciplinaria (art. 77.3 de la LOPDGDD), patrimonial por dolo o culpa grave y, en casos graves, penal.
  - Dudas: se consultan a la **DPD del centro o de la Consejería**.
- **AEPD, informe sobre apps que almacenan datos de alumnos en la nube** ([PDF](https://www.aepd.es/guias/guia-orientaciones-apps-datos-alumnos.pdf); la AEPD lo marca ahora como **«OBSOLETO»**, así que solo sirve de contexto). Dice que los cuadernos de notas son las apps que «más datos personales de los alumnos pueden llegar a tratar» y que los profesores deben pedir la autorización del centro antes de usarlas.
- **Contexto en Andalucía (2026).** El CTPDA apreció seis infracciones de la Consejería por el uso de Google Workspace for Education (RPS-2024/074): falta de evaluación de impacto, de información y de garantías en las transferencias internacionales, entre otras ([Écija, 22/4/2026](https://www.ecija.com/actualidad-insights/sancion-a-la-consejeria-de-educacion-de-andalucia-por-incumplimientos-derivados-del-uso-de-google-workspace/)). Ni siquiera las plataformas corporativas están libres de problemas, así que una hoja personal de Google lo está menos todavía.

### 3.2 Qué significa para Pablo y para La Lupa [S]

- **Lo que ya está bien:** el juego guarda los datos en el propio dispositivo (`localStorage`), identifica a cada alumno por un **alias de detective** (seudónimo) y no envía nada a terceros. El CSV con alias y notas es un dato **seudonimizado**: sigue siendo dato personal para quien tiene la correspondencia alias → alumno, pero el riesgo es mucho menor.
- **Lo que se recomienda:**
  - Que la dirección sepa que se usa el juego y lo autorice (ya hay un borrador de autorización en `imprimibles/`). Ante cualquier duda, consultar a la DPD.
  - Pasar las notas desde el ordenador del centro o desde una cuenta corporativa (`@g.educaand.es` o Microsoft 365 de la Junta), no desde la cuenta personal de Google.
  - Borrar los CSV descargados cuando ya estén en Séneca.
  - Guardar la correspondencia alias → alumno **fuera del juego** (en papel o en la lista de Séneca, por número de orden).
- **Lo que no se recomienda:**
  - Meter nombres reales en el juego o en el repo.
  - Subir los CSV a un Drive o a una hoja de cálculo personal.
  - Guardar en el juego las credenciales de Séneca o automatizar Séneca desde el juego (sería un robot no autorizado sobre un sistema de la Administración).
  - Usar extensiones de terceros sin autorización.
- **Aviso sobre `backend/`** (Apps Script + Google Sheets): si esa hoja vive en una cuenta personal, es la pieza con más riesgo. Con alias y en una cuenta corporativa, el riesgo baja. Habría que confirmarlo con la DPD antes de usarla con la clase real.

---

## 4. Recomendación práctica

### 4.1 Hoy: exportación «para Séneca» y paso asistido a mano

Pablo debería poder abrir *Calificar actividad criterial* en Séneca y teclear (o pegar) de arriba abajo **sin buscar a nadie**. Para eso, el juego debería ofrecer, además del CSV detallado que ya existe (`exportarCSV`: una fila por nota, con alumno, curso, tipo, cuenta_nota, unidad, caso, criterio, nota, calificación, aciertos, intentos, libreta, pistas, consultas_libreta, minutos y fecha), lo siguiente:

1. **Un «número de lista» por alias**, que Pablo pone una vez en la zona del maestro y coincide con el orden de su grupo en Séneca. Se guarda solo en el dispositivo. Es un número, no un nombre.
2. **Una tabla «para Séneca» por grupo y evaluación** (trimestre), filtrada por lo que «cuenta» según los ajustes:
   - Una fila por alumno, **ordenada por número de lista**. Los alumnos sin datos también aparecen, con la fila vacía, para que el orden no se descuadre.
   - Columnas: `N.º;Alias;5.1.a;9.1.a;9.2.a;…`, con el código exacto del criterio. Si Séneca lo muestra de otra forma, se cambia solo la cabecera: ver §5.
   - Celdas: **nota entera de 1 a 10** (la media del periodo, redondeada; la regla de redondeo es una decisión de Pablo), sin decimales ni texto. Un criterio sin evaluar va **vacío**, nunca con 0. Se puede añadir una segunda tabla igual con IN/SU/BI/NT/SB por si la actividad de Séneca es alfanumérica.
   - Formato: CSV con `;`, UTF-8 con BOM y coma decimal (como el actual, para que Excel o LibreOffice en español lo abran bien). Se descarga, además, como **tabla para imprimir** y se puede tener al lado mientras se teclea.
3. **Un botón «Copiar columna»** por criterio: copia al portapapeles solo las notas de ese criterio, una por línea, en el orden de lista (con línea vacía si no hay nota). Es lo que pide cualquier pegado asistido y lo que ayuda al tecleo.
4. **En Séneca**, una sola actividad evaluable **no diaria** por trimestre (p. ej., «La Lupa – 1.er trimestre») con los criterios que trabaja el juego. Así cada criterio recibe una nota por alumno y trimestre, y Séneca hace la media con el resto de actividades. **No** conviene pasar cada caso como actividad: multiplica el trabajo y el juego ya hace la media.

Cálculo aproximado [S]: con 25 alumnos y entre 4 y 6 criterios por trimestre salen de 100 a 150 notas. Con la tabla en el mismo orden, es un rato de tecleo por trimestre y no hay que buscar a nadie.

### 4.2 Medio plazo: pegado asistido (solo con autorización)

Si la dirección o la DPD lo autorizan, se puede probar **AutoNotas Séneca** en Primaria con la tabla del punto 2. AutoNotas empareja por nombre, así que la columna de nombres la pondría Pablo **en su ordenador del centro** (copiándola de Séneca) junto a las columnas del juego, ordenadas por número de lista. Los nombres no entrarían nunca en el juego.

### 4.3 Lo «automático»: solo por Moodle Centros (por probar)

La única vía oficial es la del §2.2. Antes de programar nada hay que comprobar con la cuenta de Pablo:

- que su centro tiene Moodle Centros y que su alumnado de 5.º y 6.º tiene curso creado desde «Gestión de Aulas»;
- que el calificador deja **importar CSV**;
- que un ítem con *info item* «cuaderno» llega a los criterios de Primaria.

Si las tres cosas funcionan, el juego exportaría un CSV con el formato de importación de Moodle (que se saca exportando antes una plantilla del calificador). Pablo lo importaría, y Moodle lo pasaría a Séneca con su propia sincronización y sus credenciales. Otra opción es meter el juego dentro de Moodle (H5P, SCORM o LTI) para que las notas lleguen solas al calificador, pero es un proyecto aparte y no está estudiado.

---

## 5. Lo que no se sabe (hay que comprobarlo con una cuenta docente)

- [ ] Cómo muestra Séneca los códigos de los criterios de Primaria en *Calificar actividad criterial*: `5.1.a`, `LCL.5.1`, `LCL.3.5.1` u otro. El juego necesita esa cabecera exacta.
- [ ] En qué orden aparece el alumnado en esa pantalla (¿por apellidos?) y si coincide con el «número de lista» del grupo.
- [ ] Qué tipo de nota admite un criterio de Primaria: numérica de 1 a 10, IN-SB o nivel de rúbrica (indicador de logro), y si acepta decimales.
- [ ] Si el cuaderno de 2026-27 trae ya algún botón de importar o exportar (las simplificaciones del Decreto 483/2026 llegarán de forma gradual).
- [ ] Si AutoNotas Séneca funciona con criterios de Primaria.
- [ ] Si Moodle Centros deja al docente importar calificaciones desde CSV y si la exportación «cuaderno» funciona en Primaria.
- [ ] Si el centro tiene un protocolo o una lista de apps autorizadas (y qué opina la DPD del CSV con alias y del `backend/`).

---

## Fuentes principales

- Junta de Andalucía, eAprendizaje: [Exportación de calificaciones de Moodle Centros a criterios del Cuaderno de clase (Séneca)](https://www.juntadeandalucia.es/educacion/eaprendizaje/exportacion-de-calificaciones-de-moodle-centros-a-criterios-del-cuaderno-de-clase-seneca/) (10/12/2021)
- Junta de Andalucía: [Guía básica de Moodle Centros 23-24, rol docente, 6.13 «Exportar notas del calificador a Séneca»](https://edea.juntadeandalucia.es/bancorecursos/file/c45ea16a-740d-4f4d-84ca-3f4cc4966e21/2/Guia_basica_Moodle_Centros23-24.Rol_Docente.zip/613_exportar_notas_del_calificador_a_sneca.html)
- IES Juan Sebastián Elcano: [¿Cómo exportar las calificaciones de Moodle Centros al cuaderno de Séneca?](https://blogsaverroes.juntadeandalucia.es/ieselcano/2022/05/17/como-exportar-las-calificaciones-de-moodle-centros-al-cuaderno-de-seneca/)
- REA [«Evaluación con el cuaderno de Séneca» (preguntas frecuentes)](https://juanmale14.github.io/REAcuadernov1/preguntas_frecuentes.html)
- [Guía del cuaderno de Séneca 2025-26 (IES)](https://www.scribd.com/document/923893232/Guia-Cuaderno-Seneca-2526) · [Olicasares: cuaderno de clase de Séneca](https://sites.google.com/g.educaand.es/olicasares/cuaderno-de-clase-de-s%C3%A9neca) · [Seritium: lo básico del cuaderno](https://www.seritium.es/wordpress/index.php/contenidos-sobre-el-cuaderno-de-seneca-lo-basico/) · [CEIP San José Artesano: cuaderno de Séneca](https://blogsaverroes.juntadeandalucia.es/ceipsanjoseartesano/proyecto-educativo/cuaderno-seneca-docx/)
- [Foro de USTEA: «Nuevo cuaderno de Séneca»](https://ustealdia.org/foro/index.php?topic=124216.20) (octubre de 2023)
- [AutoNotas Séneca](https://elprofedelabata.es/autonotas-seneca/) · [Séneca Fácil (extscope)](https://extscope.org/extension/edgcbhmjccjhjalfhpjihlliddflclbl) · [Cuaderno Séneca (Chrome Web Store)](https://chromewebstore.google.com/detail/cuaderno-s%C3%A9neca/aelmbinadioegilacakejkegklalpjjb) · [Planilúa](https://jcmdev.itch.io/planilua) · [andalinux: introducir las notas en Séneca automáticamente](https://andalinux.wordpress.com/2019/04/23/introducir-las-notas-en-seneca-automaticamente/)
- [Moodle Docs: Importar calificaciones](https://docs.moodle.org/es/Importar_calificaciones)
- [LOE consolidada, disposición adicional 23.ª (BOE)](https://www.boe.es/buscar/act.php?id=BOE-A-2006-7899)
- CTPDA: [Guía sobre protección de datos personales para centros educativos de Andalucía](https://www.ctpdandalucia.es/sites/default/files/inline-files/guia-proteccion-datos-centros-educativos-andalucia.pdf) (2024)
- AEPD: [Informe sobre apps que almacenan datos de alumnos en la nube](https://www.aepd.es/guias/guia-orientaciones-apps-datos-alumnos.pdf) (marcado como obsoleto)
- Écija: [Sanción a la Consejería por Google Workspace (RPS-2024/074)](https://www.ecija.com/actualidad-insights/sancion-a-la-consejeria-de-educacion-de-andalucia-por-incumplimientos-derivados-del-uso-de-google-workspace/) (22/4/2026)
- Agencia Digital de Andalucía: [Manual de solicitud de integración (OT-I)](https://desarrollo.juntadeandalucia.es/sites/default/files/2024-12/OT-I_MAN_Manual%20de%20solicitud%20de%20integraci%C3%B3n_v02r05.pdf)
