#!/usr/bin/env python3
"""Integra en el juego las imágenes entregadas en arte/entrega/.

Uso (desde apps/la-lupa/):  python3 herramientas/integrar_arte.py [--borrar]

- Lee cada PNG/JPG/WEBP de arte/entrega/ cuyo nombre sea <id>.png (fondos y objetos)
  o <id>-<expresion>.png (personajes), según datos/arte.json.
- Lo convierte a arte/<nombre>.webp con el tamaño adecuado:
    fondos 1920×1080 (recorte centrado a 16:9) · personajes alto máx. 1536 · objetos lado máx. 1024
- Marca la imagen como lista en arte.json y regenera arte/ENCARGO.md.
- Con --borrar, elimina los originales de arte/entrega/ ya integrados.
Los nombres que no encajan se informan y se dejan sin tocar.
"""
import json
import subprocess
import sys
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
RUTA_ARTE = RAIZ / "datos" / "arte.json"
ENTREGA = RAIZ / "arte" / "entrega"
SALIDA = RAIZ / "arte"
borrar = "--borrar" in sys.argv

arte = json.loads(RUTA_ARTE.read_text(encoding="utf-8"))


def identificar(nombre):
    """Devuelve (id, expresion|None) o None si el nombre no corresponde a nada."""
    if nombre in arte and not nombre.startswith("_") and arte[nombre]["tipo"] in ("fondo", "objeto"):
        return nombre, None
    for id_, a in arte.items():
        if id_.startswith("_") or a.get("tipo") != "personaje":
            continue
        for e in a["expresiones"]:
            if nombre == f"{id_}-{e}":
                return id_, e
    return None


def preparar(img, tipo):
    if tipo == "fondo":
        img = img.convert("RGB")
        w, h = img.size
        objetivo = 16 / 9
        if w / h > objetivo:
            nw = round(h * objetivo)
            img = img.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
        else:
            nh = round(w / objetivo)
            img = img.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
        return img.resize((1920, 1080), Image.LANCZOS)
    img = img.convert("RGBA")
    # Limpia la transparencia: algunas IA entregan el personaje al 99 % de opacidad
    alfa = img.getchannel("A").point(lambda a: 255 if a >= 235 else (0 if a <= 8 else a))
    img.putalpha(alfa)
    limite = (1024, 1536) if tipo == "personaje" else (1024, 1024)
    img.thumbnail(limite, Image.LANCZOS)
    return img


hechas, raras = [], []
for f in sorted(ENTREGA.iterdir()) if ENTREGA.exists() else []:
    if f.suffix.lower() not in (".png", ".jpg", ".jpeg", ".webp"):
        continue
    ident = identificar(f.stem)
    if not ident:
        raras.append(f.name)
        continue
    id_, expr = ident
    tipo = arte[id_]["tipo"]
    destino = SALIDA / f"{f.stem}.webp"
    preparar(Image.open(f), tipo).save(destino, "WEBP", quality=85, method=6)
    if expr:
        listas = arte[id_].setdefault("listas", [])
        if expr not in listas:
            listas.append(expr)
    else:
        arte[id_]["listo"] = True
    hechas.append(f"{f.name} → arte/{destino.name}")
    if borrar:
        f.unlink()

RUTA_ARTE.write_text(json.dumps(arte, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
subprocess.run([sys.executable, str(Path(__file__).parent / "encargo_arte.py")], check=True)

print(f"Integradas: {len(hechas)}")
for h in hechas:
    print("  ", h)
if raras:
    print("Nombres que no encajan con arte.json (no se han tocado):")
    for r in raras:
        print("  ", r)
