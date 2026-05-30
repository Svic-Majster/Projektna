const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Profil uporabnika
router.get('/profile/:id', userController.getProfile);

// Lestvica uporabnikov
router.get('/leaderboard', userController.getLeaderboard);

// posodobitev
router.put('/profile/:id', userController.updateProfile);

// zapusti group
router.delete('/skupina/:skupinaId/zapusti', userController.leaveGroup);

module.exports = router;