// Routes otantifikasyon : enskripsyon, koneksyon, dekoneksyon, pwofil
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { estConnecte } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/inscription — kreye yon nouvo kont kliyan
router.post('/inscription', async (req, res, next) => {
  try {
    const { nom, prenom, email, mot_de_passe, telephone, adresse, entreprise, ville, pays } = req.body;

    if (!nom || !prenom || !email || !mot_de_passe) {
      return res.status(400).json({ message: 'Les champs nom, prénom, courriel et mot de passe sont obligatoires.' });
    }

    // Verifye si imèl la deja itilize
    const existe = await db.query('SELECT 1 FROM utilisateur WHERE email = $1', [email]);
    if (existe.rowCount > 0) {
      return res.status(409).json({ message: 'Cette adresse courriel est déjà utilisée.' });
    }

    // Chiffre modpas la anvan nou anrejistre l
    const hash = await bcrypt.hash(mot_de_passe, 10);

    // Nouvo itilizatè a se toujou yon kliyan pa default
    const resUser = await db.query(
      `INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, telephone, adresse, role)
       VALUES ($1, $2, $3, $4, $5, $6, 'client')
       RETURNING id_utilisateur, nom, prenom, email, role`,
      [nom, prenom, email, hash, telephone || null, adresse || null]
    );
    const utilisateur = resUser.rows[0];

    // Kreye antre kliyan ki koresponn lan
    await db.query(
      `INSERT INTO client (id_utilisateur, entreprise, ville, pays) VALUES ($1, $2, $3, $4)`,
      [utilisateur.id_utilisateur, entreprise || null, ville || null, pays || null]
    );

    res.status(201).json({ message: 'Compte créé avec succès.', utilisateur });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/connexion — konekte yon itilizatè
router.post('/connexion', async (req, res, next) => {
  try {
    const { email, mot_de_passe } = req.body;
    if (!email || !mot_de_passe) {
      return res.status(400).json({ message: 'Courriel et mot de passe requis.' });
    }

    const resultat = await db.query('SELECT * FROM utilisateur WHERE email = $1', [email]);
    if (resultat.rowCount === 0) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    const utilisateur = resultat.rows[0];

    // Bloke kont ki inaktif
    if (utilisateur.statut !== 'actif') {
      return res.status(403).json({ message: 'Ce compte est désactivé.' });
    }

    const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
    if (!motDePasseValide) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    // Nou konsève sèlman enfòmasyon ki pa sansib nan sesyon an
    req.session.utilisateur = {
      id: utilisateur.id_utilisateur,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      role: utilisateur.role,
    };

    res.json({ message: 'Connexion réussie.', utilisateur: req.session.utilisateur });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/deconnexion — fèmen sesyon an
router.post('/deconnexion', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la déconnexion.' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Déconnexion réussie.' });
  });
});

// GET /api/auth/moi — retounen itilizatè konekte a (pou front-end lan)
router.get('/moi', (req, res) => {
  if (req.session && req.session.utilisateur) {
    return res.json({ utilisateur: req.session.utilisateur });
  }
  res.status(401).json({ message: 'Aucun utilisateur connecté.' });
});

// GET /api/auth/profil — pwofil konplè itilizatè konekte a
router.get('/profil', estConnecte, async (req, res, next) => {
  try {
    const id = req.session.utilisateur.id;
    const resultat = await db.query(
      `SELECT u.id_utilisateur, u.nom, u.prenom, u.email, u.telephone, u.adresse, u.role,
              c.entreprise, c.ville, c.pays
       FROM utilisateur u
       LEFT JOIN client c ON c.id_utilisateur = u.id_utilisateur
       WHERE u.id_utilisateur = $1`,
      [id]
    );
    res.json({ profil: resultat.rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/profil — modifye pwofil itilizatè konekte a
router.put('/profil', estConnecte, async (req, res, next) => {
  try {
    const id = req.session.utilisateur.id;
    const { nom, prenom, telephone, adresse, entreprise, ville, pays } = req.body;

    await db.query(
      `UPDATE utilisateur SET nom = COALESCE($1, nom), prenom = COALESCE($2, prenom),
              telephone = $3, adresse = $4 WHERE id_utilisateur = $5`,
      [nom, prenom, telephone || null, adresse || null, id]
    );

    await db.query(
      `UPDATE client SET entreprise = $1, ville = $2, pays = $3 WHERE id_utilisateur = $4`,
      [entreprise || null, ville || null, pays || null, id]
    );

    res.json({ message: 'Profil mis à jour avec succès.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
