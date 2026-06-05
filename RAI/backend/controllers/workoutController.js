const workoutService = require('../services/workoutService');

exports.startWorkout = async (req, res) => {
    try {
        const workout = await workoutService.startWorkout(req.body);

        res.status(201).json({
            message: 'Trening začet',
            workout,
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            error: err.message || 'Napaka na strežniku',
        });
    }
};

exports.stopWorkout = async (req, res) => {
    try {
        const workout = await workoutService.stopWorkout(req.body);

        res.json({
            message: 'Trening zaključen',
            workout,
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            error: err.message || 'Napaka na strežniku',
        });
    }
};

exports.getUserWorkouts = async (req, res) => {
    try {
        const { uporabnikId } = req.params;
        const workouts = await workoutService.getUserWorkouts(uporabnikId);
        res.json(workouts);
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            error: err.message || 'Napaka na strežniku',
        });
    }
};

exports.deleteWorkout = async (req, res) => {
    try {
        const { id } = req.params;
        await workoutService.deleteWorkout(id);

        res.json({
            success: true,
            message: 'Trening uspešno odstranjen'
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            error: err.message || 'Napaka na strežniku',
        });
    }
};