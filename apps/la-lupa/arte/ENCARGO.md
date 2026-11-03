# Encargo de imágenes · Agencia La Lupa

> Archivo generado por `herramientas/encargo_arte.py` a partir de `datos/arte.json`. No lo edites a mano: cambia `arte.json` y vuelve a generarlo.

## Para la IA de imágenes (ChatGPT / Gemini)

Eres el ilustrador de **Agencia La Lupa**, un juego educativo de detectives de ortografía para niños de 10-12 años (5.º y 6.º de Primaria, Andalucía).
Los alumnos forman parte de una pequeña agencia de detectives del barrio ficticio de La Alameda. El juego se ve como escenas a pantalla completa: un fondo, un personaje grande a un lado y un bocadillo de texto encima.

### Estilo (igual en TODAS las imágenes)

Ilustración de álbum infantil con estética de cómic europeo de detectives: línea de tinta suelta, colores planos con textura de papel envejecido, sombras suaves. Paleta: albero (amarillo arena), azul azulejo, blanco cal, terracota, verde oliva. Barrio andaluz ficticio llamado La Alameda: casas encaladas, rejas, macetas, azulejos, farolillos de feria. Tono cálido y con humor, para niños de 10-12 años. Sin texto escrito en la imagen.

### Reglas

1. **Sin texto ni letras dentro de la imagen** (el juego pone los textos).
2. **Personajes coherentes**: dibuja primero la expresión `neutral` de cada personaje y úsala como referencia para sus demás expresiones (misma cara, ropa, colores y proporciones).
3. Personajes **de cuerpo entero o de rodillas para arriba, de pie, mirando un poco hacia el centro, sobre fondo transparente** (PNG con transparencia). Si no puedes hacer transparencia, usa un fondo blanco liso.
4. Fondos **16:9, sin personajes**, con la parte inferior central algo despejada (ahí va el bocadillo de texto).
5. Objetos **aislados sobre fondo transparente**, centrados.
6. Nada de personas reales, marcas, logotipos ni referencias a Sherlock Holmes.
7. **Nombra cada archivo exactamente** como se indica (`nombre.png`). Si no, el juego no lo encuentra.

### Entrega

Sube los PNG a la carpeta `apps/la-lupa/arte/entrega/` del repositorio, con el nombre exacto de cada uno. Claude los convierte e integra en el juego.

## Orden recomendado

1. Personajes principales: Lola, Mateo y la directora Robles (aparecen en todos los casos).
2. Fondos del caso 1.
3. Personajes del caso 1 y objetos.

## Personajes

### Lola

**Descripción:** Lola, detective de 11 años, piel morena clara, pelo castaño con coleta alta, gabardina corta color albero, zapatillas, lupa grande en la mano, mirada lista y decidida.

| Archivo | Expresión |
|---|---|
| `lola-neutral.png` | expresión neutra, atenta |
| `lola-contento.png` | contento/a, sonrisa amplia |
| `lola-pensativo.png` | pensativo/a, mano en la barbilla, mirada de lado |
| `lola-sorprendido.png` | sorprendido/a, ojos muy abiertos, cejas arriba |

### Mateo

**Descripción:** Mateo, detective archivero de 11 años, piel clara, pelo rizado, gafas redondas, chaleco azul con muchos bolsillos, carga un archivador lleno de fichas de colores.

| Archivo | Expresión |
|---|---|
| `mateo-neutral.png` | expresión neutra, atenta |
| `mateo-contento.png` | contento/a, sonrisa amplia |
| `mateo-pensativo.png` | pensativo/a, mano en la barbilla, mirada de lado |
| `mateo-sorprendido.png` | sorprendido/a, ojos muy abiertos, cejas arriba |

### Directora Robles

**Descripción:** La directora Robles, mujer de unos 55 años, pelo canoso recogido en moño, gafas colgadas al cuello, chaqueta azul marino, gesto serio pero amable, taza de café en la mano.

| Archivo | Expresión |
|---|---|
| `robles-neutral.png` | expresión neutra, atenta |
| `robles-contento.png` | contento/a, sonrisa amplia |
| `robles-pensativo.png` | pensativo/a, mano en la barbilla, mirada de lado |
| `robles-sorprendido.png` | sorprendido/a, ojos muy abiertos, cejas arriba |

### Julián, el panadero

**Descripción:** Julián, panadero de unos 45 años, corpulento, bigote, delantal blanco con harina, gorro de panadero, brazos cruzados o con una barra de pan.

| Archivo | Expresión |
|---|---|
| `julian-neutral.png` | expresión neutra, atenta |
| `julian-contento.png` | contento/a, sonrisa amplia |
| `julian-sorprendido.png` | sorprendido/a, ojos muy abiertos, cejas arriba |

### Inés, la florista

**Descripción:** Inés, florista de unos 30 años, pelo rubio recogido con un clavel, delantal verde con tijeras en el bolsillo, brazos llenos de flores.

| Archivo | Expresión |
|---|---|
| `ines-neutral.png` | expresión neutra, atenta |
| `ines-contento.png` | contento/a, sonrisa amplia |
| `ines-sorprendido.png` | sorprendido/a, ojos muy abiertos, cejas arriba |

### Ramón, el músico

**Descripción:** Ramón, músico joven de unos 22 años, piel oscura, pelo rizado corto, camisa de flores, guitarra española colgada a la espalda, gesto despistado y simpático.

| Archivo | Expresión |
|---|---|
| `ramon-neutral.png` | expresión neutra, atenta |
| `ramon-contento.png` | contento/a, sonrisa amplia |
| `ramon-sorprendido.png` | sorprendido/a, ojos muy abiertos, cejas arriba |
| `ramon-nervioso.png` | nervioso/a, sonrisa forzada, gota de sudor, se rasca la nuca |

### Doña Pilar

**Descripción:** Doña Pilar, pregonera del barrio, abuela de unos 75 años, pelo blanco con peineta, mantón de flores sobre los hombros, gafas, sonrisa enorme.

| Archivo | Expresión |
|---|---|
| `pilar-neutral.png` | expresión neutra, atenta |
| `pilar-contento.png` | contento/a, sonrisa amplia |
| `pilar-sorprendido.png` | sorprendido/a, ojos muy abiertos, cejas arriba |

## Fondos (16:9, 1920×1080, sin personajes)

| Archivo | Qué se ve |
|---|---|
| `fachada-agencia.png` | Fachada de una pequeña agencia de detectives en una calle encalada del barrio de La Alameda, puerta de madera azul, gran cartel con una lupa dibujada, macetas de geranios, farol, luz de media tarde. |
| `agencia.png` | Interior de la oficina de la Agencia La Lupa: tablón de corcho grande con fichas e hilos rojos, archivadores de madera, ventana con reja andaluza, lámpara de mesa verde, mesa con lupa y libretas, azulejos en el zócalo. |
| `casa-feria.png` | Sala de la Casa de la Feria de un barrio andaluz la víspera de la fiesta: mesa larga con mantel, farolillos de papel guardados en cajas, carteles de feria antiguos, ventana abierta a una plaza, ambiente de misterio suave. |
| `panaderia.png` | Panadería tradicional de barrio: mostrador de madera con papeles y pedidos desordenados, estanterías con pan, magdalenas y bizcochos, horno de leña al fondo, harina en el aire, luz de mañana. |
| `floristeria.png` | Floristería pequeña y abarrotada de ramos para la feria: claveles, jazmines, girasoles, cubos de zinc en el suelo, macetas colgando, patio andaluz con azulejos al fondo. |
| `kiosco.png` | Templete o kiosco de música de hierro forjado en el centro de una plaza andaluza con naranjos, atril con partituras, sillas plegables, guirnaldas de feria sin encender. |
| `plaza-feria.png` | La misma plaza del barrio de La Alameda de noche y en fiesta: farolillos encendidos, guirnaldas, escenario con un atril para el pregón, vecinos al fondo, ambiente alegre. |

## Objetos (fondo transparente, 1024×1024)

| Archivo | Qué se ve |
|---|---|
| `carpeta-vacia.png` | Sobre una mesa con mantel, la marca rectangular donde estaba una carpeta y unas migas de pan esparcidas. |
| `partitura.png` | Partitura de papel antiguo en un atril, con varias manchas redondas de café. |
| `caja-musica.png` | Caja de música de madera taraceada con un candado de latón de tres ruedas numeradas. |
| `pregon.png` | Pergamino enrollado atado con una cinta roja y verde, dentro de una carpeta azul. |

## Notas del ilustrador

_Si tienes dudas o propuestas (por ejemplo, un cambio de estilo), apúntalas aquí o díselas a Pablo._

---
Quedan **36** imágenes por entregar.
