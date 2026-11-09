#!/usr/bin/env python3
"""Crea el paquete de clase (avatares del alumnado) a partir de los PNG que entrega GPT.

Uso:  python3 -I herramientas/paquete_clase.py <carpeta-png> <salida.lalupa-clase.json> --clase "5.º A" [--curso 5]

- Los alias salen de <carpeta>/MANIFIESTO.json (lista de {"archivo": "aspirante-07.png", "alias": "Agente Relámpago"})
  o, si no está, del nombre del archivo (agente-relampago.png → «agente relampago»).
- Cada avatar se reduce a 768 px de alto, se pasa a WebP y se normaliza la opacidad (como integrar_arte.py).

PRIVACIDAD: son datos de menores. La carpeta de entrada y el paquete NUNCA se guardan en el repo
(.gitignore bloquea *.lalupa-clase.json y privado/). El paquete se le da al maestro, que lo importa
en los dispositivos del aula desde la zona del maestro. Al terminar, borra las copias de trabajo.
"""
import argparse
import base64
import io
import json
import sys
from pathlib import Path

from PIL import Image

ALTO = 768

ap = argparse.ArgumentParser()
ap.add_argument("carpeta")
ap.add_argument("salida")
ap.add_argument("--clase", required=True)
ap.add_argument("--curso", default="5")
args = ap.parse_args()

carpeta = Path(args.carpeta)
pngs = sorted(carpeta.rglob("*.png"))
if not pngs:
    sys.exit("No hay PNG en la carpeta.")
alias = {}
man = next(iter(carpeta.rglob("MANIFIESTO.json")), None)
if man:
    datos = json.loads(man.read_text(encoding="utf-8"))
    for x in datos if isinstance(datos, list) else datos.get("archivos", []):
        if x.get("alias"):
            alias[Path(x.get("archivo") or x.get("ruta")).name] = x["alias"].strip()

alumnos = []
for f in pngs:
    nombre = alias.get(f.name) or f.stem.replace("-", " ").replace("_", " ")
    im = Image.open(f).convert("RGBA")
    im = im.resize((round(im.width * ALTO / im.height), ALTO), Image.LANCZOS)
    a = im.getchannel("A").point(lambda v: 255 if v >= 235 else v)
    im.putalpha(a)
    buf = io.BytesIO()
    im.save(buf, "WEBP", quality=82, method=6)
    alumnos.append({"alias": nombre, "avatar": "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()})
    print(f"  {f.name} → «{nombre}» ({len(buf.getvalue()) // 1024} KB)")

repes = {x["alias"] for x in alumnos if [y["alias"] for y in alumnos].count(x["alias"]) > 1}
if repes:
    sys.exit(f"Alias repetidos: {', '.join(sorted(repes))}")
paquete = {"tipo": "lalupa-clase", "version": 1, "clase": args.clase, "curso": args.curso, "alumnos": alumnos}
Path(args.salida).write_text(json.dumps(paquete, ensure_ascii=False), encoding="utf-8")
print(f"Paquete creado: {args.salida} · {len(alumnos)} avatares · {Path(args.salida).stat().st_size // 1024} KB")
