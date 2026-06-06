const express = require('express');
const multer = require('multer');
const router = express.Router();
const authController = require('../controllers/authController');

// slika ostane v pomnilniku, da jo posredujemo naprej face servisu
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 mb
});

// Registracija uporabnika
router.post('/register', authController.register);

// Prijava uporabnika
router.post('/login', authController.login);

// Prijava z obrazom
router.post('/face-login', upload.single('image'), authController.faceLogin);

// Registracija obraza (več slik iste osebe)
router.post('/face-enroll', upload.array('images', 20), authController.faceEnroll);

module.exports = router;