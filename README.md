
# Gia Asistente: Proyecto de Asistente Personal con Voz

Este repositorio contiene un sistema básico de asistente personal llamado **Gia**, desarrollado con tecnología de reconocimiento de voz y respuesta hablada automática.

## 🧠 Funcionalidades principales

- 🎙️ **Hot Mic**: Gia escucha constantemente sin necesidad de clics.
- 🧾 **Procesamiento de voz**: El usuario habla, Gia transcribe y entiende.
- 🔊 **Respuesta automática hablada**: Gia responde con voz real.
- 🌐 **Servidor local con Flask**: Backend que procesa los mensajes y devuelve respuestas.
- 💬 **Interfaz simple en HTML/JS** para activación automática desde el navegador.

## 📁 Estructura del Proyecto

```
gia-asistente/
├── backend/
│   └── server.py        # Servidor en Flask
├── frontend/
│   ├── index.html       # Interfaz de usuario
│   └── script.js        # Lógica de reconocimiento de voz y síntesis
└── README.md            # Este archivo
```

## 🚀 ¿Cómo usarlo?

1. Ejecuta el servidor:
   ```bash
   cd backend
   python server.py
   ```

2. Abre `frontend/index.html` en un navegador moderno (Chrome o Edge recomendado).

3. Gia comenzará a escuchar y responderte automáticamente.

## ⚠️ Advertencia

Este proyecto contiene un sistema experimental de escucha continua. Su funcionamiento puede depender de los permisos del navegador y no es recomendable para ambientes públicos sin autorización.

---

Desarrollado con cariño y patria por **Miguel + Gia** 🇩🇴
