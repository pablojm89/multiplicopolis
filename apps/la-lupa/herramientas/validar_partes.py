#!/usr/bin/env python3
"""Valida los partes de «Rellena el parte» (datos/academia/partes.json).

Uso (desde apps/la-lupa/):  python3 herramientas/validar_partes.py
Comprueba:
- al menos 10 plantillas de parte, con id único, título, negociado, código, «otros» y apartados
  con campos conocidos (cosa, lugar, ser, animal, tiempo, accion, verbo, como; uno o una lista);
- al menos 40 pistas, de las 9 reglas de 5.º, y al menos 20 por regla;
- que cada pista tiene nivel 1, 2 o 3 (1 fácil para el bronce; 3 difícil para el diamante) y que en cada
  regla hay al menos 7 de cada nivel (en diamante, una ronda son 2 partes de 6 casillas);
- que la pista nunca contiene la palabra que se busca (ni sin tildes) y cabe en la hoja (≤ 80 letras);
- que la explicación (porque) nombra la palabra;
- que la palabra no está en palabras.json con otra regla (tildes y diptongos cuentan como la misma);
- en tildes y diptongos, que la explicación dice «lleva tilde» solo si la palabra la lleva;
- en mayúsculas, que la explicación habla de mayúscula o minúscula según cómo se escribe.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
REGLAS_5 = ["tildes-generales", "b-v-1", "h-1", "c-z-s", "ll-y", "g-j-dieresis",
            "diptongo-monosilabos", "d-z-finales", "mayusculas-puntuacion-1"]
CAMPOS = {"cosa", "lugar", "ser", "animal", "tiempo", "accion", "verbo", "como"}
datos = json.loads((RAIZ / "datos" / "academia" / "partes.json").read_text(encoding="utf-8"))
banco = {w["p"].lower(): w for w in json.loads((RAIZ / "datos" / "academia" / "palabras.json").read_text(encoding="utf-8"))["palabras"]}
reglas = json.loads((RAIZ / "datos" / "reglas.json").read_text(encoding="utf-8"))


def sin_tildes(s):
    return unicodedata.normalize("NFC", unicodedata.normalize("NFD", s.lower()).replace("́", ""))


errores = []
if not datos.get("declarantes"):
    errores.append("faltan declarantes")
partes = datos.get("partes", [])
ids = set()
for pl in partes:
    pid = pl.get("id", "?")
    if pid in ids:
        errores.append(f"parte {pid}: id repetido")
    ids.add(pid)
    for campo in ("titulo", "negociado", "codigo", "otros", "letra_pequena"):
        if not pl.get(campo):
            errores.append(f"parte {pid}: falta «{campo}»")
    aps = pl.get("apartados", [])
    if len(aps) < 4:
        errores.append(f"parte {pid}: necesita al menos 4 apartados")
    for ap in aps:
        campos = ap.get("campo") if isinstance(ap.get("campo"), list) else [ap.get("campo")]
        if not campos or not set(campos) <= CAMPOS:
            errores.append(f"parte {pid}: campo desconocido «{ap.get('campo')}»")
        if not ap.get("etiqueta"):
            errores.append(f"parte {pid}: apartado sin etiqueta")
if len(partes) < 10:
    errores.append(f"hay {len(partes)} plantillas de parte; hacen falta al menos 10")

pistas = datos.get("pistas", [])
vistas = set()
por_regla = {r: 0 for r in REGLAS_5}
por_nivel = {(r, n): 0 for r in REGLAS_5 for n in (1, 2, 3)}
for x in pistas:
    p, r = x.get("p", ""), x.get("regla")
    clave = f"{p} ({r})"
    if (p, r) in vistas:
        errores.append(f"{clave}: pista repetida")
    vistas.add((p, r))
    if r not in REGLAS_5 or r not in reglas:
        errores.append(f"{clave}: regla desconocida")
        continue
    por_regla[r] += 1
    if x.get("nivel") not in (1, 2, 3):
        errores.append(f"{clave}: nivel {x.get('nivel')!r} (debe ser 1, 2 o 3)")
    else:
        por_nivel[(r, x["nivel"])] += 1
    if x.get("campo") not in CAMPOS | {"dato"}:
        errores.append(f"{clave}: campo desconocido «{x.get('campo')}»")
    pista, porque = x.get("pista", ""), x.get("porque", "")
    if not pista or not porque:
        errores.append(f"{clave}: falta la pista o la explicación")
        continue
    if re.search(rf"(?<!\w){re.escape(sin_tildes(p))}(?!\w)", sin_tildes(pista)):
        errores.append(f"{clave}: la pista contiene la palabra que se busca")
    if len(pista) > 80:
        errores.append(f"{clave}: pista demasiado larga ({len(pista)} > 80)")
    if p.lower() not in porque.lower():
        errores.append(f"{clave}: la explicación no nombra la palabra")
    w = banco.get(p.lower())
    acentuacion = {"tildes-generales", "diptongo-monosilabos"}
    if w and w["regla"] != r and not {w["regla"], r} <= acentuacion:
        errores.append(f"{clave}: en palabras.json es de la regla {w['regla']}")
    tiene = sin_tildes(p) != p.lower()
    if r in ("tildes-generales", "diptongo-monosilabos"):
        dice_no = bool(re.search(r"no llevan? tilde|sin tilde", porque))
        dice_si = bool(re.search(r"llevan? tilde", porque)) and not dice_no
        if tiene and not dice_si:
            errores.append(f"{clave}: lleva tilde, y la explicación debe decirlo («lleva tilde»)")
        if not tiene and not dice_no:
            errores.append(f"{clave}: no lleva tilde, y la explicación debe decirlo («no lleva tilde»)")
    if r == "mayusculas-puntuacion-1":
        mayus = p[0] != p[0].lower()
        if mayus and "mayúscula" not in porque:
            errores.append(f"{clave}: va con mayúscula y la explicación no lo dice")
        if not mayus and "minúscula" not in porque:
            errores.append(f"{clave}: va con minúscula y la explicación no lo dice")
for r, n in por_regla.items():
    if n < 20:
        errores.append(f"la regla {r} tiene {n} pistas; hacen falta al menos 20")
    for nv in (1, 2, 3):
        if por_nivel[(r, nv)] < 7:
            errores.append(f"la regla {r} tiene {por_nivel[(r, nv)]} pistas de nivel {nv}; hacen falta al menos 7")
if len(pistas) < 40:
    errores.append(f"hay {len(pistas)} pistas; hacen falta al menos 40")

print(f"{len(partes)} partes, {len(pistas)} pistas: " + ", ".join(f"{r} {n}" for r, n in por_regla.items()))
print("Por nivel (1/2/3): " + ", ".join(f"{r} {'/'.join(str(por_nivel[(r, nv)]) for nv in (1, 2, 3))}" for r in REGLAS_5))
if errores:
    print("\n".join("ERROR " + e for e in errores))
    sys.exit(1)
print("OK")
