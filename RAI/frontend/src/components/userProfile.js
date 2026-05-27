const userName = document.getElementById('user-name');
const userMeta = document.getElementById('user-meta');

export function renderUser(user) {
    userName.textContent = `${user.ime} ${user.priimek}`;
    userMeta.textContent = `${user.username} · XP: ${user.skupni_xp ?? 0}`;
}