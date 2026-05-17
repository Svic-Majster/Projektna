const db = require('../db');

async function startWorkout({ uporabnik_id, vrsta_workouta }) {
    if (!uporabnik_id || !vrsta_workouta) {
        const error = new Error('Manjkata uporabnik_id ali vrsta_workouta');
        error.statusCode = 400;
        throw error;
    }

    const result = await db.query(
        `INSERT INTO treningi (uporabnik_id, vrsta_workouta, zacetek_vadbe)
        VALUES ($1, $2, NOW())
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
        SET konec_vadbe = NOW()
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

module.exports = {
    startWorkout,
    stopWorkout,
};
