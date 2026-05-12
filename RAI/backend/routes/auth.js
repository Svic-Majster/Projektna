const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Registracija uporabnika
router.post('/register', authController.register);

// Prijava uporabnika
router.post('/login', authController.login);

module.exports = router;