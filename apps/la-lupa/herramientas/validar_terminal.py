#!/usr/bin/env python3
"""Valida el banco de verbos de la Terminal ORTO-3000 (datos/academia/verbos.json).

Uso (desde apps/la-lupa/):  python3 herramientas/validar_terminal.py
Comprueba la estructura (6 personas, tiempos, desinencias), que cada verbo irregular
tiene sus cinco tiempos completos, que los verbos con cambio ortográfico (-car, -gar,
-zar, -guar) guardan su pretérito perfecto simple, que cada forma tiene como mucho una
tilde, que las frases del «viaje en el tiempo» llevan el presente correcto y,
sobre todo, una lista de formas clave escritas a mano (anduve, condujeron, cayó…).
"""
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
datos = json.loads((RAIZ / "datos" / "academia" / "verbos.json").read_text(encoding="utf-8"))
reglas = json.loads((RAIZ / "datos" / "reglas.json").read_text(encoding="utf-8"))

SIMPLES = ["presente", "imperfecto", "perfecto-simple", "futuro", "condicional"]
TIEMPOS = SIMPLES + ["perfecto-compuesto"]
errores = []


def conj(inf):
    return "ir" if inf.endswith(("ir", "ír")) else inf[-2:]


def forma(v, t, p):
    """Igual que formaDe() en salas/terminal.js."""
    if t == "perfecto-compuesto":
        part = v.get("participio") or v["inf"][:-2] + ("ado" if conj(v["inf"]) == "ar" else "ido")
        return f'{datos["haber"][p]} {part}'
    if t in v.get("formas", {}):
        return v["formas"][t][p]
    return v["inf"][:-2] + datos["desinencias"][conj(v["inf"])][t][p]


# ── Estructura ──
if len(datos.get("personas", [])) != 6:
    errores.append("tiene que haber 6 personas")
ids = [t["id"] for t in datos.get("tiempos", [])]
if ids != ["presente", "imperfecto", "futuro", "perfecto-simple", "condicional", "perfecto-compuesto"]:
    errores.append(f"tiempos inesperados: {ids}")
for c in ("ar", "er", "ir"):
    for t in SIMPLES:
        d = datos["desinencias"].get(c, {}).get(t)
        if not d or len(d) != 6:
            errores.append(f"desinencias de -{c} en {t}: tienen que ser 6")
if len(datos.get("haber", [])) != 6:
    errores.append("faltan las 6 formas de haber")

vistos = {}
for v in datos["verbos"]:
    inf = v["inf"]
    if inf in vistos:
        errores.append(f"verbo repetido: {inf}")
    vistos[inf] = v
    if not re.fullmatch(r"[a-zñ]*(ar|er|ir|ír)", inf):
        errores.append(f"{inf}: no parece un infinitivo")
    if v.get("nivel") not in (1, 2):
        errores.append(f"{inf}: nivel tiene que ser 1 o 2")
    if v.get("irregular"):
        if v["nivel"] != 2:
            errores.append(f"{inf}: los irregulares van en el nivel 2")
        for t in SIMPLES:
            if len(v.get("formas", {}).get(t, [])) != 6:
                errores.append(f"{inf}: irregular sin las 6 formas de {t}")
        if not v.get("participio"):
            errores.append(f"{inf}: irregular sin participio")
    elif re.search(r"(car|gar|zar|guar)$", inf) and "perfecto-simple" not in v.get("formas", {}):
        errores.append(f"{inf}: cambio ortográfico sin su pretérito perfecto simple guardado")
    for t, lista in v.get("formas", {}).items():
        if t not in SIMPLES:
            errores.append(f"{inf}: tiempo desconocido {t}")
        if len(lista) != 6:
            errores.append(f"{inf} · {t}: tienen que ser 6 formas")
    for t in TIEMPOS:
        for p in range(6):
            f = forma(v, t, p)
            for palabra in f.split(" "):
                if not re.fullmatch(r"[a-záéíóúüñ]+", palabra):
                    errores.append(f"{inf} · {t} · {p}: forma rara «{f}»")
                if len(re.findall(r"[áéíóú]", palabra)) > 1:
                    errores.append(f"{inf} · {t} · {p}: más de una tilde en «{f}»")

# Monosílabos sin tilde (salvo sé, de saber)
MONOSILABOS = {"fui", "fue", "di", "dio", "vi", "vio", "veis", "dais", "vais", "sois", "ve", "da", "va", "es", "soy", "doy", "voy", "estoy"}
for v in datos["verbos"]:
    for t in SIMPLES:
        for p in range(6):
            f = forma(v, t, p)
            if re.sub(r"[áéíóú]", lambda m: "aeiou"["áéíóú".index(m.group())], f) in MONOSILABOS and f not in MONOSILABOS:
                errores.append(f"{v['inf']}: el monosílabo «{f}» no lleva tilde")

# ── Formas clave, comprobadas a mano (persona: 0 yo … 5 ellos) ──
CLAVE = [
    ("cantar", "imperfecto", 5, "cantaban"), ("cantar", "imperfecto", 3, "cantábamos"), ("cantar", "perfecto-simple", 2, "cantó"),
    ("cantar", "condicional", 0, "cantaría"), ("cantar", "futuro", 4, "cantaréis"), ("cantar", "presente", 4, "cantáis"),
    ("comer", "perfecto-simple", 0, "comí"), ("comer", "imperfecto", 0, "comía"), ("vivir", "presente", 4, "vivís"),
    ("vivir", "futuro", 4, "viviréis"), ("escribir", "perfecto-compuesto", 0, "he escrito"),
    ("descubrir", "perfecto-compuesto", 4, "habéis descubierto"), ("cantar", "perfecto-compuesto", 2, "ha cantado"),
    ("buscar", "perfecto-simple", 0, "busqué"), ("buscar", "perfecto-simple", 2, "buscó"), ("explicar", "perfecto-simple", 0, "expliqué"),
    ("llegar", "perfecto-simple", 0, "llegué"), ("investigar", "perfecto-simple", 0, "investigué"),
    ("cruzar", "perfecto-simple", 0, "crucé"), ("averiguar", "perfecto-simple", 0, "averigüé"), ("averiguar", "presente", 0, "averiguo"),
    ("ser", "presente", 4, "sois"), ("ser", "imperfecto", 1, "eras"), ("ser", "imperfecto", 3, "éramos"), ("ser", "perfecto-simple", 0, "fui"),
    ("ser", "perfecto-simple", 2, "fue"), ("ir", "perfecto-simple", 0, "fui"), ("ir", "imperfecto", 0, "iba"), ("ir", "imperfecto", 3, "íbamos"),
    ("ir", "presente", 4, "vais"), ("estar", "perfecto-simple", 0, "estuve"), ("estar", "presente", 1, "estás"),
    ("tener", "perfecto-simple", 0, "tuve"), ("tener", "futuro", 0, "tendré"), ("tener", "presente", 1, "tienes"),
    ("hacer", "perfecto-simple", 0, "hice"), ("hacer", "perfecto-simple", 2, "hizo"), ("hacer", "futuro", 2, "hará"),
    ("hacer", "perfecto-compuesto", 0, "he hecho"), ("decir", "perfecto-simple", 0, "dije"), ("decir", "perfecto-simple", 5, "dijeron"),
    ("decir", "futuro", 0, "diré"), ("poder", "perfecto-simple", 0, "pude"), ("poder", "presente", 0, "puedo"),
    ("querer", "futuro", 0, "querré"), ("querer", "perfecto-simple", 2, "quiso"), ("venir", "perfecto-simple", 5, "vinieron"),
    ("venir", "condicional", 0, "vendría"), ("traer", "perfecto-simple", 0, "traje"), ("traer", "perfecto-simple", 5, "trajeron"),
    ("traer", "presente", 0, "traigo"), ("poner", "perfecto-simple", 0, "puse"), ("poner", "condicional", 0, "pondría"),
    ("poner", "perfecto-compuesto", 0, "he puesto"), ("saber", "presente", 0, "sé"), ("saber", "perfecto-simple", 3, "supimos"),
    ("andar", "perfecto-simple", 0, "anduve"), ("andar", "perfecto-simple", 2, "anduvo"), ("conducir", "perfecto-simple", 0, "conduje"),
    ("conducir", "perfecto-simple", 5, "condujeron"), ("conducir", "presente", 0, "conduzco"), ("caer", "perfecto-simple", 2, "cayó"),
    ("caer", "perfecto-simple", 1, "caíste"), ("caer", "presente", 0, "caigo"), ("oír", "perfecto-simple", 5, "oyeron"),
    ("oír", "presente", 4, "oís"), ("oír", "presente", 1, "oyes"), ("oír", "futuro", 0, "oiré"), ("leer", "perfecto-simple", 2, "leyó"),
    ("leer", "perfecto-simple", 1, "leíste"), ("leer", "perfecto-compuesto", 0, "he leído"), ("ver", "presente", 4, "veis"),
    ("ver", "perfecto-simple", 2, "vio"), ("ver", "perfecto-compuesto", 0, "he visto"), ("dar", "perfecto-simple", 2, "dio"),
    ("dar", "presente", 4, "dais"),
]
for inf, t, p, esperada in CLAVE:
    if inf not in vistos:
        errores.append(f"falta el verbo {inf}")
        continue
    sale = forma(vistos[inf], t, p)
    if sale != esperada:
        errores.append(f"{inf} · {t} · persona {p}: sale «{sale}» y debería ser «{esperada}»")

# ── Frases del viaje en el tiempo ──
for fr in datos["frases"]:
    marcas = re.findall(r"\{([^}]+)\}", fr["texto"])
    if len(marcas) != 1:
        errores.append(f"frase sin un único verbo marcado: {fr['texto']}")
        continue
    v = vistos.get(fr["verbo"])
    if not v:
        errores.append(f"frase con verbo desconocido: {fr['verbo']}")
        continue
    if not 0 <= fr["persona"] < 6:
        errores.append(f"persona fuera de rango: {fr['texto']}")
        continue
    if forma(v, "presente", fr["persona"]) != marcas[0]:
        errores.append(f"«{marcas[0]}» no es el presente de {fr['verbo']} (persona {fr['persona']}): {fr['texto']}")
    if not re.match(r"^[A-ZÁÉÍÓÚÑ¿¡]", fr["texto"]) or not fr["texto"].endswith((".", "!", "?")):
        errores.append(f"frase sin mayúscula inicial o punto final: {fr['texto']}")

for r in ("b-v-1", "g-j-dieresis", "tildes-generales", "ll-y", "c-z-s", "h-1", "diptongo-monosilabos"):
    if r not in reglas:
        errores.append(f"la regla {r} no está en reglas.json")

n1 = sum(1 for v in datos["verbos"] if v["nivel"] == 1)
print(f"{len(datos['verbos'])} verbos ({n1} de N1, {len(datos['verbos']) - n1} irregulares de N2), {len(datos['frases'])} frases, {len(CLAVE)} formas clave.")
if errores:
    print(f"{len(errores)} errores:")
    for e in errores:
        print(" ·", e)
    sys.exit(1)
print("Todo correcto.")
