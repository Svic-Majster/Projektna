const db = require('../db');

// Profil uporabnika
exports.getProfile = async (req, res) => {
    try {

        const { id } = req.params;

        // Pridobi uporabnika
        const result = await db.query(
            `SELECT 
                id,
                ime,
                priimek,
                username,
                email,
                skupni_xp,
                trenutni_nivo,
                datum_registracije
             FROM uporabniki
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Uporabnik ne obstaja'
            });
        }

        res.json(result.rows[0]);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: 'Napaka na strežniku'
        });
    }
};

// Lestvica uporabnikov
exports.getLeaderboard = async (req, res) => {
    try {

        // Pridobi lestvico
        const result = await db.query(
            `SELECT
                id,
                username,
                skupni_xp,
                trenutni_nivo
             FROM uporabniki
             ORDER BY skupni_xp DESC`
        );

        res.json(result.rows);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: 'Napaka na strežniku'
        });
    }
};