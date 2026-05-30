export async function prikaziLeaderboard(izbranaSkupinaId, userParam) {
    const container = document.getElementById('leaderboard-container');
    
    let currentUserId = null;
    if (userParam) {
        currentUserId = (typeof userParam === 'object') ? Number(userParam.id || userParam.uporabnik_id) : Number(userParam);
    }
    
    try {
        const skupineResponse = await fetch(`/api/users/uporabnik/${currentUserId}/skupine`);
        const uporabnikoveSkupine = skupineResponse.ok ? await skupineResponse.json() : [];

        let aktivnaSkupinaId = izbranaSkupinaId;
        if (!aktivnaSkupinaId && uporabnikoveSkupine.length > 0) {
            aktivnaSkupinaId = uporabnikoveSkupine[0].id;
        }

        let leaderboardHtml = '';
        
        if (aktivnaSkupinaId) {
            const response = await fetch(`/api/skupina/${aktivnaSkupinaId}/leaderboard`);
            const data = await response.json();

            const kodaSkupine = data.koda_za_pridruzitev || 'KODA';
            
            const groupOwnerId = data.owner_id ? Number(data.owner_id) : null;
            const isOwner = groupOwnerId === currentUserId;

            const getMedalClass = (index) => {
                if (index === 0) return 'gold';
                if (index === 1) return 'silver';
                if (index === 2) return 'bronze';
                return '';
            };

            const dropdownOptions = uporabnikoveSkupine.map(s => 
                `<option value="${s.id}" ${Number(s.id) === Number(aktivnaSkupinaId) ? 'selected' : ''}>${s.ime_skupine}</option>`
            ).join('');

            leaderboardHtml = `
                <div class="card leaderboard-card">
                    <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                        <span class="muted" style="font-size: 14px; font-weight: 600;">Izberi skupino:</span>
                        <select id="group-select-dropdown" class="group-selector">
                            ${dropdownOptions}
                        </select>
                    </div>

                    <div class="leaderboard-header-row">
                        <div>
                            <h3 style="margin: 0;">Lestvica: ${data.ime_skupine}</h3>
                            <p class="muted" style="margin: 4px 0 0; font-size: 13px;">
                                Klikni za kopiranje kode: <span class="group-code-badge" id="copy-code-badge" title="Klikni za kopiranje">${kodaSkupine}</span>
                            </p>
                        </div>
                        
                        ${isOwner ? `
                            <button id="delete-group-btn" class="btn-group-action delete">
                                Izbriši skupino
                            </button>
                        ` : `
                            <button id="leave-group-btn" class="btn-group-action leave">
                                Zapusti skupino
                            </button>
                        `}
                    </div>
                    
                    <table class="leaderboard-table">
                        <tbody>
                            ${data.clani.map((user, index) => {
                                const memberId = Number(user.id || user.uporabnik_id || user._id);
                                const memberIsOwner = groupOwnerId !== null && groupOwnerId === memberId;
                                
                                return `
                                    <tr class="${getMedalClass(index)}">
                                        <td class="rank">${index + 1}.</td>
                                        <td>
                                            <div class="user-info">
                                                <div class="full-name">
                                                    ${user.ime && user.priimek ? `${user.ime} ${user.priimek}` : user.username} 
                                                    ${memberIsOwner ? '<span class="owner-tag">Owner</span>' : ''}
                                                </div>
                                                <div class="username">@${user.username}</div>
                                            </div>
                                        </td>
                                        <td class="xp-cell">${user.skupni_xp} XP</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            leaderboardHtml = `
                <div class="card empty" style="text-align: center; border-style: solid; margin-top: 20px;">
                    Trenutno niste član nobene skupine. Pridružite se ali ustvarite novo zgoraj!
                </div>
            `;
        }

        container.innerHTML = `
            <div class="card groups-management-card">
                <div class="groups-nav-tabs">
                    <span id="tab-join-btn" class="groups-tab-btn active">Pridruži se skupini</span>
                    <span id="tab-create-btn" class="groups-tab-btn">Ustvari novo skupino</span>
                </div>

                <div id="section-join-group">
                    <div class="group-action-row">
                        <input type="text" id="group-code-input" placeholder="Vnesi 6-mestno kodo (npr. ABC123)" style="text-transform: uppercase;">
                        <button id="join-group-btn" class="btn-group-action join">Pridruži se</button>
                    </div>
                </div>

                <div id="section-create-group" style="display: none;">
                    <div class="group-action-row">
                        <input type="text" id="group-name-input" placeholder="Vnesi ime nove skupine">
                        <button id="create-group-btn" class="btn-group-action create">Ustvari</button>
                    </div>
                </div>
            </div>

            <div id="dynamic-leaderboard-area">${leaderboardHtml}</div>
        `;

        const groupDropdown = document.getElementById('group-select-dropdown');
        if (groupDropdown) {
            groupDropdown.addEventListener('change', (e) => {
                prikaziLeaderboard(e.target.value, userParam);
            });
        }

        const copyBadge = document.getElementById('copy-code-badge');
        if (copyBadge) {
            copyBadge.addEventListener('click', () => {
                navigator.clipboard.writeText(copyBadge.innerText).then(() => {
                    const originalText = copyBadge.innerText;
                    copyBadge.innerText = 'Kopirano';
                    copyBadge.style.color = '#10b981';
                    setTimeout(() => {
                        copyBadge.innerText = originalText;
                        copyBadge.style.color = '';
                    }, 1300);
                }).catch(err => console.error('Napaka pri kopiranju:', err));
            });
        }

        const tabJoin = document.getElementById('tab-join-btn');
        const tabCreate = document.getElementById('tab-create-btn');
        const secJoin = document.getElementById('section-join-group');
        const secCreate = document.getElementById('section-create-group');

        tabJoin.addEventListener('click', () => {
            tabJoin.classList.add('active');
            tabCreate.classList.remove('active');
            secJoin.style.display = 'block';
            secCreate.style.display = 'none';
        });

        tabCreate.addEventListener('click', () => {
            tabCreate.classList.add('active');
            tabJoin.classList.remove('active');
            secCreate.style.display = 'block';
            secJoin.style.display = 'none';
        });

        document.getElementById('join-group-btn').addEventListener('click', async () => {
            const koda = document.getElementById('group-code-input').value.trim();
            if (!koda) return alert('Prosimo, vnesite kodo skupine.');

            try {
                const res = await fetch('/api/users/skupina/pridruzi-se', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uporabnikId: currentUserId, koda: koda })
                });
                const data = await res.json();

                if (res.ok) {
                    alert(data.message);
                    prikaziLeaderboard(data.skupinaId, userParam);
                } else {
                    alert('Napaka: ' + data.error);
                }
            } catch (err) { console.error(err); }
        });

        document.getElementById('create-group-btn').addEventListener('click', async () => {
            const imeSkupine = document.getElementById('group-name-input').value.trim();
            if (!imeSkupine) return alert('Prosimo, vnesite ime skupine.');

            try {
                const res = await fetch('/api/users/skupina/ustvari', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uporabnikId: currentUserId, imeSkupine: imeSkupine })
                });
                const data = await res.json();

                if (res.ok) {
                    alert(`${data.message}\nKoda skupine je: ${data.koda}`);
                    prikaziLeaderboard(data.skupinaId, userParam);
                } else {
                    alert('Napaka: ' + data.error);
                }
            } catch (err) { console.error(err); }
        });

        if (aktivnaSkupinaId) {
            const deleteBtn = document.getElementById('delete-group-btn');
            const leaveBtn = document.getElementById('leave-group-btn');

            if (deleteBtn) {
                deleteBtn.addEventListener('click', async () => {
                    if (confirm('Ali ste prepričani, da želite popolnoma IZBRISATI to skupino? Vsi člani bodo odstranjeni!')) {
                        try {
                            const res = await fetch(`/api/users/skupina/${aktivnaSkupinaId}/izbrisi`, { 
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ uporabnikId: currentUserId })
                            });
                            
                            if (res.ok) {
                                alert('Skupina je bila uspešno izbrisana.');
                                prikaziLeaderboard(null, userParam);
                            } else {
                                alert('Napaka: ' + (await res.json()).error);
                            }
                        } catch (err) { console.error(err); }
                    }
                });
            }

            if (leaveBtn) {
                leaveBtn.addEventListener('click', async () => {
                    if (confirm('Ali ste prepričani, da želite zapustiti to skupino?')) {
                        try {
                            const res = await fetch(`/api/users/skupina/${aktivnaSkupinaId}/zapusti`, { 
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ uporabnikId: currentUserId })
                            });
                            
                            if (res.ok) {
                                alert('Uspešno ste zapustili skupino.');
                                prikaziLeaderboard(null, userParam);
                            } else {
                                alert('Napaka: ' + (await res.json()).error);
                            }
                        } catch (err) { console.error(err); }
                    }
                });
            }
        }

    } catch (err) {
        console.error("Napaka:", err);
        container.innerHTML = '<p class="error" style="padding: 20px;">Napaka pri nalaganju komponente.</p>';
    }
}