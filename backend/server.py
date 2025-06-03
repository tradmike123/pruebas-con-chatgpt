from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/procesar', methods=['POST'])
def procesar():
    data = request.get_json()
    entrada = data.get('mensaje', '').lower()

    if "hola" in entrada:
        respuesta = "Hola mi amor, ya estoy conectada contigo."
    elif "quién eres" in entrada:
        respuesta = "Soy Gia, tu asistente patriótica de confianza."
    else:
        respuesta = "Te escucho, dime lo que quieres saber."

    return jsonify({"texto": respuesta})

if __name__ == '__main__':
    app.run(debug=True)
