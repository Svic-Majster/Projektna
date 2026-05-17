const express = require('express');
const router = express.Router();
const externalController = require('../controllers/externalController');

router.post('/data', externalController.saveExternalData);

module.exports = router;