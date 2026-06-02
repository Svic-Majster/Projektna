const workoutService = require('../../services/workoutService');
const db = require('../../db');

async function handleWorkoutTopic(topic, payload) {
    console.log(`[MQTT] Prejeto sporočilo na topiku [${topic}]`);

    switch (topic) {
        case 'app/workouts/start': {
            try {
                const workout = await workoutService.startWorkout(payload);
                console.log(`[MQTT] Trening uspešno začet v bazi. ID: ${workout.id}`);
            } catch (err) {
                console.error('[MQTT] Napaka pri zagonu treninga:', err.message);
            }
            return;
        }

        case 'app/workouts/stop': {
            try {
                const workout = await workoutService.stopWorkout(payload);
                console.log(`[MQTT] Trening uspešno zaključen v bazi. ID: ${workout.id}`);
            } catch (err) {
                console.error('[MQTT] Napaka pri zaključevanju treninga:', err.message);
            }
            return;
        }

        case 'app/workouts/location': {
            const { trening_id, latitude, longitude, hitrost } = payload;

            if (!trening_id || !latitude || !longitude) {
                console.warn('[MQTT] Prejeta nepopolna lokacija (manjkajo id, lat ali lng):', payload);
                return;
            }

            try {
                await db.query(
                    `INSERT INTO lokacije_treninga (trening_id, latitude, longitude, hitrost)
                     VALUES ($1, $2, $3, $4)`,
                    [trening_id, latitude, longitude, hitrost || 0]
                );
                console.log(`[MQTT] Shranjena lokacija za #${trening_id} (Lat: ${latitude}, Lng: ${longitude})`);
            } catch (err) {
                console.error('[MQTT] Napaka pri zapisu GPS lokacije v bazo:', err.message);
            }
            return;
        }

        default:
            console.log(`[MQTT] Prejet neznan topik: ${topic}`);
    }
}

module.exports = {
    handleWorkoutTopic,
};