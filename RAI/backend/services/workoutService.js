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
    
    const pridobljeniXp = Math.round(xpZaCas + xpZaRazdaljo);

    console.log(`[XP IZRAČUN] Čas: ${trajanjeMinute.toFixed(1)} min (${Math.round(xpZaCas)} XP), Razdalja: ${razdalja_km} km (${Math.round(xpZaRazdaljo)} XP). Skupaj: ${pridobljeniXp} XP`);

    const result = await db.query(
        `UPDATE treningi
        SET konec_vadbe = NOW() AT TIME ZONE 'Europe/Ljubljana', 
            status_treninga = 'zakljuceno',
            razdalja_km = $2,
            skupne_tocke = $3
        WHERE id = $1
        RETURNING *`,
        [trening_id, razdalja_km || 0, pridobljeniXp]
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