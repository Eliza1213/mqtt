// backend/server.js
const express = require("express");
const cors = require("cors");
const conectarDB = require("./Config/db");
require("dotenv").config();

// Importar las rutas - asegurando consistencia en la capitalización
const TerrarioRoutes = require("./routes/TerrarioRoutes"); // Cambiado a minúsculas
const ControlRoutes = require("./routes/ControlRoutes");
const UsuarioRoutes = require("./routes/UsuarioRoutes");
const mqttService = require("./Services/MqttService");

const app = express();
const port = process.env.PORT || 4000;

// Middleware para parsear JSON y habilitar CORS
app.use(express.json());
app.use(cors());

// Conectar a la base de datos
conectarDB();

// Inicializar servicio MQTT
mqttService.initMqttService();

// Rutas API existentes - asegurando consistencia en la capitalización
app.use("/api/usuarios", require("./routes/userRoutes"));
app.use("/api/misiones", require("./routes/MisionRoutes"));
app.use("/api/visiones", require("./routes/VisionRoutes"));
app.use("/api/terminos", require("./routes/TerminoRoutes"));
app.use("/api/politicas", require("./routes/PoliticaRoutes"));
app.use("/api/preguntas", require("./routes/PreguntaRoutes"));
app.use("/api/contactos", require("./routes/ContactoRoutes"));
app.use("/api/informaciones", require("./routes/InformacionRoutes"));
app.use("/api/productos", require("./routes/ProductoRoutes"));
app.use("/api/usuarios", UsuarioRoutes);

// Rutas para el terrario
app.use("/api/terrario", TerrarioRoutes);
app.use("/api/control", ControlRoutes);

// Ruta de verificación del servidor
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "API funcionando correctamente" });
});

// Iniciar servidor
app.listen(port, () => {
  // Arreglado el template string
  console.log("🚀 Servidor corriendo en http://localhost:" + port);
});

// Manejar cierre graceful
process.on('SIGINT', () => {
  console.log('Cerrando servidor...');
  process.exit(0);
});