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

        client.subscribe(['app/workouts/start', 'app/workouts/stop'], (err) => {
            if (err) {
                console.error('Napaka pri subscribe:', err.message);
            } else {
                console.log('MQTT topici prijavljeni');
            }
        });
    });

    client.on('message', async (topic, message) => {
        try {
            const payload = JSON.parse(message.toString());
            await handleWorkoutTopic(topic, payload);
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
