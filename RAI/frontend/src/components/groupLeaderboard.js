export async function prikaziLeaderboard(skupinaId) {
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

        container.innerHTML = `
            <div class="card leaderboard-card">
                <h3>Skupina: ${data.ime_skupine}</h3>
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
    } catch (err) {
        console.error(err);
    }
}