const db = require('../db');

// Začetek treninga
exports.startWorkout = async (req, res) => {
    try {

        const { uporabnik_id, vrsta_workouta } = req.body;

        // Preveri obvezna polja
        if (!uporabnik_id || !vrsta_workouta) {
            return res.status(400).json({
                error: 'Manjkata uporabnik_id ali vrsta_workouta'
            });
        }

        // Ustvari trening
        const result = await db.query(
            `INSERT INTO treningi
            (uporabnik_id, vrsta_workouta, zacetek_vadbe)
            VALUES ($1, $2, NOW())
            RETURNING *`,
            [uporabnik_id, vrsta_workouta]
        );

        res.status(201).json({
            message: 'Trening začet',
            workout: result.rows[0]
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: 'Napaka na strežniku'
        });
    }
};

// Zaključek treninga
exports.stopWorkout = async (req, res) => {
    try {

        const { trening_id } = req.body;

        // Preveri trening
        if (!trening_id) {
            return res.status(400).json({
                error: 'Manjka trening_id'
            });
        }

        // Zaključi trening
        const result = await db.query(
            `UPDATE treningi
             SET konec_vadbe = NOW()
             WHERE id = $1
             RETURNING *`,
            [trening_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Trening ne obstaja'
            });
        }

        res.json({
            message: 'Trening zaključen',
            workout: result.rows[0]
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: 'Napaka na strežniku'
        });
    }
};