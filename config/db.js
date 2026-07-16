// Koneksyon ak baz done PostgreSQL la atravè yon pisin (pool) koneksyon
const { Pool } = require('pg');
require('dotenv').config();

// Yon sèl pisin pataje pou tout aplikasyon an — li jere plizyè koneksyon otomatikman
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Si yon erè grav rive sou yon kliyan inaktif, nou anrejistre l pou n ka dyagnostike
pool.on('error', (err) => {
  console.error('Erè inatandi sou pisin PostgreSQL la :', err);
});

module.exports = {
  // Fonksyon rakoursi pou egzekite yon rekèt SQL
  query: (text, params) => pool.query(text, params),
  pool,
};
