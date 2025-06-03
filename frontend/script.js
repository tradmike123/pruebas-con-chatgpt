const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = true;
recognition.lang = "es-DO";

recognition.onresult = function(event) {
  const texto = event.results[event.results.length - 1][0].transcript.trim();
  console.log("Dijiste:", texto);

  fetch("http://127.0.0.1:5000/procesar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mensaje: texto })
  })
  .then(res => res.json())
  .then(data => mostrarRespuesta(data.texto));
};

function mostrarRespuesta(texto) {
  const contenedor = document.getElementById("respuesta");
  if (contenedor) {
    contenedor.textContent = texto;
  }
  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = "es-DO";
  speechSynthesis.speak(utterance);
}

function hablar(texto) {
  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = "es-DO";
  speechSynthesis.speak(utterance);
}

recognition.start();
