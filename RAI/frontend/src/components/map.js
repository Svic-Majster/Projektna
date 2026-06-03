let map = null;
let activeCircles = [];
let allData = [];

export async function pripraviZemljevid() {
    if (!map) {
        map = L.map('map').setView([46.1512, 14.9955], 8);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        const toggleCheckbox = document.getElementById('toggle-active-zones');
        if (toggleCheckbox) {
            toggleCheckbox.addEventListener('change', (e) => {
                izrisiCone(e.target.checked);
            });
        }
    }

    setTimeout(() => { map.invalidateSize(); }, 100);

    try {
        const response = await fetch('/api/zunanji-viri'); 
        allData = await response.json();

        map.eachLayer((layer) => {
            if (layer instanceof L.Marker || layer instanceof L.Circle) {
                map.removeLayer(layer);
            }
        });
        activeCircles = [];

        allData.forEach(lokacija => {
            const lat = parseFloat(lokacija.lat);
            const lng = parseFloat(lokacija.lng);

            if (!isNaN(lat) && !isNaN(lng)) {
                const temp = lokacija.podatki_json?.temperatura ?? null;
                
                const jeEkstremno = lokacija.ekstremno_vreme === true;
                const multiplier = jeEkstremno ? '1.5' : '1.0';
                
                const marker = L.marker([lat, lng]).addTo(map);
                
                marker.bindPopup(`
                    <div style="font-family: sans-serif;">
                        <h4 style="margin: 0 0 5px;">${lokacija.viri_ime}</h4>
                        <p style="margin: 0 0 5px;"><strong>Kraj:</strong> ${lokacija.kraj || 'Neznano'}</p>
                        <p style="margin: 0 0 5px;"><strong>Temp:</strong> ${temp !== null ? temp + '°C' : 'N/A'}</p>
                        <p style="margin: 0; color: ${jeEkstremno ? '#ef4444' : '#2563eb'}; font-weight: bold;">
                            <strong>Vremenski bonus: ${multiplier}x</strong>
                        </p>
                    </div>
                `);
            }
        });

        const toggleCheckbox = document.getElementById('toggle-active-zones');
        if (toggleCheckbox && toggleCheckbox.checked) {
            izrisiCone(true);
        }

    } catch (err) {
        console.error("Napaka pri nalaganju pinov:", err);
    }
}

function izrisiCone(prikazi) {
    activeCircles.forEach(c => map.removeLayer(c));
    activeCircles = [];
    
    const legenda = document.getElementById('map-legend');
    const alertBox = document.getElementById('no-zones-alert');
    
    const aktivneLokacije = allData.filter(l => l.ekstremno_vreme === true);

    if (prikazi) {
        if (aktivneLokacije.length === 0) {
            if (alertBox) alertBox.style.display = 'block';
            if (legenda) legenda.style.display = 'none';
        } else {
            if (alertBox) alertBox.style.display = 'none';
            if (legenda) legenda.style.display = 'flex';
            
            aktivneLokacije.forEach(lokacija => {
                const temp = lokacija.podatki_json?.temperatura;
                
                const circle = L.circle([lokacija.lat, lokacija.lng], {
                    radius: 10000, 
                    color: temp > 25 ? '#ef4444' : '#3b82f6',
                    fillColor: temp > 25 ? '#ef4444' : '#3b82f6',
                    fillOpacity: 0.2,
                    weight: 2
                }).addTo(map);
                
                circle.bindPopup(`<b>Aktivna cona (10km):</b> ${lokacija.kraj} (${temp ?? 'N/A'}°C)`);
                activeCircles.push(circle);
            });
        }
    } else {
        if (alertBox) alertBox.style.display = 'none';
        if (legenda) legenda.style.display = 'none';
    }
}