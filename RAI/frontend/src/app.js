import { login, register, getUserWorkouts, getUserDashboard } from './components/api.js';
import { renderUser } from './components/userProfile.js';
import { renderWorkouts, clearWorkouts } from './components/workoutList.js';
import { initNavbar, resetNavbar } from './components/navbar.js';
import { prikaziLeaderboard } from './components/groupLeaderboard.js';
import { renderDashboard } from './components/dashboard.js';

const authView = document.getElementById('auth-view');
const appView = document.getElementById('app-view');
const loginForm = document.getElementById('login-form');
const authError = document.getElementById('auth-error');
const workoutError = document.getElementById('workout-error');
const loading = document.getElementById('loading');
const logoutBtn = document.getElementById('logout-btn');
const refreshBtn = document.getElementById('refresh-btn');
const registerForm    = document.getElementById('register-form');
const registerError   = document.getElementById('register-error');
const registerSuccess = document.getElementById('register-success');
const tabLogin        = document.getElementById('tab-login');
const tabRegister     = document.getElementById('tab-register');
const loginPanel      = document.getElementById('login-panel');
const registerPanel   = document.getElementById('register-panel');

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

async function loadDashboard() {
    if (!currentUser) return;
    console.log('loadDashboard called, user:', currentUser.id);
    const loading = document.getElementById('dashboard-loading');
    const error = document.getElementById('dashboard-error');
    loading.hidden = false;
    error.hidden = true;
    try {
        const stats = await getUserDashboard(currentUser.id);
        console.log('stats:', stats);
        renderDashboard(stats);
    } catch (err) {
        console.error('dashboard error:', err);
        error.textContent = err.message;
        error.hidden = false;
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
            const aktivnaSkupinaId = (currentUser.skupine_ids && currentUser.skupine_ids.length > 0)
                ? currentUser.skupine_ids[0]
                : (currentUser.skupina_id || null);

            await prikaziLeaderboard(aktivnaSkupinaId, currentUser.id);
        } else if (target === 'dashboard-stats-view') {
            loadDashboard();
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

tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginPanel.hidden = false;
    registerPanel.hidden = true;
});

tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerPanel.hidden = false;
    loginPanel.hidden = true;
    authError.hidden = true;
});

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    registerError.hidden = true;
    registerSuccess.hidden = true;

    const d = new FormData(registerForm);
    if (d.get('geslo') !== d.get('geslo2')) {
        registerError.textContent = 'Gesli se ne ujemata.';
        registerError.hidden = false;
        return;
    }

    try {
        await register({
            ime: d.get('ime'), priimek: d.get('priimek'),
                       username: d.get('username'), email: d.get('email'),
                       geslo: d.get('geslo'),
        });
        registerSuccess.textContent = 'Registracija uspešna! Zdaj se lahko prijaviš.';
        registerSuccess.hidden = false;
        registerForm.reset();
        setTimeout(() => tabLogin.click(), 1800); // auto-switch to login
    } catch (error) {
        registerError.textContent = error.message;
        registerError.hidden = false;
    }
});

logoutBtn.addEventListener('click', logout);
refreshBtn.addEventListener('click', loadWorkouts);
