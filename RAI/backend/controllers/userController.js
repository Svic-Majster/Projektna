const db = require('../db');

// Profil uporabnika
exports.getProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `SELECT 
                id,
                ime,
                priimek,
                username,
                email,
                skupni_xp,
                datum_registracije
             FROM uporabniki
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Uporabnik ne obstaja' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Napaka na strežniku' });
    }
};

// Lestvica uporabnikov
exports.getLeaderboard = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT
                id,
                username,
                skupni_xp
             FROM uporabniki
             ORDER BY skupni_xp DESC`
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Napaka na strežniku' });
    }
};

// Posodobitev profila
exports.updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { ime, priimek, username } = req.body;

        const result = await db.query(
            `UPDATE uporabniki
             SET ime = $1,
                 priimek = $2,
                 username = $3
             WHERE id = $4
             RETURNING id, ime, priimek, username, email, skupni_xp`,
            [ime, priimek, username, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Uporabnik ne obstaja' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Napaka na strežniku' });
    }
};

// zapustitev skupine
exports.leaveGroup = async (req, res) => {
    try {
        const { skupinaId } = req.params;
        const { uporabnikId } = req.body;

        console.log("Brisanje člana iz skupine:", { skupinaId, uporabnikId });

        if (!uporabnikId) {
            return res.status(400).json({ error: 'Manjka uporabnikId' });
        }

        const result = await db.query(
            'DELETE FROM clani_skupine WHERE skupina_id = $1 AND uporabnik_id = $2',
            [skupinaId, uporabnikId]
        );

        if (result.rowCount > 0) {
            res.json({ message: 'Uspešno ste zapustili skupino' });
        } else {
            res.status(404).json({ error: 'Članstvo ni bilo najdeno' });
        }
    } catch (err) {
        console.error("SQL Napaka pri zapuščanju skupine:", err);
        res.status(500).json({ error: 'Napaka na strežniku: ' + err.message });
    }
};

exports.joinGroup = async (req, res) => {
    try {
        const { uporabnikId, koda } = req.body;

        if (!uporabnikId || !koda) {
            return res.status(400).json({ error: 'Manjka ID uporabnika ali koda skupine.' });
        }

        const groupCheck = await db.query(
            'SELECT * FROM skupine WHERE UPPER(TRIM(koda_za_pridruzitev)) = UPPER(TRIM($1))',
            [koda]
        );

        if (groupCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Skupina s to kodo ne obstaja.' });
        }

        const skupina = groupCheck.rows[0];

        try {
            await db.query(
                'INSERT INTO clani_skupine (skupina_id, uporabnik_id) VALUES ($1, $2)',
                [skupina.id, uporabnikId]
            );
            
            res.json({ 
                message: `Uspešno ste se pridružili skupini ${skupina.ime_skupine}!`, 
                skupinaId: skupina.id 
            });
        } catch (insertErr) {
            if (insertErr.code === '23505') {
                return res.status(400).json({ error: 'V tej skupini ste že pridruženi.' });
            }
            throw insertErr;
        }

    } catch (err) {
        console.error("Napaka pri pridruževanju skupini:", err);
        res.status(500).json({ error: 'Napaka na strežniku.' });
    }
};