const userName = document.getElementById('user-name');
const userMeta = document.getElementById('user-meta');

const profileName = document.getElementById('profile-name');
const profileUsername = document.getElementById('profile-username');
const profileAvatarLetter = document.getElementById('profile-avatar-letter');
const profileInfo = document.getElementById('profile-info');

export function renderUser(user) {
    userName.textContent = `${user.ime} ${user.priimek}`;
    userMeta.textContent = `${user.username} · XP: ${user.skupni_xp ?? 0}`;

    profileName.textContent = `${user.ime} ${user.priimek}`;
    profileUsername.textContent = `@${user.username}`;

    profileAvatarLetter.textContent =
        user.ime?.charAt(0)?.toUpperCase() ?? 'U';

    profileInfo.innerHTML = `
        <p><strong>Ime:</strong> ${user.ime}</p>
        <p><strong>Priimek:</strong> ${user.priimek}</p>
        <p><strong>Uporabniško ime:</strong> ${user.username}</p>
        <p><strong>E-pošta:</strong> ${user.email}</p>
        <p><strong>XP:</strong> ${user.skupni_xp ?? 0}</p>
    `;
}