#!/usr/bin/env python3
"""Valida las familias de palabras del Laboratorio (datos/academia/familias.json).

Uso (desde apps/la-lupa/):  python3 herramientas/validar_familias.py
Comprueba: al menos 70 familias con 2-4 derivadas, reglas que existen en reglas.json,
nivel 1-3 (nivel 1, bronce: al menos 2 derivadas que heredan la letra; nivel 3, oro y
diamante: al menos 3 derivadas), piezas que forman la raíz, letra dudosa en su sitio (en la
raíz y en cada derivada; «sin h» marca dónde iría y la palabra no tiene h ahí), opciones que incluyen la letra,
explicación («porque») cuando la letra cambia, pista y frase con un solo hueco que no
dejan ver la palabra (si no hay frase, debe estar en palabras.json), sin derivadas
repetidas, coherencia de reglas con palabras.json y contenido por lupa: cada regla de la
centrifugadora tiene al menos 2 familias de nivel 1 (las de -d y -z finales pueden apoyarse
en las de c, z y s que las tocan).
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
MIN_FAMILIAS = 70
REGLAS_CENTRI = ["h-1", "b-v-1", "c-z-s", "ll-y", "d-z-finales", "g-j-dieresis"]   # LAB_FAM_REGLAS


def letra_en(palabra, letra, pos):
    """¿Está la letra en su sitio? «sin h»: la palabra no la tiene ahí."""
    if letra.startswith("sin "):
        falta = letra[4:]
        return 0 <= pos <= len(palabra) and palabra[pos:pos + len(falta)] != falta
    return palabra[pos:pos + len(letra)] == letra

errores, avisos = [], []
ids, vistas = set(), Counter()
por_regla, por_nivel, nivel_regla = Counter(), Counter(), Counter()
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
    if not letra_en(raiz, letra, pos):
        errores.append(f"{fid}: la raíz «{raiz}» no tiene «{letra}» en la posición {pos}")
    nivel = f.get("nivel")
    if nivel not in (1, 2, 3):
        errores.append(f"{fid}: nivel {nivel!r} (debe ser 1, 2 o 3)")
    por_nivel[nivel] += 1
    for r in {f.get("regla"), *f.get("tambien", [])}:
        nivel_regla[(r, nivel)] += 1
    if not f.get("nota", "").strip():
        errores.append(f"{fid}: falta la nota")
    ders = f.get("derivadas", [])
    if not 2 <= len(ders) <= 4:
        errores.append(f"{fid}: tiene {len(ders)} derivadas (deben ser 2-4)")
    heredan = [d for d in ders if d.get("letra") == letra]
    if nivel == 1 and len(heredan) < 2:
        errores.append(f"{fid}: nivel 1 (bronce) necesita al menos 2 derivadas que hereden la letra ({len(heredan)})")
    if nivel == 3 and len(ders) < 3:
        errores.append(f"{fid}: nivel 3 (oro y diamante) necesita al menos 3 derivadas ({len(ders)})")
    if raiz in banco or any(d["p"] in banco for d in ders):
        conectadas += 1
    for d in ders:
        p, l, dp = d["p"], d.get("letra", ""), d.get("pos", -1)
        cab = f"{fid}/{p}"
        vistas[p] += 1
        ops = d.get("opciones", [])
        if l not in ops or len(ops) < 2 or len(set(ops)) != len(ops):
            errores.append(f"{cab}: opciones {ops} no válidas para la letra «{l}»")
        if not letra_en(p, l, dp):
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
if len(familias) < MIN_FAMILIAS:
    errores.append(f"solo hay {len(familias)} familias (mínimo {MIN_FAMILIAS})")
for r in REGLAS_CENTRI:
    if nivel_regla[(r, 1)] < 2:
        errores.append(f"la regla {r} tiene {nivel_regla[(r, 1)]} familias de nivel 1 (mínimo 2: una ronda de bronce)")
    if nivel_regla[(r, 3)] < 2:
        avisos.append(f"la regla {r} solo tiene {nivel_regla[(r, 3)]} familias de nivel 3: el diamante completará con las de nivel 2")

print(f"{len(familias)} familias, {sum(vistas.values())} derivadas, {conectadas} enlazadas con palabras.json · "
      + ", ".join(f"{r}: {n}" for r, n in sorted(por_regla.items())))
print("Por nivel: " + ", ".join(f"nivel {n}: {por_nivel[n]}" for n in (1, 2, 3)) + " · por regla (n1/n2/n3): "
      + ", ".join(f"{r}: {nivel_regla[(r, 1)]}/{nivel_regla[(r, 2)]}/{nivel_regla[(r, 3)]}" for r in REGLAS_CENTRI))
for a in avisos:
    print("· " + a)
if errores:
    print("\n".join("✗ " + e for e in errores))
    sys.exit(1)
print("✓ Familias correctas")
