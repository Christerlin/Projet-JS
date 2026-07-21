// Routes pou temwayaj kliyan yo (paj akèy la + kliyan ka kite pa yo)
const express = require('express');
const db = require('../config/db');
const { estConnecte } = require('../middleware/auth');

const router = express.Router();

// GET /api/temoignages — lis temwayaj yo pou paj akèy la
router.get('/', async (req, res, next) => {
  try {
    const resultat = await db.query(
      `SELECT t.commentaire, t.note, t.date, u.nom, u.prenom, c.entreprise
       FROM temoignage t
       JOIN client c ON c.id_client = t.id_client
       JOIN utilisateur u ON u.id_utilisateur = c.id_utilisateur
       ORDER BY t.date DESC
       LIMIT 6`
    );
    res.json({ temoignages: resultat.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/temoignages — yon kliyan konekte ka kite yon temwayaj
router.post('/', estConnecte, async (req, res, next) => {
  try {
    const { commentaire, note } = req.body;
    if (!commentaire) {
      return res.status(400).json({ message: 'Le commentaire est obligatoire.' });
    }

    const resClient = await db.query('SELECT id_client FROM client WHERE id_utilisateur = $1', [
      req.session.utilisateur.id,
    ]);
    if (resClient.rowCount === 0) {
      return res.status(403).json({ message: 'Seuls les clients peuvent laisser un témoignage.' });
    }

    await db.query(`INSERT INTO temoignage (id_client, commentaire, note) VALUES ($1, $2, $3)`, [
      resClient.rows[0].id_client,
      commentaire,
      note || null,
    ]);
    res.status(201).json({ message: 'Merci pour votre témoignage !' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
