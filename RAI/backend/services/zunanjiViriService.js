const { exec } = require('child_process');
const path = require('path');
const db = require('../db');

function pokliciScraper() {
    return new Promise((resolve, reject) => {
        const scraperPath = path.join(__dirname, '..', '..', 'scraper', 'scraper.py');
        exec(`py "${scraperPath}"`, (error, stdout, stderr) => {
            if (error) return reject(error);
            resolve(stdout);
        });
    });
}

async function getZunanjiViri() {
    const result = await db.query(`SELECT id, viri_ime, tip_vira, lat, lng, kraj, podatki_json FROM zunanji_viri`);
    return result.rows;
}

async function posodobiVseVire(podatki) {
    try {
        await db.query('BEGIN');
        
        await db.query('TRUNCATE TABLE zunanji_viri RESTART IDENTITY');
        
        for (const p of podatki) {
            await db.query(
                'INSERT INTO zunanji_viri (viri_ime, tip_vira, podatki_json, lat, lng, kraj) VALUES ($1, $2, $3, $4, $5, $6)',
                [p.viri_ime, p.tip_vira, JSON.stringify(p.podatki_json), p.lat, p.lng, p.kraj]
            );
        }
        
        await db.query('COMMIT');
        console.log(`Baza posodobljena: vstavljenih ${podatki.length} lokacij.`);
    } catch (e) {
        await db.query('ROLLBACK');
        console.error("Napaka pri vstavljanju v bazo:", e);
        throw e;
    }
}

module.exports = { pokliciScraper, getZunanjiViri, posodobiVseVire };