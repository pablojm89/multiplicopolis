# Instrucciones para agentes (ChatGPT, Codex, Gemini…)

Repo de juegos educativos de Primaria de Pablo (maestro en Andalucía). Idioma de trabajo: español.
Las reglas generales del repo están en `CLAUDE.md`. El desarrollo lo lleva Claude: **no modifiques código ni datos del juego** salvo que Pablo lo pida expresamente.

## Si vienes a hacer las ilustraciones de Agencia La Lupa

1. Lee **`apps/la-lupa/arte/ENCARGO.md`**: estilo, reglas, la lista de imágenes pendientes y el nombre exacto de cada archivo.
2. Genera las imágenes en el orden que indica.
3. Entrégalas como PNG en `apps/la-lupa/arte/entrega/` con el nombre exacto, en una rama tuya `gpt/<lote>` (nunca en `main` ni en la rama de Claude), con un `MANIFIESTO` de SHA-256. Toca solo `arte/entrega/`: los `.webp` y `arte.json` los genera Claude. Personajes y objetos con el fondo **totalmente transparente**, sin halo ni brillo alrededor. Si no puedes escribir en el repo, dáselas a Pablo con esos nombres y él las sube.
4. Si tienes dudas o propuestas, escríbelas en la sección «Notas del ilustrador» de `ENCARGO.md` o díselas a Pablo.

## Si Pablo te pasa fichas de aspirante de sus alumnos

Sigue el encargo tipo de **`apps/la-lupa/arte/AVATARES-ALUMNADO.md`**. Son datos de menores: entrégaselos solo a Pablo en un zip y **nunca** los subas al repo ni a GitHub (ni issues ni comentarios), ni los guardes para otra cosa.

No toques `apps/la-lupa/arte/*.webp` ni `datos/arte.json`: los genera el script de integración de Claude.
