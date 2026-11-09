#!/usr/bin/env python3
"""Valida datos/academia/apuntes.json (apuntes de la libreta antes de cada caso).

Comprueba:
- que están las 9 reglas de 5.º y que todas existen en reglas.json;
- campos obligatorios: titulo («Apuntes de detective · <nombre de la regla>»), intro, esquemas, completar;
- 2 o 3 esquemas por regla, con al menos una tabla y al menos una lista o unos pasos;
- tablas: mismo número de celdas en cada fila que columnas; la primera columna (la regla) nunca vacía;
  al menos una celda vacía por regla para que el alumno la complete;
- pasos numerados «1.º …», «2.º …» en orden;
- que no hay cadenas vacías fuera de las celdas de las tablas;
- formas que la Ortografía de 2010 ya no acentúa (sólo, guión, fué, dió…).
Uso: python3 herramientas/validar_apuntes.py
"""
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
REGLAS_5 = ["tildes-generales", "b-v-1", "h-1", "c-z-s", "ll-y", "g-j-dieresis",
            "diptongo-monosilabos", "d-z-finales", "mayusculas-puntuacion-1"]
TIPOS = {"tabla", "lista", "pasos"}
PROHIBIDAS = re.compile(r"\b(sólo|guión|truhán|fué|fuí|dió|vió|pié|éste|ésta|éstos|éstas|ése|ésa|ésos|ésas|"
                        r"aquél|aquélla|aquéllos|aquéllas|ó)\b", re.IGNORECASE)

errores = []


def err(donde, msg):
    errores.append(f"{donde}: {msg}")


def texto(donde, valor):
    """Cadena obligatoria (no vacía) + revisión ortográfica."""
    if not isinstance(valor, str) or not valor.strip():
        err(donde, "cadena vacía o ausente")
        return
    revisar(donde, valor)


def revisar(donde, valor):
    if valor != valor.strip() or "  " in valor:
        err(donde, f"espacios sobrantes en «{valor}»")
    for m in PROHIBIDAS.finditer(valor):
        err(donde, f"forma sin tilde en la Ortografía de 2010: «{m.group(0)}»")


def main():
    apuntes = json.loads((RAIZ / "datos/academia/apuntes.json").read_text(encoding="utf-8"))
    reglas = json.loads((RAIZ / "datos/reglas.json").read_text(encoding="utf-8"))
    for r in REGLAS_5:
        if r not in apuntes:
            err(r, "faltan los apuntes de esta regla")
    for rid, a in apuntes.items():
        if rid not in reglas:
            err(rid, "la regla no existe en reglas.json")
            continue
        esperado = f"Apuntes de detective · {reglas[rid]['nombre']}"
        if a.get("titulo") != esperado:
            err(rid, f"el título debería ser «{esperado}»")
        texto(f"{rid}.intro", a.get("intro"))
        texto(f"{rid}.completar", a.get("completar"))
        esquemas = a.get("esquemas") or []
        if not 2 <= len(esquemas) <= 3:
            err(rid, f"tiene {len(esquemas)} esquemas (deben ser 2 o 3)")
        tipos = [e.get("tipo") for e in esquemas]
        if "tabla" not in tipos:
            err(rid, "falta al menos una tabla")
        if not {"lista", "pasos"} & set(tipos):
            err(rid, "falta una lista de trucos o unos pasos")
        vacias = 0
        for i, e in enumerate(esquemas):
            d = f"{rid}.esquemas[{i}]"
            if e.get("tipo") not in TIPOS:
                err(d, f"tipo desconocido «{e.get('tipo')}»")
                continue
            texto(f"{d}.titulo", e.get("titulo"))
            if e["tipo"] == "tabla":
                cols = e.get("columnas") or []
                if len(cols) < 2:
                    err(d, "una tabla necesita al menos 2 columnas")
                for j, c in enumerate(cols):
                    texto(f"{d}.columnas[{j}]", c)
                filas = e.get("filas") or []
                if not filas:
                    err(d, "la tabla no tiene filas")
                for j, f in enumerate(filas):
                    if len(f) != len(cols):
                        err(d, f"fila {j}: {len(f)} celdas para {len(cols)} columnas")
                    if not f or not str(f[0]).strip():
                        err(d, f"fila {j}: la primera celda (la regla) no puede quedar vacía")
                    for celda in f:
                        if not isinstance(celda, str):
                            err(d, f"fila {j}: celda que no es texto")
                        elif celda == "":
                            vacias += 1
                        else:
                            revisar(f"{d}.filas[{j}]", celda)
            elif e["tipo"] == "lista":
                puntos = e.get("puntos") or []
                if not puntos:
                    err(d, "la lista no tiene puntos")
                for j, p in enumerate(puntos):
                    texto(f"{d}.puntos[{j}]", p)
            else:
                pasos = e.get("pasos") or []
                if len(pasos) < 2:
                    err(d, "hacen falta al menos 2 pasos")
                for j, p in enumerate(pasos):
                    texto(f"{d}.pasos[{j}]", p)
                    if isinstance(p, str) and not p.startswith(f"{j + 1}.º "):
                        err(d, f"el paso {j + 1} debe empezar por «{j + 1}.º »")
        if vacias == 0:
            err(rid, "ninguna celda vacía: el alumno no tiene nada que completar en las tablas")
    if errores:
        print("\n".join(errores))
        print(f"\n✗ {len(errores)} errores")
        sys.exit(1)
    n = sum(len(a["esquemas"]) for a in apuntes.values())
    print(f"✓ apuntes.json correcto: {len(apuntes)} reglas, {n} esquemas")


if __name__ == "__main__":
    main()
