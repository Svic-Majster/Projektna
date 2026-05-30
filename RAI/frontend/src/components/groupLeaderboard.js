export async function prikaziLeaderboard(skupinaId, userParam) {
    const container = document.getElementById('leaderboard-container');
    const currentUserId = (userParam && typeof userParam === 'object') ? userParam.id : userParam;
    
    try {
        let leaderboardHtml = '';
        
        // ce je v skupini naredimo html za skupino
        if (skupinaId) {
            const response = await fetch(`/api/skupina/${skupinaId}/leaderboard`);
            const data = await response.json();

            const getMedalClass = (index) => {
                if (index === 0) return 'gold';
                if (index === 1) return 'silver';
                if (index === 2) return 'bronze';
                return '';
            };

            leaderboardHtml = `
                <div class="card leaderboard-card" style="margin-top: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                        <h3 style="margin: 0;">Lestvica: ${data.ime_skupine}</h3>
                        <button id="leave-group-btn" class="btn btn-danger" style="padding: 6px 12px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">
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
        } else {
            leaderboardHtml = `
                <div class="card" style="margin-top: 20px; padding: 20px; text-align: center; color: #666;">
                    Trenutno niste član nobene skupine. Vnesite kodo zgoraj, da se pridružite!
                </div>
            `;
        }

        // Izris vmesnika s pridružitvenim blokom
        container.innerHTML = `
            <div class="card groups-management-card" style="padding: 20px;">
                <h3 style="margin-top: 0; margin-bottom: 12px; color: #333; font-weight: 600;">Pridruži se skupini</h3>
                <div style="display: flex; gap: 10px;">
                    <input type="text" id="group-code-input" placeholder="Vnesi kodo skupine (npr. KODA123)" style="padding: 10px 12px; border: 1px solid #ccc; border-radius: 4px; flex: 1; font-size: 0.95em; text-transform: uppercase;">
                    <button id="join-group-btn" style="padding: 10px 20px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">Pridruži se</button>
                </div>
            </div>

            <div id="dynamic-leaderboard-area">${leaderboardHtml}</div>
        `;

        // Gumb: Pridruži se
        document.getElementById('join-group-btn').addEventListener('click', async () => {
            const kodaInput = document.getElementById('group-code-input');
            const koda = kodaInput.value.trim();

            if (!koda) {
                alert('Prosimo, vnesite kodo skupine.');
                return;
            }

            try {
                const res = await fetch('/api/users/skupina/pridruzi-se', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uporabnikId: currentUserId, koda: koda }) // Uporabi varni ID
                });

                const data = await res.json();

                if (res.ok) {
                    alert(data.message);
                    
                    // Posodobitev stanja v pomnilniku, če je bil poslan celoten objekt
                    if (userParam && typeof userParam === 'object') {
                        userParam.skupina_id = data.skupinaId;
                        userParam.skupine_ids = [data.skupinaId];
                    }
                    
                    prikaziLeaderboard(data.skupinaId, userParam);
                } else {
                    alert('Napaka: ' + data.error);
                }
            } catch (err) {
                console.error(err);
                alert('Napaka pri komunikaciji s strežnikom.');
            }
        });

        // Gumb: Zapusti skupino
        if (skupinaId) {
            document.getElementById('leave-group-btn').addEventListener('click', async () => {
                if (confirm('Ali ste prepričani, da želite zapustiti to skupino?')) {
                    try {
                        const res = await fetch(`/api/users/skupina/${skupinaId}/zapusti`, { 
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ uporabnikId: currentUserId }) // Uporabi varni ID
                        });
                        
                        if (res.ok) {
                            alert('Uspešno ste zapustili skupino.');
                            
                            // Ponastavitev stanja v pomnilniku, če je bil poslan celoten objekt
                            if (userParam && typeof userParam === 'object') {
                                userParam.skupina_id = null;
                                userParam.skupine_ids = [];
                            }
                            
                            prikaziLeaderboard(null, userParam);
                        } else {
                            const errData = await res.json();
                            alert('Napaka: ' + errData.error);
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }
            });
        }

    } catch (err) {
        console.error("Napaka:", err);
        container.innerHTML = '<p style="padding: 20px; color: red;">Napaka pri nalaganju komponente.</p>';
    }
}