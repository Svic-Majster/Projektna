export function renderDashboard(stats) {
    const container = document.getElementById('dashboard-content');

    const vrsteHTML = `
    <div class="dashboard-types">
        <div class="dashboard-type-item tek">
    <span class="dashboard-type-value">${stats.treningi_tek}</span>
    <span class="dashboard-type-label">Tek</span>
</div>
<div class="dashboard-type-item kolesarjenje">
    <span class="dashboard-type-value">${stats.treningi_kolesarjenje}</span>
    <span class="dashboard-type-label">Kolesarjenje</span>
</div>
<div class="dashboard-type-item hoja">
    <span class="dashboard-type-value">${stats.treningi_hoja}</span>
    <span class="dashboard-type-label">Hoja</span>
</div>
    </div>
`;

    container.innerHTML = `
        <div class="dashboard-grid">
            <div class="dashboard-card">
                <p class="dashboard-label">Skupno število treningov</p>
                <p class="dashboard-value">${stats.skupaj_treningov}</p>
            </div>
            <div class="dashboard-card">
                <p class="dashboard-label">Skupna kilometrina</p>
                <p class="dashboard-value">${parseFloat(stats.skupaj_km).toFixed(1)} km</p>
            </div>
            <div class="dashboard-card">
                <p class="dashboard-label">Povprečna razdalja</p>
                <p class="dashboard-value">${parseFloat(stats.povprecna_razdalja).toFixed(1)} km</p>
            </div>
            <div class="dashboard-card">
                <p class="dashboard-label">Skupen XP</p>
                <p class="dashboard-value">${stats.skupaj_xp} XP</p>
            </div>
            <div class="dashboard-card">
                <p class="dashboard-label">Povprečen XP</p>
                <p class="dashboard-value">${parseFloat(stats.povprecen_xp).toFixed(0)} XP</p>
            </div>
            <div class="dashboard-card">
                <p class="dashboard-label">Povprečno trajanje treninga</p>
                <p class="dashboard-value">${parseFloat(stats.povprecna_dolzina_min).toFixed(0)} min</p>
            </div>
        </div>

        <div class="dashboard-section">
            <h4>Treningi po vrsti</h4>
            ${vrsteHTML}
        </div>
    `;
}