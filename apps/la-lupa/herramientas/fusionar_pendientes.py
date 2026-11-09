#!/usr/bin/env python3
"""Pasa los casos en preparación (datos/pendiente/<caso>.json) a los archivos compartidos.

Uso (desde apps/la-lupa/):  python3 herramientas/fusionar_pendientes.py [--borrar]
Cada archivo de pendiente/ puede traer:
  "unidad": "5-06"        → en programacion.json, esa unidad apunta a <caso>
  "reglas": {id: {...}}   → se mezcla con reglas.json (los campos nuevos sustituyen a los viejos)
  "arte":   {id: {...}}   → se añade a arte.json; si el personaje ya existe, solo se suman sus
                            expresiones nuevas (se conservan las imágenes ya hechas)
Sirve para que varios casos se escriban a la vez (por ejemplo, con subagentes) sin pisarse.
"""
import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DATOS = RAIZ / "datos"


def leer(nombre):
    return json.loads((DATOS / nombre).read_text(encoding="utf-8"))


def escribir(nombre, datos):
    (DATOS / nombre).write_text(json.dumps(datos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


reglas, arte, prog = leer("reglas.json"), leer("arte.json"), leer("programacion.json")
pendientes = sorted((DATOS / "pendiente").glob("*.json"))
for f in pendientes:
    extra = json.loads(f.read_text(encoding="utf-8"))
    caso = f.stem
    for k, v in extra.get("reglas", {}).items():
        reglas.setdefault(k, {}).update(v)
    for k, v in extra.get("arte", {}).items():
        if k in arte and arte[k].get("tipo") == "personaje":
            viejas = arte[k].setdefault("expresiones", [])
            viejas += [x for x in v.get("expresiones", []) if x not in viejas]
        elif k not in arte:
            arte[k] = v
    if extra.get("unidad"):
        unidades = [u for c in prog["cursos"].values() for u in c["unidades"] if u["id"] == extra["unidad"]]
        if not unidades:
            sys.exit(f"{f.name}: la unidad {extra['unidad']} no está en programacion.json")
        unidades[0]["caso"] = caso
    print(f"{f.name}: {len(extra.get('reglas', {}))} reglas, {len(extra.get('arte', {}))} entradas de arte, unidad {extra.get('unidad')}")

escribir("reglas.json", reglas)
escribir("arte.json", arte)
escribir("programacion.json", prog)
if "--borrar" in sys.argv:
    for f in pendientes:
        f.unlink()
print("Hecho. Ejecuta ahora validar_casos.py y encargo_arte.py.")
