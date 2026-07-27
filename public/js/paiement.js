// Script paj peman an — entegre Stripe Elements pou peye yon kòmand

let stripe;
let carte; // Eleman kat kredi Stripe la
let idCommande;

document.addEventListener('DOMContentLoaded', initialiserPaiement);

async function initialiserPaiement() {
  const zone = document.getElementById('zone-paiement');

  // Itilizatè a dwe konekte pou peye
  const utilisateur = await chargerSession();
  if (!utilisateur) {
    zone.innerHTML =
      '<div class="carte text-center"><p>Vous devez être connecté pour effectuer un paiement.</p>' +
      '<a href="/signin.html?redirection=/pay.html" class="btn btn-primaire">Se connecter</a></div>';
    return;
  }

  // Nou pran id kòmand la nan URL la
  const parametres = new URLSearchParams(window.location.search);
  idCommande = parametres.get('commande');

  if (!idCommande) {
    await afficherCommandesEnAttente(zone);
    return;
  }

  await preparerPaiement(zone);
}

// Si pa gen kòmand espesifik, montre lis kòmand ki poko peye yo
async function afficherCommandesEnAttente(zone) {
  const { commandes } = await api.get('/api/commandes');
  const enAttente = commandes.filter((c) => c.statut === 'en_attente');

  if (enAttente.length === 0) {
    zone.innerHTML =
      '<div class="carte text-center"><i class="bi bi-check-circle carte-icone"></i>' +
      '<p>Vous n\'avez aucune commande en attente de paiement.</p>' +
      '<a href="/pricing.html" class="btn btn-primaire">Voir nos services</a></div>';
    return;
  }

  const carteEl = document.createElement('div');
  carteEl.className = 'carte';
  const titre = document.createElement('h4');
  titre.textContent = 'Vos commandes en attente';
  carteEl.appendChild(titre);

  enAttente.forEach((c) => {
    const ligne = document.createElement('div');
    ligne.className = 'd-flex justify-content-between align-items-center border-bottom py-2';

    const info = document.createElement('span');
    info.textContent = `Commande #${c.id_commande} — ${formaterPrix(c.montant_total)}`;

    const bouton = document.createElement('a');
    bouton.className = 'btn btn-primaire btn-sm';
    bouton.href = '/pay.html?commande=' + c.id_commande;
    bouton.textContent = 'Payer';

    ligne.appendChild(info);
    ligne.appendChild(bouton);
    carteEl.appendChild(ligne);
  });

  zone.innerHTML = '';
  zone.appendChild(carteEl);
}

// Prepare fòm peman an pou yon kòmand espesifik
async function preparerPaiement(zone) {
  try {
    // Nou pran kle piblik Stripe la epi nou kreye entansyon peman an
    const { cle } = await api.get('/api/paiement/cle-publique');
    stripe = Stripe(cle);

    const { statut, donnees } = await api.post('/api/paiement/creer-intention', {
      id_commande: idCommande,
    });

    if (statut !== 200) {
      zone.innerHTML = '<div class="alert alert-danger">' + (donnees.message || 'Erreur.') + '</div>';
      return;
    }

    // Nou konstwi fòm peman an
    afficherFormulairePaiement(zone, donnees.montant);

    // Nou monte eleman kat Stripe la
    const elements = stripe.elements();
    carte = elements.create('card', { hidePostalCode: true });
    carte.mount('#element-carte');

    document.getElementById('form-paiement').addEventListener('submit', (e) =>
      confirmerPaiement(e, donnees.clientSecret)
    );
  } catch (e) {
    zone.innerHTML = '<div class="alert alert-danger">Impossible de préparer le paiement.</div>';
  }
}

// Konstwi HTML fòm peman an
function afficherFormulairePaiement(zone, montant) {
  zone.innerHTML = `
    <div class="carte">
      <h4 class="mb-3">Commande #${Number(idCommande)}</h4>
      <div class="d-flex justify-content-between mb-3">
        <span>Montant à payer</span>
        <span class="fw-bold fs-4 text-primary">${formaterPrix(montant)}</span>
      </div>
      <div id="message-paiement"></div>
      <form id="form-paiement">
        <label class="form-label">Informations de carte</label>
        <div id="element-carte" class="form-control mb-3" style="padding: 0.8rem"></div>
        <button type="submit" id="btn-payer" class="btn btn-accent w-100">
          <i class="bi bi-lock-fill me-2"></i>Payer ${formaterPrix(montant)}
        </button>
      </form>
      <p class="text-center text-muted mt-3 mb-0">
        <small><i class="bi bi-shield-check me-1"></i>Paiement sécurisé par Stripe. Carte de test : 4242 4242 4242 4242</small>
      </p>
    </div>`;
}

// Konfime peman an ak Stripe epi anrejistre l sou serveur la
async function confirmerPaiement(e, clientSecret) {
  e.preventDefault();
  const bouton = document.getElementById('btn-payer');
  const zoneMessage = document.getElementById('message-paiement');
  bouton.disabled = true;
  bouton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Traitement...';

  // Stripe konfime peman an bò kliyan an
  const resultat = await stripe.confirmCardPayment(clientSecret, {
    payment_method: { card: carte },
  });

  if (resultat.error) {
    afficherMessage(zoneMessage, 'danger', resultat.error.message);
    bouton.disabled = false;
    bouton.innerHTML = '<i class="bi bi-lock-fill me-2"></i>Réessayer';
    return;
  }

  if (resultat.paymentIntent && resultat.paymentIntent.status === 'succeeded') {
    // Nou enfòme serveur la pou l anrejistre peman an
    const { donnees } = await api.post('/api/paiement/confirmer', {
      id_commande: idCommande,
      payment_intent_id: resultat.paymentIntent.id,
    });
    afficherSucces(donnees.message);
  }
}

function afficherMessage(zone, type, texte) {
  zone.innerHTML = '';
  const alerte = document.createElement('div');
  alerte.className = 'alert alert-' + type;
  alerte.textContent = texte;
  zone.appendChild(alerte);
}

// Montre yon ekran konfimasyon apre peman reyisi
function afficherSucces(message) {
  const zone = document.getElementById('zone-paiement');
  zone.innerHTML = '';
  const carteEl = document.createElement('div');
  carteEl.className = 'carte text-center';
  carteEl.innerHTML =
    '<i class="bi bi-check-circle-fill" style="font-size: 4rem; color: var(--couleur-accent)"></i>' +
    '<h3 class="mt-3">Paiement réussi !</h3>';
  const p = document.createElement('p');
  p.textContent = message;
  carteEl.appendChild(p);
  const lien = document.createElement('a');
  lien.className = 'btn btn-primaire';
  lien.href = '/tableau-bord.html';
  lien.textContent = 'Voir mes commandes';
  carteEl.appendChild(lien);
  zone.appendChild(carteEl);
}
