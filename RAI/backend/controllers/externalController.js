const db = require('../db');

exports.saveExternalData = async (req, res) => {
    try {
        const { viri_ime, tip_vira, podatki_json, lat, lng, kraj } = req.body;

        if (!viri_ime || !tip_vira || !kraj) {
            return res.status(400).json({ error: 'Manjkajo podatki (viri_ime, tip_vira, kraj).' });
        }

        const deleteQuery = `
            DELETE FROM zunanji_viri 
            WHERE viri_ime = $1 AND tip_vira = $2 AND kraj = $3;
        `;
        await db.query(deleteQuery, [viri_ime, tip_vira, kraj]);

        const insertQuery = `
            INSERT INTO zunanji_viri (viri_ime, tip_vira, podatki_json, lat, lng, kraj)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id;
        `;

        const values = [
            viri_ime,
            tip_vira,
            typeof podatki_json === 'object' ? JSON.stringify(podatki_json) : podatki_json,
            lat || null,
            lng || null,
            kraj
        ];

        const result = await db.query(insertQuery, values);

        console.log(`[Vreme] Shranjeno: ${kraj}`);

        return res.status(201).json({
            message: 'Uspešno shranjeno.',
            id: result.rows[0].id
        });

    } catch (err) {
        console.error('Napaka v kontrolerju:', err.message);
        return res.status(500).json({ error: 'Interna napaka na strežniku.', details: err.message });
    }
};