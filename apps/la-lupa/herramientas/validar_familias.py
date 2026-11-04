#!/usr/bin/env python3
"""Valida las familias de palabras del Laboratorio (datos/academia/familias.json).

Uso (desde apps/la-lupa/):  python3 herramientas/validar_familias.py
Comprueba: al menos 25 familias con 2-4 derivadas, reglas que existen en reglas.json,
piezas que forman la raíz, letra dudosa en su sitio (en la raíz y en cada derivada;
«sin h» marca dónde iría y la palabra no tiene h ahí), opciones que incluyen la letra,
explicación («porque») cuando la letra cambia, pista y frase con un solo hueco que no
dejan ver la palabra (si no hay frase, debe estar en palabras.json), sin derivadas
repetidas y coherencia de reglas con palabras.json.
"""
import json
import re
import sys
from collections import Counter
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
reglas = json.loads((RAIZ / "datos" / "reglas.json").read_text(encoding="utf-8"))
familias = json.loads((RAIZ / "datos" / "academia" / "familias.json").read_text(encoding="utf-8"))["familias"]
banco = {p["p"]: p for p in json.loads((RAIZ / "datos" / "academia" / "palabras.json").read_text(encoding="utf-8"))["palabras"]}
PALABRA = re.compile(r"[^\W_]+")

errores, avisos = [], []
ids, vistas = set(), Counter()
por_regla = Counter()
conectadas = 0
for f in familias:
    fid = f.get("id", "?")
    if fid in ids:
        errores.append(f"{fid}: id repetido")
    ids.add(fid)
    raiz, letra, pos = f.get("raiz", ""), f.get("letra", ""), f.get("pos", -1)
    if f.get("regla") not in reglas:
        errores.append(f"{fid}: regla desconocida {f.get('regla')}")
    for r in f.get("tambien", []):
        if r not in reglas:
            errores.append(f"{fid}: regla «tambien» desconocida {r}")
    por_regla[f.get("regla")] += 1
    if "".join(f.get("piezas", [])) != raiz:
        errores.append(f"{fid}: las piezas {f.get('piezas')} no forman «{raiz}»")
    if raiz[pos:pos + len(letra)] != letra:
        errores.append(f"{fid}: la raíz «{raiz}» no tiene «{letra}» en la posición {pos}")
    if not f.get("nota", "").strip():
        errores.append(f"{fid}: falta la nota")
    ders = f.get("derivadas", [])
    if not 2 <= len(ders) <= 4:
        errores.append(f"{fid}: tiene {len(ders)} derivadas (deben ser 2-4)")
    if raiz in banco or any(d["p"] in banco for d in ders):
        conectadas += 1
    for d in ders:
        p, l, dp = d["p"], d.get("letra", ""), d.get("pos", -1)
        cab = f"{fid}/{p}"
        vistas[p] += 1
        ops = d.get("opciones", [])
        if l not in ops or len(ops) < 2 or len(set(ops)) != len(ops):
            errores.append(f"{cab}: opciones {ops} no válidas para la letra «{l}»")
        if l.startswith("sin "):
            falta = l[4:]
            if not 0 <= dp <= len(p) or p[dp:dp + len(falta)] == falta:
                errores.append(f"{cab}: «{l}» en la posición {dp} no cuadra")
        elif p[dp:dp + len(l)] != l:
            errores.append(f"{cab}: no tiene «{l}» en la posición {dp}")
        if l != letra and not d.get("porque", "").strip():
            errores.append(f"{cab}: la letra cambia ({letra} → {l}) y falta «porque»")
        if l == letra and d.get("porque"):
            avisos.append(f"{cab}: tiene «porque» aunque hereda la letra")
        pista = d.get("pista", "")
        if not pista.strip():
            errores.append(f"{cab}: falta la pista")
        frase = d.get("frase") or banco.get(p, {}).get("frase")
        if not frase:
            errores.append(f"{cab}: no tiene frase (ni en palabras.json)")
            continue
        if frase.count("___") != 1:
            errores.append(f"{cab}: la frase «{frase}» debe tener un solo hueco ___")
        for texto in (pista, frase.replace("___", " ")):
            if p.lower() in [w.lower() for w in PALABRA.findall(texto)]:
                errores.append(f"{cab}: «{texto}» deja ver la palabra")
        if p in banco and banco[p]["regla"] not in [f.get("regla"), *f.get("tambien", [])]:
            avisos.append(f"{cab}: en palabras.json tiene la regla {banco[p]['regla']}")

for p, n in vistas.items():
    if n > 1:
        errores.append(f"«{p}» aparece en {n} familias")
if len(familias) < 25:
    errores.append(f"solo hay {len(familias)} familias (mínimo 25)")

print(f"{len(familias)} familias, {sum(vistas.values())} derivadas, {conectadas} enlazadas con palabras.json · "
      + ", ".join(f"{r}: {n}" for r, n in sorted(por_regla.items())))
for a in avisos:
    print("· " + a)
if errores:
    print("\n".join("✗ " + e for e in errores))
    sys.exit(1)
print("✓ Familias correctas")
