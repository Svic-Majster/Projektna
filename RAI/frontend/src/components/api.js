const API_BASE = 'http://localhost:3000/api';

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

export async function login(identifier, geslo) {
    const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, geslo }),
    });
    return data.user;
}

export async function getUserWorkouts(userId) {
    return apiRequest(`/workouts/user/${userId}`);
}