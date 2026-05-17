const db = require('../db');

exports.saveExternalData = async (req, res) => {
    try {
        const { viri_ime, tip_vira, podatki_json, lat, lng, kraj } = req.body;

        if (!viri_ime || !tip_vira || !podatki_json) {
            return res.status(400).json({ 
                error: 'Manjkajo obvezni podatki (viri_ime, tip_vira ali podatki_json).' 
            });
        }

        const queryText = `
            INSERT INTO zunanji_viri (viri_ime, tip_vira, podatki_json, lat, lng, kraj)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, datum_zajema;
        `;

        const values = [
            viri_ime, 
            tip_vira, 
            typeof podatki_json === 'object' ? JSON.stringify(podatki_json) : podatki_json, 
            lat || null, 
            lng || null, 
            kraj || null
        ];

        const result = await db.query(queryText, values);

        console.log(`Shranjeno: ${viri_ime} (${tip_vira})`);

        return res.status(201).json({
            message: 'Podatki uspešno shranjeni.',
            inserted_id: result.rows[0].id,
            datum_zajema: result.rows[0].datum_zajema
        });

    } catch (err) {
        console.error('Napaka v externalController:', err.message);
        return res.status(500).json({ error: 'Interna napaka na strežniku.' });
    }
};