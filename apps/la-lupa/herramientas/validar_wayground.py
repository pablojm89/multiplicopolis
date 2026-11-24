#!/usr/bin/env python3
"""Comprueba datos/wayground.json (órdenes del director con un cuestionario de Wayground).

Uso: python3 herramientas/validar_wayground.py
- código de 6 a 8 cifras (el de la asignación; enlace https://wayground.com/join?gc=CÓDIGO)
- «hasta» con formato AAAA-MM-DD y fecha real
- curso, si lo hay, de programacion.json; reglas, si las hay, de reglas.json
- avisa de las órdenes caducadas (se pueden borrar) y de campos desconocidos
"""
import datetime, json, pathlib, re, sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
datos = json.loads((RAIZ / "datos/wayground.json").read_text(encoding="utf-8"))
reglas = json.loads((RAIZ / "datos/reglas.json").read_text(encoding="utf-8"))
cursos = json.loads((RAIZ / "datos/programacion.json").read_text(encoding="utf-8"))["cursos"]
CAMPOS = {"titulo", "codigo", "hasta", "curso", "reglas", "mensaje"}
hoy = datetime.date.today()
errores, avisos = [], []

ordenes = datos.get("ordenes")
if not isinstance(ordenes, list):
    errores.append("falta la lista «ordenes»")
    ordenes = []
for i, o in enumerate(ordenes, 1):
    nom = f"orden {i} ({o.get('titulo', 'sin título')})" if isinstance(o, dict) else f"orden {i}"
    if not isinstance(o, dict):
        errores.append(f"{nom}: no es un objeto"); continue
    if not re.fullmatch(r"\d{6,8}", str(o.get("codigo", "")).replace(" ", "")):
        errores.append(f"{nom}: el código debe tener de 6 a 8 cifras")
    if not str(o.get("titulo", "")).strip():
        avisos.append(f"{nom}: sin título (saldrá «Cuestionario de Wayground»)")
    try:
        hasta = datetime.date.fromisoformat(o.get("hasta", ""))
        if hasta < hoy:
            avisos.append(f"{nom}: caducada el {hasta:%d/%m/%Y}; ya no sale en el tablón y se puede borrar")
    except (TypeError, ValueError):
        errores.append(f"{nom}: «hasta» debe ser una fecha AAAA-MM-DD")
    if o.get("curso") is not None and str(o["curso"]) not in cursos:
        errores.append(f"{nom}: el curso «{o['curso']}» no existe (cursos: {', '.join(cursos)})")
    for r in o.get("reglas", []) or []:
        if r not in reglas:
            errores.append(f"{nom}: la regla «{r}» no está en reglas.json")
    for c in set(o) - CAMPOS:
        avisos.append(f"{nom}: campo desconocido «{c}» (se ignora)")

for a in avisos:
    print("Aviso:", a)
for e in errores:
    print("ERROR:", e)
vigentes = sum(1 for o in ordenes if isinstance(o, dict) and str(o.get("hasta", "")) >= hoy.isoformat())
print(f"{len(ordenes)} órdenes, {vigentes} en el tablón hoy. {'Todo bien.' if not errores else f'{len(errores)} errores.'}")
sys.exit(1 if errores else 0)
