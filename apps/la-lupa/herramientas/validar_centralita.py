#!/usr/bin/env python3
"""Valida los dictados de la Centralita (datos/academia/dictados.json).

Uso (desde apps/la-lupa/):  python3 herramientas/validar_centralita.py
Comprueba que cada frase tiene un nivel (1, 2 o 3) y las palabras de su nivel
(1: 5-9, frases cortas para la lupa de bronce; 2: 8-14; 3: 14-20, frases largas para el oro),
2-3 marcas (hasta 4 en nivel 3) que están de verdad en el texto (con las mismas mayúsculas
y tildes), reglas de 5.º que existen en reglas.json, una explicación (por) en cada marca,
que en diamante (dos frases juntas) cada signo de puntuación es uno de los que se corrigen
y al menos 12 frases por regla, con 4 de cada nivel.
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
LARGO = {1: (5, 9), 2: (8, 14), 3: (14, 20)}
MARCAS = {1: (2, 3), 2: (2, 3), 3: (2, 4)}
SIGNOS = set(".,;:¿?¡!")            # los que se corrigen en diamante (salas/centralita.js)
POR_REGLA, POR_NIVEL = 12, 4

errores = []
vistos = set()
por_regla = Counter()
por_nivel = Counter()
for f in frases:
    t = f["texto"]
    cab = t[:40]
    if t in vistos:
        errores.append(f"frase repetida: {cab}")
    vistos.add(t)
    if f.get("regla") not in QUINTO:
        errores.append(f"«{cab}»: regla principal desconocida {f.get('regla')}")
    por_regla[f.get("regla")] += 1
    nivel = f.get("nivel")
    if nivel not in LARGO:
        errores.append(f"«{cab}»: nivel {nivel!r} (debe ser 1, 2 o 3)")
        nivel = 2
    por_nivel[(f.get("regla"), nivel)] += 1
    palabras = PALABRA.findall(t)
    lo, hi = LARGO[nivel]
    if not lo <= len(palabras) <= hi:
        errores.append(f"«{cab}»: tiene {len(palabras)} palabras (en nivel {nivel} deben ser {lo}-{hi})")
    raros = set(re.sub(r"[^\W_]+|\s", "", t)) - SIGNOS
    if raros:
        errores.append(f"«{cab}»: signos que el diamante no sabe corregir: {''.join(sorted(raros))}")
    if t[-1] not in ".?!":
        errores.append(f"«{cab}»: debe terminar en punto, ? o !")
    if re.search(r"\d", t):
        errores.append(f"«{cab}»: escribe los números con letras")
    if "  " in t or t != t.strip():
        errores.append(f"«{cab}»: espacios de más")
    marcas = f.get("marcas", [])
    lo, hi = MARCAS[nivel]
    if not lo <= len(marcas) <= hi:
        errores.append(f"«{cab}»: tiene {len(marcas)} marcas (en nivel {nivel} deben ser {lo}-{hi})")
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
    if por_regla[r] < POR_REGLA:
        errores.append(f"la regla {r} solo tiene {por_regla[r]} frases (mínimo {POR_REGLA})")
    for n in LARGO:
        if por_nivel[(r, n)] < POR_NIVEL:
            errores.append(f"la regla {r} solo tiene {por_nivel[(r, n)]} frases de nivel {n} (mínimo {POR_NIVEL})")

print(f"{len(frases)} frases · " + ", ".join(f"{r}: {por_regla[r]}" for r in QUINTO))
print("Por nivel: " + ", ".join(f"{n}: {sum(v for (r, m), v in por_nivel.items() if m == n)}" for n in LARGO))
if errores:
    print("\n".join("✗ " + e for e in errores))
    sys.exit(1)
print("✓ Dictados correctos")
