#!/usr/bin/env python3
"""Valida datos/academia/comas.json (Pizarra · Z3 La coma que cambia el culpable).

Comprueba:
- al menos 20 frases, ids únicos, tipo y nivel válidos;
- dos lecturas por frase, con emoji, situación, frase y explicación;
- las dos lecturas (y sus variantes «tambien») tienen exactamente las mismas palabras,
  con las mismas mayúsculas: solo cambian los signos;
- ninguna puntuación de una lectura coincide con alguna de la otra;
- cada frase empieza por mayúscula (tras ¿ o ¡), termina en . ? o !, solo usa los
  signos del teclado del juego (, . ¿ ? ¡ !), con los ¿? y ¡! emparejados y bien
  espaciados (sin espacio antes de , . ? ! ni después de ¿ ¡);
- situaciones y explicaciones con mayúscula inicial, signo final y longitud que cabe en la tarjeta.
Uso (desde apps/la-lupa/): python3 herramientas/validar_comas.py
"""
import json
import re
import sys
from pathlib import Path

RUTA = Path(__file__).resolve().parent.parent / "datos" / "academia" / "comas.json"
TIPOS = {"vocativo", "si-no", "pregunta", "pregunta-exclamacion", "enumeracion", "inciso"}
SIGNOS = set(",.¿?¡!")
ORDEN = ",.:?!¿¡"
PALABRA = re.compile(r"[^\W\d_]+|\d+")
errores = []


def error(donde, msg):
    errores.append(f"{donde}: {msg}")


def partir(frase):
    """Palabras y signos de cada hueco (antes de la primera, entre palabras y después de la última)."""
    palabras = PALABRA.findall(frase)
    trozos = PALABRA.split(frase)
    huecos = ["".join(sorted(t.replace(" ", ""), key=ORDEN.index)) if all(c in SIGNOS or c == " " for c in t) else None for t in trozos]
    return palabras, huecos


def revisar_frase(donde, frase):
    if frase != frase.strip() or "  " in frase:
        error(donde, f"espacios sobrantes en «{frase}»")
    raro = [c for c in frase if not (c.isalpha() or c == " " or c in SIGNOS)]
    if raro:
        error(donde, f"caracteres no permitidos {raro} en «{frase}»")
    cuerpo = frase.lstrip("¿¡")
    if not cuerpo or not cuerpo[0].isupper():
        error(donde, f"debe empezar por mayúscula: «{frase}»")
    if frase[-1:] not in ".?!":
        error(donde, f"debe terminar en . ? o !: «{frase}»")
    if re.search(r" [,.?!]", frase) or re.search(r"[¿¡] ", frase):
        error(donde, f"espacio mal puesto junto a un signo: «{frase}»")
    if re.search(r"[,.?!][^\s,.?!]", frase.rstrip(".?!")):
        error(donde, f"falta espacio tras un signo: «{frase}»")
    for abre, cierra in (("¿", "?"), ("¡", "!")):
        nivel = 0
        for c in frase:
            if c == abre:
                nivel += 1
            elif c == cierra:
                nivel -= 1
                if nivel < 0:
                    break
        if nivel != 0:
            error(donde, f"signos {abre}{cierra} sin emparejar: «{frase}»")
    if re.search(r"\.\s+\w", frase) and not re.search(r"\.\s+[A-ZÁÉÍÓÚÑ]", frase):
        error(donde, f"tras un punto va mayúscula: «{frase}»")
    if len(frase) > 64:
        error(donde, f"frase demasiado larga para la pizarra ({len(frase)} caracteres)")


def revisar_texto(donde, campo, texto, maximo):
    if not isinstance(texto, str) or not texto.strip():
        return error(donde, f"falta «{campo}»")
    if texto != texto.strip() or "  " in texto:
        error(donde, f"espacios sobrantes en «{campo}»")
    primera = texto.lstrip("¿¡«(")[:1]
    if not primera.isupper():
        error(donde, f"«{campo}» debe empezar por mayúscula")
    if texto[-1] not in ".?!»":
        error(donde, f"«{campo}» debe terminar con signo de cierre")
    if len(texto) > maximo:
        error(donde, f"«{campo}» demasiado largo ({len(texto)} > {maximo})")


def main():
    datos = json.loads(RUTA.read_text(encoding="utf-8"))
    frases = datos.get("frases")
    if not isinstance(frases, list) or len(frases) < 20:
        error("comas.json", "hacen falta al menos 20 frases")
        frases = frases or []
    ids = set()
    por_tipo = {}
    for n, f in enumerate(frases):
        donde = f"frase {n} ({f.get('id', '¿sin id?')})"
        if not f.get("id") or f["id"] in ids:
            error(donde, "id vacío o repetido")
        ids.add(f.get("id"))
        if f.get("tipo") not in TIPOS:
            error(donde, f"tipo desconocido: {f.get('tipo')}")
        por_tipo[f.get("tipo")] = por_tipo.get(f.get("tipo"), 0) + 1
        if f.get("nivel") not in (1, 2, 3):
            error(donde, "nivel debe ser 1, 2 o 3")
        lecturas = f.get("lecturas", [])
        if len(lecturas) != 2:
            error(donde, "debe tener exactamente dos lecturas")
            continue
        palabras_ref = None
        firmas = []
        for i, lec in enumerate(lecturas):
            d = f"{donde} lectura {i}"
            if not lec.get("emoji") or any(c.isalnum() for c in lec["emoji"]):
                error(d, "falta el emoji (sin letras ni números)")
            revisar_texto(d, "situacion", lec.get("situacion"), 110)
            revisar_texto(d, "explicacion", lec.get("explicacion"), 130)
            todas = [lec.get("frase", "")] + list(lec.get("tambien", []))
            firma = set()
            for fr in todas:
                revisar_frase(d, fr)
                palabras, huecos = partir(fr)
                if None in huecos:
                    error(d, f"no se puede partir en palabras y signos: «{fr}»")
                if palabras_ref is None:
                    palabras_ref = palabras
                elif palabras != palabras_ref:
                    error(d, f"las palabras no coinciden con las de la otra lectura: {palabras} ≠ {palabras_ref}")
                if tuple(huecos) in firma:
                    error(d, f"puntuación repetida en «{fr}»")
                firma.add(tuple(huecos))
            firmas.append(firma)
        if len(firmas) == 2 and firmas[0] & firmas[1]:
            error(donde, "las dos lecturas comparten una misma puntuación")
    for e in errores:
        print("✗", e)
    print(f"{len(frases)} frases · por tipo: {dict(sorted(por_tipo.items(), key=str))}")
    if errores:
        print(f"{len(errores)} errores")
        sys.exit(1)
    print("✓ comas.json correcto")


if __name__ == "__main__":
    main()
