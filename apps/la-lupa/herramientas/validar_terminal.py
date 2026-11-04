#!/usr/bin/env python3
"""Valida el banco de verbos de la Terminal ORTO-3000 (datos/academia/verbos.json).

Uso (desde apps/la-lupa/):  python3 herramientas/validar_terminal.py
Comprueba la estructura (6 personas, 8 tiempos con modo y nivel, desinencias), que cada
verbo irregular tiene sus cinco tiempos de indicativo y el presente de subjuntivo
completos (el imperativo, si lo tiene, solo en tú y vosotros), que cada verbo regular
coincide con una conjugación regular independiente (con los cambios ortográficos de
-car, -gar, -zar y -guar delante de e), que cada forma tiene como mucho una tilde, que
los monosílabos no la llevan (salvo sé y dé), que las frases del «viaje en el tiempo»
(de uno o dos verbos) llevan el presente correcto, que hay contenido de sobra para cada
lupa y, sobre todo, una lista de formas clave escritas a mano (anduve, condujeron, cayó…).
"""
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
datos = json.loads((RAIZ / "datos" / "academia" / "verbos.json").read_text(encoding="utf-8"))
reglas = json.loads((RAIZ / "datos" / "reglas.json").read_text(encoding="utf-8"))

SIMPLES = ["presente", "imperfecto", "perfecto-simple", "futuro", "condicional"]
MODOS = ["subjuntivo", "imperativo"]
TIEMPOS = SIMPLES + ["perfecto-compuesto"] + MODOS
SEGUNDAS = (1, 4)            # el imperativo solo tiene tú y vosotros
errores = []


def conj(inf):
    return "ir" if inf.endswith(("ir", "ír")) else inf[-2:]


def forma(v, t, p):
    """Igual que formaDe() en salas/terminal.js (None si esa casilla no existe)."""
    if t == "perfecto-compuesto":
        part = v.get("participio") or v["inf"][:-2] + ("ado" if conj(v["inf"]) == "ar" else "ido")
        return f'{datos["haber"][p]} {part}'
    if t in v.get("formas", {}):
        return v["formas"][t][p]
    if v.get("irregular") and t in MODOS:
        return None
    des = datos["desinencias"][conj(v["inf"])][t][p]
    return None if des is None else v["inf"][:-2] + des


# ── Conjugación regular independiente (desinencias escritas otra vez aquí, a mano, y cambios ortográficos) ──
REG = {
    "ar": {"presente": "o as a amos áis an", "imperfecto": "aba abas aba ábamos abais aban",
           "perfecto-simple": "é aste ó amos asteis aron", "futuro": "aré arás ará aremos aréis arán",
           "condicional": "aría arías aría aríamos aríais arían", "subjuntivo": "e es e emos éis en",
           "imperativo": "- a - - ad -"},
    "er": {"presente": "o es e emos éis en", "imperfecto": "ía ías ía íamos íais ían",
           "perfecto-simple": "í iste ió imos isteis ieron", "futuro": "eré erás erá eremos eréis erán",
           "condicional": "ería erías ería eríamos eríais erían", "subjuntivo": "a as a amos áis an",
           "imperativo": "- e - - ed -"},
    "ir": {"presente": "o es e imos ís en", "imperfecto": "ía ías ía íamos íais ían",
           "perfecto-simple": "í iste ió imos isteis ieron", "futuro": "iré irás irá iremos iréis irán",
           "condicional": "iría irías iría iríamos iríais irían", "subjuntivo": "a as a amos áis an",
           "imperativo": "- e - - id -"},
}


def regular_esperada(inf, t, p):
    des = REG[conj(inf)][t].split()[p]
    if des == "-":
        return None
    raiz = inf[:-2]
    if des[0] in "eé":                       # el sonido se conserva delante de e
        if raiz.endswith("gu"):
            raiz = raiz[:-2] + "gü"
        elif raiz.endswith("c"):
            raiz = raiz[:-1] + "qu"
        elif raiz.endswith("g"):
            raiz = raiz[:-1] + "gu"
        elif raiz.endswith("z"):
            raiz = raiz[:-1] + "c"
    return raiz + des


# ── Estructura ──
if len(datos.get("personas", [])) != 6:
    errores.append("tiene que haber 6 personas")
ids = [t["id"] for t in datos.get("tiempos", [])]
if ids != ["presente", "imperfecto", "futuro", "perfecto-simple", "condicional", "perfecto-compuesto", "subjuntivo", "imperativo"]:
    errores.append(f"tiempos inesperados: {ids}")
for t in datos.get("tiempos", []):
    if t.get("modo") not in ("indicativo", "subjuntivo", "imperativo") or t.get("nivel") not in (1, 2, 3, 4):
        errores.append(f"tiempo {t.get('id')}: falta su modo o su nivel (1-4)")
for c in ("ar", "er", "ir"):
    for t in SIMPLES + MODOS:
        d = datos["desinencias"].get(c, {}).get(t)
        if not d or len(d) != 6:
            errores.append(f"desinencias de -{c} en {t}: tienen que ser 6")
        elif t == "imperativo" and any((x is None) != (i not in SEGUNDAS) for i, x in enumerate(d)):
            errores.append(f"desinencias de -{c} en imperativo: solo tú y vosotros (las demás, null)")
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
    if v.get("nivel") not in (1, 2, 3):
        errores.append(f"{inf}: nivel tiene que ser 1, 2 o 3")
    if v.get("irregular"):
        if v["nivel"] not in (2, 3):
            errores.append(f"{inf}: los irregulares van en el nivel 2 o 3")
        for t in SIMPLES + ["subjuntivo"]:
            if len(v.get("formas", {}).get(t, [])) != 6:
                errores.append(f"{inf}: irregular sin las 6 formas de {t}")
        if not v.get("participio"):
            errores.append(f"{inf}: irregular sin participio")
    else:
        if v.get("nivel") != 1:
            errores.append(f"{inf}: los regulares van en el nivel 1")
        if re.search(r"(car|gar|zar|guar)$", inf):
            for t in ("perfecto-simple", "subjuntivo"):
                if t not in v.get("formas", {}):
                    errores.append(f"{inf}: cambio ortográfico sin su {t} guardado")
        # Todo regular tiene que coincidir con la conjugación independiente
        for t in SIMPLES + MODOS:
            for p in range(6):
                if forma(v, t, p) != regular_esperada(inf, t, p):
                    errores.append(f"{inf} · {t} · {p}: sale «{forma(v, t, p)}» y la regular es «{regular_esperada(inf, t, p)}»")
    for t, lista in v.get("formas", {}).items():
        if t not in SIMPLES + MODOS:
            errores.append(f"{inf}: tiempo desconocido {t}")
        if len(lista) != 6:
            errores.append(f"{inf} · {t}: tienen que ser 6 formas")
        if t == "imperativo" and any((x is None) != (i not in SEGUNDAS) for i, x in enumerate(lista)):
            errores.append(f"{inf} · imperativo: solo tú y vosotros (las demás casillas, null)")
    for t in TIEMPOS:
        for p in range(6):
            f = forma(v, t, p)
            if f is None:
                if not (t == "imperativo" and (p not in SEGUNDAS or v.get("irregular"))):
                    errores.append(f"{inf} · {t} · {p}: falta la forma")
                continue
            for palabra in f.split(" "):
                if not re.fullmatch(r"[a-záéíóúüñ]+", palabra):
                    errores.append(f"{inf} · {t} · {p}: forma rara «{f}»")
                if len(re.findall(r"[áéíóú]", palabra)) > 1:
                    errores.append(f"{inf} · {t} · {p}: más de una tilde en «{f}»")

# Monosílabos sin tilde (salvo las diacríticas: sé, de saber y de ser; dé, de dar)
MONOSILABOS = {"fui", "fue", "di", "dio", "vi", "vio", "veis", "dais", "vais", "sois", "ve", "da", "va", "es", "soy", "doy", "voy", "estoy",
               "des", "den", "deis", "ten", "pon", "ven", "sal", "haz", "sed", "ved", "dad", "id"}
DIACRITICAS = {"sé", "dé"}
for v in datos["verbos"]:
    for t in SIMPLES + MODOS:
        for p in range(6):
            f = forma(v, t, p)
            if f and f not in DIACRITICAS and re.sub(r"[áéíóú]", lambda m: "aeiou"["áéíóú".index(m.group())], f) in MONOSILABOS and f not in MONOSILABOS:
                errores.append(f"{v['inf']}: el monosílabo «{f}» no lleva tilde")
for inf, t, p, f in (("saber", "presente", 0, "sé"), ("ser", "imperativo", 1, "sé"), ("dar", "subjuntivo", 0, "dé"), ("dar", "subjuntivo", 2, "dé")):
    if inf in vistos and forma(vistos[inf], t, p) != f:
        errores.append(f"{inf} · {t} · {p}: tiene que ser «{f}» (tilde diacrítica)")

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
    # Verbos nuevos (indicativo)
    ("salir", "presente", 0, "salgo"), ("salir", "futuro", 0, "saldré"), ("salir", "condicional", 3, "saldríamos"), ("salir", "perfecto-simple", 2, "salió"),
    ("volver", "presente", 0, "vuelvo"), ("volver", "presente", 3, "volvemos"), ("volver", "perfecto-compuesto", 0, "he vuelto"),
    ("jugar", "presente", 0, "juego"), ("jugar", "perfecto-simple", 0, "jugué"), ("jugar", "presente", 4, "jugáis"),
    ("pensar", "presente", 5, "piensan"), ("pensar", "perfecto-simple", 0, "pensé"), ("encontrar", "presente", 2, "encuentra"),
    ("contar", "presente", 0, "cuento"), ("empezar", "presente", 0, "empiezo"), ("empezar", "perfecto-simple", 0, "empecé"),
    ("empezar", "perfecto-simple", 2, "empezó"), ("dormir", "perfecto-simple", 2, "durmió"), ("dormir", "perfecto-simple", 5, "durmieron"),
    ("dormir", "presente", 3, "dormimos"), ("pedir", "perfecto-simple", 2, "pidió"), ("pedir", "presente", 4, "pedís"),
    ("sentir", "perfecto-simple", 2, "sintió"), ("sentir", "presente", 0, "siento"), ("seguir", "presente", 0, "sigo"),
    ("seguir", "perfecto-simple", 2, "siguió"), ("seguir", "presente", 4, "seguís"), ("conocer", "presente", 0, "conozco"),
    ("construir", "presente", 0, "construyo"), ("construir", "presente", 4, "construís"), ("construir", "perfecto-simple", 0, "construí"),
    ("construir", "perfecto-simple", 2, "construyó"), ("construir", "perfecto-compuesto", 2, "ha construido"),
    ("romper", "perfecto-compuesto", 0, "he roto"), ("abrir", "perfecto-compuesto", 5, "han abierto"), ("tocar", "perfecto-simple", 0, "toqué"),
    ("apagar", "perfecto-simple", 0, "apagué"), ("lanzar", "perfecto-simple", 0, "lancé"), ("lanzar", "perfecto-simple", 2, "lanzó"),
    # Presente de subjuntivo
    ("cantar", "subjuntivo", 0, "cante"), ("cantar", "subjuntivo", 4, "cantéis"), ("comer", "subjuntivo", 3, "comamos"),
    ("vivir", "subjuntivo", 5, "vivan"), ("vivir", "subjuntivo", 4, "viváis"), ("buscar", "subjuntivo", 0, "busque"),
    ("llegar", "subjuntivo", 2, "llegue"), ("cruzar", "subjuntivo", 3, "crucemos"), ("averiguar", "subjuntivo", 0, "averigüe"),
    ("ser", "subjuntivo", 0, "sea"), ("estar", "subjuntivo", 0, "esté"), ("estar", "subjuntivo", 4, "estéis"), ("ir", "subjuntivo", 0, "vaya"),
    ("ir", "subjuntivo", 3, "vayamos"), ("tener", "subjuntivo", 0, "tenga"), ("hacer", "subjuntivo", 2, "haga"), ("decir", "subjuntivo", 5, "digan"),
    ("poder", "subjuntivo", 0, "pueda"), ("poder", "subjuntivo", 3, "podamos"), ("querer", "subjuntivo", 4, "queráis"),
    ("venir", "subjuntivo", 0, "venga"), ("traer", "subjuntivo", 0, "traiga"), ("poner", "subjuntivo", 1, "pongas"), ("saber", "subjuntivo", 0, "sepa"),
    ("conducir", "subjuntivo", 0, "conduzca"), ("caer", "subjuntivo", 2, "caiga"), ("oír", "subjuntivo", 0, "oiga"), ("leer", "subjuntivo", 3, "leamos"),
    ("ver", "subjuntivo", 0, "vea"), ("ver", "subjuntivo", 4, "veáis"), ("dar", "subjuntivo", 0, "dé"), ("dar", "subjuntivo", 4, "deis"),
    ("salir", "subjuntivo", 0, "salga"), ("volver", "subjuntivo", 3, "volvamos"), ("volver", "subjuntivo", 5, "vuelvan"),
    ("jugar", "subjuntivo", 0, "juegue"), ("jugar", "subjuntivo", 3, "juguemos"), ("pensar", "subjuntivo", 0, "piense"),
    ("dormir", "subjuntivo", 3, "durmamos"), ("pedir", "subjuntivo", 0, "pida"), ("sentir", "subjuntivo", 3, "sintamos"),
    ("seguir", "subjuntivo", 0, "siga"), ("conocer", "subjuntivo", 0, "conozca"), ("construir", "subjuntivo", 0, "construya"),
    ("empezar", "subjuntivo", 0, "empiece"), ("empezar", "subjuntivo", 3, "empecemos"), ("encontrar", "subjuntivo", 3, "encontremos"),
    ("contar", "subjuntivo", 2, "cuente"), ("andar", "subjuntivo", 0, "ande"), ("tocar", "subjuntivo", 0, "toque"), ("lanzar", "subjuntivo", 0, "lance"),
    # Imperativo (tú: persona 1; vosotros: persona 4)
    ("cantar", "imperativo", 1, "canta"), ("cantar", "imperativo", 4, "cantad"), ("comer", "imperativo", 1, "come"), ("comer", "imperativo", 4, "comed"),
    ("escribir", "imperativo", 1, "escribe"), ("escribir", "imperativo", 4, "escribid"), ("buscar", "imperativo", 1, "busca"),
    ("ser", "imperativo", 1, "sé"), ("ser", "imperativo", 4, "sed"), ("ir", "imperativo", 1, "ve"), ("ir", "imperativo", 4, "id"),
    ("tener", "imperativo", 1, "ten"), ("hacer", "imperativo", 1, "haz"), ("hacer", "imperativo", 4, "haced"), ("decir", "imperativo", 1, "di"),
    ("venir", "imperativo", 1, "ven"), ("poner", "imperativo", 1, "pon"), ("salir", "imperativo", 1, "sal"), ("ver", "imperativo", 1, "ve"),
    ("dar", "imperativo", 1, "da"), ("traer", "imperativo", 1, "trae"), ("oír", "imperativo", 1, "oye"), ("oír", "imperativo", 4, "oíd"),
    ("leer", "imperativo", 4, "leed"), ("volver", "imperativo", 1, "vuelve"), ("volver", "imperativo", 4, "volved"), ("jugar", "imperativo", 1, "juega"),
    ("pensar", "imperativo", 1, "piensa"), ("dormir", "imperativo", 1, "duerme"), ("pedir", "imperativo", 1, "pide"), ("seguir", "imperativo", 1, "sigue"),
    ("construir", "imperativo", 1, "construye"), ("empezar", "imperativo", 1, "empieza"), ("contar", "imperativo", 1, "cuenta"),
    ("conducir", "imperativo", 1, "conduce"), ("encontrar", "imperativo", 4, "encontrad"),
]
for inf, t, p, esperada in CLAVE:
    if inf not in vistos:
        errores.append(f"falta el verbo {inf}")
        continue
    sale = forma(vistos[inf], t, p)
    if sale != esperada:
        errores.append(f"{inf} · {t} · persona {p}: sale «{sale}» y debería ser «{esperada}»")

# ── Frases del viaje en el tiempo (una marca: verbo + persona; dos marcas: verbos [[verbo, persona], …]) ──
dobles = 0
for fr in datos["frases"]:
    marcas = re.findall(r"\{([^}]+)\}", fr["texto"])
    pares = fr.get("verbos") or [[fr.get("verbo"), fr.get("persona")]]
    if fr.get("verbos") and ("verbo" in fr or "persona" in fr):
        errores.append(f"frase con «verbo» y «verbos» a la vez: {fr['texto']}")
    if len(pares) not in (1, 2) or len(marcas) != len(pares):
        errores.append(f"frase con {len(marcas)} verbos marcados y {len(pares)} verbos en los datos: {fr['texto']}")
        continue
    dobles += len(pares) == 2
    for marca, (inf, persona) in zip(marcas, pares):
        v = vistos.get(inf)
        if not v:
            errores.append(f"frase con verbo desconocido: {inf}")
            continue
        if not isinstance(persona, int) or not 0 <= persona < 6:
            errores.append(f"persona fuera de rango: {fr['texto']}")
            continue
        if forma(v, "presente", persona) != marca:
            errores.append(f"«{marca}» no es el presente de {inf} (persona {persona}): {fr['texto']}")
    if not re.match(r"^[A-ZÁÉÍÓÚÑ¿¡]", fr["texto"]) or not fr["texto"].endswith((".", "!", "?")):
        errores.append(f"frase sin mayúscula inicial o punto final: {fr['texto']}")
    if re.search(r"\b(ayer|mañana|hoy|ahora|anoche)\b", fr["texto"].lower()):
        errores.append(f"frase con una palabra de tiempo que no vale para todos los destinos: {fr['texto']}")
if len({fr["texto"] for fr in datos["frases"]}) != len(datos["frases"]):
    errores.append("hay frases repetidas")

# ── Contenido por lupa: que no se repita enseguida ──
por_nivel = {n: [v for v in datos["verbos"] if v["nivel"] == n] for n in (1, 2, 3)}
frases_de = lambda cond: [fr for fr in datos["frases"] if all(cond(vistos[i]) for i, _ in (fr.get("verbos") or [[fr["verbo"], 0]]) if i in vistos)]
CUOTAS = {"verbos regulares (bronce)": (len(por_nivel[1]), 35), "irregulares frecuentes (plata)": (len(por_nivel[2]), 15),
          "irregulares de oro y diamante": (len(por_nivel[2]) + len(por_nivel[3]), 28),
          "frases de bronce": (len([f for f in frases_de(lambda v: v["nivel"] == 1) if "verbos" not in f]), 30),
          "frases con dos verbos (diamante)": (dobles, 10),
          "verbos con imperativo": (sum(1 for v in datos["verbos"] if forma(v, "imperativo", 1)), 40)}
for nombre, (hay, minimo) in CUOTAS.items():
    if hay < minimo:
        errores.append(f"pocos {nombre}: {hay} (mínimo {minimo})")

for r in ("b-v-1", "g-j-dieresis", "tildes-generales", "ll-y", "c-z-s", "h-1", "diptongo-monosilabos"):
    if r not in reglas:
        errores.append(f"la regla {r} no está en reglas.json")

print(f"{len(datos['verbos'])} verbos ({len(por_nivel[1])} regulares, {len(por_nivel[2])} irregulares frecuentes, {len(por_nivel[3])} irregulares difíciles), "
      f"{len(datos['frases'])} frases ({dobles} con dos verbos), {len(CLAVE)} formas clave.")
if errores:
    print(f"{len(errores)} errores:")
    for e in errores:
        print(" ·", e)
    sys.exit(1)
print("Todo correcto.")
