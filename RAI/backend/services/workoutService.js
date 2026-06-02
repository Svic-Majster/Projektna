const db = require('../db');

async function startWorkout({ uporabnik_id, vrsta_workouta }) {
    if (!uporabnik_id || !vrsta_workouta) {
        const error = new Error('Manjkata uporabnik_id ali vrsta_workouta');
        error.statusCode = 400;
        throw error;
    }

    const result = await db.query(
        `INSERT INTO treningi (uporabnik_id, vrsta_workouta, status_treninga, zacetek_vadbe)
        VALUES ($1, $2, 'v_teku', NOW())
        RETURNING *`,
        [uporabnik_id, vrsta_workouta]
    );

    return result.rows[0];
}

async function stopWorkout({ trening_id }) {
    if (!trening_id) {
        const error = new Error('Manjka trening_id');
        error.statusCode = 400;
        throw error;
    }

    const result = await db.query(
        `UPDATE treningi
        SET konec_vadbe = NOW(), status_treninga = 'zakljuceno'
        WHERE id = $1
        RETURNING *`,
        [trening_id]
    );

    if (result.rows.length === 0) {
        const error = new Error('Trening ne obstaja');
        error.statusCode = 404;
        throw error;
    }

    return result.rows[0];
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