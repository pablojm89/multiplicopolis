#!/usr/bin/env python3
"""Valida los homófonos del Laboratorio (datos/academia/homofonos.json).

Uso (desde apps/la-lupa/):  python3 herramientas/validar_homofonos.py
Comprueba: al menos 30 grupos de 2-3 formas distintas que suenan igual (con seseo,
yeísmo, b = v y h muda), reglas que existen en reglas.json, significado en cada forma,
al menos 2 frases por forma con un solo hueco «___», sin ninguna forma del grupo
escrita en la frase, sin frases repetidas, y coherencia con palabras.json.
"""
import json
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
reglas = json.loads((RAIZ / "datos" / "reglas.json").read_text(encoding="utf-8"))
grupos = json.loads((RAIZ / "datos" / "academia" / "homofonos.json").read_text(encoding="utf-8"))["grupos"]
banco = {p["p"]: p for p in json.loads((RAIZ / "datos" / "academia" / "palabras.json").read_text(encoding="utf-8"))["palabras"]}
PALABRA = re.compile(r"[^\W_]+")


def sin_tildes(s):
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn").replace("ü", "u")


def suena(p):
    """Cómo suena (aprox.) en una zona de seseo y yeísmo: así se comprueba que son homófonos."""
    s = sin_tildes(p.lower())
    s = s.replace("ch", "\0").replace("h", "").replace("\0", "ch")
    s = s.replace("v", "b").replace("ll", "y").replace("z", "s")
    s = re.sub(r"c(?=[ei])", "s", s)
    if s.endswith("y"):
        s = s[:-1] + "i"
    return s


errores, avisos = [], []
ids, frases_vistas = set(), set()
por_regla = Counter()
for g in grupos:
    gid = g.get("id", "?")
    if gid in ids:
        errores.append(f"{gid}: id repetido")
    ids.add(gid)
    if g.get("regla") not in reglas:
        errores.append(f"{gid}: regla desconocida {g.get('regla')}")
    for r in g.get("tambien", []):
        if r not in reglas:
            errores.append(f"{gid}: regla «tambien» desconocida {r}")
    por_regla[g.get("regla")] += 1
    if not g.get("truco", "").strip():
        errores.append(f"{gid}: falta el truco")
    formas = g.get("formas", [])
    if not 2 <= len(formas) <= 3:
        errores.append(f"{gid}: tiene {len(formas)} formas (deben ser 2 o 3)")
    ps = [f["p"] for f in formas]
    if len(set(ps)) != len(ps):
        errores.append(f"{gid}: formas repetidas")
    if len({suena(p) for p in ps}) != 1:
        errores.append(f"{gid}: no suenan igual: " + ", ".join(f"{p} [{suena(p)}]" for p in ps))
    for f in formas:
        p = f["p"]
        if not f.get("significado", "").strip():
            errores.append(f"{gid}/{p}: falta el significado")
        elif not f["significado"].rstrip().endswith((".", "…")):
            errores.append(f"{gid}/{p}: el significado debe acabar en punto")
        fr = f.get("frases", [])
        if len(fr) < 2:
            errores.append(f"{gid}/{p}: tiene {len(fr)} frases (mínimo 2)")
        for t in fr:
            if t.count("___") != 1:
                errores.append(f"{gid}/{p}: la frase «{t}» debe tener un solo hueco ___")
            if t in frases_vistas:
                errores.append(f"{gid}/{p}: frase repetida «{t}»")
            frases_vistas.add(t)
            palabras = [w.lower() for w in PALABRA.findall(t.replace("___", " "))]
            for otra in ps:
                if otra.lower() in palabras:
                    errores.append(f"{gid}/{p}: la frase «{t}» ya contiene «{otra}»")
            if not re.search(r"[.!?…»]$", t):
                errores.append(f"{gid}/{p}: la frase «{t}» debe acabar en un signo de cierre")
            if "  " in t or t != t.strip():
                errores.append(f"{gid}/{p}: espacios de más en «{t}»")
        if p in banco and banco[p]["regla"] not in [g.get("regla"), *g.get("tambien", [])]:
            avisos.append(f"{gid}/{p}: en palabras.json tiene la regla {banco[p]['regla']}")

if len(grupos) < 30:
    errores.append(f"solo hay {len(grupos)} grupos (mínimo 30)")

print(f"{len(grupos)} grupos, {sum(len(g['formas']) for g in grupos)} formas, {len(frases_vistas)} frases · "
      + ", ".join(f"{r}: {n}" for r, n in sorted(por_regla.items())))
for a in avisos:
    print("· " + a)
if errores:
    print("\n".join("✗ " + e for e in errores))
    sys.exit(1)
print("✓ Homófonos correctos")
