const mqtt = require('mqtt');
const { handleWorkoutTopic } = require('./handlers/workoutHandler');

const MQTT_URL = process.env.MQTT_URL || 'mqtt://localhost:1883';
const MQTT_USER = process.env.MQTT_USER;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;

const globalniAktivniTreningi = {};

function startMqttClient(io) {
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
                console.log(`[MQTT LWT] Zaznan nepričakovan izpad naprave za uporabnika #${payload.uporabnik_id}!`);
            }

            await handleWorkoutTopic(topic, payload);

            if (io) {
                const mqttUserId = payload.uporabnik_id || payload.user_id;

                if (mqttUserId) {
                    if (topic.endsWith('start')) {
                        globalniAktivniTreningi[mqttUserId] = true;
                    } else if (topic.endsWith('stop')) {
                        globalniAktivniTreningi[mqttUserId] = false;
                    } else if (topic.endsWith('location')) {
                        globalniAktivniTreningi[mqttUserId] = true;
                    }

                    const skupnoAktivnih = Object.values(globalniAktivniTreningi).filter(v => v === true).length;
                    console.log(`[Socket.io] Oddajam globalno število aktivnih: ${skupnoAktivnih}`);

                    io.emit('global-active-count', { count: skupnoAktivnih });

                    const roomName = `user_${mqttUserId}`;
                    io.to(roomName).emit('mqtt-device-update', {
                        topic: topic,
                        data: payload,
                        timestamp: new Date().toISOString()
                    });
                } else {
                    console.warn(`[Websocket] Sporočilo nima uporabnik_id. Ne bo posredovano.`);
                }
            } else {
                console.error("[Websocket] Objekt 'io' ni na voljo v MQTT odjemalcu!");
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