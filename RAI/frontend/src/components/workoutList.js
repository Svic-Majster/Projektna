import { formatDate } from './utils.js';

const workoutsList = document.getElementById('workouts-list');
const emptyState = document.getElementById('empty-state');

export function renderWorkouts(items) {
    workoutsList.innerHTML = '';
    emptyState.hidden = items.length !== 0;

    items.forEach((workout) => {
        const article = document.createElement('article');
        const trajanje = formatDuration(workout.zacetek_vadbe, workout.konec_vadbe);
        article.className = 'workout-item';
        article.innerHTML = `
            <h4>${workout.vrsta_workouta || 'trening'}</h4>
            <div class="workout-grid">
                <p><strong>ID:</strong> ${workout.id ?? '—'}</p>
                <p><strong>Točke (XP):</strong> ${workout.skupne_tocke ?? 0}</p>
                <p><strong>Razdalja:</strong> ${workout.razdalja_km ?? 0} km</p>
                <p><strong>Vremenski bonus:</strong> ${workout.vremenski_bonus ?? 1}x</p>
                <p><strong>Začetek:</strong> ${formatDate(workout.zacetek_vadbe)}</p>
                <p><strong>Konec:</strong> ${formatDate(workout.konec_vadbe)}</p>
                <p><strong>Trajanje treninga:</strong> ${trajanje}</p>
            </div>
        `;
        workoutsList.appendChild(article);
    });
}

function formatDuration(startTimeStr, endTimeStr) {
    if (!startTimeStr || !endTimeStr) return 'Trajanje ni znano';

    const diffMs = new Date(endTimeStr) - new Date(startTimeStr);

    if (diffMs <= 0 || isNaN(diffMs)) return '0sec';

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let result = [];
    if (hours > 0) result.push(`${hours}h`);
    if (minutes > 0) result.push(`${minutes}min`);
    if (seconds > 0 || result.length === 0) result.push(`${seconds}sec`);

    return result.join(' ');
}

export function clearWorkouts() {
    workoutsList.innerHTML = '';
}