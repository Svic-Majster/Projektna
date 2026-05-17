const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

// pool povezav
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// ob uspesni povezavi javi
pool.on('connect', () => {
  console.log('Zagon je bil uspesen.');
});

// ob napaki javi
pool.on('error', (err) => {
  console.error('Napaka pri povezavah:', err);
});

// query za v drugih files
module.exports = {
  query: (text, params) => pool.query(text, params),
};
