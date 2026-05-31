const bcrypt = require('bcrypt');
const db = require('../db');

exports.register = async (req, res) => {
    try {
        const { ime, priimek, username, email, geslo } = req.body;

        if (!ime || !priimek || !username || !email || !geslo) {
            return res.status(400).json({ error: 'Manjkajo podatki' });
        }

        const hashedPassword = await bcrypt.hash(geslo, 10);

        const result = await db.query(
            `INSERT INTO uporabniki (ime, priimek, username, email, geslo)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, ime, priimek, username, email, skupni_xp, datum_registracije`,
            [ime, priimek, username, email, hashedPassword]
        );

        res.status(201).json({
            message: 'Uporabnik ustvarjen',
            user: result.rows[0]
        });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Username ali email že obstaja' });
        }
        console.error(err);
        res.status(500).json({ error: 'Napaka na strežniku' });
    }
};

// Prijava uporabnika
exports.login = async (req, res) => {
    try {
        const { identifier, geslo } = req.body;

        if (!identifier || !geslo) {
            return res.status(400).json({ error: 'Manjkajo podatki' });
        }

        // Popravek: Dodan LEFT JOIN za pridobitev skupina_id
        const result = await db.query(
            `SELECT u.*, cs.skupina_id
             FROM uporabniki u
             LEFT JOIN clani_skupine cs ON u.id = cs.uporabnik_id
             WHERE u.email = $1 OR u.username = $1`,
            [identifier]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Napačni prijavni podatki' });
        }

        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(geslo, user.geslo);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Napačni prijavni podatki' });
        }

        res.json({
            message: 'Prijava uspešna',
            user: {
                id: user.id,
                ime: user.ime,
                priimek: user.priimek,
                username: user.username,
                email: user.email,
                skupni_xp: user.skupni_xp,
                skupina_id: user.skupina_id,
                datum_registracije: user.datum_registracije
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Napaka na strežniku' });
    }
};
