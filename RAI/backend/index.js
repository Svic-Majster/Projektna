const express = require('express');
const cors = require('cors');
const db = require('./db');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const workoutRoutes = require('./routes/workoutRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);

// osnovna pot | http://localhost:3000
app.get('/', (req, res) => {
    res.send('API deluje.');
});

// pot za bazo | http://localhost:3000/api/health
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server deluje na http://localhost:${PORT}`);
});
