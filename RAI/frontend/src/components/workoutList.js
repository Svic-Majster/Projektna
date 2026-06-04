import { formatDate } from './utils.js';

const workoutsList = document.getElementById('workouts-list');
const emptyState = document.getElementById('empty-state');
const paginationContainer = document.getElementById('pagination');

export let currentPage = 1;
export function setCurrentPage(page) { currentPage = page; }
const itemsPerPage = 5;

export function initWorkoutFilters() {
    document.getElementById('filter-type').addEventListener('change', applyFilters);
    document.getElementById('sort-type').addEventListener('change', applyFilters);
}

function applyFilters() {
    let filtered = [...window.allWorkouts];
    
    const type = document.getElementById('filter-type').value;
    if (type !== 'all') {
        filtered = filtered.filter(w => w.vrsta_workouta?.toLowerCase() === type);
    }

    const sort = document.getElementById('sort-type').value;
    if (sort !== 'none') {
        filtered.sort((a, b) => {
            if (sort === 'xp-desc') return b.skupne_tocke - a.skupne_tocke;
            if (sort === 'xp-asc') return a.skupne_tocke - b.skupne_tocke;
            if (sort === 'km-desc') return b.razdalja_km - a.razdalja_km;
            if (sort === 'km-asc') return a.razdalja_km - b.razdalja_km;
            if (sort === 'time-desc') return calculateDuration(b) - calculateDuration(a);
            if (sort === 'time-asc') return calculateDuration(a) - calculateDuration(b);
            return 0;
        });
    }

    setCurrentPage(1);
    renderWorkouts(filtered, true);
}

function calculateDuration(w) {
    return new Date(w.konec_vadbe) - new Date(w.zacetek_vadbe);
}

export function renderWorkouts(items, isFiltered = false) {
    if (!isFiltered) window.allWorkouts = items;
    
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage);

    workoutsList.innerHTML = '';
    emptyState.hidden = items.length !== 0;

    paginatedItems.forEach((workout) => {
        const article = document.createElement('article');
        const trajanje = formatDuration(workout.zacetek_vadbe, workout.konec_vadbe);
        article.className = 'workout-item';
        article.innerHTML = `
            <h4>${workout.vrsta_workouta || 'trening'}</h4>
            <div class="workout-grid">
                <p><strong>Točke (XP):</strong> ${workout.skupne_tocke ?? 0}</p>
                <p><strong>Razdalja:</strong> ${workout.razdalja_km ?? 0} km</p>
                <p><strong>Začetek:</strong> ${formatDate(workout.zacetek_vadbe)}</p>
                <p><strong>Trajanje:</strong> ${trajanje}</p>
            </div>
        `;
        workoutsList.appendChild(article);
    });

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    paginationContainer.innerHTML = '';
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = i === currentPage ? 'btn btn-primary' : 'btn btn-secondary';
        btn.style.margin = '0 5px';
        btn.style.cursor = 'pointer';
        btn.onclick = () => {
            currentPage = i;
            renderWorkouts(window.allWorkouts, true);
        };
        paginationContainer.appendChild(btn);
    }
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
    result.push(`${seconds}sec`);
    return result.join(' ');
}

export function clearWorkouts() {
    workoutsList.innerHTML = '';
    paginationContainer.innerHTML = '';
}