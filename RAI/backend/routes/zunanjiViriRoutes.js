const express = require('express');
const router = express.Router();
const zunanjiViriService = require('../services/zunanjiViriService');

router.get('/', async (req, res) => {
    try {
        console.log('Zagon scraperja pred nalaganjem zemljevida...');
        
        // scraper posodobi tabelo
        try {
            await zunanjiViriService.pokliciScraper();
        } catch (scraperErr) {
            // ce ne gren da stare podatke
            console.error('Scraper se ni uspešno izvedel, berem obstoječe podatke.');
        }
        
        const lokacije = await zunanjiViriService.getZunanjiViri();
        
        res.json(lokacije);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Napaka na strežniku pri obdelavi lokacij' });
    }
});

module.exports = router;