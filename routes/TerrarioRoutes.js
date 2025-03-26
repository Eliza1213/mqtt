// backend/routes/TerrarioRoutes.js
const express = require("express");
const router = express.Router();
const TerrarioData = require("../models/TerrarioData");
const mqttService = require("../Services/MqttService");

// Inicializar el servicio MQTT al cargar las rutas
mqttService.initMqttService();

// Ruta para obtener el estado actual del terrario
router.get("/estado", (req, res) => {
  try {
    const status = mqttService.getTerrarioStatus();
    res.status(200).json(status);
  } catch (error) {
    console.error("Error al obtener estado del terrario:", error);
    res.status(500).json({ error: "Error al obtener el estado del terrario" });
  }
});

// Ruta para verificar la conectividad MQTT
router.get("/conectividad", (req, res) => {
  const conectado = mqttService.isConnected();
  res.status(200).json({ 
    connected: conectado,
    broker: 'd67c9225.ala.dedicated.aws.emqxcloud.com',
    port: 1883,
    clientId: 'mqttx_194a442b'
  });
});

// Ruta para guardar datos del terrario
router.post("/terrario-data", async (req, res) => {
  const { dispositivo_id, temperatura, humedad, luz, ventilador, pir } = req.body;

  try {
    const nuevoDato = new TerrarioData({
      dispositivo_id,
      temperatura,
      humedad,
      luz,
      ventilador,
      pir,
    });

    await nuevoDato.save();
    res.status(201).json({ message: "Datos guardados correctamente" });
  } catch (error) {
    console.error("Error al guardar los datos:", error);
    res.status(500).json({ message: "Error al guardar los datos" });
  }
});

module.exports = router;