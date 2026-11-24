/* Ayuda de manejo. Las pistas del caso se piden por separado, con la lupa. */
"use strict";

const AYUDA_PANTALLA = {
  entrada: ["Tu ficha de detective", "Si juegas por primera vez, escribe tu nombre, elige tu curso y pulsa «Crear ficha». Si ya has jugado, toca tu ficha para recuperar tu avance en este dispositivo."],
  tablon: ["¿Por dónde empiezo?", "El botón de arriba te lleva al primer caso pendiente. Un candado indica qué expediente tienes que terminar antes.", "Desde aquí también puedes entrenar en la Academia o abrir el buzón de encargos.", "Si hay una orden del director con un cuestionario de Wayground, su botón lo abre en otra pestaña (hace falta internet). Al terminar, vuelve a esta pestaña."],
  sinCasos: ["¿Qué puedo jugar?", "Los casos de este curso aún se están preparando. Puedes practicar en la Academia o resolver los encargos abiertos del buzón."],
  casosAlDia: ["¿Qué puedo jugar ahora?", "Ya has resuelto los casos disponibles de tu curso. Mientras llegan más, puedes repetir un caso, entrenar en la Academia o jugar un encargo."],
  preparacion: ["Cómo preparar el caso", "Empieza por el paso marcado «Ahora». Al terminarlo, se abre el siguiente. Puedes salir al tablón y volver otro día: los pasos completados se guardan."],
  repasoCaso: ["Cómo preparar el repaso", "Empieza por el paso marcado «Ahora». En este expediente practicarás reglas mezcladas con la Imprenta, el dictado y tus fichas. Los pasos completados se guardan."],
  apuntes: ["Cómo usar la ficha", "En la preparación con libreta de papel, haz en tu cuaderno lo que pide el primer bloque. Los esquemas de abajo son para consultar. Cuando termines, pulsa el botón para seguir."],
  apuntesDigital: ["Cómo usar la ficha", "Lee los esquemas y fíjate en los ejemplos. Cuando estés listo para practicar, pulsa «Ya me lo sé»."],
  estudio: ["Cómo repasar", "Elige una regla y lee sus esquemas y ejemplos. Usa «Todas las reglas» para cambiar de ficha. Puedes consultar los apuntes en cualquier momento."],
  academia: ["Qué puedes hacer en la Academia", "Elige una tarea del turno o una puerta para entrenar. Si quieres leer una regla, entra en «Apuntes para estudiar». La preparación obligatoria de un caso se abre desde su tarjeta del tablón."],
  carnet: ["Cómo ganar lupas y sellos", "Cada ejercicio tiene sus propias lupas. Supera dos rondas seguidas en tu nivel más alto para ganar el siguiente. El carné te muestra el progreso de cada sala."],
  elegirActividad: ["Cómo elegir un ejercicio", "Toca el ejercicio que quieras hacer. La frase debajo de su nombre te dice qué vas a practicar."],
  elegirRegla: ["Qué vas a entrenar", "Elige una regla para practicarla. «Todo mezclado» combina varias reglas en una misma ronda."],
  nivel: ["Qué lupa elegir", "Empieza con la lupa de bronce si es tu primera vez. Las lupas con candado se abren al superar rondas. Puedes volver a entrenar con una lupa que ya tengas.", "Pulsa «Empezar entrenamiento» cuando estés listo."],
  ejemplo: ["Del ejemplo a la ronda", "Lee cómo lo resuelve tu instructor. Cuando estés listo, pulsa «Ahora tú» para empezar. Este ejemplo no cuenta para tu puntuación."],
  temaPizarra: ["Qué regla investigar", "Toca la regla que quieras investigar o pulsa «Una al azar» para que don Anselmo elija."],
  encargos: ["Qué hay en el buzón", "Toca un encargo abierto para jugarlo. Los sobres con candado indican el rango que necesitas. Ganas puntos al resolver casos y encargos y al entrenar en la Academia."],
  informe: ["Qué hacer con tu informe", "Aquí puedes ver tus aciertos y qué palabras conviene repasar. Sigue al próximo caso si aparece el botón, o vuelve al tablón."],
  informeEncargo: ["Qué hacer con tu informe", "Mira tus aciertos y las palabras para repasar. Pulsa «Volver a los encargos» para elegir otra misión del buzón."],
};

const AYUDA_CASO = {
  portada: ["Cómo abrir el expediente", "Toca el precinto. Cuando aparezca «Abrir expediente», púlsalo para entrar."],
  relato: ["Cómo seguir la historia", "Lee el bocadillo. Puedes tocar el texto para verlo entero enseguida. Cuando aparezca «Seguir», púlsalo."],
  descubre: ["Cómo descubrir una regla", "Compara las palabras de los grupos y toca la opción que explica cómo están escritas. Lee la explicación y sigue."],
  apunta: ["Qué hacer con tu libreta", "Lee la lista y escribe en tu cuaderno lo que te pide. Pulsa «Ya lo he apuntado» para seguir. Si juegas con libreta digital, escribe en las casillas y pulsa «Guardar»."],
  papeles: ["Cómo corregir los papeles", "Toca un papel si crees que tiene una palabra mal escrita. Escribe la palabra completa como debería estar y pulsa «Comprobar»."],
  caza: ["Cómo revisar el documento", "Toca la palabra que creas que está mal escrita. Escribe la palabra completa y pulsa «Comprobar». El contador de abajo te dice cuántas faltas quedan."],
  hipotesis: ["Cómo elegir una hipótesis", "Una hipótesis es tu explicación de lo que ha pasado. Piensa en las pistas que has encontrado y toca la opción que mejor encaje."],
  clasifica: ["Cómo clasificar las palabras", "Lee la palabra que aparece y toca el grupo al que pertenece. Después aparecerá la siguiente."],
  huecos: ["Cómo rellenar los huecos", "Elige la letra de cada hueco. Si aparece «sin letra», puedes elegir dejarlo vacío. Cuando tengas una opción en cada fila, pulsa «Comprobar»."],
  manchas: ["Cómo revisar las tildes", "En cada palabra, elige «Con tilde» o «Sin tilde» para la vocal tapada. Después, pulsa «Comprobar» y revisa las que queden marcadas."],
  careo: ["Cómo demostrar una falta", "Toca la palabra mal escrita, elige la carta que explica la regla y luego escribe la palabra bien. Repite hasta aclarar la declaración."],
  candado: ["Cómo usar el candado", "Escribe una cifra por casilla, en el orden en que las conseguiste. Pulsa «Abrir».", "Si te falta una cifra, el botón «Libreta» te permite consultar las pistas encontradas."],
  expediente: ["Cómo archivar el expediente", "Desplaza la hoja para leer todos los textos. Toca y corrige las palabras con faltas. Al acabar, pulsa «Archivar expediente»."],
  pregunta: ["Cómo responder", "Lee la pregunta y, si hay un documento al lado, vuelve a leerlo para buscar la respuesta. Toca la opción que elijas."],
  escribe: ["Cómo escribir una respuesta", "Lee qué te piden y escribe la palabra o la respuesta corta. Incluye las tildes necesarias y pulsa «Comprobar»."],
  ordena: ["Cómo ordenar los fragmentos", "Toca el primer fragmento, luego el segundo y así hasta completar la lista. «Deshacer» quita el último que colocaste. Al colocarlos todos, aparece «Comprobar el orden»."],
  final: ["Cómo cerrar la investigación", "Lee el final. Puedes tocar el texto para verlo entero. Pulsa «Ver mi informe» para guardar el resultado y ver cómo te ha ido."],
};

const AYUDA_ACTIVIDAD = {
  fichas: ["Cómo usar las fichas del Archivo", "Lee la pista o la frase y escribe la palabra completa. Cuando acabes, pulsa el botón para pasar a la ficha siguiente."],
  documento: ["Cómo revisar el documento", "Toca una palabra que te parezca mal escrita, escríbela bien y comprueba. El contador te indica cuántas faltas has corregido."],
  parte: ["Cómo rellenar el parte", "Lee la pista de cada casilla y escribe la palabra. Usa Intro o el botón ✓ de esa casilla para comprobarla."],
  sintilde: ["Cómo devolver las tildes", "Toca la palabra que creas que necesita tilde. Escríbela completa con su tilde y pulsa «Comprobar». Puedes usar las vocales acentuadas que aparecen junto al campo."],
  sismografo: ["Cómo usar el sismógrafo", "Toca la sílaba que suena más fuerte. Si hay varias sílabas, elige si la palabra es aguda, llana o esdrújula. Para acabar, escribe la palabra completa con tilde o sin ella."],
  homofonos: ["Cómo usar el microscopio", "Lee la frase entera y elige la palabra que encaja por su significado. Después sigue la instrucción de Mateo para comprobar o escribir tu elección."],
  familias: ["Cómo usar la centrifugadora", "Pulsa «Centrifugar» para ver la parte que comparten las palabras de la familia. Lee cada palabra nueva y fíjate en lo que se conserva o cambia."],
  testigo: ["Cómo escribir el acta", "Lee cómo habla el testigo. Escribe en las casillas las palabras marcadas tal como se escriben en un acta. El seseo y el yeísmo son formas de hablar."],
  conjugar: ["Cómo usar la máquina del tiempo verbal", "Pulsa «Intro» para empezar. Mira el verbo, la persona (yo, tú, él…) y el tiempo que te pide la Terminal. Escribe solo la forma del verbo y compruébala."],
  "descubre-regla": ["Cómo investigar en la Pizarra", "Toca las palabras que comparten algo en su escritura para rodearlas. Elige la regla que explica el grupo, pruébala con palabras nuevas y escribe un ejemplo tuyo.", "Si hay dos grupos, toca otra vez una palabra para cambiar el color del círculo."],
  coma: ["Cómo cambiar el sentido de la frase", "Lee qué quiere decir el personaje. Elige dónde van los signos para que la frase tenga ese sentido y comprueba tu lectura."],
  dictado: ["Cómo recibir un dictado", "Pulsa «Recibir» para leer el mensaje unos segundos, o «Escuchar» si elegiste la radio. Después escribe el mensaje y pulsa «Transmitir». El botón indica si puedes repetirlo.", "Si la radio no está disponible, usa «Relámpago» para hacer el dictado en pantalla."],
  deletreo: ["Cómo recibir un deletreo", "Pulsa «Recibir» y junta las letras que ves o escuchas para escribir la palabra.", "Cuando Lola anuncie «Cambio de sentido», lee la palabra que aparece y pulsa en orden las teclas con los nombres de sus letras."],
  pruebas: ["Cómo revisar una prueba de imprenta", "Lee la galerada. En una pantalla táctil, toca la palabra para elegirla y tócala otra vez para marcarla. Después revisa las que hayas marcado y corrígelas."],
};

function activarAyudaPantalla(pantalla) {
  const tipo = P?.caso.escenas[P.i]?.tipo;
  const ayuda = AYUDA_PANTALLA[pantalla] || AYUDA_ACTIVIDAD[pantalla] || (P?.academia ? AYUDA_ACTIVIDAD[tipo] : AYUDA_CASO[tipo]);
  if (!ayuda) return;
  const capa = $("#escenario .capa");
  capa.insertAdjacentHTML("beforeend", '<button class="ayuda-juego" id="ayudaJuego" aria-label="Ayuda de esta pantalla" aria-haspopup="dialog" title="Ayuda de esta pantalla">?</button>');
  $("#ayudaJuego").onclick = () => {
    if ($("#capaModal").classList.contains("visible")) return;
    const [titulo, ...pasos] = ayuda;
    abrirModal(`<h3 id="tituloAyuda">${esc(titulo)}</h3>${pasos.map(p => `<p>${esc(p)}</p>`).join("")}`, "ventana-libreta ventana-ayuda");
    const ventana = $(".ventana-ayuda");
    ventana.setAttribute("aria-labelledby", "tituloAyuda");
    const cerrar = $(".cerrar", ventana);
    cerrar.focus();
    // Esta ayuda tiene un único control de salida.
    ventana.onkeydown = e => { if (e.key === "Tab") { e.preventDefault(); cerrar.focus(); } };
  };
}
