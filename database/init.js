// Script pou inisyalize baz done a : li kreye baz la (si l pa egziste),
// egzekite schema.sql epi seed.sql. Lanse l ak : npm run db:init
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { configurationConnexion } = require('../config/db');

const DB_NAME = process.env.DB_NAME;

async function creerBaseSiNecessaire() {
  // Nou konekte sou baz "postgres" default la pou n ka kreye baz pa nou an
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });

  await client.connect();
  const resultat = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [DB_NAME]);
  if (resultat.rowCount === 0) {
    // Non baz la pa ka parametre, men li soti nan .env nou an
    await client.query(`CREATE DATABASE ${DB_NAME}`);
    console.log(`Baz done "${DB_NAME}" kreye.`);
  } else {
    console.log(`Baz done "${DB_NAME}" deja egziste.`);
  }
  await client.end();
}

async function executerScript(nomFichier) {
  // Menm konfigirasyon ak aplikasyon an : varyab separe an lokal,
  // oswa DATABASE_URL sou tè deplwaman an.
  const client = new Client(configurationConnexion());
  await client.connect();
  const sql = fs.readFileSync(path.join(__dirname, nomFichier), 'utf8');
  await client.query(sql);
  await client.end();
  console.log(`Script "${nomFichier}" egzekite avèk siksè.`);
}

async function main() {
  try {
    // Sou yon baz jere (Neon, Render...), baz la deja kreye lè w kreye
    // pwojè a, epi kont lan pa gen dwa fè CREATE DATABASE. Nou sote etap la.
    if (process.env.DATABASE_URL) {
      console.log('DATABASE_URL detekte : nou sèvi ak baz done ki deja kreye a.');
    } else {
      await creerBaseSiNecessaire();
    }
    await executerScript('schema.sql');
    await executerScript('seed.sql');
    console.log('Inisyalizasyon baz done a fini.');
  } catch (err) {
    console.error('Erè pandan inisyalizasyon an :', err.message);
    process.exit(1);
  }
}

main();
