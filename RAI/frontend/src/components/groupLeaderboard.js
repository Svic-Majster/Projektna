export async function prikaziLeaderboard(skupinaId, currentUserId) {
    const container = document.getElementById('leaderboard-container');
    
    try {
        const response = await fetch(`/api/skupina/${skupinaId}/leaderboard`);
        const data = await response.json();
        
        // Pomožna funkcija za barvo glede na mesto
        const getMedalClass = (index) => {
            if (index === 0) return 'gold';
            if (index === 1) return 'silver';
            if (index === 2) return 'bronze';
            return '';
        };

        // Izris strukture z gumbom za izstop, ki je poravnan desno od naslova skupine
        container.innerHTML = `
            <div class="card leaderboard-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                    <h3 style="margin: 0;">Skupina: ${data.ime_skupine}</h3>
                    <button id="leave-group-btn" class="btn btn-danger" style="padding: 6px 12px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Zapusti skupino
                    </button>
                </div>
                <table class="leaderboard-table">
                    <tbody>
                        ${data.clani.map((user, index) => `
                            <tr class="${getMedalClass(index)}">
                                <td class="rank">${index + 1}.</td>
                                <td>
                                    <div class="user-info">
                                        <div class="full-name">${user.ime} ${user.priimek}</div>
                                        <div class="username">@${user.username}</div>
                                    </div>
                                </td>
                                <td class="xp-cell">${user.skupni_xp} XP</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        document.getElementById('leave-group-btn').addEventListener('click', async () => {
            if (confirm('Ali ste prepričani, da želite zapustiti to skupino?')) {
                try {
                    const res = await fetch(`/api/users/skupina/${skupinaId}/zapusti`, { 
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ uporabnikId: currentUserId })
                    });
                    
                    if (res.ok) {
                        alert('Uspešno ste zapustili skupino.');
                        location.reload();
                    } else {
                        const errData = await res.json();
                        alert('Napaka pri zapuščanju skupine: ' + errData.error);
                    }
                } catch (err) {
                    console.error("Napaka pri komunikaciji s strežnikom:", err);
                    alert('Prišlo je do napake na omrežju.');
                }
            }
        });

    } catch (err) {
        console.error("Napaka pri pridobivanju leaderboarda:", err);
        container.innerHTML = '<p style="padding: 20px; color: red;">Napaka pri nalaganju lestvice.</p>';
    }
}