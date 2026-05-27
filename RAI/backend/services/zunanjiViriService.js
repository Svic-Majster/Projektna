const { exec } = require('child_process');
const path = require('path');
const db = require('../db');

function pokliciScraper() {
    return new Promise((resolve, reject) => {
        const scraperPath = path.join(__dirname, '..', '..', 'scraper', 'scraper.py');
        
        exec(`python "${scraperPath}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Napaka pri izvajanju scraperja: ${error.message}`);
                return reject(error);
            }
            if (stderr) {
                console.warn(`Scraper opozorilo: ${stderr}`);
            }
            console.log(`Scraper zaključen uspešno: ${stdout}`);
            resolve(stdout);
        });
    });
}

async function getZunanjiViri() {
    const result = await db.query(
        `SELECT id, viri_ime, tip_vira, lat, lng, kraj, podatki_json 
         FROM zunanji_viri 
         WHERE lat IS NOT NULL AND lng IS NOT NULL`
    );
    return result.rows;
}

module.exports = {
    pokliciScraper,
    getZunanjiViri
};