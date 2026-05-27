const userName = document.getElementById('user-name');
const userMeta = document.getElementById('user-meta');

export function renderUser(user) {
    userName.textContent = `${user.ime} ${user.priimek}`;
    userMeta.textContent = `${user.username} · ${user.email} · XP: ${user.skupni_xp ?? 0} · Nivo: ${user.trenutni_nivo ?? 1}`;
}