#!/usr/bin/env python3
"""Valida los casos (datos/casos/*.json) antes de jugarlos.

Uso (desde apps/la-lupa/):  python3 herramientas/validar_casos.py
Comprueba: tipos de escena conocidos, imágenes en arte.json, posiciones de los huecos,
que el código del candado sean las cifras de las recompensas en orden, cartas de los
careos, etiquetas de regla del marcado, respuesta correcta en hipótesis y descubre,
y que cada caso esté en la programación.
"""
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
reglas = json.loads((RAIZ / "datos" / "reglas.json").read_text(encoding="utf-8"))
arte = json.loads((RAIZ / "datos" / "arte.json").read_text(encoding="utf-8"))
prog = json.loads((RAIZ / "datos" / "programacion.json").read_text(encoding="utf-8"))
en_prog = {u.get("caso") for c in prog["cursos"].values() for u in c["unidades"]}
# Casos en preparación: datos/pendiente/<caso>.json aporta reglas, arte y unidad sin tocar los archivos compartidos
for f in sorted((RAIZ / "datos" / "pendiente").glob("*.json")) if (RAIZ / "datos" / "pendiente").exists() else []:
    extra = json.loads(f.read_text(encoding="utf-8"))
    for k, v in extra.get("reglas", {}).items():
        reglas.setdefault(k, {}).update(v)
    arte.update(extra.get("arte", {}))
    en_prog.add(f.stem)
TIPOS = {"portada", "relato", "descubre", "apunta", "papeles", "caza", "hipotesis", "clasifica", "huecos",
         "manchas", "careo", "candado", "expediente", "final", "pregunta", "escribe", "ordena"}
# Encargos (misiones secundarias): datos/encargos.json + datos/encargos/<id>.json
ind_enc = RAIZ / "datos" / "encargos.json"
en_indice = {x["id"] for x in json.loads(ind_enc.read_text(encoding="utf-8"))["encargos"]} if ind_enc.exists() else set()
SEMILLA = re.compile(r"\{([^{}|]+)\|([^{}|]+)(?:\|([^{}|]+))?\}")

errores = []
archivos = sorted((RAIZ / "datos" / "casos").glob("*.json")) + sorted((RAIZ / "datos" / "encargos").glob("*.json"))
for f in archivos:
    c = json.loads(f.read_text(encoding="utf-8"))
    nombre = f.stem
    err = lambda m: errores.append(f"{nombre}: {m}")
    if c.get("id") != nombre:
        err("el id no coincide con el nombre del archivo")
    if "encargo" in c:
        enc = c["encargo"]
        if c["id"] not in en_indice:
            err("no está en datos/encargos.json")
        if not isinstance(enc.get("rango"), int) or not 0 <= enc["rango"] <= 4:
            err("encargo.rango tiene que ser 0-4 (Novato, Agente, Detective, Inspector/a, Élite)")
        for k in ("cliente", "contenido"):
            if not enc.get(k):
                err(f"al encargo le falta «{k}»")
    elif c["id"] not in en_prog:
        err("no está en programacion.json")
    cartas = {k["id"] for r in c["reglas"] for k in reglas.get(r, {}).get("cartas", [])}
    digitos = []
    for i, e in enumerate(c["escenas"]):
        donde = f"escena {i} ({e['tipo']})"
        if e["tipo"] not in TIPOS:
            err(f"{donde}: tipo desconocido")
        for campo in ("fondo", "objeto"):
            if e.get(campo) and e[campo] not in arte:
                err(f"{donde}: {campo} «{e[campo]}» no está en arte.json")
        pj = e.get("personaje")
        if pj and (pj["id"] not in arte or pj.get("expresion", "neutral") not in arte[pj["id"]].get("expresiones", [])):
            err(f"{donde}: personaje/expresión {pj} no está en arte.json")
        if pj and arte.get(pj["id"], {}).get("no_voltear") and arte[pj["id"]].get("mira") == pj.get("lado", "der"):
            err(f"{donde}: {pj['id']} no se puede voltear (pulsera en la muñeca izquierda): ponlo en el lado contrario a «{pj.get('lado', 'der')}»")
        for id_ in e.get("equipo", []):
            if id_ not in arte:
                err(f"{donde}: personaje del equipo «{id_}» no está en arte.json")
        for campo in ("texto", "intro", "declaracion"):
            for m in SEMILLA.finditer(e.get(campo, "")):
                if m.group(1) == m.group(2):
                    err(f"{donde}: falta sembrada igual a la forma correcta ({m.group(1)})")
                et = m.group(3)
                if et and et not in reglas and et not in cartas:
                    err(f"{donde}: etiqueta «{et}» no es una regla ni una carta del caso")
                if e["tipo"] == "careo" and not et:
                    err(f"{donde}: falta sin carta en el careo ({m.group(1)})")
        for w in e.get("palabras", []) if e["tipo"] == "huecos" else []:
            if w["p"][w["pos"]:w["pos"] + len(w["letra"])] != w["letra"]:
                err(f"{donde}: en «{w['p']}» no está «{w['letra']}» en la posición {w['pos']}")
            if w["letra"] not in w["opciones"]:
                err(f"{donde}: la letra correcta de «{w['p']}» no está entre las opciones")
        for w in e.get("palabras", []) if e["tipo"] == "clasifica" else []:
            if w["cat"] not in {k["id"] for k in e["categorias"]}:
                err(f"{donde}: «{w['p']}» tiene una categoría que no existe")
        if e["tipo"] in ("hipotesis",) and not 0 <= e["correcta"] < len(e["opciones"]):
            err(f"{donde}: respuesta correcta fuera de rango")
        for q in e.get("preguntas", []):
            if not 0 <= q["correcta"] < len(q["opciones"]):
                err(f"{donde}: pregunta con respuesta fuera de rango")
        for it in e.get("items", []) if e["tipo"] == "escribe" else []:
            if not it.get("enunciado") or not it.get("respuestas"):
                err(f"{donde}: a un ítem le falta el enunciado o las respuestas")
        if e["tipo"] == "ordena" and len(e.get("fragmentos", [])) < 3:
            err(f"{donde}: hacen falta al menos 3 fragmentos")
        if e["tipo"] == "pregunta" and not e.get("preguntas"):
            err(f"{donde}: no hay preguntas")
        if e.get("recompensa", {}).get("digito"):
            digitos.append(e["recompensa"]["digito"])
        if e["tipo"] == "candado" and e["codigo"] != "".join(digitos):
            err(f"{donde}: el código {e['codigo']} no coincide con las cifras encontradas {''.join(digitos)}")

print(f"{len(archivos)} casos y encargos revisados")
if errores:
    print("ERRORES:")
    for e in errores:
        print("  -", e)
    sys.exit(1)
print("Todo correcto")
