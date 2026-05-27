const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController.js');

// Začetek treninga
router.post('/start', workoutController.startWorkout);

// Zaključek treninga
router.post('/stop', workoutController.stopWorkout);


router.get('/user/:uporabnikId', workoutController.getUserWorkouts);

module.exports = router;
