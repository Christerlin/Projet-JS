// Koneksyon ak baz done PostgreSQL la atravè yon pisin (pool) koneksyon
const { Pool } = require('pg');
require('dotenv').config();

// De fason pou konekte :
//   - An lokal, chak enfòmasyon nan pwòp varyab pa l (DB_HOST, DB_USER...).
//   - Sou yon tè deplwaman, sèvis la bay yon sèl chèn koneksyon konplè
//     nan DATABASE_URL. Se fòma Neon, Render, Railway ak lòt yo itilize.
function configurationConnexion() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      // SSL ak verifikasyon sètifika a aktive. Neon sèvi ak sètifika piblik,
      // donk sa mache dirèkteman epi li pwoteje kont yon atak nan mitan.
      // Sèl si yon tè sèvi ak yon sètifika entèn ki pa siyen piblikman, mete
      // DB_SSL_STRICT=false. Pa fè sa san w pa konnen poukisa.
      ssl:
        process.env.DB_SSL === 'false'
          ? false
          : { rejectUnauthorized: process.env.DB_SSL_STRICT !== 'false' },
    };
  }

  return {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };
}

// Yon sèl pisin pataje pou tout aplikasyon an — li jere plizyè koneksyon otomatikman
const pool = new Pool(configurationConnexion());

// Si yon erè grav rive sou yon kliyan inaktif, nou anrejistre l pou n ka dyagnostike
pool.on('error', (err) => {
  console.error('Erè inatandi sou pisin PostgreSQL la :', err);
});

module.exports = {
  // Fonksyon rakoursi pou egzekite yon rekèt SQL
  query: (text, params) => pool.query(text, params),
  pool,
  configurationConnexion,
};
