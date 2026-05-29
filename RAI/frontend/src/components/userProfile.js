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
    <label class="profile-field">
        <span>Ime</span>
        <input id="profile-ime" type="text" value="${user.ime}" />
    </label>

    <label class="profile-field">
        <span>Priimek</span>
        <input id="profile-priimek" type="text" value="${user.priimek}" />
    </label>

    <label class="profile-field">
        <span>Uporabniško ime</span>
        <input id="profile-username-input" type="text" value="${user.username}" />
    </label>

    <label class="profile-field">
    <span>E-pošta</span>
    <input type="text" value="${user.email}" disabled />
</label>

<label class="profile-field">
    <span>XP</span>
    <input type="text" value="${user.skupni_xp ?? 0}" disabled />
</label>

    <div class="profile-actions">
    <button id="save-profile-btn" class="btn btn-primary">
        Shrani spremembe
    </button>
</div>
`;

    const saveButton = document.getElementById('save-profile-btn');

    saveButton?.addEventListener('click', () => {
        alert('Shranjevanje profila bo dodano v naslednji fazi.');
    });
}
