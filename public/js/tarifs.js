// Script paj tarif yo — afiche sèvis, filtre, seleksyone epi kòmande

// Nou kenbe seleksyon an nan yon Map : id_service -> { nom, prix }
const selection = new Map();

document.addEventListener('DOMContentLoaded', () => {
  chargerCategories();
  chargerServices();

  document.getElementById('btn-filtrer').addEventListener('click', chargerServices);
  document.getElementById('recherche').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') chargerServices();
  });
  document.getElementById('btn-commander').addEventListener('click', passerCommande);
});

// Chaje kategori yo nan meni deroulan an
async function chargerCategories() {
  try {
    const { categories } = await api.get('/api/services/categories');
    const select = document.getElementById('filtre-categorie');
    categories.forEach((cat) => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      select.appendChild(option);
    });
  } catch (e) {
    // Pa grav si l echwe
  }
}

// Chaje sèvis yo selon rechèch ak filtraj
async function chargerServices() {
  const zone = document.getElementById('zone-services');
  const recherche = document.getElementById('recherche').value.trim();
  const categorie = document.getElementById('filtre-categorie').value;

  const params = new URLSearchParams();
  if (recherche) params.append('recherche', recherche);
  if (categorie) params.append('categorie', categorie);

  try {
    const { services } = await api.get('/api/services?' + params.toString());
    zone.innerHTML = '';

    if (services.length === 0) {
      zone.innerHTML = '<p class="text-center text-muted">Aucun service ne correspond à votre recherche.</p>';
      return;
    }

    services.forEach((s) => zone.appendChild(creerCarteService(s)));
  } catch (e) {
    zone.innerHTML = '<p class="text-center text-danger">Erreur lors du chargement des services.</p>';
  }
}

// Kreye kat yon sèvis (ak textContent pou done ki soti nan baz la)
function creerCarteService(s) {
  const col = document.createElement('div');
  col.className = 'col-md-6 col-lg-4';

  const carte = document.createElement('div');
  carte.className = 'carte-prix';

  const titre = document.createElement('h4');
  titre.textContent = s.nom_service;

  const categorie = document.createElement('span');
  categorie.className = 'badge bg-secondary mb-2';
  categorie.textContent = s.categorie || 'Général';

  const description = document.createElement('p');
  description.className = 'text-muted';
  description.textContent = s.description || '';

  const prix = document.createElement('div');
  prix.className = 'prix';
  prix.innerHTML = formaterPrix(s.prix) + '<span> / projet</span>';

  const bouton = document.createElement('button');
  bouton.className = 'btn btn-primaire w-100 mt-3';
  bouton.innerHTML = '<i class="bi bi-plus-circle me-2"></i>Sélectionner';
  bouton.addEventListener('click', () => basculerSelection(s, bouton));

  // Si sèvis la deja chwazi, montre eta a
  if (selection.has(s.id_service)) {
    marquerCommeSelectionne(bouton);
  }

  carte.appendChild(categorie);
  carte.appendChild(titre);
  carte.appendChild(description);
  carte.appendChild(prix);
  carte.appendChild(bouton);
  col.appendChild(carte);
  return col;
}

// Ajoute oswa retire yon sèvis nan seleksyon an
function basculerSelection(service, bouton) {
  if (selection.has(service.id_service)) {
    selection.delete(service.id_service);
    bouton.className = 'btn btn-primaire w-100 mt-3';
    bouton.innerHTML = '<i class="bi bi-plus-circle me-2"></i>Sélectionner';
  } else {
    selection.set(service.id_service, { nom: service.nom_service, prix: Number(service.prix) });
    marquerCommeSelectionne(bouton);
  }
  mettreAJourBaro();
}

function marquerCommeSelectionne(bouton) {
  bouton.className = 'btn btn-accent w-100 mt-3';
  bouton.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Sélectionné';
}

// Mete baro rezime a ajou (kantite ak total)
function mettreAJourBaro() {
  const baro = document.getElementById('baro-selection');
  const nb = selection.size;
  let total = 0;
  selection.forEach((v) => (total += v.prix));

  document.getElementById('nb-selection').textContent = nb;
  document.getElementById('total-selection').textContent = formaterPrix(total);
  baro.style.display = nb > 0 ? 'block' : 'none';
}

// Kreye kòmand la epi voye kliyan an sou paj peman an
async function passerCommande() {
  // Verifye si itilizatè a konekte
  const utilisateur = await chargerSession();
  if (!utilisateur) {
    alert('Veuillez vous connecter pour passer une commande.');
    window.location.href = '/signin.html?redirection=/pricing.html';
    return;
  }

  const services = Array.from(selection.keys()).map((id) => ({ id_service: id, quantite: 1 }));

  const { statut, donnees } = await api.post('/api/commandes', { services });
  if (statut === 201) {
    // Nou konsève id kòmand la pou paj peman an
    window.location.href = '/pay.html?commande=' + donnees.id_commande;
  } else {
    alert(donnees.message || 'Erreur lors de la création de la commande.');
  }
}
