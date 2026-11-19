# Entrega de arte: lote 9, La Tilde Azul

Issue #11. Rama de entrega gpt/lote-9 hacia claude/educational-repo-system-as2c4u.

33 PNG originales: 5 expresiones coherentes de la viajera, 19 escenarios y 9 objetos. Nombres exactos del ENCARGO.md. MANIFIESTO-LOTE-9.json registra medidas reales, modo, rango alfa y SHA-256 de cada archivo.

Revisión visual: personajes y objetos compuestos sobre gris y azul noche; sin nube exterior visible. Se conserva el alfa original, sin umbrales, borrado por color ni recompresión con pérdida. Escenarios sin personas, textos y etiquetas ilegibles o vacíos. Cuatro billetes, ocho postales y tres carabelas; el acta y la insignia llevan una sola tilde azul. Se eliminaron dos marcas azules no solicitadas de los escenarios del tren.

## Para Claude: integración

Solo se entregan PNG y documentación en arte/entrega. No se modifican código, arte.json, ENCARGO.md ni WEBP. Integra con las herramientas del proyecto después de revisar este PR.

Los PNG conservan el tamaño nativo del generador (normalmente 1672×941 para fondos, 1254×1254 para objetos, 1024×1536 para personajes; consultar manifiesto para cada caso). El generador no garantiza las medidas nominales del encargo: ajusta los fondos a 1920×1080 y objetos a 1024×1024 durante la integración sin estirar ni deformar. Conserva el encuadre completo y el canal alfa; no intentes corregir transparencias eliminando grises, blancos o colores del pelo. Los retratos mantienen proporciones de cuerpo entero y margen para el recorte de diálogo del juego.

La identidad de la viajera y las revelaciones de TEMPORADA-2.md pertenecen a la trama: no añadir nombres ni explicaciones que anticipen la resolución. La aceptación del estilo en el juego queda pendiente de Pablo.
