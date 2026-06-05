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
    document.getElementById('date-from').addEventListener('input', applyFilters);
    document.getElementById('date-to').addEventListener('input', applyFilters);
    
    const resetBtn = document.getElementById('reset-filters');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.getElementById('filter-type').value = 'all';
            document.getElementById('sort-type').value = 'none';
            document.getElementById('date-from').value = '';
            document.getElementById('date-to').value = '';
            applyFilters();
        });
    }
}

function applyFilters() {
    let filtered = [...window.allWorkouts];
    
    const type = document.getElementById('filter-type').value;
    if (type !== 'all') {
        filtered = filtered.filter(w => w.vrsta_workouta?.toLowerCase() === type);
    }

    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;

    if (dateFrom) {
        const from = new Date(dateFrom);
        filtered = filtered.filter(w => new Date(w.zacetek_vadbe) >= from);
    }
    if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        filtered = filtered.filter(w => new Date(w.zacetek_vadbe) <= to);
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
            <div class="workout-actions" style="display: none; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); text-align: right;">
                <button class="btn btn-danger delete-workout-btn" type="button">Izbriši trening</button>
            </div>
        `;

        article.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-workout-btn')) return;

            document.querySelectorAll('.workout-item.expanded').forEach(openItem => {
                if (openItem !== article) {
                    openItem.classList.remove('expanded');
                    openItem.querySelector('.workout-actions').style.display = 'none';
                }
            });

            const actionsDiv = article.querySelector('.workout-actions');
            article.classList.toggle('expanded');
            actionsDiv.style.display = article.classList.contains('expanded') ? 'block' : 'none';
        });

        const deleteBtn = article.querySelector('.delete-workout-btn');
        deleteBtn.addEventListener('click', async () => {
            if (confirm('Ali res želiš izbrisati ta trening?')) {
                await deleteWorkout(workout.id);
            }
        });

        workoutsList.appendChild(article);
    });

    renderPagination(totalPages);
}

async function deleteWorkout(workoutId) {
    try {
        const response = await fetch(`/api/workouts/${workoutId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error('Napaka pri brisanju treninga.');

        window.allWorkouts = window.allWorkouts.filter(w => w.id !== workoutId);
        const noviTotalPages = Math.ceil(window.allWorkouts.length / itemsPerPage);
        if (currentPage > noviTotalPages && currentPage > 1) {
            currentPage = noviTotalPages;
        }
        renderWorkouts(window.allWorkouts, true);
    } catch (err) {
        const errEl = document.getElementById('workout-error');
        if (errEl) {
            errEl.innerText = err.message;
            errEl.hidden = false;
        }
    }
}

function renderPagination(totalPages) {
    paginationContainer.innerHTML = '';
    if (totalPages <= 1) return;

    const createBtn = (page, text = page, active = false, disabled = false) => {
        const btn = document.createElement('button');
        btn.innerText = text;
        btn.className = active ? 'btn btn-primary' : 'btn btn-secondary';
        btn.disabled = disabled;
        btn.style.margin = '0 3px';
        btn.style.cursor = disabled ? 'default' : 'pointer';
        
        if (!disabled) {
            btn.onclick = () => {
                currentPage = page;
                renderWorkouts(window.allWorkouts, true);
            };
        }
        paginationContainer.appendChild(btn);
    };

    createBtn(currentPage - 1, '« Prejšnja', false, currentPage === 1);

    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 || 
            i === totalPages || 
            (i >= currentPage - 2 && i <= currentPage + 2)
        ) {
            createBtn(i, i, i === currentPage);
        } 
        else if (i === currentPage - 3 || i === currentPage + 3) {
            const span = document.createElement('span');
            span.innerText = '...';
            span.style.margin = '0 5px';
            paginationContainer.appendChild(span);
        }
    }

    createBtn(currentPage + 1, 'Naslednja »', false, currentPage === totalPages);
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