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

app.get('/api/skupina/:id/leaderboard', async (req, res) => {
    try {
        const skupinaId = req.params.id;
                const skupinaMeta = await db.query(
            'SELECT koda_za_pridruzitev, owner_id FROM skupine WHERE id = $1',
            [skupinaId]
        );

        if (skupinaMeta.rows.length === 0) {
            return res.status(404).json({ error: 'Skupina ne obstaja.' });
        }

        const [clani, imeSkupine] = await Promise.all([
            groupLeaderboardService.getLeaderboard(skupinaId),
            groupLeaderboardService.getGroupName(skupinaId)
        ]);

        res.json({
            ime_skupine: imeSkupine,
            koda_za_pridruzitev: skupinaMeta.rows[0].koda_za_pridruzitev,
            owner_id: skupinaMeta.rows[0].owner_id,
            clani: clani
        });
    } catch (err) {
        console.error("Napaka pri pridobivanju leaderboarda:", err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/users/skupina/:skupinaId/zapusti', async (req, res) => {
    try {
        const { skupinaId } = req.params;
        const { uporabnikId } = req.body; 

        const result = await db.query(
            'DELETE FROM clani_skupine WHERE skupina_id = $1 AND uporabnik_id = $2',
            [skupinaId, uporabnikId]
        );

        if (result.rowCount > 0) {
            res.json({ message: 'Uspešno ste zapustili skupino' });
        } else {
            res.status(404).json({ error: 'Članstvo ni bilo najdeno' });
        }
    } catch (err) {
        console.error("Napaka pri zapuščanju skupine:", err);
        res.status(500).json({ error: 'Napaka na strežniku' });
    }
});

app.delete('/api/users/skupina/:skupinaId/izbrisi', async (req, res) => {
    try {
        const { skupinaId } = req.params;
        const { uporabnikId } = req.body;

        const provera = await db.query('SELECT owner_id FROM skupine WHERE id = $1', [skupinaId]);
        if (provera.rows.length === 0) {
            return res.status(404).json({ error: 'Skupina ne obstaja.' });
        }

        if (provera.rows[0].owner_id !== uporabnikId) {
            return res.status(403).json({ error: 'Niste lastnik te skupine, zato je ne morete izbrisati.' });
        }

        await db.query('DELETE FROM clani_skupine WHERE skupina_id = $1', [skupinaId]);
        
        await db.query('DELETE FROM skupine WHERE id = $1', [skupinaId]);

        res.json({ message: 'Skupina je bila uspešno izbrisana.' });
    } catch (err) {
        console.error("Napaka pri brisanju skupine:", err);
        res.status(500).json({ error: 'Napaka na strežniku pri brisanju skupine.' });
    }
});

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