// Script fòm kontak la — voye mesaj la sou API a

document.getElementById('form-contact').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const zoneAlerte = document.getElementById('message-alerte');

  // Nou rasanble done fòm yo nan yon objè
  const donnees = {
    nom: form.nom.value.trim(),
    prenom: form.prenom.value.trim(),
    email: form.email.value.trim(),
    telephone: form.telephone.value.trim(),
    sujet: form.sujet.value.trim(),
    message: form.message.value.trim(),
  };

  const { statut, donnees: reponse } = await api.post('/api/contact', donnees);

  if (statut === 201) {
    afficherAlerte(zoneAlerte, 'success', reponse.message);
    form.reset();
  } else {
    afficherAlerte(zoneAlerte, 'danger', reponse.message || 'Une erreur est survenue.');
  }
});

// Afiche yon mesaj alèt Bootstrap (tèks la mete ak textContent)
function afficherAlerte(zone, type, texte) {
  zone.innerHTML = '';
  const alerte = document.createElement('div');
  alerte.className = 'alert alert-' + type;
  alerte.textContent = texte;
  zone.appendChild(alerte);
}
