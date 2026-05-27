const express = require('express');
const router = express.Router();
const zunanjiViriService = require('../services/zunanjiViriService');

router.get('/', async (req, res) => {
    const lokacije = await zunanjiViriService.getZunanjiViri();
    res.json(lokacije);
});

router.post('/bulk', async (req, res) => {
    try {
        await zunanjiViriService.posodobiVseVire(req.body);
        res.status(200).json({ status: 'uspeh' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;