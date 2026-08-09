// Routes pou kòmand kliyan yo — kreye kòmand, konsilte istwa, detay
const express = require('express');
const db = require('../config/db');
const { estConnecte } = require('../middleware/auth');
const { construireFacture, numeroFacture } = require('../utils/facture-pdf');

const router = express.Router();

// Ti fonksyon pou jwenn id_client ki koresponn ak itilizatè konekte a
async function trouverIdClient(idUtilisateur) {
  const resultat = await db.query('SELECT id_client FROM client WHERE id_utilisateur = $1', [idUtilisateur]);
  return resultat.rowCount > 0 ? resultat.rows[0].id_client : null;
}

// POST /api/commandes — kreye yon kòmand ak yon oswa plizyè sèvis
// Kò rekèt la : { services: [{ id_service, quantite }] }
router.post('/', estConnecte, async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    const idClient = await trouverIdClient(req.session.utilisateur.id);
    if (!idClient) {
      return res.status(403).json({ message: 'Seuls les clients peuvent passer une commande.' });
    }

    const { services } = req.body;
    if (!Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ message: 'Veuillez sélectionner au moins un service.' });
    }

    // Nou itilize yon tranzaksyon : si yon bagay echwe, tout anile
    await client.query('BEGIN');

    // Kreye kòmand la ak yon montan tanporè 0
    const resCommande = await client.query(
      `INSERT INTO commande (id_client, montant_total, statut) VALUES ($1, 0, 'en_attente') RETURNING id_commande`,
      [idClient]
    );
    const idCommande = resCommande.rows[0].id_commande;

    let montantTotal = 0;

    // Pou chak sèvis, nou pran prix reyèl la nan baz done a (pa fè kliyan konfyans)
    for (const item of services) {
      const resService = await client.query('SELECT prix FROM service WHERE id_service = $1 AND statut = $2', [
        item.id_service,
        'actif',
      ]);
      if (resService.rowCount === 0) {
        throw new Error(`Service ${item.id_service} introuvable ou inactif.`);
      }
      const prix = Number(resService.rows[0].prix);
      const quantite = Number(item.quantite) > 0 ? Number(item.quantite) : 1;
      montantTotal += prix * quantite;

      await client.query(
        `INSERT INTO detail_commande (id_commande, id_service, quantite, prix) VALUES ($1, $2, $3, $4)`,
        [idCommande, item.id_service, quantite, prix]
      );
    }

    // Mete montan total la ajou
    await client.query('UPDATE commande SET montant_total = $1 WHERE id_commande = $2', [montantTotal, idCommande]);

    await client.query('COMMIT');
    res.status(201).json({ message: 'Commande créée.', id_commande: idCommande, montant_total: montantTotal });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// GET /api/commandes — istwa kòmand kliyan konekte a
router.get('/', estConnecte, async (req, res, next) => {
  try {
    const idClient = await trouverIdClient(req.session.utilisateur.id);
    if (!idClient) {
      return res.json({ commandes: [] });
    }
    const resultat = await db.query(
      `SELECT c.id_commande, c.date_commande, c.montant_total, c.statut,
              p.statut AS statut_paiement, p.date_paiement
       FROM commande c
       LEFT JOIN paiement p ON p.id_commande = c.id_commande
       WHERE c.id_client = $1
       ORDER BY c.date_commande DESC`,
      [idClient]
    );
    res.json({ commandes: resultat.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/commandes/:id — detay yon kòmand (sèlman pwòp kòmand kliyan an)
router.get('/:id', estConnecte, async (req, res, next) => {
  try {
    const idClient = await trouverIdClient(req.session.utilisateur.id);
    const resCommande = await db.query(
      'SELECT * FROM commande WHERE id_commande = $1 AND id_client = $2',
      [req.params.id, idClient]
    );
    if (resCommande.rowCount === 0) {
      return res.status(404).json({ message: 'Commande introuvable.' });
    }
    const resDetails = await db.query(
      `SELECT d.quantite, d.prix, s.nom_service, s.description
       FROM detail_commande d
       JOIN service s ON s.id_service = d.id_service
       WHERE d.id_commande = $1`,
      [req.params.id]
    );
    res.json({ commande: resCommande.rows[0], details: resDetails.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/commandes/:id/facture — faktir PDF la (bonis)
// Menm règ ak rès la : yon kliyan ka telechaje SÈLMAN pwòp faktir pa l.
// Tout chif yo soti nan baz done a, front-end lan pa voye anyen.
router.get('/:id/facture', estConnecte, async (req, res, next) => {
  try {
    const idClient = await trouverIdClient(req.session.utilisateur.id);
    const resCommande = await db.query(
      'SELECT * FROM commande WHERE id_commande = $1 AND id_client = $2',
      [req.params.id, idClient]
    );
    if (resCommande.rowCount === 0) {
      return res.status(404).json({ message: 'Commande introuvable.' });
    }
    const commande = resCommande.rows[0];

    const [resClient, resDetails, resPaiement] = await Promise.all([
      db.query(
        `SELECT u.nom, u.prenom, u.email AS courriel, u.telephone, u.adresse,
                c.entreprise, c.ville, c.pays
         FROM client c
         JOIN utilisateur u ON u.id_utilisateur = c.id_utilisateur
         WHERE c.id_client = $1`,
        [idClient]
      ),
      db.query(
        `SELECT d.quantite, d.prix, s.nom_service
         FROM detail_commande d
         JOIN service s ON s.id_service = d.id_service
         WHERE d.id_commande = $1
         ORDER BY d.id_detail`,
        [commande.id_commande]
      ),
      db.query('SELECT * FROM paiement WHERE id_commande = $1', [commande.id_commande]),
    ]);

    const nomFichier = numeroFacture(commande.id_commande) + '.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${nomFichier}"`);

    construireFacture(
      {
        commande,
        client: resClient.rows[0],
        details: resDetails.rows,
        paiement: resPaiement.rows[0] || null,
      },
      res
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
