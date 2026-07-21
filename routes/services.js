// Routes pou konsilte sèvis yo (piblik) — jesyon admin nan routes/admin.js
const express = require('express');
const db = require('../config/db');

const router = express.Router();

// GET /api/services — lis tout sèvis aktif yo, ak posibilite pou filtre
// Paramèt opsyonèl : ?categorie=... epi ?recherche=...
router.get('/', async (req, res, next) => {
  try {
    const { categorie, recherche } = req.query;
    const conditions = ["statut = 'actif'"];
    const valeurs = [];

    if (categorie) {
      valeurs.push(categorie);
      conditions.push(`categorie = $${valeurs.length}`);
    }
    if (recherche) {
      valeurs.push(`%${recherche}%`);
      conditions.push(`(nom_service ILIKE $${valeurs.length} OR description ILIKE $${valeurs.length})`);
    }

    const sql = `SELECT * FROM service WHERE ${conditions.join(' AND ')} ORDER BY nom_service`;
    const resultat = await db.query(sql, valeurs);
    res.json({ services: resultat.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/services/categories — lis kategori diferan yo (pou filtraj)
router.get('/categories', async (req, res, next) => {
  try {
    const resultat = await db.query(
      `SELECT DISTINCT categorie FROM service WHERE statut = 'actif' AND categorie IS NOT NULL ORDER BY categorie`
    );
    res.json({ categories: resultat.rows.map((r) => r.categorie) });
  } catch (err) {
    next(err);
  }
});

// GET /api/services/:id — detay yon sèvis
router.get('/:id', async (req, res, next) => {
  try {
    const resultat = await db.query('SELECT * FROM service WHERE id_service = $1', [req.params.id]);
    if (resultat.rowCount === 0) {
      return res.status(404).json({ message: 'Service introuvable.' });
    }
    res.json({ service: resultat.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
