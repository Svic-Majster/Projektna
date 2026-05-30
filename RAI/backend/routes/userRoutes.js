const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Profil uporabnika
router.get('/profile/:id', userController.getProfile);

// Lestvica uporabnikov
router.get('/skupina/:skupinaId/leaderboard', userController.getGroupLeaderboard);

// posodobitev
router.put('/profile/:id', userController.updateProfile);

// zapusti group
router.delete('/skupina/:skupinaId/zapusti', userController.leaveGroup);

// pridruzi se skupini
router.post('/skupina/pridruzi-se', userController.joinGroup);

router.post('/skupina/ustvari', userController.createGroup);

module.exports = router;