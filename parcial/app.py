from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os

app = Flask(__name__, static_folder='.')
CORS(app)

RUTA_JSON = os.path.join(os.path.dirname(__file__), 'calculadoras.json')

def leer_datos():
    try:
        with open(RUTA_JSON, 'r', encoding='utf-8') as file:
            return json.load(file)
    except Exception as e:
        return {"usuarios": [], "calculadoras": {}}

def guardar_datos(data):
    with open(RUTA_JSON, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=2)

@app.route('/')
def index():
    return send_from_directory('.', 'proyecto.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/api/calculadoras', methods=['GET'])
def obtener_calculadoras():
    datos = leer_datos()
    return jsonify(datos)

@app.route('/api/register', methods=['POST'])
def registrar():
    req_data = request.get_json()
    usuario_o_email = req_data.get('usuario')
    password = req_data.get('password')

    if not usuario_o_email or not password:
        return jsonify({"success": False, "message": "Datos incompletos"}), 400

    datos = leer_datos()
    usuarios = datos.get("usuarios", [])

    for u in usuarios:
        if u.get('usuario') == usuario_o_email or u.get('email') == usuario_o_email:
            return jsonify({"success": False, "message": "El usuario o correo ya está registrado"}), 400

    nuevo_usuario = {
        "usuario": usuario_o_email,
        "email": usuario_o_email,
        "password": password
    }
    usuarios.append(nuevo_usuario)
    datos["usuarios"] = usuarios
    guardar_datos(datos)

    return jsonify({"success": True, "message": "Registro exitoso"})

@app.route('/api/login', methods=['POST'])
def login():
    req_data = request.get_json()
    usuario_input = req_data.get('usuario')
    password_input = req_data.get('password')

    datos = leer_datos()
    usuarios = datos.get("usuarios", [])

    usuario_encontrado = None
    for u in usuarios:
        if u.get('usuario') == usuario_input or u.get('email') == usuario_input:
            usuario_encontrado = u
            break

    if not usuario_encontrado:
        return jsonify({"success": False, "message": "El usuario o correo no existe"}), 404

    if usuario_encontrado.get('password') == password_input:
        return jsonify({"success": True, "message": "Contraseña correcta", "usuario": usuario_encontrado.get('usuario')})
    else:
        return jsonify({"success": False, "message": "Contraseña incorrecta"}), 401

if __name__ == '__main__':
    app.run(port=5000, debug=True)