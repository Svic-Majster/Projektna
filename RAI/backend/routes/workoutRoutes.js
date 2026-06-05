const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController.js');

// Začetek treninga
router.post('/start', workoutController.startWorkout);

// Zaključek treninga
router.post('/stop', workoutController.stopWorkout);

// Pridobivanje treningov uporabnika
router.get('/user/:uporabnikId', workoutController.getUserWorkouts);

// Izbris treninga preko controllerja
router.delete('/:id', workoutController.deleteWorkout);

module.exports = router;