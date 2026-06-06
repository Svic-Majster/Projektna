const bcrypt = require('bcrypt');
const db = require('../db');

const FACE_SERVICE_URL = process.env.FACE_SERVICE_URL || 'http://localhost:8000';

// javni podatki uporabnika (brez gesla)
function javniUporabnik(user) {
    return {
        id: user.id,
        ime: user.ime,
        priimek: user.priimek,
        username: user.username,
        email: user.email,
        skupni_xp: user.skupni_xp,
        skupina_id: user.skupina_id,
        datum_registracije: user.datum_registracije,
        profilna_slika: user.profilna_slika,
    };
}

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
            user: javniUporabnik(user)
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Napaka na strežniku' });
    }
};

// Prijava z obrazom — sliko posredujemo face servisu, ki vrne status ujemanja
exports.faceLogin = async (req, res) => {
    try {
        const { identifier } = req.body;

        if (!identifier) {
            return res.status(400).json({ error: 'Manjka identifier' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'Manjka slika' });
        }

        // poišči uporabnika (enako kot pri navadni prijavi)
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

        // posreduj sliko face servisu
        const form = new FormData();
        form.append('user_id', String(user.id));
        form.append(
            'image',
            new Blob([req.file.buffer], { type: req.file.mimetype }),
            req.file.originalname || 'login.jpg'
        );

        let faceRes;
        let faceData;
        try {
            faceRes = await fetch(`${FACE_SERVICE_URL}/verify`, { method: 'POST', body: form });
            faceData = await faceRes.json();
        } catch (e) {
            console.error('Face servis ni dosegljiv:', e);
            return res.status(503).json({ error: 'Storitev za prepoznavo obraza ni dosegljiva.' });
        }

        if (faceRes.status === 404) {
            return res.status(404).json({ error: 'Uporabnik nima registriranega obraza.' });
        }

        const status = faceData.status;            // uspesno / zavrnjeno_nizek_ujemanje / obraz_ni_zaznan
        const confidence = faceData.confidence ?? null;

        // zabeleži poskus prijave
        await db.query(
            `INSERT INTO obdelani_podatki_ai (uporabnik_id, slika_prijave, status_prijave, ai_confidence)
             VALUES ($1, $2, $3, $4)`,
            [user.id, req.file.originalname || 'face-login', status, confidence]
        ).catch((err) => console.error('Napaka pri beleženju poskusa:', err));

        if (status !== 'uspesno') {
            const sporocilo = status === 'obraz_ni_zaznan'
                ? 'Obraz ni bil zaznan.'
                : 'Obraz se ne ujema.';
            return res.status(401).json({ error: sporocilo, status, confidence });
        }

        res.json({
            message: 'Prijava z obrazom uspešna',
            user: javniUporabnik(user)
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Napaka na strežniku' });
    }
};

// Registracija obraza — slike posredujemo face servisu, ki nauči model uporabnika
exports.faceEnroll = async (req, res) => {
    try {
        const uporabnikId = req.body.uporabnikId;

        if (!uporabnikId) {
            return res.status(400).json({ error: 'Manjka uporabnikId' });
        }
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Manjkajo slike' });
        }

        // preveri, da uporabnik obstaja
        const obstaja = await db.query('SELECT id FROM uporabniki WHERE id = $1', [uporabnikId]);
        if (obstaja.rows.length === 0) {
            return res.status(404).json({ error: 'Uporabnik ne obstaja' });
        }

        // posreduj slike face servisu
        const form = new FormData();
        form.append('user_id', String(uporabnikId));
        for (const file of req.files) {
            form.append(
                'images',
                new Blob([file.buffer], { type: file.mimetype }),
                file.originalname || 'enroll.jpg'
            );
        }

        let faceRes;
        let faceData;
        try {
            faceRes = await fetch(`${FACE_SERVICE_URL}/enroll`, { method: 'POST', body: form });
            faceData = await faceRes.json();
        } catch (e) {
            console.error('Face servis ni dosegljiv:', e);
            return res.status(503).json({ error: 'Storitev za prepoznavo obraza ni dosegljiva.' });
        }

        // 422 = na nobeni sliki ni bilo zaznanega obraza
        if (faceRes.status === 422) {
            return res.status(422).json({ error: 'Na slikah ni bilo zaznanega obraza.' });
        }
        if (!faceRes.ok) {
            return res.status(502).json({ error: 'Napaka pri registraciji obraza.' });
        }

        res.json({
            message: 'Obraz uspešno registriran',
            uporabljenih_slik: faceData.used,
            preskocenih_slik: faceData.skipped
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Napaka na strežniku' });
    }
};
