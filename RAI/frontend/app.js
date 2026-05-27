const API_BASE = 'http://localhost:3000/api';

const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const authError = document.getElementById('auth-error');
const workoutError = document.getElementById('workout-error');
const loading = document.getElementById('loading');
const emptyState = document.getElementById('empty-state');
const workoutsList = document.getElementById('workouts-list');
const userName = document.getElementById('user-name');
const userMeta = document.getElementById('user-meta');
const logoutBtn = document.getElementById('logout-btn');
const refreshBtn = document.getElementById('refresh-btn');

let currentUser = null;

async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
                                 ...options,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || 'Prišlo je do napake.');
    }

    return data;
}

async function login(identifier, geslo) {
    const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, geslo }),
    });

    return data.user;
}

async function getUserWorkouts(userId) {
    return apiRequest(`/workouts/user/${userId}`);
}

function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('sl-SI');
}

function renderUser(user) {
    userName.textContent = `${user.ime} ${user.priimek}`;
    userMeta.textContent = `${user.username} · ${user.email} · XP: ${user.skupni_xp ?? 0} · Nivo: ${user.trenutni_nivo ?? 1}`;
}

function renderWorkouts(items) {
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

async function loadWorkouts() {
    if (!currentUser) return;

    workoutError.hidden = true;
    loading.hidden = false;

    try {
        const workouts = await getUserWorkouts(currentUser.id);
        renderWorkouts(workouts);
    } catch (error) {
        workoutsList.innerHTML = '';
        emptyState.hidden = true;
        workoutError.textContent = error.message;
        workoutError.hidden = false;
    } finally {
        loading.hidden = true;
    }
}

function showDashboard(user) {
    currentUser = user;
    renderUser(user);
    authView.hidden = true;
    dashboardView.hidden = false;
    loadWorkouts();
}

function logout() {
    currentUser = null;
    loginForm.reset();
    workoutsList.innerHTML = '';
    authError.hidden = true;
    workoutError.hidden = true;
    dashboardView.hidden = true;
    authView.hidden = false;
}

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    authError.hidden = true;

    const formData = new FormData(loginForm);
    const identifier = formData.get('identifier');
    const geslo = formData.get('geslo');

    try {
        const user = await login(identifier, geslo);
        showDashboard(user);
    } catch (error) {
        authError.textContent = error.message;
        authError.hidden = false;
    }
});

logoutBtn.addEventListener('click', logout);
refreshBtn.addEventListener('click', loadWorkouts);
