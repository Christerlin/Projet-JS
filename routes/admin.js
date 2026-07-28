// Routes administratè yo — tout pwoteje pa middleware "estAdmin"
const express = require('express');
const db = require('../config/db');
const { estAdmin } = require('../middleware/auth');

const router = express.Router();

// Tout routes ki anba a mande wòl administratè
router.use(estAdmin);

// -------------------- TABLO DE BÒ (estatistik) --------------------

// GET /api/admin/statistiques — chif kle pou tablo de bò a
router.get('/statistiques', async (req, res, next) => {
  try {
    const [clients, services, commandes, revenus, messages] = await Promise.all([
      db.query("SELECT COUNT(*) FROM utilisateur WHERE role = 'client'"),
      db.query("SELECT COUNT(*) FROM service WHERE statut = 'actif'"),
      db.query('SELECT COUNT(*) FROM commande'),
      db.query("SELECT COALESCE(SUM(montant), 0) AS total FROM paiement WHERE statut = 'reussi'"),
      db.query('SELECT COUNT(*) FROM contact'),
    ]);
    res.json({
      nb_clients: Number(clients.rows[0].count),
      nb_services: Number(services.rows[0].count),
      nb_commandes: Number(commandes.rows[0].count),
      revenus_total: Number(revenus.rows[0].total),
      nb_messages: Number(messages.rows[0].count),
    });
  } catch (err) {
    next(err);
  }
});

// -------------------- JESYON ITILIZATÈ / KLIYAN --------------------

// GET /api/admin/utilisateurs — lis tout itilizatè yo
router.get('/utilisateurs', async (req, res, next) => {
  try {
    const resultat = await db.query(
      `SELECT id_utilisateur, nom, prenom, email, telephone, role, statut, date_creation
       FROM utilisateur ORDER BY date_creation DESC`
    );
    res.json({ utilisateurs: resultat.rows });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/utilisateurs/:id/statut — aktive oswa dezaktive yon kont
router.put('/utilisateurs/:id/statut', async (req, res, next) => {
  try {
    const { statut } = req.body;
    if (!['actif', 'inactif'].includes(statut)) {
      return res.status(400).json({ message: 'Statut invalide.' });
    }
    await db.query('UPDATE utilisateur SET statut = $1 WHERE id_utilisateur = $2', [statut, req.params.id]);
    res.json({ message: 'Statut mis à jour.' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/utilisateurs/:id — efase yon itilizatè
router.delete('/utilisateurs/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM utilisateur WHERE id_utilisateur = $1', [req.params.id]);
    res.json({ message: 'Utilisateur supprimé.' });
  } catch (err) {
    next(err);
  }
});

// -------------------- JESYON SÈVIS (CRUD) --------------------

// GET /api/admin/services — lis tout sèvis yo (menm sa ki inaktif)
router.get('/services', async (req, res, next) => {
  try {
    const resultat = await db.query('SELECT * FROM service ORDER BY id_service');
    res.json({ services: resultat.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/services — ajoute yon nouvo sèvis
router.post('/services', async (req, res, next) => {
  try {
    const { nom_service, description, prix, categorie, image } = req.body;
    if (!nom_service || prix == null) {
      return res.status(400).json({ message: 'Le nom et le prix du service sont obligatoires.' });
    }
    const resultat = await db.query(
      `INSERT INTO service (nom_service, description, prix, categorie, image)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nom_service, description || null, prix, categorie || null, image || null]
    );
    res.status(201).json({ message: 'Service ajouté.', service: resultat.rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/services/:id — modifye yon sèvis
router.put('/services/:id', async (req, res, next) => {
  try {
    const { nom_service, description, prix, categorie, image, statut } = req.body;
    const resultat = await db.query(
      `UPDATE service SET nom_service = COALESCE($1, nom_service),
              description = COALESCE($2, description), prix = COALESCE($3, prix),
              categorie = COALESCE($4, categorie), image = COALESCE($5, image),
              statut = COALESCE($6, statut)
       WHERE id_service = $7 RETURNING *`,
      [nom_service, description, prix, categorie, image, statut, req.params.id]
    );
    if (resultat.rowCount === 0) {
      return res.status(404).json({ message: 'Service introuvable.' });
    }
    res.json({ message: 'Service mis à jour.', service: resultat.rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/services/:id — efase yon sèvis
router.delete('/services/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM service WHERE id_service = $1', [req.params.id]);
    res.json({ message: 'Service supprimé.' });
  } catch (err) {
    next(err);
  }
});

// -------------------- PEMAN AK KÒMAND --------------------

// GET /api/admin/paiements — lis tout peman yo
router.get('/paiements', async (req, res, next) => {
  try {
    const resultat = await db.query(
      `SELECT p.id_paiement, p.montant, p.mode_paiement, p.transaction_id, p.date_paiement, p.statut,
              c.id_commande, u.nom, u.prenom, u.email
       FROM paiement p
       JOIN commande c ON c.id_commande = p.id_commande
       JOIN client cl ON cl.id_client = c.id_client
       JOIN utilisateur u ON u.id_utilisateur = cl.id_utilisateur
       ORDER BY p.date_paiement DESC`
    );
    res.json({ paiements: resultat.rows });
  } catch (err) {
    next(err);
  }
});

// -------------------- MESAJ KONTAK --------------------

// GET /api/admin/messages — lis mesaj kontak yo
router.get('/messages', async (req, res, next) => {
  try {
    const resultat = await db.query('SELECT * FROM contact ORDER BY date_message DESC');
    res.json({ messages: resultat.rows });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/messages/:id — efase yon mesaj
router.delete('/messages/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM contact WHERE id_contact = $1', [req.params.id]);
    res.json({ message: 'Message supprimé.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
