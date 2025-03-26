// backend/routes/ControlRoutes.js
const express = require("express");
const router = express.Router();
const mqttService = require("../Services/MqttService");

// Ruta para controlar los actuadores
router.post("/", (req, res) => {
  const { actuador, accion } = req.body;

  // Verificar datos recibidos
  if (!actuador || !accion) {
    return res.status(400).json({ message: "Datos incompletos: faltan actuador o acción." });
  }

  console.log("Recibido: Actuador - " + actuador + ", Acción - " + accion);

  try {
    // Enviar comando al MQTT
    mqttService.controlActuator(actuador, accion);
    
    // Lógica de control de actuadores para compatibilidad con código existente
    switch (actuador) {
      case "fan":
        if (accion === "on") {
          console.log("Encendiendo el ventilador...");
        } else if (accion === "off") {
          console.log("Apagando el ventilador...");
        } else {
          return res.status(400).json({ message: "Acción no válida para el ventilador." });
        }
        break;

      case "lamp":
        if (accion === "on") {
          console.log("Encendiendo la lámpara...");
        } else if (accion === "off") {
          console.log("Apagando la lámpara...");
        } else {
          return res.status(400).json({ message: "Acción no válida para la lámpara." });
        }
        break;
      
      case "dispense":
        if (accion === "on" || accion === "dispense") {
          console.log("Dispensando comida...");
        } else {
          return res.status(400).json({ message: "Acción no válida para dispensar comida." });
        }
        break;

      default:
        return res.status(400).json({ message: "Actuador no reconocido." });
    }

    // Responder con éxito
    res.status(200).json({ message: "Acción realizada con éxito." });
  } catch (error) {
    console.error("Error al controlar actuador:", error);
    res.status(500).json({ message: "Error al controlar actuador: " + (error.message || "Error desconocido") });
  }
});

module.exports = router;