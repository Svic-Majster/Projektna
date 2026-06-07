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

            if (topic === 'app/workouts/stop' && payload.status === 'izpad_povezave') {
                console.log(`[MQTT LWT] Zaznan nepričakovan izpad naprave za uporabnika #${payload.uporabnik_id}! Sprožam Last Will.`);
            }

            await handleWorkoutTopic(topic, payload);

            try {
                const { io } = require('../index'); 
                
                if (io) {
                    const mqttUserId = payload.uporabnik_id || payload.user_id;

                    if (mqttUserId) {
                        const roomName = `user_${mqttUserId}`;
                        console.log(`[Websocket] Pošiljam topik ${topic} v sobo: ${roomName}`);
                        
                        io.to(roomName).emit('mqtt-device-update', {
                            topic: topic,
                            data: payload,
                            timestamp: new Date().toISOString()
                        });
                    } else {
                        console.warn(`[Webosocket] Sporočilo na ${topic} nima uporabnik_id. Ne bo posredovano.`);
                    }
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