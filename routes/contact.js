// Route pou fòm kontak la — mesaj yo anrejistre nan baz done a
const express = require('express');
const db = require('../config/db');
const { normaliserTelephone } = require('../utils/telephone');

const router = express.Router();

// POST /api/contact — anrejistre yon nouvo mesaj
router.post('/', async (req, res, next) => {
  try {
    const { nom, prenom, email, telephone, sujet, message } = req.body;

    // Validasyon chan obligatwa yo
    if (!nom || !prenom || !email || !sujet || !message) {
      return res.status(400).json({ message: 'Veuillez remplir tous les champs obligatoires.' });
    }

    const tel = normaliserTelephone(telephone);
    if (!tel.ok) {
      return res.status(400).json({ message: tel.message });
    }

    await db.query(
      `INSERT INTO contact (nom, prenom, email, telephone, sujet, message)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [nom, prenom, email, tel.valeur, sujet, message]
    );

    res.status(201).json({ message: 'Votre message a bien été envoyé. Nous vous répondrons bientôt.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
