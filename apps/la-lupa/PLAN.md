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
- [ ] Probar el prototipo en clase y ajustar
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
