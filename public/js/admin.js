// Script panel administratè a — jesyon sèvis, itilizatè, peman, mesaj

document.addEventListener('DOMContentLoaded', initialiserAdmin);

async function initialiserAdmin() {
  // Nou verifye itilizatè a se yon administratè, sinon nou redirije l
  const utilisateur = await chargerSession();
  if (!utilisateur || utilisateur.role !== 'admin') {
    window.location.href = '/signin.html';
    return;
  }

  chargerStatistiques();
  chargerServices();
  chargerUtilisateurs();
  chargerPaiements();
  chargerMessages();

  document.getElementById('form-service').addEventListener('submit', enregistrerService);
  document.getElementById('btn-nouveau-service').addEventListener('click', reinitialiserFormService);
}

// Ti fonksyon pou kreye yon selil tab ak tèks san danje
function cellule(texte) {
  const td = document.createElement('td');
  td.textContent = texte;
  return td;
}

// -------------------- Estatistik --------------------

// Montan an pou ti kat estatistik la. Nou kite santim yo deyò, epi depi l
// rive nan milyon nou abreje l, konsa kat la rete menm gwosè ak lòt yo
// kèlkeswa kantite chif la. Montan egzak yo nan onglè Paiements lan.
function formaterRevenusCourt(montant) {
  const valeur = Number(montant) || 0;
  if (valeur >= 1000000) {
    return (valeur / 1000000).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' M$';
  }
  return valeur.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' $';
}

async function chargerStatistiques() {
  const { nb_clients, nb_services, nb_commandes, revenus_total, nb_messages } = await api.get(
    '/api/admin/statistiques'
  );
  const zone = document.getElementById('zone-stats');

  const cartes = [
    { titre: 'Clients', valeur: nb_clients, icone: 'bi-people-fill' },
    { titre: 'Services', valeur: nb_services, icone: 'bi-box-seam' },
    { titre: 'Commandes', valeur: nb_commandes, icone: 'bi-cart-fill' },
    { titre: 'Revenus', valeur: formaterRevenusCourt(revenus_total), icone: 'bi-cash-stack' },
    { titre: 'Messages', valeur: nb_messages, icone: 'bi-envelope-fill' },
  ];

  zone.innerHTML = '';
  cartes.forEach((c) => {
    const col = document.createElement('div');
    col.className = 'col-6 col-md-4 col-lg stat-col';
    const carte = document.createElement('div');
    carte.className = 'stat-carte';
    carte.innerHTML =
      `<i class="bi ${c.icone}" style="font-size:1.5rem"></i>` +
      `<div class="chif">${c.valeur}</div>`;
    const p = document.createElement('div');
    p.textContent = c.titre;
    carte.appendChild(p);
    col.appendChild(carte);
    zone.appendChild(col);
  });

  // Graf senp ak Chart.js (bonis)
  const ctx = document.getElementById('graf-general');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Clients', 'Services', 'Commandes', 'Messages'],
      datasets: [
        {
          label: 'Total',
          data: [nb_clients, nb_services, nb_commandes, nb_messages],
          backgroundColor: ['#2c7be5', '#00b8a9', '#1e3a5f', '#f6ad55'],
          borderRadius: 6,
        },
      ],
    },
    options: { plugins: { legend: { display: false } } },
  });
}

// -------------------- Sèvis --------------------
async function chargerServices() {
  const { services } = await api.get('/api/admin/services');
  const tbody = document.getElementById('tbody-services');
  tbody.innerHTML = '';

  services.forEach((s) => {
    const tr = document.createElement('tr');
    tr.appendChild(cellule(s.nom_service));
    tr.appendChild(cellule(s.categorie || '—'));
    tr.appendChild(cellule(formaterPrix(s.prix)));

    const tdStatut = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = 'badge ' + (s.statut === 'actif' ? 'bg-success' : 'bg-secondary');
    badge.textContent = s.statut;
    tdStatut.appendChild(badge);
    tr.appendChild(tdStatut);

    const tdActions = document.createElement('td');
    const btnModifier = document.createElement('button');
    btnModifier.className = 'btn btn-sm btn-outline-primary me-1';
    btnModifier.innerHTML = '<i class="bi bi-pencil"></i>';
    btnModifier.addEventListener('click', () => ouvrirModificationService(s));

    const btnSupprimer = document.createElement('button');
    btnSupprimer.className = 'btn btn-sm btn-outline-danger';
    btnSupprimer.innerHTML = '<i class="bi bi-trash"></i>';
    btnSupprimer.addEventListener('click', () => supprimerService(s.id_service));

    tdActions.appendChild(btnModifier);
    tdActions.appendChild(btnSupprimer);
    tr.appendChild(tdActions);
    tbody.appendChild(tr);
  });
}

function reinitialiserFormService() {
  const form = document.getElementById('form-service');
  form.reset();
  form.id_service.value = '';
  document.getElementById('titre-modal-service').textContent = 'Nouveau service';
}

function ouvrirModificationService(s) {
  const form = document.getElementById('form-service');
  form.id_service.value = s.id_service;
  form.nom_service.value = s.nom_service;
  form.description.value = s.description || '';
  form.prix.value = s.prix;
  form.categorie.value = s.categorie || '';
  document.getElementById('titre-modal-service').textContent = 'Modifier le service';
  new bootstrap.Modal(document.getElementById('modal-service')).show();
}

async function enregistrerService(e) {
  e.preventDefault();
  const form = e.target;
  const donnees = {
    nom_service: form.nom_service.value.trim(),
    description: form.description.value.trim(),
    prix: form.prix.value,
    categorie: form.categorie.value.trim(),
  };

  const id = form.id_service.value;
  // Si gen yon id, se yon modifikasyon; sinon se yon nouvo sèvis
  const resultat = id
    ? await api.put('/api/admin/services/' + id, donnees)
    : await api.post('/api/admin/services', donnees);

  if (resultat.statut === 200 || resultat.statut === 201) {
    bootstrap.Modal.getInstance(document.getElementById('modal-service')).hide();
    chargerServices();
    chargerStatistiques();
  } else {
    alert(resultat.donnees.message || 'Erreur.');
  }
}

async function supprimerService(id) {
  if (!confirm('Voulez-vous vraiment supprimer ce service ?')) return;
  await api.supprimer('/api/admin/services/' + id);
  chargerServices();
  chargerStatistiques();
}

// -------------------- Itilizatè --------------------
async function chargerUtilisateurs() {
  const { utilisateurs } = await api.get('/api/admin/utilisateurs');
  const tbody = document.getElementById('tbody-utilisateurs');
  tbody.innerHTML = '';

  utilisateurs.forEach((u) => {
    const tr = document.createElement('tr');
    tr.appendChild(cellule(u.prenom + ' ' + u.nom));
    tr.appendChild(cellule(u.email));

    const tdRole = document.createElement('td');
    const badgeRole = document.createElement('span');
    badgeRole.className = 'badge ' + (u.role === 'admin' ? 'bg-primary' : 'bg-info');
    badgeRole.textContent = u.role;
    tdRole.appendChild(badgeRole);
    tr.appendChild(tdRole);

    const tdStatut = document.createElement('td');
    const badgeStatut = document.createElement('span');
    badgeStatut.className = 'badge ' + (u.statut === 'actif' ? 'bg-success' : 'bg-secondary');
    badgeStatut.textContent = u.statut;
    tdStatut.appendChild(badgeStatut);
    tr.appendChild(tdStatut);

    const tdActions = document.createElement('td');
    // Nou pa pèmèt aksyon sou administratè yo pou evite erè
    if (u.role !== 'admin') {
      const btnBasculer = document.createElement('button');
      btnBasculer.className = 'btn btn-sm btn-outline-warning me-1';
      const nouveauStatut = u.statut === 'actif' ? 'inactif' : 'actif';
      btnBasculer.textContent = u.statut === 'actif' ? 'Désactiver' : 'Activer';
      btnBasculer.addEventListener('click', () => changerStatutUtilisateur(u.id_utilisateur, nouveauStatut));

      const btnSupprimer = document.createElement('button');
      btnSupprimer.className = 'btn btn-sm btn-outline-danger';
      btnSupprimer.innerHTML = '<i class="bi bi-trash"></i>';
      btnSupprimer.addEventListener('click', () => supprimerUtilisateur(u.id_utilisateur));

      tdActions.appendChild(btnBasculer);
      tdActions.appendChild(btnSupprimer);
    }
    tr.appendChild(tdActions);
    tbody.appendChild(tr);
  });
}

async function changerStatutUtilisateur(id, statut) {
  await api.put('/api/admin/utilisateurs/' + id + '/statut', { statut });
  chargerUtilisateurs();
}

async function supprimerUtilisateur(id) {
  if (!confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) return;
  await api.supprimer('/api/admin/utilisateurs/' + id);
  chargerUtilisateurs();
  chargerStatistiques();
}

// -------------------- Peman --------------------
async function chargerPaiements() {
  const { paiements } = await api.get('/api/admin/paiements');
  const tbody = document.getElementById('tbody-paiements');
  tbody.innerHTML = '';

  paiements.forEach((p) => {
    const tr = document.createElement('tr');
    tr.appendChild(cellule(p.prenom + ' ' + p.nom));
    tr.appendChild(cellule('#' + p.id_commande));
    tr.appendChild(cellule(formaterPrix(p.montant)));
    tr.appendChild(cellule(p.mode_paiement));
    tr.appendChild(cellule(new Date(p.date_paiement).toLocaleDateString('fr-FR')));

    const tdStatut = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = 'badge bg-success';
    badge.textContent = p.statut;
    tdStatut.appendChild(badge);
    tr.appendChild(tdStatut);
    tbody.appendChild(tr);
  });
}

// -------------------- Mesaj --------------------
async function chargerMessages() {
  const { messages } = await api.get('/api/admin/messages');
  const zone = document.getElementById('zone-messages');
  zone.innerHTML = '';

  if (messages.length === 0) {
    zone.innerHTML = '<p class="text-muted">Aucun message.</p>';
    return;
  }

  messages.forEach((m) => {
    const col = document.createElement('div');
    col.className = 'col-md-6';
    const carte = document.createElement('div');
    carte.className = 'carte';

    const titre = document.createElement('h6');
    titre.textContent = m.sujet;

    const auteur = document.createElement('p');
    auteur.className = 'text-muted mb-1';
    auteur.textContent = `${m.prenom} ${m.nom} — ${m.email}`;

    const tel = document.createElement('p');
    tel.className = 'text-muted small mb-2';
    tel.textContent = m.telephone || '';

    const message = document.createElement('p');
    message.textContent = m.message;

    const btnSupprimer = document.createElement('button');
    btnSupprimer.className = 'btn btn-sm btn-outline-danger';
    btnSupprimer.innerHTML = '<i class="bi bi-trash me-1"></i>Supprimer';
    btnSupprimer.addEventListener('click', () => supprimerMessage(m.id_contact));

    carte.appendChild(titre);
    carte.appendChild(auteur);
    carte.appendChild(tel);
    carte.appendChild(message);
    carte.appendChild(btnSupprimer);
    col.appendChild(carte);
    zone.appendChild(col);
  });
}

async function supprimerMessage(id) {
  if (!confirm('Supprimer ce message ?')) return;
  await api.supprimer('/api/admin/messages/' + id);
  chargerMessages();
  chargerStatistiques();
}
