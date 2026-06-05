import { updateUserProfile, uploadProfilePicture } from './api.js';
const userName = document.getElementById('user-name');
const userMeta = document.getElementById('user-meta');

const profileName = document.getElementById('profile-name');
const profileUsername = document.getElementById('profile-username');
const profileAvatarLetter = document.getElementById('profile-avatar-letter');
const profileInfo = document.getElementById('profile-info');


function showToast(message, type = 'success') {
    // odstrani obstoječ toast če obstaja
    document.getElementById('profile-toast')?.remove();

    const toast = document.createElement('div');
    toast.id = 'profile-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        color: white;
        background: ${type === 'success' ? '#2563eb' : type === 'info' ? '#6b7280' : '#dc2626'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.2s ease;
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => { toast.style.opacity = '1'; });

    // avtomatsko izgine po 3 sekundah
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 200);
    }, 3000);
}

function renderProfileAvatar(user) {
    profileAvatarLetter.innerHTML = '';

    if (user.profilna_slika) {
        const img = document.createElement('img');
        img.src = user.profilna_slika;
        img.alt = 'Profilna slika';
        img.className = 'profile-avatar-img';
        profileAvatarLetter.appendChild(img);
    } else {
        profileAvatarLetter.textContent =
            user.ime?.charAt(0)?.toUpperCase() ?? 'U';
    }
}



export function renderUser(user) {
    userName.textContent = `${user.ime} ${user.priimek}`;
    userMeta.textContent = `${user.username} · XP: ${user.skupni_xp ?? 0}`;

    profileName.textContent = `${user.ime} ${user.priimek}`;
    profileUsername.textContent = `@${user.username}`;

    renderProfileAvatar(user);

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
        <span id="save-profile-msg" style="display:none; margin-left:10px;"></span>
    </div>
`;

    const original = {
        ime: user.ime,
        priimek: user.priimek,
        username: user.username
    };
    let isSaving = false;

    profileAvatarLetter.onclick = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = async (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        try {
            const updated = await uploadProfilePicture(user.id, file);

            user.profilna_slika = updated.profilna_slika;

            renderProfileAvatar(user);

            showToast('Profilna slika posodobljena!', 'success');
        } catch (err) {
            showToast(`Napaka: ${err.message}`, 'error');
        }
    };

    fileInput.click();
};

    const saveButton = document.getElementById('save-profile-btn');
    const saveMsg = document.getElementById('save-profile-msg');

    saveButton?.addEventListener('click', async () => {
        if (isSaving) return;  // anti-spam

        const ime = document.getElementById('profile-ime').value.trim();
        const priimek = document.getElementById('profile-priimek').value.trim();
        const username = document.getElementById('profile-username-input').value.trim();

        if (!ime || !priimek || !username) {
            showToast('Vsa polja morajo biti izpolnjena.', 'error');
            return;
        }

        // ni sprememb -> ne pošiljaj
        if (ime === original.ime && priimek === original.priimek && username === original.username) {
            showToast('Ni sprememb za shraniti.', 'info');
            return;
        }

        isSaving = true;
        saveButton.disabled = true;
        saveButton.textContent = 'Shranjujem...';

        try {
            const updated = await updateUserProfile(user.id, { ime, priimek, username });

            user.ime = updated.ime;
            user.priimek = updated.priimek;
            user.username = updated.username;

            // posodobi snapshot
            original.ime = updated.ime;
            original.priimek = updated.priimek;
            original.username = updated.username;

            userName.textContent = `${updated.ime} ${updated.priimek}`;
            userMeta.textContent = `${updated.username} · XP: ${updated.skupni_xp ?? 0}`;
            profileName.textContent = `${updated.ime} ${updated.priimek}`;
            profileUsername.textContent = `@${updated.username}`;
            renderProfileAvatar(user);

            showToast('Profil posodobljen!', 'success');
        } catch (err) {
            showToast(`Napaka: ${err.message}`, 'error');
        } finally {
            isSaving = false;
            saveButton.disabled = false;
            saveButton.textContent = 'Shrani spremembe';
        }
    });
}