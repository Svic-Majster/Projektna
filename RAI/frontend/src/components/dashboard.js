// theme colors
const BARVE = {
    tek: '#90e39a',           // light-green
    kolesarjenje: '#ddf093',  // lime-cream
    hoja: '#f6d0b1',          // desert-sand
    primary: '#638475',       // deep-teal
};

// time filters for xp chart, value = days back (null = all time)
const FILTRI = [
    { kljuc: 'vse', oznaka: 'Ves čas', dni: null },
    { kljuc: 'mesec', oznaka: 'Zadnji mesec', dni: 30 },
    { kljuc: 'teden', oznaka: 'Zadnji teden', dni: 7 },
];

// keep chart refs so we can destroy them before redrawing
let xpChart = null;
let vrsteChart = null;
let razdaljaChart = null;

// current workouts and selected filter
let vsiTreningi = [];
let aktivenFilter = 'vse';

export function renderDashboard(stats, workouts = []) {
    const container = document.getElementById('dashboard-content');
    vsiTreningi = workouts;

    const filterGumbiHTML = FILTRI.map((f) =>
        `<button type="button" class="chart-filter-btn ${f.kljuc === aktivenFilter ? 'active' : ''}" data-filter="${f.kljuc}">${f.oznaka}</button>`
    ).join('');

    container.innerHTML = `
        <div class="dashboard-grid">
            <!-- top row: total stats (colored) -->
            <div class="dashboard-card stat-total c1">
                <p class="dashboard-label">Skupno število treningov</p>
                <p class="dashboard-value">${stats.skupaj_treningov}</p>
            </div>
            <div class="dashboard-card stat-total c2">
                <p class="dashboard-label">Skupna kilometrina</p>
                <p class="dashboard-value">${parseFloat(stats.skupaj_km).toFixed(1)} km</p>
            </div>
            <div class="dashboard-card stat-total c3">
                <p class="dashboard-label">Skupen XP</p>
                <p class="dashboard-value">${stats.skupaj_xp} XP</p>
            </div>

            <!-- bottom row: average stats (plain) -->
            <div class="dashboard-card">
                <p class="dashboard-label">Povprečna razdalja</p>
                <p class="dashboard-value">${parseFloat(stats.povprecna_razdalja).toFixed(1)} km</p>
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
                    <div class="chart-head">
                        <p class="dashboard-label">XP skozi čas</p>
                        <div class="chart-filters">${filterGumbiHTML}</div>
                    </div>
                    <canvas id="chart-xp"></canvas>
                </div>
                <div class="chart-row">
                    <div class="dashboard-card chart-card">
                        <p class="dashboard-label">Treningi po vrsti</p>
                        <canvas id="chart-vrste"></canvas>
                    </div>
                    <div class="dashboard-card chart-card">
                        <p class="dashboard-label">Razdalja po vrsti (km)</p>
                        <canvas id="chart-razdalja"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;

    // clicking a filter refreshes all charts and the button state
    container.querySelectorAll('.chart-filter-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            aktivenFilter = btn.dataset.filter;
            container.querySelectorAll('.chart-filter-btn').forEach((b) =>
                b.classList.toggle('active', b.dataset.filter === aktivenFilter)
            );
            osveziGrafe();
        });
    });

    osveziGrafe();
}

// redraw all charts for the selected time filter
function osveziGrafe() {
    const treningi = filtriraniTreningi();
    izrisiXpGraf(treningi);
    izrisiVrsteGraf(treningi);
    izrisiRazdaljaGraf(treningi);
}

// return finished workouts within the selected range, oldest first
function filtriraniTreningi() {
    const filter = FILTRI.find((f) => f.kljuc === aktivenFilter) || FILTRI[0];
    let meja = null;
    if (filter.dni !== null) {
        meja = new Date();
        meja.setDate(meja.getDate() - filter.dni);
    }

    return vsiTreningi
        .filter((w) => w.konec_vadbe)
        .filter((w) => meja === null || new Date(w.zacetek_vadbe) >= meja)
        .sort((a, b) => new Date(a.zacetek_vadbe) - new Date(b.zacetek_vadbe));
}

// line chart: xp per workout over time
function izrisiXpGraf(treningi) {
    const canvas = document.getElementById('chart-xp');
    if (!canvas || typeof Chart === 'undefined') return;

    if (xpChart) xpChart.destroy();

    const oznake = treningi.map((w) =>
        new Date(w.zacetek_vadbe).toLocaleDateString('sl-SI', { day: 'numeric', month: 'numeric' })
    );
    const tocke = treningi.map((w) => w.skupne_tocke ?? 0);

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

// doughnut chart: workout count by type
function izrisiVrsteGraf(workouts) {
    const canvas = document.getElementById('chart-vrste');
    if (!canvas || typeof Chart === 'undefined') return;

    if (vrsteChart) vrsteChart.destroy();

    const stevila = { tek: 0, kolesarjenje: 0, hoja: 0 };
    workouts.forEach((w) => {
        if (w.vrsta_workouta in stevila) stevila[w.vrsta_workouta] += 1;
    });

    vrsteChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['Tek', 'Kolesarjenje', 'Hoja'],
            datasets: [{
                data: [stevila.tek, stevila.kolesarjenje, stevila.hoja],
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

// bar chart: total distance (km) by workout type
function izrisiRazdaljaGraf(workouts) {
    const canvas = document.getElementById('chart-razdalja');
    if (!canvas || typeof Chart === 'undefined') return;

    if (razdaljaChart) razdaljaChart.destroy();

    const vsote = { tek: 0, kolesarjenje: 0, hoja: 0 };
    workouts.forEach((w) => {
        if (w.vrsta_workouta in vsote) {
            vsote[w.vrsta_workouta] += w.razdalja_km ?? 0;
        }
    });

    razdaljaChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['Tek', 'Kolesarjenje', 'Hoja'],
            datasets: [{
                label: 'km',
                data: [
                    +vsote.tek.toFixed(1),
                    +vsote.kolesarjenje.toFixed(1),
                    +vsote.hoja.toFixed(1),
                ],
                backgroundColor: [BARVE.tek, BARVE.kolesarjenje, BARVE.hoja],
                borderRadius: 6,
            }],
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } },
        },
    });
}
