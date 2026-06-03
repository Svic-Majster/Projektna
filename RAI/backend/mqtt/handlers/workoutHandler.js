const workoutService = require('../../services/workoutService');
const db = require('../../db');

async function handleWorkoutTopic(topic, payload) {
    console.log(`[MQTT] Prejeto sporočilo na topiku [${topic}]`);

    switch (topic) {
        case 'app/workouts/start': {
            try {
                const workout = await workoutService.startWorkout(payload);
                console.log(`[MQTT] Trening uspešno začet v bazi. Avtomatski ID: ${workout.id}`);
            } catch (err) {
                console.error('[MQTT] Napaka pri zagonu treninga:', err.message);
            }
            return;
        }

        case 'app/workouts/stop': {
            try {
                const { uporabnik_id, razdalja_km } = payload;

                if (!uporabnik_id) {
                    console.warn('[MQTT] Stop signal nima polja uporabnik_id:', payload);
                    return;
                }

                const aktivniTrening = await db.query(
                    `SELECT id FROM treningi WHERE uporabnik_id = $1 AND status_treninga = 'v_teku' LIMIT 1`,
                    [uporabnik_id]
                );

                if (aktivniTrening.rows.length === 0) {
                    console.warn(`[MQTT] Ni aktivnega treninga (v_teku) za uporabnika #${uporabnik_id}`);
                    return;
                }

                const trening_id = aktivniTrening.rows[0].id;
                
                const workout = await workoutService.stopWorkout({ trening_id, razdalja_km });
                console.log(`[MQTT] Trening uspešno zaključen v bazi. ID: ${workout.id}, Razdalja: ${workout.razdalja_km} km`);
            } catch (err) {
                console.error('[MQTT] Napaka pri zaključevanju treninga:', err.message);
            }
            return;
        }

        case 'app/workouts/location': {
            const { uporabnik_id, latitude, longitude, hitrost } = payload;

            if (!uporabnik_id || !latitude || !longitude) {
                console.warn('[MQTT] Prejeta nepopolna lokacija (manjkajo uporabnik_id, lat ali lng):', payload);
                return;
            }

            try {
                const aktivniTrening = await db.query(
                    `SELECT id FROM treningi WHERE uporabnik_id = $1 AND status_treninga = 'v_teku' LIMIT 1`,
                    [uporabnik_id]
                );

                if (aktivniTrening.rows.length === 0) {
                    console.warn(`[MQTT] Lokacija zavrnjena. Uporabnik #${uporabnik_id} nima aktivnega treninga.`);
                    return;
                }

                const trening_id = aktivniTrening.rows[0].id;

                await db.query(
                    `INSERT INTO lokacije_treninga (trening_id, latitude, longitude, hitrost)
                     VALUES ($1, $2, $3, $4)`,
                    [trening_id, latitude, longitude, hitrost || 0]
                );
                console.log(`[MQTT] Shranjena lokacija za aktiven trening #${trening_id} (Lat: ${latitude}, Lng: ${longitude})`);
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