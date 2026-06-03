const STORAGE_KEY = 'theme';

function preberiTemo() {
    try {
        return localStorage.getItem(STORAGE_KEY) || 'light';
    } catch (e) {
        return 'light';
    }
}

function uporabiTemo(tema) {
    document.documentElement.setAttribute('data-theme', tema);
    try {
        localStorage.setItem(STORAGE_KEY, tema);
    } catch (e) { /* localstorage not available */ }

    // update chart.js text/grid colors to match the theme
    if (typeof Chart !== 'undefined') {
        Chart.defaults.color = tema === 'dark' ? '#cbd5e1' : '#374151';
        Chart.defaults.borderColor = tema === 'dark' ? 'rgba(203, 213, 225, 0.12)' : 'rgba(0, 0, 0, 0.1)';
    }
}

export function initTheme() {
    const trenutna = preberiTemo();
    uporabiTemo(trenutna);

    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
        toggle.checked = trenutna === 'dark';
        toggle.addEventListener('change', () => {
            uporabiTemo(toggle.checked ? 'dark' : 'light');
        });
    }
}
