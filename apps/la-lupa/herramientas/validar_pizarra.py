#!/usr/bin/env python3
"""Valida datos/academia/pizarra.json (sala de la Pizarra, Z1 · Descubre la regla).

Comprueba, por cada regla de 5.º y cada subregla:
- campos obligatorios y tamaños mínimos (ejemplos ≥ 12, relleno ≥ 8, 4 hipótesis);
- «nivel» de la subregla (1-3) y de cada ejemplo ({p, nivel}), con ejemplos de sobra para cada lupa:
  bronce (nivel 1, si la subregla es de nivel 1), plata (nivel 1-2), oro (2-3) y diamante (al menos 3 de nivel 3);
- una hipótesis de cada tipo (buena, amplia, estrecha y «otra», para el bronce), con su «porque»;
- que «{p}» solo aparece si hay «prueba», y que la prueba de la amplia sale del relleno
  y la de la estrecha, de los ejemplos;
- que no hay duplicados ni palabras repetidas entre ejemplos, relleno y contraejemplos;
- que todos los ejemplos cumplen el «patron» y ningún relleno lo cumple;
- que «punto» existe en la ficha de Mateo de reglas.json;
- que hay palabras de sobra para las cuatro fases (pizarra, contraejemplo y ejemplo propio);
- formato: palabras sueltas en minúscula; frases cortas, con mayúscula o signo inicial y cierre;
- por regla: al menos 4 subreglas, alguna de nivel 1 y algún par de «rivales» (lupa de oro).
  Los rivales son mutuos, de la misma regla, y ningún ejemplo ni contraejemplo de uno cumple el patrón
  del otro; entre los dos hay relleno que no cumple ninguno de los dos patrones.
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
MIN_SUBREGLAS = 4

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
    total, ejemplos, por_nivel, pares = 0, 0, {1: 0, 2: 0, 3: 0}, 0
    for r, subs in banco.items():
        if r not in reglas:
            err(r, "no existe en reglas.json")
            continue
        puntos = (reglas[r].get("ficha") or {}).get("puntos", [])
        if not puntos:
            err(r, "la regla no tiene ficha de Mateo")
        if len(subs) < MIN_SUBREGLAS:
            err(r, f"solo {len(subs)} subregla(s) (mínimo {MIN_SUBREGLAS})")
        ids = [s.get("id") for s in subs]
        if len(ids) != len(set(ids)):
            err(r, "ids de subregla repetidos")
        if not any(s.get("nivel") == 1 for s in subs):
            err(r, "no hay ninguna subregla de nivel 1 (lupa de bronce)")
        for s in subs:
            total += 1
            ejemplos += len(s.get("ejemplos", []))
            por_nivel[s.get("nivel")] = por_nivel.get(s.get("nivel"), 0) + 1
            validar_sub(f"{r}/{s.get('id')}", s, puntos)
        pares += validar_rivales(r, subs)
    print(f"Pizarra: {len(banco)} reglas, {total} subreglas (nivel 1: {por_nivel[1]}, 2: {por_nivel[2]}, 3: {por_nivel[3]}), "
          f"{ejemplos} ejemplos, {pares} pares de rivales.")
    for a in avisos:
        print("  aviso:", a)
    if errores:
        print(f"\n{len(errores)} error(es):")
        for e in errores:
            print("  ✗", e)
        sys.exit(1)
    print("✓ Todo correcto.")


def palabra(x):
    return x.get("p", "") if isinstance(x, dict) else x


def validar_sub(donde, s, puntos):
    for campo in ("id", "nombre", "pista", "si", "ejemplos", "relleno", "hipotesis"):
        if not s.get(campo):
            err(donde, f"falta «{campo}»")
    frases = bool(s.get("frases"))
    nivel = s.get("nivel")
    if nivel not in (1, 2, 3):
        err(donde, f"«nivel» de la subregla debe ser 1, 2 o 3 (hay {nivel})")
    crudos = s.get("ejemplos", [])
    for x in crudos:
        if not isinstance(x, dict) or not x.get("p") or x.get("nivel") not in (1, 2, 3):
            err(donde, f"cada ejemplo es {{p, nivel}} con nivel 1-3: {x}")
    ej = [palabra(x) for x in crudos]
    niv = [x.get("nivel") if isinstance(x, dict) else 1 for x in crudos]
    rel, con = s.get("relleno", []), s.get("contraejemplos", [])
    if len(ej) < 12:
        err(donde, f"solo {len(ej)} ejemplos (mínimo 12)")
    if len(rel) < 8:
        err(donde, f"solo {len(rel)} de relleno (mínimo 8)")
    # Ejemplos para cada lupa (el juego necesita las de la pizarra + 3 para el contraejemplo + 1 de idea)
    n1, n12, n23, n3 = (sum(1 for n in niv if f(n)) for f in (lambda n: n == 1, lambda n: n <= 2, lambda n: n >= 2, lambda n: n == 3))
    if nivel == 1 and n1 < 8:
        err(donde, f"subregla de nivel 1 con solo {n1} ejemplos de nivel 1 (mínimo 8, para el bronce)")
    if nivel in (1, 2) and n12 < 9:
        err(donde, f"solo {n12} ejemplos de nivel 1-2 (mínimo 9, para la plata)")
    if n23 < (9 if nivel == 3 else 6):
        err(donde, f"solo {n23} ejemplos de nivel 2-3 (mínimo {9 if nivel == 3 else 6}, para el oro y el diamante)")
    if n3 < 3:
        err(donde, f"solo {n3} ejemplos de nivel 3 (mínimo 3, para el diamante)")
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
    rx = patron(donde, s)
    if rx:
        for x in ej:
            if not rx.search(prep(x, frases)):
                err(donde, f"el ejemplo «{x}» no cumple el patrón {s['patron']}")
        for x in rel:
            if rx.search(prep(x, frases)):
                err(donde, f"el relleno «{x}» cumple el patrón {s['patron']}")
    elif not s.get("patron"):
        avisos.append(f"{donde}: sin patrón (el ejemplo propio no se comprueba)")
    if "{plural}" in s.get("si", "") + s.get("excepcion", ""):
        for x in ej:
            if not re.search(r"[dz]$", x):
                err(donde, f"«{{plural}}» con «{x}», que no acaba en d ni en z")

    # Hipótesis
    hip = s.get("hipotesis", [])
    valores = [h.get("valor") for h in hip]
    if sorted(valores) != ["amplia", "buena", "estrecha", "otra"]:
        err(donde, f"las hipótesis tienen que ser una buena, una amplia, una estrecha y una «otra» (hay {valores})")
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
        if v in ("amplia", "estrecha") and not prueba:
            err(donde, f"la hipótesis {v} no tiene «prueba» que la tumbe en la pizarra")
        origen = {"amplia": cr, "estrecha": cj}.get(v)
        for x in prueba:
            if origen is None or clave(x, frases) not in origen:
                err(donde, f"la prueba «{x}» de la {v} no está en {'el relleno' if v == 'amplia' else 'los ejemplos'}")


def validar_rivales(r, subs):
    """Lupa de oro: pares de subreglas rivales. Devuelve cuántos pares hay."""
    por_id = {s.get("id"): s for s in subs}
    pares = set()
    for s in subs:
        for o in s.get("rivales", []):
            donde = f"{r}/{s.get('id')} ↔ {o}"
            if o not in por_id or o == s.get("id"):
                err(donde, "el rival no existe en la misma regla")
                continue
            if s.get("id") not in por_id[o].get("rivales", []):
                err(donde, "los rivales tienen que ser mutuos")
            pares.add(tuple(sorted((s.get("id"), o))))
    for a, b in sorted(pares):
        A, B = por_id[a], por_id[b]
        donde = f"{r}/{a} ↔ {b}"
        frases = bool(A.get("frases"))
        rxa, rxb = patron(donde, A), patron(donde, B)
        if not rxa or not rxb:
            err(donde, "los rivales necesitan patrón para separar los dos círculos")
            continue
        ca = {clave(palabra(x), frases) for x in A["ejemplos"]} | {clave(x, frases) for x in A.get("contraejemplos", [])}
        cb = {clave(palabra(x), frases) for x in B["ejemplos"]} | {clave(x, frases) for x in B.get("contraejemplos", [])}
        for X, rx_otro, nombre in ((A, rxb, b), (B, rxa, a)):
            for x in [palabra(y) for y in X["ejemplos"]]:
                if rx_otro.search(prep(x, frases)):
                    err(donde, f"«{x}» cumple también el patrón de {nombre}: no se sabría en qué círculo va")
            # Una excepción que cumple el patrón del rival no sale en la lupa de oro (el juego la descarta)
            for x in X.get("contraejemplos", []):
                if rx_otro.search(prep(x, frases)):
                    avisos.append(f"{donde}: la excepción «{x}» cumple el patrón de {nombre}; no sale en la lupa de oro")
        if ca & cb:
            err(donde, f"palabras en las dos subreglas: {sorted(ca & cb)}")
        rel = {x for x in A["relleno"] + B["relleno"]
               if clave(x, frases) not in ca | cb and not rxa.search(prep(x, frases)) and not rxb.search(prep(x, frases))}
        if len(rel) < 4:
            err(donde, f"solo {len(rel)} de relleno que no cumple ninguna de las dos reglas (mínimo 4)")
        for X in (A, B):
            if sum(1 for y in X["ejemplos"] if isinstance(y, dict) and y.get("nivel", 1) >= 2) < 5:
                err(donde, f"{X['id']} tiene menos de 5 ejemplos de nivel 2-3 para el oro")
    if not pares:
        err(r, "no hay ningún par de «rivales» (lupa de oro)")
    return len(pares)


def patron(donde, s):
    pat = s.get("patron")
    if not pat:
        return None
    try:
        return re.compile(pat)
    except re.error as e:
        err(donde, f"patrón inválido: {e}")
        return None


def clave(x, frases):
    return " ".join(x.split()) if frases else x.strip().lower()


def prep(x, frases):
    return x.strip() if frases else x.strip().lower()


if __name__ == "__main__":
    main()
