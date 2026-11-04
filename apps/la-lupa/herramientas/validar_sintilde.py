#!/usr/bin/env python3
"""Valida las hojas de «La máquina sin tilde» (datos/academia/sintilde.json).

Uso (desde apps/la-lupa/):  python3 herramientas/validar_sintilde.py
Comprueba:
- que hay al menos 20 frases y que cada hoja es de tildes-generales o de diptongo-monosilabos;
- que el título no lleva tildes (la máquina también lo escribe, y no se puede corregir);
- que cada palabra con tilde la lleva por las reglas generales (aguda en vocal, -n o -s;
  llana en otra letra; esdrújula siempre), calculando las sílabas como lo hace el juego;
- que no hay monosílabos con tilde (diacrítica), hiatos con tilde (día, había) ni
  interrogativos con tilde (qué, cómo…), que son de 6.º;
- que cada hoja tiene 3-6 palabras con tilde, y las de diptongo, alguna trampa monosílaba (fue, dio, ti…).
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
datos = json.loads((RAIZ / "datos" / "academia" / "sintilde.json").read_text(encoding="utf-8"))
REGLAS = {"tildes-generales", "diptongo-monosilabos"}
VOCAL = set("aeiouáéíóú")
FUERTE = set("aeoáéóíú")
TILDADA = set("áéíóú")
PROHIBIDAS = {"qué", "cómo", "cuándo", "dónde", "adónde", "quién", "quiénes", "cuál", "cuáles", "cuánto", "cuánta", "cuántos", "cuántas", "aún"}


def nfc(s):
    return unicodedata.normalize("NFC", s)


def analisis(w):
    """Igual que pupAnalisis() de salas/pupitre-extra.js: núcleos vocálicos y sílaba tónica."""
    s = nfc(w.lower())
    s = re.sub(r"qu(?=[eiéí])", "q", s)
    s = re.sub(r"gu(?=[eiéí])", "g", s)
    s = s.replace("ü", "u")
    s = "i" if s == "y" else re.sub(r"([aeiouáéíóú])y$", r"\1i", s)
    nucleos, pegado = [], False
    for c in s:
        if c in VOCAL:
            if nucleos and pegado and not (nucleos[-1][-1] in FUERTE and c in FUERTE):
                nucleos[-1] += c
            else:
                nucleos.append(c)
            pegado = True
        elif not (c == "h" and pegado):
            pegado = False
    tonica = next((i for i, n in enumerate(nucleos) if set(n) & TILDADA), -1)
    return nucleos, tonica


def hiato_con_tilde(w):
    s = nfc(w.lower()).replace("h", "")
    return bool(re.search(r"[íú][aeiouáéíóú]|[aeiouáéíóú][íú]", s)) and not re.search(r"(?<=[iu])[íú]|[íú](?=[iu])", s)


errores = []
total_frases = 0
ids = set()
for h in datos["hojas"]:
    hid = h.get("id", "?")
    if hid in ids:
        errores.append(f"{hid}: id repetido")
    ids.add(hid)
    if h.get("regla") not in REGLAS:
        errores.append(f"{hid}: regla «{h.get('regla')}» no es de esta actividad")
    if set(nfc(h.get("titulo", ""))) & TILDADA:
        errores.append(f"{hid}: el título no puede llevar tildes")
    frases = h.get("frases", [])
    total_frases += len(frases)
    objetivos, palabras = [], []
    for f in frases:
        if re.search(r"[\[\]{}|_]", f):
            errores.append(f"{hid}: la frase lleva marcas: «{f}»")
        for w in re.findall(r"[^\W\d_]+", nfc(f)):
            palabras.append(w.lower())
            if not set(w.lower()) & TILDADA:
                continue
            objetivos.append(w)
            if w.lower() in PROHIBIDAS:
                errores.append(f"{hid}: «{w}» es de 6.º (interrogativo o diacrítica)")
                continue
            if hiato_con_tilde(w):
                errores.append(f"{hid}: «{w}» lleva tilde de hiato (es de 6.º)")
                continue
            nuc, t = analisis(w)
            if len(nuc) == 1:
                errores.append(f"{hid}: «{w}» es monosílabo con tilde (diacrítica, de 6.º)")
                continue
            desde = len(nuc) - 1 - t
            final = w.lower()[-1]
            en_vocal_ns = final in VOCAL or final in "ns"
            if desde == 0 and not en_vocal_ns:
                errores.append(f"{hid}: «{w}» es aguda sin terminar en vocal, -n o -s: no debería llevar tilde")
            if desde == 1 and en_vocal_ns:
                errores.append(f"{hid}: «{w}» es llana terminada en vocal, -n o -s: no debería llevar tilde")
    if not 3 <= len(objetivos) <= 6:
        errores.append(f"{hid}: tiene {len(objetivos)} palabras con tilde (deben ser 3-6): {objetivos}")
    if h.get("regla") == "diptongo-monosilabos":
        trampas = {"fue", "fui", "dio", "vio", "pie", "ti", "vi", "guion", "bien", "cien", "pues"}
        if not trampas & set(palabras):
            errores.append(f"{hid}: las hojas de diptongos necesitan alguna trampa monosílaba (fue, dio, ti, pie…)")
    print(f"  {hid:<14} {h.get('regla'):<22} {len(objetivos)} con tilde: {', '.join(objetivos)}")

if total_frases < 20:
    errores.append(f"hay {total_frases} frases; hacen falta al menos 20")
por_regla = {r: sum(1 for h in datos["hojas"] if h.get("regla") == r) for r in REGLAS}
for r, n in por_regla.items():
    if n < 2:
        errores.append(f"la regla {r} necesita al menos 2 hojas (una ronda son 2)")

print(f"{len(datos['hojas'])} hojas, {total_frases} frases ({', '.join(f'{r}: {n}' for r, n in por_regla.items())})")
if errores:
    print("\n".join("ERROR " + e for e in errores))
    sys.exit(1)
print("OK")
