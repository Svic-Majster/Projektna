const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Profil uporabnika
router.get('/profile/:id', userController.getProfile);

router.post(
    '/profile/:id/avatar',
    userController.uploadProfilePictureMiddleware.single('profilePicture'),
    userController.uploadProfilePicture
);
// Lestvica uporabnikov
router.get('/skupina/:skupinaId/leaderboard', userController.getGroupLeaderboard);

// posodobitev
router.put('/profile/:id', userController.updateProfile);

// zapusti group
router.delete('/skupina/:skupinaId/zapusti', userController.leaveGroup);

// pridruzi se skupini
router.post('/skupina/pridruzi-se', userController.joinGroup);

router.post('/skupina/ustvari', userController.createGroup);

router.get('/uporabnik/:uporabnikId/skupine', userController.getUserGroups);

router.get('/dashboard/:id', userController.getDashboardStats);

module.exports = router;