import { login, getUserWorkouts } from './components/api.js';
import { renderUser } from './components/userProfile.js';
import { renderWorkouts, clearWorkouts } from './components/workoutList.js';
import { initNavbar, resetNavbar } from './components/navbar.js';
import { prikaziLeaderboard } from './components/groupLeaderboard.js';

const authView = document.getElementById('auth-view');
const appView = document.getElementById('app-view');
const loginForm = document.getElementById('login-form');
const authError = document.getElementById('auth-error');
const workoutError = document.getElementById('workout-error');
const loading = document.getElementById('loading');
const logoutBtn = document.getElementById('logout-btn');
const refreshBtn = document.getElementById('refresh-btn');

let currentUser = null;

async function loadWorkouts() {
    if (!currentUser) return;

    workoutError.hidden = true;
    loading.hidden = false;

    try {
        const workouts = await getUserWorkouts(currentUser.id);
        renderWorkouts(workouts);
    } catch (error) {
        clearWorkouts();
        document.getElementById('empty-state').hidden = true;
        workoutError.textContent = error.message;
        workoutError.hidden = false;
    } finally {
        loading.hidden = true;
    }
}

function showApplication(user) {
    currentUser = user;
    renderUser(user);
    authView.hidden = true;
    appView.hidden = false;

    initNavbar(async (target) => {
        if (target === 'home-view') {
            loadWorkouts();
        } else if (target === 'group-view') {
            const container = document.getElementById('leaderboard-container');
            
            if (currentUser.skupine_ids && currentUser.skupine_ids.length > 0) {
                const prvaSkupinaId = currentUser.skupine_ids[0];
                await prikaziLeaderboard(prvaSkupinaId, currentUser.id);
            } else if (currentUser.skupina_id) {
                await prikaziLeaderboard(currentUser.skupina_id, currentUser.id);
            } else {
                container.innerHTML = '<p style="padding: 20px;">Niste člani nobene skupine.</p>';
            }
        }
    });

    loadWorkouts();
}

function logout() {
    currentUser = null;
    loginForm.reset();
    clearWorkouts();
    resetNavbar();
    
    authError.hidden = true;
    workoutError.hidden = true;
    appView.hidden = true;
    authView.hidden = false;
}

// Dogodki (Listeners)
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    authError.hidden = true;

    const formData = new FormData(loginForm);
    const identifier = formData.get('identifier');
    const geslo = formData.get('geslo');

    try {
        const user = await login(identifier, geslo);
        showApplication(user);
    } catch (error) {
        authError.textContent = error.message;
        authError.hidden = false;
    }
});

logoutBtn.addEventListener('click', logout);
refreshBtn.addEventListener('click', loadWorkouts);