let socket = null;
const cachedDevices = {};

export function initActiveDevicesRealtime(trenutniUporabnikId) {
    if (socket) return;

    if (typeof io === 'undefined') {
        console.error("Socket.io odjemalec ni najden na strani. Preveri index.html.");
        return;
    }

    socket = io();

    socket.on('connect', () => {
        console.log("Uspešno povezan na real-time strežnik naprav.");
        
        if (trenutniUporabnikId) {
            socket.emit('pridruzitev-uporabniku', trenutniUporabnikId);
        }
    });

    socket.on('mqtt-device-update', (payload) => {
        const { topic, data, timestamp } = payload;

        if (!cachedDevices['trenutni_trening']) {
            cachedDevices['trenutni_trening'] = {
                naprava: 'Neznana naprava',
                workout: 'Ni aktiven',
                lokacija: 'Čakam lokacijo...',
                time: ''
            };
        }

        const device = cachedDevices['trenutni_trening'];
        device.time = new Date(timestamp).toLocaleTimeString();

        if (data.uporabnik_id || data.user_id) {
            device.naprava = `Uporabnik #${data.uporabnik_id || data.user_id}`;
        }

        if (topic.endsWith('start')) {
            device.workout = data.vrsta_workouta || data.type || 'Aktiven';
        } else if (topic.endsWith('location')) {
            if (device.workout === 'Ni aktiven') device.workout = 'Aktiven';
            if (data.latitude !== undefined && data.longitude !== undefined) {
                device.lokacija = `Lat: ${data.latitude.toFixed(4)}, Lng: ${data.longitude.toFixed(4)}`;
            } else if (data.lat !== undefined && data.lng !== undefined) {
                device.lokacija = `Lat: ${data.lat.toFixed(4)}, Lng: ${data.lng.toFixed(4)}`;
            }
        } else if (topic.endsWith('stop')) {
            device.workout = 'Ni aktiven';
        }

        renderDevicesTable();
    });
}

function renderDevicesTable() {
    const tableBody = document.getElementById('mqtt-devices-table-body');
    if (!tableBody) return;

    const keys = Object.keys(cachedDevices);
    if (keys.length === 0) return;

    tableBody.innerHTML = '';

    keys.forEach(key => {
        const d = cachedDevices[key];
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--border)';
        tr.innerHTML = `
            <td style="padding: 10px 12px; font-family: monospace;">${d.naprava}</td>
            <td style="padding: 10px 12px; font-weight: bold; color: #2563eb;">${d.workout.toUpperCase()}</td>
            <td style="padding: 10px 12px;">${d.lokacija}</td>
            <td style="padding: 10px 12px; color: var(--text-muted); font-size: 0.9em;">${d.time}</td>
        `;
        tableBody.appendChild(tr);
    });
}