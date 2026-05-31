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

export async function updateUserProfile(userId, data) {
    return apiRequest(`/users/profile/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function leaveGroup(skupinaId, uporabnikId) {
    return apiRequest(`/users/skupina/${skupinaId}/zapusti`, {
        method: 'DELETE',
        body: JSON.stringify({ uporabnikId }),
    });
}

export async function joinGroup(uporabnikId, koda) {
    return apiRequest('/users/skupina/pridruzi-se', {
        method: 'POST',
        body: JSON.stringify({ uporabnikId, koda }),
    });
}

export async function createGroup(uporabnikId, imeSkupine) {
    return apiRequest('/users/skupina/ustvari', {
        method: 'POST',
        body: JSON.stringify({ uporabnikId, imeSkupine }),
    });
}

export async function deleteGroup(skupinaId, uporabnikId) {
    return apiRequest(`/users/skupina/${skupinaId}/izbrisi`, {
        method: 'DELETE',
        body: JSON.stringify({ uporabnikId }),
    });
}

export async function getUserDashboard(userId) {
    return apiRequest(`/users/dashboard/${userId}`);
}