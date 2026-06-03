// Barve iz teme (style.css)
const BARVE = {
    tek: '#90e39a',           // light-green
    kolesarjenje: '#ddf093',  // lime-cream
    hoja: '#f6d0b1',          // desert-sand
    primary: '#638475',       // deep-teal
};

// Hranimo reference na grafe, da jih lahko uničimo pred ponovnim izrisom
// (sicer Chart.js javi "Canvas is already in use").
let xpChart = null;
let vrsteChart = null;

export function renderDashboard(stats, workouts = []) {
    const container = document.getElementById('dashboard-content');

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
            <h4>Grafi</h4>
            <div class="dashboard-charts">
                <div class="dashboard-card chart-card">
                    <p class="dashboard-label">XP skozi čas</p>
                    <canvas id="chart-xp"></canvas>
                </div>
                <div class="dashboard-card chart-card">
                    <p class="dashboard-label">Treningi po vrsti</p>
                    <canvas id="chart-vrste"></canvas>
                </div>
            </div>
        </div>
    `;

    izrisiXpGraf(workouts);
    izrisiVrsteGraf(stats);
}

// Linijski graf: XP po posameznem treningu skozi čas (od najstarejšega do najnovejšega).
function izrisiXpGraf(workouts) {
    const canvas = document.getElementById('chart-xp');
    if (!canvas || typeof Chart === 'undefined') return;

    if (xpChart) xpChart.destroy();

    // Samo zaključeni treningi, urejeni naraščajoče po datumu začetka.
    const zakljuceni = workouts
        .filter((w) => w.konec_vadbe)
        .sort((a, b) => new Date(a.zacetek_vadbe) - new Date(b.zacetek_vadbe));

    const oznake = zakljuceni.map((w) =>
        new Date(w.zacetek_vadbe).toLocaleDateString('sl-SI', { day: 'numeric', month: 'numeric' })
    );
    const tocke = zakljuceni.map((w) => w.skupne_tocke ?? 0);

    xpChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: oznake,
            datasets: [{
                label: 'XP',
                data: tocke,
                borderColor: BARVE.primary,
                backgroundColor: 'rgba(99, 132, 117, 0.15)',
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: BARVE.primary,
            }],
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } },
        },
    });
}

// Doughnut graf: razmerje treningov po vrsti.
function izrisiVrsteGraf(stats) {
    const canvas = document.getElementById('chart-vrste');
    if (!canvas || typeof Chart === 'undefined') return;

    if (vrsteChart) vrsteChart.destroy();

    vrsteChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['Tek', 'Kolesarjenje', 'Hoja'],
            datasets: [{
                data: [
                    stats.treningi_tek,
                    stats.treningi_kolesarjenje,
                    stats.treningi_hoja,
                ],
                backgroundColor: [BARVE.tek, BARVE.kolesarjenje, BARVE.hoja],
                borderWidth: 2,
                borderColor: '#ffffff',
            }],
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } },
        },
    });
}
