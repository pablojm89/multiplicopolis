#!/usr/bin/env python3
"""Valida los bancos de datos de la Academia (datos/academia/*.json).

Uso (desde apps/la-lupa/):  python3 herramientas/validar_academia.py
Así «miles de propuestas» no son miles de erratas. Comprueba:

Palabras (palabras.json)
- que no hay palabras repetidas (sin distinguir mayúsculas), que la regla existe y que hay
  al menos 60 palabras por cada una de las 9 reglas de 5.º;
- que `nivel` es 1, 2 o 3 en todas;
- que la frase tiene un solo hueco ___ y no deja ver la palabra ni su forma errónea;
- que las sílabas reconstruyen la palabra y coinciden con el silabeo de la RAE (diptongos,
  hiatos, ch, ll, rr y qu juntos) que hace este validador; en tildes y diptongos son obligatorias;
- que la tónica cuadra con la tilde: si la palabra lleva tilde, es la sílaba de la tilde; si no,
  la que marcan las reglas generales (aguda si termina en consonante que no es -n ni -s, o en -y);
- en tildes-generales y diptongo-monosilabos, que la palabra cumple las reglas generales: la tilde
  hace falta (aguda en vocal, -n o -s; llana en otra letra; esdrújula siempre), los monosílabos no
  la llevan y no hay hiatos con tilde en i/u (eso es la regla hiato, de 6.º);
- que la forma errónea `mal` solo cambia lo que trabaja la regla: tildes (tildes y diptongos),
  b/v o m/n delante de b/v (b-v-1), una h (h-1), c/z/s/qu/k (c-z-s), ll/y o -y/-i final (ll-y),
  g/j, gu/g o ü/u (g-j-dieresis), -d/-z final (d-z-finales) o la mayúscula inicial (mayúsculas);
- en mayúsculas, que las que van en minúscula no tienen el hueco al principio de la frase.

Textos (textos.json)
- que cada [palabra] marcada está en el banco y que cada texto tiene 4-8 marcas y `nivel` 1-3;
- que la longitud cuadra con el nivel: 2-3 oraciones (nivel 1), 3-6 (nivel 2), 6-8 (nivel 3);
- que hay al menos 5 textos por regla (un texto cuenta para una regla si tiene 2 marcas de ella
  con forma errónea, que es lo que pide el Pupitre para elegirlo);
- que una marca a principio de oración va con mayúscula, y que las marcas de mayúsculas van
  en minúscula y tal cual están en el banco (el Pupitre pone en mayúscula la forma errónea de las
  palabras escritas con mayúscula, así que un nombre propio marcado perdería su falta).

Testigos (testigos.json): que cada [palabra] está en el banco.
"""
import json
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
REGLAS_5 = ["tildes-generales", "b-v-1", "h-1", "c-z-s", "ll-y", "g-j-dieresis",
            "diptongo-monosilabos", "d-z-finales", "mayusculas-puntuacion-1"]
MIN_PALABRAS, MIN_TEXTOS = 60, 5
ORACIONES = {1: (2, 3), 2: (3, 6), 3: (6, 8)}
TILDES = ("tildes-generales", "diptongo-monosilabos")
MAYUS = "mayusculas-puntuacion-1"
# Palabras cuyo silabeo correcto no sale del algoritmo (palabra: sílabas). Hoy, ninguna.
EXCEPCIONES_SILABAS = {}

reglas = json.loads((RAIZ / "datos" / "reglas.json").read_text(encoding="utf-8"))
banco = json.loads((RAIZ / "datos" / "academia" / "palabras.json").read_text(encoding="utf-8"))["palabras"]
textos = json.loads((RAIZ / "datos" / "academia" / "textos.json").read_text(encoding="utf-8"))["textos"]
testigos = json.loads((RAIZ / "datos" / "academia" / "testigos.json").read_text(encoding="utf-8"))["testigos"]

# ── Silabeo ortográfico ─────────────────────────────────────────
FUERTES, DEBILES_T, DEBILES = set("aeoáéó"), set("íú"), set("iuü")
VOCALES = FUERTES | DEBILES_T | DEBILES
INSEPARABLES = {"pl", "pr", "bl", "br", "cl", "cr", "dr", "fl", "fr", "gl", "gr", "tr", "kl", "kr"}
CON_TILDE = set("áéíóú")


def unidades(pal):
    """Letras (ch, ll y rr como una sola) marcadas como vocal o consonante. La y es vocal al final o ante consonante."""
    s, out, i = pal.lower(), [], 0
    while i < len(s):
        if s[i:i + 2] in ("ch", "ll", "rr"):
            out.append((s[i:i + 2], False)); i += 2; continue
        if s[i] == "y":
            sig = s[i + 1] if i + 1 < len(s) else ""
            out.append(("y", i > 0 and sig not in VOCALES)); i += 1; continue
        out.append((s[i], s[i] in VOCALES)); i += 1
    return out


def hay_hiato(a, b):
    a, b = ("i" if a == "y" else a), ("i" if b == "y" else b)
    return (a in FUERTES and b in FUERTES) or a == b or \
        (a in DEBILES_T and b in FUERTES) or (b in DEBILES_T and a in FUERTES)


def silabear(pal):
    us = unidades(pal)
    nucleos, i = [], 0
    while i < len(us):
        if not us[i][1]:
            i += 1; continue
        g = [i]
        while i + 1 < len(us) and us[i + 1][1]:
            if hay_hiato(us[i][0], us[i + 1][0]):
                nucleos.append(g); g = []
            g.append(i + 1); i += 1
        nucleos.append(g); i += 1
    if not nucleos:
        return [pal]
    cortes = []
    for a, b in zip(nucleos, nucleos[1:]):
        ini, fin = a[-1] + 1, b[0]
        if fin - ini <= 1:
            cortes.append(ini)          # V-V o V-CV
        else:
            par = us[fin - 2][0] + us[fin - 1][0]
            cortes.append(fin - 2 if par in INSEPARABLES else fin - 1)
    pos = [0]
    for u in us:
        pos.append(pos[-1] + len(u[0]))
    bordes = [0] + [pos[c] for c in cortes] + [len(pal)]
    return [pal[x:y] for x, y in zip(bordes, bordes[1:])]


def sin_tildes(s):
    return unicodedata.normalize("NFC", "".join(c for c in unicodedata.normalize("NFD", s) if c != "́"))


def tonica_por_regla(silabas):
    """Sílaba tónica de una palabra sin tilde: llana si termina en vocal, -n o -s; si no, aguda."""
    if len(silabas) == 1:
        return 0
    return len(silabas) - 2 if silabas[-1][-1].lower() in "aeiouns" else len(silabas) - 1


# ── Formas erróneas: qué cambio admite cada regla ───────────────
CAMBIOS = {
    "b-v-1": [("b", "v"), ("v", "b")],
    "c-z-s": [("c", "s"), ("s", "c"), ("z", "s"), ("s", "z"), ("c", "z"), ("z", "c"),
              ("qu", "k"), ("qu", "q"), ("c", "k")],
    "ll-y": [("ll", "y"), ("y", "ll")],
    "g-j-dieresis": [("g", "j"), ("j", "g"), ("ü", "u"), ("gu", "g")],
}


def un_cambio(p, mal, pares):
    for a, b in pares:
        i = p.find(a)
        while i >= 0:
            if p[:i] + b + p[i + len(a):] == mal:
                return True
            i = p.find(a, i + 1)
    return False


def mal_valido(w):
    p, mal, r = w["p"], w["mal"], w["regla"]
    if r in TILDES:
        return sin_tildes(mal) == sin_tildes(p)
    if r == "b-v-1":
        if un_cambio(p, mal, CAMBIOS[r]):
            return True
        # m/n delante de b/v: hombre → honbre, invierno → imvierno
        return any(p[i] in "mn" and p[i + 1] in "bv" and mal == p[:i] + ("n" if p[i] == "m" else "m") + p[i + 1:]
                   for i in range(len(p) - 1))
    if r == "h-1":
        largo, corto = (p, mal) if len(p) > len(mal) else (mal, p)
        return len(largo) == len(corto) + 1 and any(largo[i] == "h" and largo[:i] + largo[i + 1:] == corto
                                                     for i in range(len(largo)))
    if r == "ll-y":
        return un_cambio(p, mal, CAMBIOS[r]) or (p.endswith("y") and mal == p[:-1] + "i")
    if r in CAMBIOS:
        return un_cambio(p, mal, CAMBIOS[r])
    if r == "d-z-finales":
        return p[-1] in "dz" and mal == p[:-1] + {"d": "z", "z": "d"}[p[-1]]
    if r == MAYUS:
        return mal[1:] == p[1:] and mal[0] != p[0] and mal[0].lower() == p[0].lower()
    return True


def contiene(frase, palabra):
    return re.search(rf"(?<!\w){re.escape(palabra.lower())}(?!\w)", frase.lower()) is not None


# ── Palabras ────────────────────────────────────────────────────
errores = []
vistas = {}
for w in banco:
    p = w["p"]
    r = w.get("regla")
    cab = f"{p} ({r})"
    if p.lower() in vistas:
        errores.append(f"palabra repetida: {p}")
    vistas[p.lower()] = w
    if r not in reglas:
        errores.append(f"{cab}: regla desconocida")
    if w.get("nivel") not in (1, 2, 3):
        errores.append(f"{cab}: nivel {w.get('nivel')!r} (tiene que ser 1, 2 o 3)")
    frase = w.get("frase", "")
    if frase.count("___") != 1:
        errores.append(f"{cab}: la frase tiene que tener un solo hueco ___")
    elif contiene(frase.replace("___", " "), p) or ("mal" in w and contiene(frase.replace("___", " "), w["mal"])):
        errores.append(f"{cab}: la frase deja ver la palabra o su forma errónea")
    if r == MAYUS and p[0].islower() and re.match(r"^[¡¿«]*___", frase):
        errores.append(f"{cab}: va en minúscula, así que el hueco no puede ir al principio de la frase")
    if "mal" in w:
        if w["mal"] == p:
            errores.append(f"{cab}: la forma errónea es igual a la correcta")
        elif not mal_valido(w):
            errores.append(f"{cab}: la forma errónea «{w['mal']}» cambia algo que no es de la regla")
    sil = w.get("silabas")
    if sil is None:
        if r in TILDES:
            errores.append(f"{cab}: faltan sílabas y tónica")
        continue
    if "".join(sil) != p:
        errores.append(f"{cab}: las sílabas {sil} no forman la palabra")
        continue
    esperado = EXCEPCIONES_SILABAS.get(p, silabear(p))
    if sil != esperado:
        errores.append(f"{cab}: sílabas {'-'.join(sil)}; según la RAE serían {'-'.join(esperado)}")
    t = w.get("tonica", -1)
    if not isinstance(t, int) or not 0 <= t < len(sil):
        errores.append(f"{cab}: tónica fuera de rango")
        continue
    con_tilde = [k for k, s in enumerate(sil) if set(s.lower()) & CON_TILDE]
    if len(con_tilde) > 1:
        errores.append(f"{cab}: tiene más de una tilde")
    if con_tilde and t != con_tilde[0]:
        errores.append(f"{cab}: lleva tilde en «{sil[con_tilde[0]]}», pero la tónica marcada es «{sil[t]}»")
    if not con_tilde and t != tonica_por_regla(sil):
        errores.append(f"{cab}: sin tilde, la tónica tendría que ser «{sil[tonica_por_regla(sil)]}», no «{sil[t]}»")
    if r in TILDES and con_tilde:
        sil_t = sil[t].lower()
        if len(sil) == 1:
            errores.append(f"{cab}: los monosílabos no llevan tilde (salvo la diacrítica, que no se usa como falta)")
        elif tonica_por_regla([sin_tildes(s) for s in sil]) == t:
            errores.append(f"{cab}: según las reglas generales no lleva tilde")
        letras = sin_tildes(p.lower())
        i = next(k for k, c in enumerate(p.lower()) if c in CON_TILDE)
        if p.lower()[i] in "íú" and ((i > 0 and letras[i - 1] in "aeo") or (i + 1 < len(p) and letras[i + 1] in "aeo")):
            errores.append(f"{cab}: tilde de hiato en {sil_t}: es de la regla hiato (6.º)")

por_regla = Counter(w["regla"] for w in banco)
for r in REGLAS_5:
    if por_regla[r] < MIN_PALABRAS:
        errores.append(f"la regla {r} tiene {por_regla[r]} palabras (mínimo {MIN_PALABRAS})")

# ── Textos ──────────────────────────────────────────────────────
def oraciones(texto):
    limpio = re.sub(r"«[^»]*»", "«»", re.sub(r"\[([^\]]+)\]", r"\1", texto))
    return len([o for o in re.split(r"(?<=[.!?…])\s+(?=[¡¿«]?[A-ZÁÉÍÓÚÑ])", limpio.strip()) if o])


textos_regla = Counter()
for t in textos:
    cab = f"texto «{t['tipo']}»"
    marcas = list(re.finditer(r"\[([^\]]+)\]", t["texto"]))
    if not 4 <= len(marcas) <= 8:
        errores.append(f"{cab}: tiene {len(marcas)} palabras marcadas (entre 4 y 8)")
    n = t.get("nivel")
    if n not in (1, 2, 3):
        errores.append(f"{cab}: nivel {n!r} (tiene que ser 1, 2 o 3)")
    else:
        o, (lo, hi) = oraciones(t["texto"]), ORACIONES[n]
        if not lo <= o <= hi:
            errores.append(f"{cab}: tiene {o} oraciones; el nivel {n} pide {lo}-{hi}")
    cuenta = Counter()
    for m in marcas:
        pal = m.group(1)
        w = vistas.get(pal.lower())
        if not w:
            errores.append(f"{cab}: [{pal}] no está en el banco")
            continue
        if w.get("mal"):
            cuenta[w["regla"]] += 1
        antes = t["texto"][:m.start()].rstrip(" ¡¿«")
        inicio = not antes or antes[-1] in ".!?…"
        if inicio and pal[0].islower():
            errores.append(f"{cab}: [{pal}] empieza oración y va en minúscula")
        if w["regla"] == MAYUS:
            if pal != w["p"]:
                errores.append(f"{cab}: [{pal}] tiene que escribirse como en el banco ({w['p']})")
            if w["p"][0].isupper():
                errores.append(f"{cab}: [{pal}] es un nombre propio; el Pupitre no puede sembrar su falta (déjalo sin marcar)")
    for r, k in cuenta.items():
        if k >= 2:
            textos_regla[r] += 1

for r in REGLAS_5:
    if textos_regla[r] < MIN_TEXTOS:
        errores.append(f"la regla {r} tiene {textos_regla[r]} textos con 2 o más marcas (mínimo {MIN_TEXTOS})")

for t in testigos:
    for m in re.findall(r"\[([^\]]+)\]", t["frase"]):
        if m.lower() not in vistas:
            errores.append(f"testigo «{t['quien']}»: [{m}] no está en el banco")

# ── Resumen ─────────────────────────────────────────────────────
niveles = Counter((w["regla"], w.get("nivel")) for w in banco)
niveles_t = Counter(t.get("nivel") for t in textos)
print(f"{len(banco)} palabras, {len(textos)} textos, {len(testigos)} testigos")
print(f"{'regla':26} {'palabras':>8}  {'n1':>3} {'n2':>3} {'n3':>3}  textos")
for r in REGLAS_5:
    print(f"{r:26} {por_regla[r]:8}  {niveles[(r, 1)]:3} {niveles[(r, 2)]:3} {niveles[(r, 3)]:3}  {textos_regla[r]:6}")
total_n = Counter(w.get("nivel") for w in banco)
print("Palabras por nivel: " + ", ".join(f"{k}: {total_n[k]} ({round(100 * total_n[k] / len(banco))} %)" for k in (1, 2, 3)))
print("Textos por nivel: " + ", ".join(f"{k}: {niveles_t[k]}" for k in (1, 2, 3)))
if errores:
    print("ERRORES:")
    for e in errores:
        print("  -", e)
    sys.exit(1)
print("Todo correcto")
