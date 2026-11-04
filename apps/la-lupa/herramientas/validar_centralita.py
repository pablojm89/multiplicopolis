#!/usr/bin/env python3
"""Valida los dictados de la Centralita (datos/academia/dictados.json).

Uso (desde apps/la-lupa/):  python3 herramientas/validar_centralita.py
Comprueba que cada frase tiene 8-14 palabras, 2-3 marcas que están de verdad en el
texto (con las mismas mayúsculas y tildes), reglas de 5.º que existen en reglas.json,
una explicación (por) en cada marca y al menos 4 frases por regla.
"""
import json
import re
import sys
from collections import Counter
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
reglas = json.loads((RAIZ / "datos" / "reglas.json").read_text(encoding="utf-8"))
frases = json.loads((RAIZ / "datos" / "academia" / "dictados.json").read_text(encoding="utf-8"))["frases"]
QUINTO = ["tildes-generales", "b-v-1", "h-1", "c-z-s", "ll-y", "g-j-dieresis",
          "diptongo-monosilabos", "d-z-finales", "mayusculas-puntuacion-1"]
PALABRA = re.compile(r"[^\W_]+")   # letras y cifras, como el tokenizador de la sala

errores = []
vistos = set()
por_regla = Counter()
for f in frases:
    t = f["texto"]
    cab = t[:40]
    if t in vistos:
        errores.append(f"frase repetida: {cab}")
    vistos.add(t)
    if f.get("regla") not in QUINTO:
        errores.append(f"«{cab}»: regla principal desconocida {f.get('regla')}")
    por_regla[f.get("regla")] += 1
    palabras = PALABRA.findall(t)
    if not 8 <= len(palabras) <= 14:
        errores.append(f"«{cab}»: tiene {len(palabras)} palabras (deben ser 8-14)")
    if re.search(r"\d", t):
        errores.append(f"«{cab}»: escribe los números con letras")
    if "  " in t or t != t.strip():
        errores.append(f"«{cab}»: espacios de más")
    marcas = f.get("marcas", [])
    if not 2 <= len(marcas) <= 3:
        errores.append(f"«{cab}»: tiene {len(marcas)} marcas (deben ser 2-3)")
    usadas = Counter()
    for m in marcas:
        usadas[m["p"]] += 1
        if usadas[m["p"]] > palabras.count(m["p"]):
            errores.append(f"«{cab}»: la marca «{m['p']}» no está en el texto (o no tantas veces)")
        if m.get("regla") not in reglas:
            errores.append(f"«{cab}»: la marca «{m['p']}» tiene una regla desconocida {m.get('regla')}")
        if not m.get("por", "").strip():
            errores.append(f"«{cab}»: la marca «{m['p']}» no tiene explicación (por)")

for r in QUINTO:
    if por_regla[r] < 4:
        errores.append(f"la regla {r} solo tiene {por_regla[r]} frases (mínimo 4)")

print(f"{len(frases)} frases · " + ", ".join(f"{r}: {por_regla[r]}" for r in QUINTO))
if errores:
    print("\n".join("✗ " + e for e in errores))
    sys.exit(1)
print("✓ Dictados correctos")
