#!/usr/bin/env python3
"""Genera arte/ENCARGO.md (el pedido de imágenes para ChatGPT/Gemini) a partir de datos/arte.json.

Uso (desde apps/la-lupa/):  python3 herramientas/encargo_arte.py
Solo lista lo que falta: lo que ya está marcado como listo no aparece.
"""
import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
arte = json.loads((RAIZ / "datos" / "arte.json").read_text(encoding="utf-8"))
estilo = arte["_estilo"]

fondos, personajes, objetos = [], [], []
for id_, a in arte.items():
    if id_.startswith("_"):
        continue
    if a["tipo"] == "fondo" and not a.get("listo"):
        fondos.append((id_, a))
    elif a["tipo"] == "objeto" and not a.get("listo"):
        objetos.append((id_, a))
    elif a["tipo"] == "personaje":
        faltan = [e for e in a["expresiones"] if e not in a.get("listas", [])]
        if faltan:
            personajes.append((id_, a, faltan))

EXPRESION = {
    "neutral": "expresión neutra, atenta",
    "contento": "contento/a, sonrisa amplia",
    "pensativo": "pensativo/a, mano en la barbilla, mirada de lado",
    "sorprendido": "sorprendido/a, ojos muy abiertos, cejas arriba",
    "nervioso": "nervioso/a, sonrisa forzada, gota de sudor, se rasca la nuca",
}

lineas = [
    "# Encargo de imágenes · Agencia La Lupa",
    "",
    "> Archivo generado por `herramientas/encargo_arte.py` a partir de `datos/arte.json`. No lo edites a mano: cambia `arte.json` y vuelve a generarlo.",
    "",
    "## Para la IA de imágenes (ChatGPT / Gemini)",
    "",
    "Eres el ilustrador de **Agencia La Lupa**, un juego educativo de detectives de ortografía para niños de 10-12 años (5.º y 6.º de Primaria, Andalucía).",
    "Los alumnos forman parte de una pequeña agencia de detectives del barrio ficticio de La Alameda. El juego se ve como escenas a pantalla completa: un fondo, un personaje grande a un lado y un bocadillo de texto encima.",
    "",
    "### Estilo (igual en TODAS las imágenes)",
    "",
    f"{estilo}",
    "",
    "### Reglas",
    "",
    "1. **Sin texto ni letras dentro de la imagen** (el juego pone los textos).",
    "2. **Personajes coherentes**: dibuja primero la expresión `neutral` de cada personaje y úsala como referencia para sus demás expresiones (misma cara, ropa, colores y proporciones).",
    "3. Personajes **de cuerpo entero o de rodillas para arriba, de pie, mirando un poco hacia el centro, sobre fondo transparente** (PNG con transparencia). Si no puedes hacer transparencia, usa un fondo blanco liso.",
    "4. Fondos **16:9, sin personajes**, con la parte inferior central algo despejada (ahí va el bocadillo de texto).",
    "5. Objetos **aislados sobre fondo transparente**, centrados.",
    "6. Nada de personas reales, marcas, logotipos ni referencias a Sherlock Holmes.",
    "7. **Nombra cada archivo exactamente** como se indica (`nombre.png`). Si no, el juego no lo encuentra.",
    "",
    "### Entrega",
    "",
    "Sube los PNG a la carpeta `apps/la-lupa/arte/entrega/` del repositorio, con el nombre exacto de cada uno. Claude los convierte e integra en el juego.",
    "",
    "## Orden recomendado",
    "",
    "1. Personajes principales: Lola, Mateo y la directora Robles (aparecen en todos los casos).",
    "2. Fondos del caso 1.",
    "3. Personajes del caso 1 y objetos.",
    "",
]

aprobadas = [f"`{i}.png`" for i, a in arte.items() if not i.startswith("_") and a.get("listo")]
aprobadas += [f"`{i}-{e}.png`" for i, a in arte.items() if not i.startswith("_") and a.get("tipo") == "personaje" for e in a.get("listas", [])]
if aprobadas:
    lineas += [
        "## Ya aprobadas: úsalas como referencia",
        "",
        "Pablo ha dado el visto bueno a estas imágenes. Mantén exactamente el mismo estilo, luz y acabado, y el mismo aspecto de cada personaje: " + ", ".join(aprobadas) + ".",
        "",
    ]

if personajes:
    lineas += ["## Personajes", ""]
    for id_, a, faltan in personajes:
        lineas += [f"### {a['nombre']}", "", f"**Descripción:** {a['prompt']}", "", "| Archivo | Expresión |", "|---|---|"]
        lineas += [f"| `{id_}-{e}.png` | {EXPRESION.get(e, e)} |" for e in faltan]
        lineas += [""]
if fondos:
    lineas += ["## Fondos (16:9, 1920×1080, sin personajes)", "", "| Archivo | Qué se ve |", "|---|---|"]
    lineas += [f"| `{id_}.png` | {a['prompt']} |" for id_, a in fondos]
    lineas += [""]
if objetos:
    lineas += ["## Objetos (fondo transparente, 1024×1024)", "", "| Archivo | Qué se ve |", "|---|---|"]
    lineas += [f"| `{id_}.png` | {a['prompt']} |" for id_, a in objetos]
    lineas += [""]

total = sum(len(f) for _, _, f in personajes) + len(fondos) + len(objetos)
lineas += [
    "## Notas del ilustrador",
    "",
    "_Si tienes dudas o propuestas (por ejemplo, un cambio de estilo), apúntalas aquí o díselas a Pablo._",
    "",
    f"---\nQuedan **{total}** imágenes por entregar.",
    "",
]

(RAIZ / "arte" / "ENCARGO.md").write_text("\n".join(lineas), encoding="utf-8")
print(f"ENCARGO.md generado: {total} imágenes pendientes")
