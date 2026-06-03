const db = require('../db');

async function startWorkout({ uporabnik_id, vrsta_workouta }) {
    if (!uporabnik_id || !vrsta_workouta) {
        const error = new Error('Manjkata uporabnik_id ali vrsta_workouta');
        error.statusCode = 400;
        throw error;
    }

    const result = await db.query(
        `INSERT INTO treningi (uporabnik_id, vrsta_workouta, zacetek_vadbe, status_treninga)
        VALUES ($1, $2, NOW() AT TIME ZONE 'Europe/Ljubljana', 'v_teku')
        RETURNING *`,
        [uporabnik_id, vrsta_workouta]
    );

    return result.rows[0];
}

/*
XP SISTEM:

Pravila točkovanja:
1 min = 10xp
Tek = 10 XP / 100m (100 na km) (faktor 10)
Hoja =  6 XP / 100m (60 na km) (faktor 6)
Kolesarjenje = 3 XP / 100m (30 na km) (faktor 3)

ENACBA:
xp = ((trajanje_sekunde/60) * 10) + ((razdalja_km * 10) * Faktor)
zaokrozeno na celo st
*/

async function stopWorkout({ trening_id, razdalja_km }) {
    if (!trening_id) {
        const error = new Error('Manjka trening_id');
        error.statusCode = 400;
        throw error;
    }

    const treningInfo = await db.query(
        `SELECT zacetek_vadbe, vrsta_workouta, uporabnik_id FROM treningi WHERE id = $1`,
        [trening_id]
    );

    if (treningInfo.rows.length === 0) {
        const error = new Error('Trening ne obstaja');
        error.statusCode = 404;
        throw error;
    }

    const { zacetek_vadbe, vrsta_workouta, uporabnik_id } = treningInfo.rows[0];
    
    const zacetek = new Date(zacetek_vadbe);
    const zdaj = new Date();
    const trajanjeSekunde = Math.max(0, Math.floor((zdaj.getTime() - zacetek.getTime()) / 1000));
    const trajanjeMinute = trajanjeSekunde / 60;

    let faktorNa100m = 3;
    if (vrsta_workouta === 'tek') faktorNa100m = 10;
    if (vrsta_workouta === 'hoja') faktorNa100m = 6;

    const xpZaCas = trajanjeMinute * 10;
    const stokratMetriEnote = (razdalja_km || 0) * 10;
    const xpZaRazdaljo = stokratMetriEnote * faktorNa100m;
    
    let osnovniXp = xpZaCas + xpZaRazdaljo;

    let jeEkstremnoVreme = false;
    let multiplier = 1.0;

    try {
        // zadna kordinata za trening
        const zadnjaLokacija = await db.query(
            `SELECT latitude, longitude FROM lokacije_treninga 
             WHERE trening_id = $1 
             ORDER BY id DESC LIMIT 1`,
            [trening_id]
        );

        if (zadnjaLokacija.rows.length > 0) {
            const { latitude, longitude } = zadnjaLokacija.rows[0];

            const najblizjeVreme = await db.query(
                `SELECT ekstremno_vreme, 
                    SQRT(
                        POWER((lat - $1) * 111.1, 2) + 
                        POWER((lng - $2) * 111.1 * COS(RADIANS($1)), 2)
                    ) AS razdalja_do_postaje_km
                 FROM zunanji_viri
                 ORDER BY razdalja_do_postaje_km ASC
                 LIMIT 1`,
                [latitude, longitude]
            );

            if (najblizjeVreme.rows.length > 0) {
                const postaja = najblizjeVreme.rows[0];
                console.log(`[GPS] Najbližja postaja je oddaljena: ${postaja.razdalja_do_postaje_km.toFixed(2)} km`);

                if (postaja.razdalja_do_postaje_km <= 10.0 && postaja.ekstremno_vreme === true) {
                    jeEkstremnoVreme = true;
                    multiplier = 1.5;
                    console.log(`[BONUS] Aktiviran 1.5x multiplier! Trening je bil zaključen znotraj 10km radiusa (${postaja.razdalja_do_postaje_km.toFixed(2)} km) od postaje z ekstremnimi razmerami.`);
                } else if (postaja.razdalja_do_postaje_km > 10.0 && postaja.ekstremno_vreme === true) {
                    console.log(`[INFO] Vreme je ekstremno, vendar je postaja preveč oddaljena (${postaja.razdalja_do_postaje_km.toFixed(2)} km). Bonus ni aktiviran.`);
                }
            }
        }
    } catch (vremeErr) {
        console.error('[XP BONUS ERROR] Napaka pri računanju razdalje do postaje:', vremeErr.message);
    }

    const pridobljeniXp = Math.round(osnovniXp * multiplier);

    console.log(`[XP IZRAČUN] Čas: ${trajanjeMinute.toFixed(1)} min, Razdalja: ${razdalja_km} km. Multiplier: ${multiplier}x. Skupaj: ${pridobljeniXp} XP`);

const result = await db.query(
        `UPDATE treningi
        SET konec_vadbe = NOW() AT TIME ZONE 'Europe/Ljubljana', 
            status_treninga = 'zakljuceno',
            razdalja_km = $2,
            skupne_tocke = $3,
            vremenski_bonus = $4  -- <-- Tukaj mora priti čist true/false
        WHERE id = $1
        RETURNING *`,
        [
            trening_id, 
            razdalja_km || 0, 
            pridobljeniXp, 
            jeEkstremnoVreme ? true : false
        ]
    );

    await db.query(
        `UPDATE uporabniki 
         SET skupni_xp = skupni_xp + $1 
         WHERE id = $2`,
        [pridobljeniXp, uporabnik_id]
    );

    return {
        ...result.rows[0],
        izracunani_xp: pridobljeniXp
    };
}

async function getUserWorkouts(uporabnikId) {
    if (!uporabnikId) {
        const error = new Error('Manjka uporabnikId');
        error.statusCode = 400;
        throw error;
    }

    const result = await db.query(
        `SELECT
        id,
        uporabnik_id,
        vrsta_workouta,
        status_treninga,
        skupne_tocke,
        razdalja_km,
        vremenski_bonus,
        zacetek_vadbe,
        konec_vadbe
        FROM treningi
        WHERE uporabnik_id = $1
        ORDER BY zacetek_vadbe DESC`,
        [uporabnikId]
    );

    return result.rows;
}

module.exports = {
    startWorkout,
    stopWorkout,
    getUserWorkouts,
};