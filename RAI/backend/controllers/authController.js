const bcrypt = require('bcrypt');
const db = require('../db');

// Registracija uporabnika
exports.register = async (req, res) => {
    try {
        const { ime, priimek, username, email, geslo } = req.body;

        // Preveri obvezna polja
        if (!ime || !priimek || !username || !email || !geslo) {
            return res.status(400).json({
                error: 'Manjkajo podatki'
            });
        }

        // Hash gesla
        const hashedPassword = await bcrypt.hash(geslo, 10);

        // Shrani uporabnika
        const result = await db.query(
            `INSERT INTO uporabniki 
            (ime, priimek, username, email, geslo)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, ime, priimek, username, email, skupni_xp, trenutni_nivo, datum_registracije`,
            [ime, priimek, username, email, hashedPassword]
        );

        res.status(201).json({
            message: 'Uporabnik ustvarjen',
            user: result.rows[0]
        });

    } catch (err) {

        // Username ali email že obstaja
        if (err.code === '23505') {
            return res.status(409).json({
                error: 'Username ali email že obstaja'
            });
        }

        console.error(err);

        res.status(500).json({
            error: 'Napaka na strežniku'
        });
    }
};