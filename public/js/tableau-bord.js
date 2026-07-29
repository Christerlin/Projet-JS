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

  if (commandes.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.className = 'text-center text-muted';
    td.textContent = 'Vous n\'avez aucune commande.';
    tr.appendChild(td);
    tbody.appendChild(tr);
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
    if (c.statut === 'en_attente') {
      const lien = document.createElement('a');
      lien.className = 'btn btn-sm btn-accent';
      lien.href = '/pay.html?commande=' + c.id_commande;
      lien.textContent = 'Payer';
      tdAction.appendChild(lien);
    }
    tr.appendChild(tdAction);
    tbody.appendChild(tr);
  });
}

// -------------------- Pwofil --------------------
async function chargerProfil() {
  const { profil } = await api.get('/api/auth/profil');
  const form = document.getElementById('form-profil');
  form.nom.value = profil.nom || '';
  form.prenom.value = profil.prenom || '';
  form.telephone.value = profil.telephone || '';
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
