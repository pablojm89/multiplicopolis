#!/usr/bin/env python3
"""Valida las galeradas de la Imprenta del Eco (datos/academia/galeradas.json).

Uso (desde apps/la-lupa/):  python3 herramientas/validar_imprenta.py
Comprueba, en cada artículo:
- que cada marca [palabra|regla] o [palabra|regla|mal] usa una de las 9 reglas de 5.º;
- que hay forma errónea (propia o de palabras.json), distinta de la correcta y de una sola palabra;
- que el error es de su regla (tilde, b/v, h, c/z/s, ll/y, g/j, -d/-z, mayúscula, monosílabo);
- que no se repite una candidata en el mismo artículo;
- que en las faltas de mayúscula del banco la forma errónea se usa tal cual (sevilla, Lunes) y no desaparece;
- que cada artículo tiene «nivel» (1-3) y, según su nivel, la longitud y las candidatas que piden las lupas:
    nivel 1 (bronce: 3 faltas muy visibles): 35-75 palabras, 5-9 candidatas, ≥ 4 reglas (≥ 3 muy visibles);
    nivel 2 (plata: 4-5 faltas; oro: 6): 80-140 palabras, 9-14 candidatas, ≥ 7 reglas;
    nivel 3 (oro: 6; diamante: 7-8 + sospechosas): 150-260 palabras, 12-18 candidatas, las 9 reglas;
- que hay al menos 30 artículos (y 8 de cada nivel) y que no se destripa la temporada (ni el Tachón ni Bruno);
- que el texto, sin marcas, no deja corchetes ni llaves sueltos.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
REGLAS_5 = ["tildes-generales", "b-v-1", "h-1", "c-z-s", "ll-y", "g-j-dieresis",
            "diptongo-monosilabos", "d-z-finales", "mayusculas-puntuacion-1"]
reglas = json.loads((RAIZ / "datos" / "reglas.json").read_text(encoding="utf-8"))
banco = {w["p"]: w for w in json.loads((RAIZ / "datos" / "academia" / "palabras.json").read_text(encoding="utf-8"))["palabras"]}
galeradas = json.loads((RAIZ / "datos" / "academia" / "galeradas.json").read_text(encoding="utf-8"))["galeradas"]
VISIBLES = {"mayusculas-puntuacion-1", "h-1", "b-v-1", "ll-y", "g-j-dieresis", "c-z-s", "d-z-finales"}
NIVELES = {1: {"palabras": (35, 75), "candidatas": (5, 9), "reglas": 4},
           2: {"palabras": (80, 140), "candidatas": (9, 14), "reglas": 7},
           3: {"palabras": (150, 260), "candidatas": (12, 18), "reglas": 9}}
PROHIBIDAS = re.compile(r"tach[oó]n|bruno", re.I)
MARCA = re.compile(r"\[([^\]|]+)\|([^\]|]+)(?:\|([^\]|]+))?\]")


def sin_tildes(s):
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn" or c == "̈")


def sin_acento_agudo(s):
    return unicodedata.normalize("NFC", unicodedata.normalize("NFD", s).replace("́", ""))


# Para cada regla: dos formas que, «neutralizadas», deben quedar iguales (el error es de esa regla)
def neutro(regla, s):
    s0 = s
    s = s.lower()
    if regla in ("tildes-generales", "diptongo-monosilabos"):
        return sin_acento_agudo(s)
    if regla == "mayusculas-puntuacion-1":
        return s
    if regla == "b-v-1":
        return s.replace("v", "b")
    if regla == "h-1":
        return s.replace("h", "")
    if regla == "c-z-s":
        s = s.replace("qu", "k").replace("q", "k")
        s = re.sub(r"c(?=[eiéí])", "s", s).replace("z", "s").replace("c", "k")
        return s
    if regla == "ll-y":
        return s.replace("ll", "y")
    if regla == "g-j-dieresis":
        s = s.replace("ü", "u").replace("j", "g")
        return re.sub(r"gu(?=[eiéí])", "g", s)
    if regla == "d-z-finales":
        return re.sub(r"[dz]$", "D", s)
    return s0


errores = []
avisos = []
por_nivel = {}
ids = set()
for g in galeradas:
    gid = g.get("id", "?")
    if gid in ids:
        errores.append(f"{gid}: id repetido")
    ids.add(gid)
    for campo in ("seccion", "titular", "entradilla", "firma", "parrafos"):
        if not g.get(campo):
            errores.append(f"{gid}: falta «{campo}»")
    nivel = g.get("nivel")
    if nivel not in NIVELES:
        errores.append(f"{gid}: «nivel» tiene que ser 1, 2 o 3")
        nivel = 2
    if PROHIBIDAS.search(json.dumps(g, ensure_ascii=False)):
        errores.append(f"{gid}: no se puede nombrar al Tachón ni a Bruno (destripa la temporada)")
    for campo in ("titular", "entradilla"):
        if re.search(r"[\[\]{}|]", g.get(campo, "")):
            errores.append(f"{gid}: el {campo} no puede llevar marcas")
    vistas, reglas_art, n = set(), set(), 0
    for par in g.get("parrafos", []):
        limpio = MARCA.sub(lambda m: m[1], par)
        if re.search(r"[\[\]{}|]", limpio):
            errores.append(f"{gid}: marca mal cerrada en «{par[:40]}…»")
        for m in MARCA.finditer(par):
            n += 1
            p, regla, mal = m[1], m[2], m[3]
            if regla not in REGLAS_5:
                errores.append(f"{gid}: [{p}] tiene una regla que no es de 5.º: {regla}")
                continue
            if regla not in reglas:
                errores.append(f"{gid}: [{p}] regla desconocida {regla}")
            w = banco.get(p) or banco.get(p.lower())
            if mal is None:
                if not w:
                    errores.append(f"{gid}: [{p}] no está en palabras.json: añade la forma errónea [{p}|{regla}|…]")
                    continue
                if not w.get("mal"):
                    errores.append(f"{gid}: [{p}] está en palabras.json pero sin forma errónea: añádela en la marca")
                    continue
                if w["regla"] != regla:
                    errores.append(f"{gid}: [{p}] es de {w['regla']} en palabras.json, no de {regla}")
                mal = w["mal"]
                # Como candidatasImprenta(): la mayúscula inicial se copia, salvo en las faltas de mayúscula
                if p[0].isupper() and regla != "mayusculas-puntuacion-1":
                    mal = mal[0].upper() + mal[1:]
            if mal == p:
                errores.append(f"{gid}: [{p}] la forma errónea es igual a la correcta")
            if not re.fullmatch(r"[^\W\d_]+", mal) or not re.fullmatch(r"[^\W\d_]+", p):
                errores.append(f"{gid}: [{p}|{mal}] debe ser una sola palabra, solo letras")
            if neutro(regla, mal) != neutro(regla, p):
                errores.append(f"{gid}: «{mal}» → «{p}» no parece un error de {regla}")
            if regla != "mayusculas-puntuacion-1" and p[0].isupper() != mal[0].isupper():
                errores.append(f"{gid}: [{p}|{mal}] cambia la mayúscula y no es de mayúsculas")
            if p.lower() in vistas:
                errores.append(f"{gid}: [{p}] está marcada dos veces")
            vistas.add(p.lower())
            reglas_art.add(regla)
    cfg = NIVELES[nivel]
    lo, hi = cfg["candidatas"]
    if not lo <= n <= hi:
        errores.append(f"{gid} (nivel {nivel}): tiene {n} candidatas (deben ser {lo}-{hi})")
    if len(reglas_art) < cfg["reglas"]:
        errores.append(f"{gid} (nivel {nivel}): solo tiene candidatas de {len(reglas_art)} reglas (mínimo {cfg['reglas']})")
    if nivel == 1 and len(reglas_art & VISIBLES) < 3:
        errores.append(f"{gid}: en bronce hacen falta 3 reglas muy visibles (no tildes ni monosílabos)")
    palabras = len(re.findall(r"\w+", " ".join(MARCA.sub(lambda m: m[1], p) for p in g.get("parrafos", []))))
    lo, hi = cfg["palabras"]
    if not lo <= palabras <= hi:
        errores.append(f"{gid} (nivel {nivel}): {palabras} palabras (deben ser {lo}-{hi})")
    por_nivel.setdefault(nivel, []).append((gid, palabras, n))

cobertura = {r: sum(1 for g in galeradas for p in g["parrafos"] for m in MARCA.finditer(p) if m[2] == r) for r in REGLAS_5}
print(f"{len(galeradas)} galeradas · candidatas por regla: " + ", ".join(f"{r} {c}" for r, c in cobertura.items()))
for nv in sorted(por_nivel):
    arts = por_nivel[nv]
    print(f"  nivel {nv}: {len(arts)} artículos · {min(a[1] for a in arts)}-{max(a[1] for a in arts)} palabras · {min(a[2] for a in arts)}-{max(a[2] for a in arts)} candidatas")
    if len(arts) < 8:
        errores.append(f"nivel {nv}: solo {len(arts)} artículos (mínimo 8)")
for a in avisos:
    print("  aviso:", a)
if len(galeradas) < 30:
    errores.append(f"hay {len(galeradas)} galeradas; deben ser al menos 30")
if errores:
    print("ERRORES:")
    for e in errores:
        print("  -", e)
    sys.exit(1)
print("Todo correcto")
