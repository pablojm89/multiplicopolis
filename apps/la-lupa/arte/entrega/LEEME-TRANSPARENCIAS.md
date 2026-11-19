# Entrega directa de los lotes 6 y 7

23 PNG originales sin pérdida. Se corrigió mediante edición de imagen la máscara de cinco variantes de Robles: contento, pensativo, sorprendido, deporte y deporte-contento. Estas CINCO versiones sustituyen a las entregas previas, incluidas las de los ZIP. No recuperar sus máscaras anteriores. Se mantiene el peinado aprobado: moño rizado con volumen, informal, frente despejada y sin flequillo ni rizos hacia delante.

## Integración pendiente por Claude

El commit ca4d0e4 ya integró los lotes, pero Pablo detectó errores en las transparencias del pelo después de limpiar un halo gris. Esta entrega NO modifica los WEBP ni arte.json; aporta PNG válidos para rehacer las cinco conversiones dañadas con el flujo de Claude. No marcar esta corrección como visible en el juego hasta reconvertirlos y revisar las escenas.

No eliminar el fondo por color ni hacer un recorte binario mediante umbral de alfa: esos pasos dañan los rizos y el suavizado. Conservar el canal alfa de los nuevos PNG tal como llega. El máximo alfa de algunos originales es 254: eso NO es una nube gris y no exige destruir semitransparencias de bordes. Revisar sobre fondo claro Y oscuro, especialmente alrededor del moño y en los huecos entre rizos, antes y después de la conversión a WEBP. Se comprobaron las cinco imágenes corregidas mediante composición alfa sobre ambos fondos y se vieron limpias, sin nube ni zonas de fondo opacas. Las vistas previas que muestran el RGB oculto sin componer el alfa pueden enseñar luz ámbar que no es visible en el juego.

Preferir conversión sin pérdida al sustituir los cinco recursos de Robles y comprobar conservación exacta del alfa. Personajes 1024×1536; foto/objetos ajustar al objetivo1024×1024 preservando proporciones; fondo1920×1080. Manifiesto registra dimensiones y SHA256 reales. El resto de imágenes del lote7 ya está integrado; se conservan aquí los originales como fuente.

GitHub: se ha autorizado la instalación pablojm89 y ahora funciona la escritura. Rama de entrega gpt/arte-lotes-6-7-robles-aprobado, destino claude/educational-repo-system-as2c4u. No fusionar a main. No contiene datos del alumnado ni fotografías personales. Referencias: issues #6 y #7.
