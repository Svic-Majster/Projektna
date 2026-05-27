import { formatDate } from './utils.js';

const workoutsList = document.getElementById('workouts-list');
const emptyState = document.getElementById('empty-state');

export function renderWorkouts(items) {
    workoutsList.innerHTML = '';
    emptyState.hidden = items.length !== 0;

    items.forEach((workout) => {
        const article = document.createElement('article');
        article.className = 'workout-item';
        article.innerHTML = `
            <h4>${workout.vrsta_workouta || 'trening'}</h4>
            <div class="workout-grid">
                <p><strong>ID:</strong> ${workout.id ?? '—'}</p>
                <p><strong>Točke:</strong> ${workout.skupne_tocke ?? 0}</p>
                <p><strong>Razdalja:</strong> ${workout.razdalja_km ?? 0} km</p>
                <p><strong>Vremenski bonus:</strong> ${workout.vremenski_bonus ?? 1}</p>
                <p><strong>Prometni bonus:</strong> ${workout.prometni_bonus ?? 1}</p>
                <p><strong>Začetek:</strong> ${formatDate(workout.zacetek_vadbe)}</p>
                <p><strong>Konec:</strong> ${formatDate(workout.konec_vadbe)}</p>
            </div>
        `;
        workoutsList.appendChild(article);
    });
}

export function clearWorkouts() {
    workoutsList.innerHTML = '';
}