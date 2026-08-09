// Routes peman ak Stripe — kreye entansyon peman epi konfime li
const express = require('express');
const db = require('../config/db');
const { estConnecte } = require('../middleware/auth');

const router = express.Router();

// Nou inisyalize Stripe ak kle sekrè a
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Chèche yon kòmand SÈLMAN si li apatni a itilizatè konekte a.
// Nou pase pa tab client la paske id sesyon an se yon id_utilisateur,
// se pa menm bagay ak id_client ki nan tab commande a.
async function trouverCommandeDuClient(idUtilisateur, idCommande) {
  const resultat = await db.query(
    `SELECT cm.*
     FROM commande cm
     JOIN client cl ON cl.id_client = cm.id_client
     WHERE cm.id_commande = $1 AND cl.id_utilisateur = $2`,
    [idCommande, idUtilisateur]
  );
  return resultat.rowCount > 0 ? resultat.rows[0] : null;
}

// GET /api/paiement/cle-publique — bay front-end lan kle piblik Stripe la
router.get('/cle-publique', (req, res) => {
  res.json({ cle: process.env.STRIPE_PUBLISHABLE_KEY });
});

// POST /api/paiement/creer-intention — kreye yon PaymentIntent pou yon kòmand
// Kò rekèt la : { id_commande }
router.post('/creer-intention', estConnecte, async (req, res, next) => {
  try {
    const { id_commande } = req.body;

    // Kòmand la dwe egziste EPI apatni a moun ki konekte a. San tès sa a,
    // nenpòt kliyan te ka bay nenpòt nimewo epi wè montan lòt moun.
    const commande = await trouverCommandeDuClient(req.session.utilisateur.id, id_commande);
    if (!commande) {
      return res.status(404).json({ message: 'Commande introuvable.' });
    }
    if (commande.statut === 'payee') {
      return res.status(409).json({ message: 'Cette commande a déjà été payée.' });
    }

    // Stripe travay ak pi piti inite lajan an (santim), donk nou miltipliye pa 100
    const montantEnCentimes = Math.round(Number(commande.montant_total) * 100);

    const intention = await stripe.paymentIntents.create({
      amount: montantEnCentimes,
      currency: 'usd',
      metadata: { id_commande: String(id_commande) },
    });

    res.json({ clientSecret: intention.client_secret, montant: commande.montant_total });
  } catch (err) {
    next(err);
  }
});

// POST /api/paiement/confirmer — anrejistre peman an apre konfimasyon Stripe
// Kò rekèt la : { id_commande, payment_intent_id }
router.post('/confirmer', estConnecte, async (req, res, next) => {
  try {
    const { id_commande, payment_intent_id } = req.body;

    // 1. Kòmand la dwe apatni a moun ki konekte a
    const commande = await trouverCommandeDuClient(req.session.utilisateur.id, id_commande);
    if (!commande) {
      return res.status(404).json({ message: 'Commande introuvable.' });
    }

    // 2. Nou revalide estati a dirèkteman avèk Stripe pou n pa fè front-end lan konfyans
    const intention = await stripe.paymentIntents.retrieve(payment_intent_id);
    if (intention.status !== 'succeeded') {
      return res.status(400).json({ message: 'Le paiement n\'a pas été confirmé.' });
    }

    // 3. Entansyon an dwe se sa nou te kreye POU kòmand sa a. Se tès sa a ki
    // anpeche yon moun peye yon ti kòmand epi sèvi ak menm entansyon an pou
    // make yon lòt kòmand pi chè kòm peye.
    if (String(intention.metadata.id_commande) !== String(id_commande)) {
      return res.status(400).json({ message: 'Ce paiement ne correspond pas à cette commande.' });
    }

    // 4. Montan an dwe koresponn ak total kòmand la
    const montant = intention.amount / 100;
    if (Math.round(montant * 100) !== Math.round(Number(commande.montant_total) * 100)) {
      return res.status(400).json({ message: 'Le montant payé ne correspond pas à la commande.' });
    }

    // Anrejistre peman an epi make kòmand la kòm peye
    await db.query(
      `INSERT INTO paiement (id_commande, montant, mode_paiement, transaction_id, statut)
       VALUES ($1, $2, 'stripe', $3, 'reussi')
       ON CONFLICT (id_commande) DO UPDATE SET transaction_id = $3, statut = 'reussi'`,
      [id_commande, montant, payment_intent_id]
    );
    await db.query(`UPDATE commande SET statut = 'payee' WHERE id_commande = $1`, [id_commande]);

    res.json({ message: 'Paiement effectué avec succès. Merci pour votre confiance !' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
