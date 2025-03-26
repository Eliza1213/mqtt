const express = require("express");
const cors = require("cors");
const conectarDB = require("./Config/db");
require("dotenv").config();



const app = express();
const port = process.env.PORT || 4000;

// Middleware para parsear JSON y habilitar CORS
app.use(express.json());
app.use(cors());

// Conectar a la base de datos
conectarDB();

// Rutas API existentes
app.use("/api/usuarios", require("./routes/userRoutes"));
app.use("/api/misiones", require("./routes/MisionRoutes"));
app.use("/api/visiones", require("./routes/VisionRoutes"));
app.use("/api/terminos", require("./routes/TerminoRoutes"));
app.use("/api/politicas", require("./routes/PoliticaRoutes"));
app.use("/api/preguntas", require("./routes/PreguntaRoutes"));
app.use("/api/contactos", require("./routes/ContactoRoutes"));
app.use("/api/informaciones", require("./routes/InformacionRoutes"));
app.use("/api/productos", require("./routes/ProductoRoutes"));

// Exportar la aplicación
module.exports = app;