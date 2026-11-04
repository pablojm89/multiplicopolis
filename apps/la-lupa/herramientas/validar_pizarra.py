#!/usr/bin/env python3
"""Valida datos/academia/pizarra.json (sala de la Pizarra, Z1 · Descubre la regla).

Comprueba, por cada regla de 5.º y cada subregla:
- campos obligatorios y tamaños mínimos (ejemplos ≥ 8, relleno ≥ 6, 3 hipótesis);
- una hipótesis de cada tipo (una sola buena, una amplia y una estrecha), con su «porque»;
- que «{p}» solo aparece si hay «prueba», y que la prueba de la amplia sale del relleno
  y la de la estrecha, de los ejemplos;
- que no hay duplicados ni palabras repetidas entre ejemplos, relleno y contraejemplos;
- que todos los ejemplos cumplen el «patron» y ningún relleno lo cumple;
- que «punto» existe en la ficha de Mateo de reglas.json;
- que hay palabras de sobra para las cuatro fases (pizarra, contraejemplo y ejemplo propio);
- formato: palabras sueltas en minúscula; frases cortas, con mayúscula o signo inicial y cierre.
Uso: python3 herramientas/validar_pizarra.py
"""
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
REGLAS_5 = ["tildes-generales", "b-v-1", "h-1", "c-z-s", "ll-y", "g-j-dieresis",
            "diptongo-monosilabos", "d-z-finales", "mayusculas-puntuacion-1"]
MAX_FRASE = 36  # caracteres: dos frases tienen que caber por fila en la pizarra

errores, avisos = [], []


def err(donde, msg):
    errores.append(f"{donde}: {msg}")


def main():
    datos = json.loads((RAIZ / "datos/academia/pizarra.json").read_text(encoding="utf-8"))
    reglas = json.loads((RAIZ / "datos/reglas.json").read_text(encoding="utf-8"))
    banco = datos.get("reglas", {})
    for r in REGLAS_5:
        if r not in banco:
            err(r, "falta la regla en pizarra.json")
    total = 0
    for r, subs in banco.items():
        if r not in reglas:
            err(r, "no existe en reglas.json")
            continue
        puntos = (reglas[r].get("ficha") or {}).get("puntos", [])
        if not puntos:
            err(r, "la regla no tiene ficha de Mateo")
        if len(subs) < 2:
            avisos.append(f"{r}: solo {len(subs)} subregla(s)")
        ids = [s.get("id") for s in subs]
        if len(ids) != len(set(ids)):
            err(r, "ids de subregla repetidos")
        for s in subs:
            total += 1
            validar_sub(f"{r}/{s.get('id')}", s, puntos)
    print(f"Pizarra: {len(banco)} reglas, {total} subreglas.")
    for a in avisos:
        print("  aviso:", a)
    if errores:
        print(f"\n{len(errores)} error(es):")
        for e in errores:
            print("  ✗", e)
        sys.exit(1)
    print("✓ Todo correcto.")


def validar_sub(donde, s, puntos):
    for campo in ("id", "nombre", "pista", "si", "ejemplos", "relleno", "hipotesis"):
        if not s.get(campo):
            err(donde, f"falta «{campo}»")
    frases = bool(s.get("frases"))
    ej, rel, con = s.get("ejemplos", []), s.get("relleno", []), s.get("contraejemplos", [])
    if len(ej) < 8:
        err(donde, f"solo {len(ej)} ejemplos (mínimo 8)")
    if len(rel) < 6:
        err(donde, f"solo {len(rel)} de relleno (mínimo 6)")
    # Fase 1: 4 ejemplos + 2 relleno. Fase 3: 2 ejemplos + 1 excepción, o 1 ejemplo + 2 relleno. Fase 4: queda alguno.
    if len(ej) < 7 or len(rel) < 4:
        err(donde, "no hay palabras de sobra para las fases 3 y 4")
    if con and not s.get("excepcion"):
        err(donde, "hay contraejemplos pero falta «excepcion»")
    if not isinstance(s.get("punto"), int) or not 0 <= s["punto"] < len(puntos):
        err(donde, f"«punto» {s.get('punto')} no está en la ficha ({len(puntos)} puntos)")

    # Duplicados y solapes
    for nombre, lista in (("ejemplos", ej), ("relleno", rel), ("contraejemplos", con)):
        claves = [clave(x, frases) for x in lista]
        dup = {x for x in claves if claves.count(x) > 1}
        if dup:
            err(donde, f"duplicados en {nombre}: {sorted(dup)}")
    cj, cr, cc = ({clave(x, frases) for x in l} for l in (ej, rel, con))
    for a, b, na, nb in ((cj, cr, "ejemplos", "relleno"), (cj, cc, "ejemplos", "contraejemplos"), (cr, cc, "relleno", "contraejemplos")):
        if a & b:
            err(donde, f"en {na} y en {nb} a la vez: {sorted(a & b)}")

    # Formato
    for x in ej + rel + con:
        if x != x.strip() or "  " in x:
            err(donde, f"espacios sobrantes en «{x}»")
        if frases:
            if len(x) > MAX_FRASE:
                err(donde, f"frase demasiado larga ({len(x)} > {MAX_FRASE}): «{x}»")
            if not re.match(r"^[¿¡]?[A-ZÁÉÍÓÚÑ]", x):
                err(donde, f"la frase no empieza con mayúscula: «{x}»")
            if not re.search(r"[.?!…]$", x):
                err(donde, f"la frase no se cierra con punto o signo: «{x}»")
            if x.count("¿") != x.count("?") or x.count("¡") != x.count("!"):
                err(donde, f"signos sin pareja: «{x}»")
        else:
            if " " in x:
                err(donde, f"palabra con espacios: «{x}»")
            if x != x.lower():
                err(donde, f"palabra con mayúscula: «{x}»")

    # Patrón comprobable (mismas expresiones que usa el juego en JS)
    pat = s.get("patron")
    if pat:
        try:
            rx = re.compile(pat)
        except re.error as e:
            err(donde, f"patrón inválido: {e}")
            rx = None
        if rx:
            for x in ej:
                if not rx.search(prep(x, frases)):
                    err(donde, f"el ejemplo «{x}» no cumple el patrón {pat}")
            for x in rel:
                if rx.search(prep(x, frases)):
                    err(donde, f"el relleno «{x}» cumple el patrón {pat}")
    else:
        avisos.append(f"{donde}: sin patrón (el ejemplo propio no se comprueba)")
    if "{plural}" in s.get("si", "") + s.get("excepcion", ""):
        for x in ej:
            if not re.search(r"[dz]$", x):
                err(donde, f"«{{plural}}» con «{x}», que no acaba en d ni en z")

    # Hipótesis
    hip = s.get("hipotesis", [])
    valores = [h.get("valor") for h in hip]
    if sorted(valores) != ["amplia", "buena", "estrecha"]:
        err(donde, f"las hipótesis tienen que ser una buena, una amplia y una estrecha (hay {valores})")
    textos = [h.get("texto", "") for h in hip]
    if len(set(textos)) != len(textos):
        err(donde, "hipótesis repetidas")
    for h in hip:
        t, v = h.get("texto", ""), h.get("valor")
        if not t or not t[0].isupper() or not t.endswith("."):
            err(donde, f"hipótesis mal formada: «{t}»")
        if v != "buena" and not h.get("porque"):
            err(donde, f"la hipótesis {v} no explica «porque»")
        prueba = h.get("prueba", [])
        if "{p}" in h.get("porque", "") and not prueba:
            err(donde, f"la hipótesis {v} usa {{p}} y no tiene «prueba»")
        origen = {"amplia": cr, "estrecha": cj}.get(v)
        for x in prueba:
            if origen is None or clave(x, frases) not in origen:
                err(donde, f"la prueba «{x}» de la {v} no está en {'el relleno' if v == 'amplia' else 'los ejemplos'}")


def clave(x, frases):
    return " ".join(x.split()) if frases else x.strip().lower()


def prep(x, frases):
    return x.strip() if frases else x.strip().lower()


if __name__ == "__main__":
    main()
