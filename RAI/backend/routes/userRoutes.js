const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Profil uporabnika
router.get('/profile/:id', userController.getProfile);

// Lestvica uporabnikov
router.get('/leaderboard', userController.getLeaderboard);

router.put('/profile/:id', userController.updateProfile);

module.exports = router;