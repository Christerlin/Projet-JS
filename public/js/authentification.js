// Script paj koneksyon/enskripsyon an

// Si gen yon paramèt "redirection" nan URL la, nou sonje l
const parametres = new URLSearchParams(window.location.search);
const redirection = parametres.get('redirection') || '/';

// -------------------- Koneksyon --------------------
document.getElementById('form-connexion').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const zone = document.getElementById('message-alerte');

  const { statut, donnees } = await api.post('/api/auth/connexion', {
    email: form.email.value.trim(),
    mot_de_passe: form.mot_de_passe.value,
  });

  if (statut === 200) {
    // Redirije selon wòl la : admin sou panel la, kliyan sou paj sib la
    if (donnees.utilisateur.role === 'admin') {
      window.location.href = '/admin.html';
    } else {
      window.location.href = redirection;
    }
  } else {
    afficherAlerte(zone, 'danger', donnees.message || 'Connexion échouée.');
  }
});

// -------------------- Enskripsyon --------------------
document.getElementById('form-inscription').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const zone = document.getElementById('message-alerte');

  const { statut, donnees } = await api.post('/api/auth/inscription', {
    nom: form.nom.value.trim(),
    prenom: form.prenom.value.trim(),
    email: form.email.value.trim(),
    mot_de_passe: form.mot_de_passe.value,
    telephone: form.telephone.value.trim(),
    entreprise: form.entreprise.value.trim(),
    ville: form.ville.value.trim(),
  });

  if (statut === 201) {
    afficherAlerte(zone, 'success', 'Compte créé avec succès. Vous pouvez maintenant vous connecter.');
    form.reset();
  } else {
    afficherAlerte(zone, 'danger', donnees.message || 'Inscription échouée.');
  }
});

// Afiche yon alèt (tèks mete ak textContent pou sekirite)
function afficherAlerte(zone, type, texte) {
  zone.innerHTML = '';
  const alerte = document.createElement('div');
  alerte.className = 'alert alert-' + type;
  alerte.textContent = texte;
  zone.appendChild(alerte);
  zone.scrollIntoView({ behavior: 'smooth' });
}
