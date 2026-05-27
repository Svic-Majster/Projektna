let map = null;

export async function pripraviZemljevid() {
    if (!map) {
        map = L.map('map').setView([46.1512, 14.9955], 8);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    }

    setTimeout(() => { map.invalidateSize(); }, 100);

    try {
        const response = await fetch('/api/zunanji-viri'); 
        const lokacije = await response.json();

        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        lokacije.forEach(lokacija => {
            const lat = parseFloat(lokacija.lat);
            const lng = parseFloat(lokacija.lng);

            if (!isNaN(lat) && !isNaN(lng)) {
                const multiplier = lokacija.podatki_json?.weather_multiplier || lokacija.podatki_json?.multiplier || '1.0';

                const marker = L.marker([lat, lng]).addTo(map);
                
                marker.bindPopup(`
                    <div style="font-family: sans-serif;">
                        <h4 style="margin: 0 0 5px;">${lokacija.viri_ime}</h4>
                        <p style="margin: 0 0 5px;"><strong>Kraj:</strong> ${lokacija.kraj || 'Neznano'}</p>
                        <p style="margin: 0 0 5px;"><strong>Tip:</strong> ${lokacija.tip_vira}</p>
                        <p style="margin: 0; color: #2563eb;"><strong>Vremenski bonus: ${multiplier}x</strong></p>
                    </div>
                `);
            }
        });
    } catch (err) {
        console.error("Napaka pri nalaganju pinov:", err);
    }
}