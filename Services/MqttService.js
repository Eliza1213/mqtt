// Services/MqttService.js
const mqtt = require('mqtt');

// Estado actual del terrario
let currentTerrarioState = {
  temperature: 25.5,
  fanState: false,
  foodLevel: "medium",
  turtleActivity: false,
  stableTemp: 24.0,
  maxTemp: 30.0,
  lampState: false
};

// Configuración de la conexión MQTT
const MQTT_CONFIG = {
  host: 'd67c9225.ala.dedicated.aws.emqxcloud.com',
  port: 1883,
  username: 'tortuterra',
  password: 'tortuterra',
  clientId: 'mqttx_194a442b'
};

// Tópicos MQTT
const MQTT_TOPICS = {
  temperature: 'tortuterra/sensor/temperature',
  foodLevel: 'tortuterra/sensor/foodlevel',
  motion: 'tortuterra/sensor/motion',
  fanState: 'tortuterra/fan/state',
  lampState: 'tortuterra/lamp/state',
  foodState: 'tortuterra/food/state',
  fanControl: 'tortuterra/fan/control',
  lampControl: 'tortuterra/lamp/control',
  foodControl: 'tortuterra/food/control'
};

// Cliente MQTT
let mqttClient = null;
let connectionStatus = false;

// Inicializar el servicio MQTT
const initMqttService = () => {
  if (mqttClient) return;

  console.log('Iniciando servicio MQTT...');
  
  try {
    mqttClient = mqtt.connect({
      protocol: 'mqtt',
      host: MQTT_CONFIG.host,
      port: MQTT_CONFIG.port,
      username: MQTT_CONFIG.username,
      password: MQTT_CONFIG.password,
      clientId: MQTT_CONFIG.clientId,
      reconnectPeriod: 5000
    });
    
    // Eventos MQTT
    mqttClient.on('connect', () => {
      console.log('✅ Conectado al broker MQTT');
      connectionStatus = true;
      
      mqttClient.subscribe([
        MQTT_TOPICS.temperature,
        MQTT_TOPICS.foodLevel,
        MQTT_TOPICS.motion,
        MQTT_TOPICS.fanState,
        MQTT_TOPICS.lampState,
        MQTT_TOPICS.foodState
      ], (err) => {
        if (err) {
          console.error(`❌ Error al suscribirse: ${err.message}`);
        } else {
          console.log('✅ Suscripciones activas:', Object.values(MQTT_TOPICS).join(', '));
        }
      });
    });

    // LÍNEA 88 CORREGIDA (usando template strings)
    mqttClient.on('message', (topic, message) => {
      const value = message.toString();
      console.log(`Mensaje recibido en ${topic}: ${value}`);
      
      try {
        if (topic === MQTT_TOPICS.temperature) {
          currentTerrarioState.temperature = parseFloat(value);
        } else if (topic === MQTT_TOPICS.foodLevel) {
          currentTerrarioState.foodLevel = value;
        } else if (topic === MQTT_TOPICS.motion) {
          currentTerrarioState.turtleActivity = value === 'detected';
        } else if (topic === MQTT_TOPICS.fanState) {
          currentTerrarioState.fanState = value === 'on';
        } else if (topic === MQTT_TOPICS.lampState) {
          currentTerrarioState.lampState = value === 'on';
        }
      } catch (error) {
        console.error(`Error procesando mensaje: ${error.message}`);
      }
    });

    mqttClient.on('error', (err) => {
      console.error(`Error MQTT: ${err.message}`);
      connectionStatus = false;
    });

    mqttClient.on('reconnect', () => {
      console.log('🔄 Intentando reconexión MQTT...');
      connectionStatus = false;
    });

    mqttClient.on('close', () => {
      console.log('🔌 Conexión MQTT cerrada');
      connectionStatus = false;
    });

  } catch (error) {
    console.error(`Error inicializando MQTT: ${error.message}`);
    connectionStatus = false;
  }
};

// Controlar actuadores
const controlActuator = (actuador, accion) => {
  if (!mqttClient) initMqttService();
  
  if (!connectionStatus) {
    throw new Error('🚫 Conexión MQTT no disponible');
  }

  const commandMap = {
    fan: MQTT_TOPICS.fanControl,
    lamp: MQTT_TOPICS.lampControl,
    dispense: MQTT_TOPICS.foodControl
  };

  const topic = commandMap[actuador];
  if (!topic) throw new Error(`🚫 Actuador no soportado: ${actuador}`);

  const message = actuador === 'dispense' ? 'dispense' : accion;
  console.log(`📤 Enviando: ${topic} -> ${message}`);

  mqttClient.publish(topic, message, { qos: 1 }, (err) => {
    if (err) throw new Error(`❌ Fallo al enviar: ${err.message}`);
    console.log(`📩 Comando enviado: ${topic}/${message}`);
  });

  return true;
};

// Estado del terrario
const getTerrarioStatus = () => ({
  ...currentTerrarioState,
  connected: connectionStatus,
  lastUpdate: new Date().toISOString()
});

module.exports = {
  initMqttService,
  controlActuator,
  getTerrarioStatus,
  isConnected: () => connectionStatus
};