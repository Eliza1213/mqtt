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
  // Sensores
  temperature: 'tortuterra/sensor/temperature',
  foodLevel: 'tortuterra/sensor/foodlevel',
  motion: 'tortuterra/sensor/motion',
  
  // Actuadores (estado)
  fanState: 'tortuterra/fan/state',
  lampState: 'tortuterra/lamp/state',
  foodState: 'tortuterra/food/state',
  
  // Actuadores (control)
  fanControl: 'tortuterra/fan/control',
  lampControl: 'tortuterra/lamp/control',
  foodControl: 'tortuterra/food/control'
};

// Cliente MQTT
let mqttClient = null;
let connectionStatus = false;

// Inicializar el servicio MQTT
const initMqttService = () => {
  if (mqttClient) return; // Ya está inicializado
  
  console.log('Iniciando servicio MQTT...');
  
  try {
    // Conectamos al broker MQTT
    mqttClient = mqtt.connect({
      protocol: 'mqtt',
      host: MQTT_CONFIG.host,
      port: MQTT_CONFIG.port,
      username: MQTT_CONFIG.username,
      password: MQTT_CONFIG.password,
      clientId: MQTT_CONFIG.clientId,
      reconnectPeriod: 5000
    });
    
    // Manejo de eventos de conexión
    mqttClient.on('connect', () => {
      console.log('✅ Conectado al broker MQTT');
      connectionStatus = true;
      
      // Suscripción a los tópicos de estado
      mqttClient.subscribe([
        MQTT_TOPICS.temperature,
        MQTT_TOPICS.foodLevel,
        MQTT_TOPICS.motion,
        MQTT_TOPICS.fanState,
        MQTT_TOPICS.lampState,
        MQTT_TOPICS.foodState
      ], (err) => {
        if (err) {
          console.error('❌ Error al suscribirse a los tópicos:', err);
        } else {
          console.log('✅ Suscrito a los tópicos de estado');
        }
      });
    });
    
    // Manejo de mensajes recibidos
    mqttClient.on('message', (topic, message) => {
      const value = message.toString();
      console.log('Mensaje recibido en ' + topic + ': ' + value);
      
      try {
        // Actualizar el estado según el tópico
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
        console.error('Error al procesar mensaje MQTT:', error);
      }
    });
    
    // Manejo de errores
    mqttClient.on('error', (err) => {
      console.error('Error en conexión MQTT:', err);
      connectionStatus = false;
    });
    
    // Reconexión
    mqttClient.on('reconnect', () => {
      console.log('Intentando reconectar a MQTT...');
      connectionStatus = false;
    });
    
    // Desconexión
    mqttClient.on('close', () => {
      console.log('Conexión MQTT cerrada');
      connectionStatus = false;
    });
  } catch (error) {
    console.error('Error al inicializar el servicio MQTT:', error);
    connectionStatus = false;
  }
};

// Controlar un actuador
const controlActuator = (actuador, accion) => {
  if (!mqttClient) {
    initMqttService(); // Intentar iniciar si no está inicializado
  }
  
  if (!connectionStatus) {
    console.error('❌ Cliente MQTT no conectado');
    throw new Error('Cliente MQTT no conectado');
  }
  
  let topic = '';
  let message = '';
  
  // Seleccionar el tópico y mensaje según el actuador y la acción
  if (actuador === 'fan') {
    topic = MQTT_TOPICS.fanControl;
    message = accion;
  } else if (actuador === 'lamp') {
    topic = MQTT_TOPICS.lampControl;
    message = accion;
  } else if (actuador === 'dispense') {
    topic = MQTT_TOPICS.foodControl;
    message = 'dispense';
  } else {
    throw new Error('Actuador no soportado: ' + actuador);
  }
  
  // Publicar el mensaje
  console.log('Enviando comando: ' + topic + ' - ' + message);
  mqttClient.publish(topic, message, { qos: 1 }, (err) => {
    if (err) {
      console.error('❌ Error al enviar comando ' + actuador + '/' + accion + ':', err);
      throw err;
    } else {
      console.log('✅ Comando enviado: ' + topic + ' - ' + message);
    }
  });
  
  return true;
};

// Obtener el estado actual del terrario
const getTerrarioStatus = () => {
  return {
    ...currentTerrarioState,
    connected: connectionStatus
  };
};

// Verificar la conexión MQTT
const isConnected = () => {
  return connectionStatus;
};

module.exports = {
  initMqttService,
  controlActuator,
  getTerrarioStatus,
  isConnected
};