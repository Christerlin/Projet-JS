// Script espas kliyan an — kòmand, pwofil, temwayaj

document.addEventListener('DOMContentLoaded', async () => {
  // Itilizatè a dwe konekte
  const utilisateur = await chargerSession();
  if (!utilisateur) {
    window.location.href = '/signin.html?redirection=/tableau-bord.html';
    return;
  }

  chargerCommandes();
  chargerProfil();

  document.getElementById('form-profil').addEventListener('submit', enregistrerProfil);
  document.getElementById('form-temoignage').addEventListener('submit', envoyerTemoignage);
});

// -------------------- Kòmand yo --------------------
async function chargerCommandes() {
  const { commandes } = await api.get('/api/commandes');
  const tbody = document.getElementById('tbody-commandes');
  tbody.innerHTML = '';

  // Menm apèl la sèvi pou onglè peman an, pa bezwen yon dezyèm rekèt
  remplirPaiements(commandes);

  if (commandes.length === 0) {
    tbody.appendChild(ligneVide(5, 'Vous n\'avez aucune commande.'));
    return;
  }

  commandes.forEach((c) => {
    const tr = document.createElement('tr');

    const tdId = document.createElement('td');
    tdId.textContent = '#' + c.id_commande;
    tr.appendChild(tdId);

    const tdDate = document.createElement('td');
    tdDate.textContent = new Date(c.date_commande).toLocaleDateString('fr-FR');
    tr.appendChild(tdDate);

    const tdMontant = document.createElement('td');
    tdMontant.textContent = formaterPrix(c.montant_total);
    tr.appendChild(tdMontant);

    const tdStatut = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = 'badge ' + (c.statut === 'payee' ? 'bg-success' : c.statut === 'annulee' ? 'bg-danger' : 'bg-warning');
    badge.textContent = c.statut === 'payee' ? 'Payée' : c.statut === 'annulee' ? 'Annulée' : 'En attente';
    tdStatut.appendChild(badge);
    tr.appendChild(tdStatut);

    const tdAction = document.createElement('td');
    tdAction.className = 'd-flex gap-2 flex-wrap';

    // Detay yo : ki sèvis kliyan an te achte nan kòmand sa a
    const detail = document.createElement('button');
    detail.type = 'button';
    detail.className = 'btn btn-sm btn-outline-secondary';
    const iconeDetail = document.createElement('i');
    iconeDetail.className = 'bi bi-list-ul me-1';
    detail.appendChild(iconeDetail);
    detail.appendChild(document.createTextNode('Détails'));
    detail.addEventListener('click', () => afficherDetailCommande(c.id_commande));
    tdAction.appendChild(detail);

    if (c.statut === 'en_attente') {
      const lien = document.createElement('a');
      lien.className = 'btn btn-sm btn-accent';
      lien.href = '/pay.html?commande=' + c.id_commande;
      lien.textContent = 'Payer';
      tdAction.appendChild(lien);
    }

    // Faktir PDF la (bonis). Sèvè a jenere l, navigatè a jis telechaje l.
    if (c.statut !== 'annulee') {
      const facture = document.createElement('a');
      facture.className = 'btn btn-sm btn-outline-secondary';
      facture.href = '/api/commandes/' + c.id_commande + '/facture';
      const icone = document.createElement('i');
      icone.className = 'bi bi-file-earmark-pdf me-1';
      facture.appendChild(icone);
      facture.appendChild(document.createTextNode('Facture'));
      tdAction.appendChild(facture);
    }

    tr.appendChild(tdAction);
    tbody.appendChild(tr);
  });
}

// Yon sèl liy ki okipe tout tablo a lè pa gen anyen pou montre
function ligneVide(colonnes, texte) {
  const tr = document.createElement('tr');
  const td = document.createElement('td');
  td.colSpan = colonnes;
  td.className = 'text-center text-muted';
  td.textContent = texte;
  tr.appendChild(td);
  return tr;
}

// Ti etikèt koulè pou eta yon kòmand oswa yon peman
function badgeStatut(texte, couleur) {
  const badge = document.createElement('span');
  badge.className = 'badge bg-' + couleur;
  badge.textContent = texte;
  return badge;
}

// -------------------- Istwa peman yo --------------------
function remplirPaiements(commandes) {
  const tbody = document.getElementById('tbody-paiements');
  if (!tbody) return;
  tbody.innerHTML = '';

  // Se sèlman kòmand ki gen yon peman ki parèt isit la
  const payees = commandes.filter((c) => c.date_paiement);

  if (payees.length === 0) {
    tbody.appendChild(ligneVide(6, 'Vous n\'avez encore effectué aucun paiement.'));
    return;
  }

  payees.forEach((c) => {
    const tr = document.createElement('tr');

    const cellules = [
      '#' + c.id_commande,
      new Date(c.date_paiement).toLocaleDateString('fr-FR'),
      formaterPrix(c.montant_paiement != null ? c.montant_paiement : c.montant_total),
      c.mode_paiement || '-',
      c.transaction_id || '-',
    ];

    cellules.forEach((valeur, index) => {
      const td = document.createElement('td');
      if (index === 4) {
        // Referans Stripe la long. Nou koupe l nan yon span : si nou te mete
        // klas yo sou td a, li t ap sispann konpòte l tankou yon selil epi
        // kolòn yo t ap dekale.
        const span = document.createElement('span');
        span.className = 'text-truncate d-inline-block align-bottom';
        span.style.maxWidth = '160px';
        span.textContent = valeur;
        span.title = valeur;
        td.appendChild(span);
      } else {
        td.textContent = valeur;
      }
      tr.appendChild(td);
    });

    const tdStatut = document.createElement('td');
    const reussi = c.statut_paiement === 'reussi';
    tdStatut.appendChild(
      badgeStatut(reussi ? 'Réussi' : c.statut_paiement === 'rembourse' ? 'Remboursé' : 'Échoué',
        reussi ? 'success' : c.statut_paiement === 'rembourse' ? 'secondary' : 'danger')
    );
    tr.appendChild(tdStatut);

    tbody.appendChild(tr);
  });
}

// -------------------- Detay yon kòmand --------------------
async function afficherDetailCommande(idCommande) {
  const corps = document.getElementById('corps-detail');
  document.getElementById('titre-detail').textContent = 'Détail de la commande #' + idCommande;
  corps.textContent = 'Chargement...';

  const fenetre = new bootstrap.Modal(document.getElementById('modal-detail'));
  fenetre.show();

  const { commande, details } = await api.get('/api/commandes/' + idCommande);
  corps.innerHTML = '';

  if (!details || details.length === 0) {
    const vide = document.createElement('p');
    vide.className = 'text-center text-muted mb-0';
    vide.textContent = 'Aucun service dans cette commande.';
    corps.appendChild(vide);
    return;
  }

  const table = document.createElement('table');
  table.className = 'table mb-0';

  const thead = document.createElement('thead');
  const trTete = document.createElement('tr');
  ['Service', 'Quantité', 'Prix unitaire', 'Total'].forEach((titre) => {
    const th = document.createElement('th');
    th.textContent = titre;
    trTete.appendChild(th);
  });
  thead.appendChild(trTete);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  details.forEach((d) => {
    const tr = document.createElement('tr');
    [d.nom_service, String(d.quantite), formaterPrix(d.prix), formaterPrix(d.prix * d.quantite)]
      .forEach((valeur) => {
        const td = document.createElement('td');
        td.textContent = valeur;
        tr.appendChild(td);
      });
    tbody.appendChild(tr);
  });

  // Dènye liy lan bay total kòmand la
  const trTotal = document.createElement('tr');
  const tdVide = document.createElement('td');
  tdVide.colSpan = 3;
  tdVide.className = 'text-end fw-bold';
  tdVide.textContent = 'Total';
  const tdTotal = document.createElement('td');
  tdTotal.className = 'fw-bold';
  tdTotal.textContent = formaterPrix(commande.montant_total);
  trTotal.appendChild(tdVide);
  trTotal.appendChild(tdTotal);
  tbody.appendChild(trTotal);

  table.appendChild(tbody);
  corps.appendChild(table);
}

// -------------------- Pwofil --------------------
async function chargerProfil() {
  const { profil } = await api.get('/api/auth/profil');
  const form = document.getElementById('form-profil');
  form.nom.value = profil.nom || '';
  form.prenom.value = profil.prenom || '';
  // Baz la sere "+509 XXXX XXXX", men chan an montre 8 chif sèlman
  form.telephone.value = telephoneLocal(profil.telephone);
  form.adresse.value = profil.adresse || '';
  form.entreprise.value = profil.entreprise || '';
  form.ville.value = profil.ville || '';
  form.pays.value = profil.pays || '';
}

async function enregistrerProfil(e) {
  e.preventDefault();
  const form = e.target;
  const zone = document.getElementById('message-profil');

  const { statut, donnees } = await api.put('/api/auth/profil', {
    nom: form.nom.value.trim(),
    prenom: form.prenom.value.trim(),
    telephone: form.telephone.value.trim(),
    adresse: form.adresse.value.trim(),
    entreprise: form.entreprise.value.trim(),
    ville: form.ville.value.trim(),
    pays: form.pays.value.trim(),
  });

  afficherAlerte(zone, statut === 200 ? 'success' : 'danger', donnees.message);
}

// -------------------- Temwayaj --------------------
async function envoyerTemoignage(e) {
  e.preventDefault();
  const form = e.target;
  const zone = document.getElementById('message-temoignage');

  const { statut, donnees } = await api.post('/api/temoignages', {
    commentaire: form.commentaire.value.trim(),
    note: form.note.value,
  });

  if (statut === 201) {
    afficherAlerte(zone, 'success', donnees.message);
    form.reset();
  } else {
    afficherAlerte(zone, 'danger', donnees.message || 'Erreur.');
  }
}

// Afiche yon alèt (textContent pou sekirite)
function afficherAlerte(zone, type, texte) {
  zone.innerHTML = '';
  const alerte = document.createElement('div');
  alerte.className = 'alert alert-' + type;
  alerte.textContent = texte;
  zone.appendChild(alerte);
}
