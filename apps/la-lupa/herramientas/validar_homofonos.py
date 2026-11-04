#!/usr/bin/env python3
"""Valida los homófonos del Laboratorio (datos/academia/homofonos.json).

Uso (desde apps/la-lupa/):  python3 herramientas/validar_homofonos.py
Comprueba: al menos 50 grupos de 2-3 formas distintas que suenan igual (con seseo,
yeísmo, b = v y h muda), reglas que existen en reglas.json, nivel 1-3 (las parejas de
bronce, nivel 1, tienen 2 formas), significado en cada forma, al menos 3 frases por forma
con un solo hueco «___», sin ninguna forma del grupo escrita en la frase, sin frases
repetidas, ninguna forma en dos grupos, y coherencia con palabras.json.
Frases dobles (diamante): dos huecos, cada uno con una forma de un grupo distinto, sin
ninguna forma de esos grupos escrita, y suficientes para cada regla del microscopio.
Contenido mínimo por lupa: al menos 3 grupos de nivel 1 (parejas), 3 tríos y 4 de nivel 3.
"""
import json
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
reglas = json.loads((RAIZ / "datos" / "reglas.json").read_text(encoding="utf-8"))
HOM = json.loads((RAIZ / "datos" / "academia" / "homofonos.json").read_text(encoding="utf-8"))
grupos, dobles = HOM["grupos"], HOM.get("dobles", [])
REGLAS_MICRO = ["b-v-1", "h-1", "ll-y", "c-z-s"]      # LAB_HOM_REGLAS en salas/laboratorio-extra.js
MIN_GRUPOS, MIN_FRASES, MIN_DOBLES, DOBLES_REGLA = 50, 3, 40, 8
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
por_regla, por_nivel = Counter(), Counter()
grupo_de = {}
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
    nivel = g.get("nivel")
    if nivel not in (1, 2, 3):
        errores.append(f"{gid}: nivel {nivel!r} (debe ser 1, 2 o 3)")
    por_nivel[nivel] += 1
    if nivel == 1 and len(g.get("formas", [])) != 2:
        errores.append(f"{gid}: los grupos de nivel 1 (bronce) son parejas: 2 formas")
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
        if p in grupo_de:
            errores.append(f"{gid}/{p}: la forma ya está en el grupo {grupo_de[p]['id']}")
        grupo_de[p] = g
        if not f.get("significado", "").strip():
            errores.append(f"{gid}/{p}: falta el significado")
        elif not f["significado"].rstrip().endswith((".", "…")):
            errores.append(f"{gid}/{p}: el significado debe acabar en punto")
        fr = f.get("frases", [])
        if len(fr) < MIN_FRASES:
            errores.append(f"{gid}/{p}: tiene {len(fr)} frases (mínimo {MIN_FRASES})")
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

# ── Frases dobles (diamante) ──
dobles_regla = Counter()
for d in dobles:
    t, ps = d.get("frase", ""), d.get("p", [])
    cab = f"doble «{t}»"
    if t.count("___") != 2 or len(ps) != 2:
        errores.append(f"{cab}: debe tener 2 huecos ___ y 2 formas en «p»")
        continue
    gs = [grupo_de.get(p) for p in ps]
    if not all(gs):
        errores.append(f"{cab}: forma desconocida en {ps}")
        continue
    if gs[0] is gs[1]:
        errores.append(f"{cab}: los dos huecos son del mismo grupo ({gs[0]['id']})")
    if t in frases_vistas:
        errores.append(f"{cab}: frase repetida")
    frases_vistas.add(t)
    palabras = [w.lower() for w in PALABRA.findall(t.replace("___", " "))]
    for g in gs:
        for f in g["formas"]:
            if f["p"].lower() in palabras:
                errores.append(f"{cab}: ya contiene «{f['p']}»")
    if not re.search(r"[.!?…»]$", t) or "  " in t or t != t.strip():
        errores.append(f"{cab}: debe acabar en un signo de cierre y sin espacios de más")
    for r in REGLAS_MICRO:
        if any(r in [g["regla"], *g.get("tambien", [])] for g in gs):
            dobles_regla[r] += 1

if len(grupos) < MIN_GRUPOS:
    errores.append(f"solo hay {len(grupos)} grupos (mínimo {MIN_GRUPOS})")
if len(dobles) < MIN_DOBLES:
    errores.append(f"solo hay {len(dobles)} frases dobles (mínimo {MIN_DOBLES})")
for r in REGLAS_MICRO:
    if dobles_regla[r] < DOBLES_REGLA:
        errores.append(f"la regla {r} solo tiene {dobles_regla[r]} frases dobles (mínimo {DOBLES_REGLA}: una ronda de diamante)")
parejas1 = sum(1 for g in grupos if g.get("nivel") == 1)
trios = sum(1 for g in grupos if len(g["formas"]) == 3)
if parejas1 < 3 or trios < 3 or por_nivel[3] < 4:
    errores.append(f"falta contenido por lupa: {parejas1} parejas de nivel 1, {trios} tríos y {por_nivel[3]} grupos de nivel 3")

print(f"{len(grupos)} grupos, {sum(len(g['formas']) for g in grupos)} formas, {len(frases_vistas)} frases ({len(dobles)} dobles) · "
      + ", ".join(f"{r}: {n}" for r, n in sorted(por_regla.items())))
print("Por nivel: " + ", ".join(f"nivel {n}: {por_nivel[n]}" for n in (1, 2, 3)) + f" · tríos: {trios} · dobles por regla: "
      + ", ".join(f"{r}: {dobles_regla[r]}" for r in REGLAS_MICRO))
for a in avisos:
    print("· " + a)
if errores:
    print("\n".join("✗ " + e for e in errores))
    sys.exit(1)
print("✓ Homófonos correctos")
