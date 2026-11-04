#!/usr/bin/env python3
"""Valida los bancos de datos de la Academia (datos/academia/*.json).

Uso (desde apps/la-lupa/):  python3 herramientas/validar_academia.py
Comprueba que cada palabra marcada en los textos existe en el banco, que las sílabas
reconstruyen la palabra, que la sílaba tónica existe, que la forma errónea es distinta
y que cada frase tiene su hueco ___. Así «miles de propuestas» no son miles de erratas.
"""
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
reglas = json.loads((RAIZ / "datos" / "reglas.json").read_text(encoding="utf-8"))
banco = json.loads((RAIZ / "datos" / "academia" / "palabras.json").read_text(encoding="utf-8"))["palabras"]
textos = json.loads((RAIZ / "datos" / "academia" / "textos.json").read_text(encoding="utf-8"))["textos"]

errores = []
vistas = set()
for w in banco:
    p = w["p"]
    if p in vistas:
        errores.append(f"palabra repetida: {p}")
    vistas.add(p)
    if w["regla"] not in reglas:
        errores.append(f"{p}: regla desconocida {w['regla']}")
    if "mal" in w and w["mal"] == p:
        errores.append(f"{p}: la forma errónea es igual a la correcta")
    if "silabas" in w:
        if "".join(w["silabas"]) != p:
            errores.append(f"{p}: las sílabas {w['silabas']} no forman la palabra")
        if not 0 <= w.get("tonica", -1) < len(w["silabas"]):
            errores.append(f"{p}: tónica fuera de rango")
    if "___" not in w.get("frase", "___"):
        errores.append(f"{p}: la frase no tiene hueco ___")

for t in textos:
    for m in re.findall(r"\[([^\]]+)\]", t["texto"]):
        if m.lower() not in vistas:
            errores.append(f"texto «{t['tipo']}»: [{m}] no está en el banco")

print(f"{len(banco)} palabras, {len(textos)} textos")
if errores:
    print("ERRORES:")
    for e in errores:
        print("  -", e)
    sys.exit(1)
print("Todo correcto")
