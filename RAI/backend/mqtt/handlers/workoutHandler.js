const workoutService = require('../../services/workoutService');

async function handleWorkoutTopic(topic, payload) {
    switch (topic) {
        case 'app/workouts/start': {
            const workout = await workoutService.startWorkout(payload);
            console.log('MQTT trening začet:', workout.id);
            return;
        }
        case 'app/workouts/stop': {
            const workout = await workoutService.stopWorkout(payload);
            console.log('MQTT trening zaključen:', workout.id);
            return;
        }
        default:
            console.log(`Ni handlerja za topic: ${topic}`);
    }
}

module.exports = {
    handleWorkoutTopic,
};
