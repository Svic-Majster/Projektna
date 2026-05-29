const express = require('express');
const cors = require('cors');
const db = require('./db');
const path = require('path');
const cron = require('node-cron');
const { startMqttClient } = require('./mqtt/client');
const zunanjiViriService = require('./services/zunanjiViriService');
const groupLeaderboardService = require('./services/groupLeaderboardService');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/src', express.static(path.join(__dirname, '../frontend/src')));
app.use(express.static(path.join(__dirname, '../frontend/public')));

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const externalRoutes = require('./routes/externalRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const zunanjiViriRoutes = require('./routes/zunanjiViriRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/zunanji-viri', zunanjiViriRoutes);

// 2. Dodaj API rutno za leaderboard
app.get('/api/skupina/:id/leaderboard', async (req, res) => {
    try {
        const skupinaId = req.params.id;
        
        // Poberemo podatke iz novega servisa
        const [clani, imeSkupine] = await Promise.all([
            groupLeaderboardService.getLeaderboard(skupinaId),
            groupLeaderboardService.getGroupName(skupinaId)
        ]);

        res.json({
            ime_skupine: imeSkupine,
            clani: clani
        });
    } catch (err) {
        console.error("Napaka pri pridobivanju leaderboarda:", err);
        res.status(500).json({ error: err.message });
    }
});

// zagon scrapera vsakih 10 min
cron.schedule('*/10 * * * *', async () => {
    console.log('--- Avtomatski zagon scraperja (vsakih 10 min) ---');
    try {
        await zunanjiViriService.pokliciScraper();
        console.log('Avtomatski scraper uspešno zaključen.');
    } catch (err) {
        console.error('Napaka pri avtomatskem zagonu scraperja:', err);
    }
});

app.get('/api/health', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({
            status: 'vse ok',
            db_time: result.rows[0].now,
            sporocilo: 'Povezava z Docker bazo deluje!'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Baza ne odgovarja', details: err.message });
    }
});

startMqttClient();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server deluje na http://localhost:${PORT}`);
});