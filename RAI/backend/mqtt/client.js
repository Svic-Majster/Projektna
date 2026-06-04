const mqtt = require('mqtt');
const { handleWorkoutTopic } = require('./handlers/workoutHandler');

const MQTT_URL = process.env.MQTT_URL || 'mqtt://localhost:1883';
const MQTT_USER = process.env.MQTT_USER;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;

function startMqttClient() {
    const client = mqtt.connect(MQTT_URL, {
        username: MQTT_USER,
        password: MQTT_PASSWORD,
        reconnectPeriod: 5000,
    });

    client.on('connect', () => {
        console.log('MQTT povezan');

        client.subscribe(['app/workouts/start', 'app/workouts/stop', 'app/workouts/location'], (err) => {
            if (err) {
                console.error('Napaka pri subscribe:', err.message);
            } else {
                console.log('MQTT topici prijavljeni (start, stop, location)');
            }
        });
    });

    client.on('message', async (topic, message) => {
        try {
            const rawString = message.toString();
            let payload;
            try {
                payload = JSON.parse(rawString);
            } catch {
                payload = { sporocilo: rawString };
            }

            await handleWorkoutTopic(topic, payload);

            try {
                const { io } = require('../index'); 
                
                if (io) {
                    console.log(`[Websocket] Pošiljam posodobitev za topik: ${topic}`);
                    
                    io.emit('mqtt-device-update', {
                        topic: topic,
                        data: payload,
                        timestamp: new Date().toISOString()
                    });
                }
            } catch (wsErr) {
                console.error("Napaka pri WS oddajanju znotraj MQTT clienta:", wsErr);
            }

        } catch (err) {
            console.error('MQTT napaka pri obdelavi:', err.message);
        }
    });

    client.on('error', (err) => {
        console.error('MQTT error:', err.message);
    });

    return client;
}

module.exports = {
    startMqttClient,
};