// Script paj akèy la — chaje temwayaj kliyan yo depi baz done a

document.addEventListener('DOMContentLoaded', chargerTemoignages);

async function chargerTemoignages() {
  const zone = document.getElementById('zone-temoignages');
  if (!zone) return;

  try {
    const rep = await fetch('/api/temoignages');
    if (!rep.ok) throw new Error('Repons API a pa bon');
    const { temoignages } = await rep.json();

    if (!temoignages || temoignages.length === 0) {
      afficherMessageVide(zone);
      return;
    }

    // Nou vide zòn nan anvan nou ranpli l ankò
    zone.innerHTML = '';
    temoignages.forEach((t) => zone.appendChild(construireCarte(t)));
  } catch (e) {
    afficherMessageVide(zone);
  }
}

// Yon sèl kat temwayaj. Nou itilize textContent pou done ki soti nan
// baz la, konsa yon kòmantè ki gen HTML ladan l pa ka lanse okenn kòd.
function construireCarte(t) {
  const col = document.createElement('div');
  col.className = 'col-md-6 col-lg-4';

  const carte = document.createElement('div');
  carte.className = 'carte-temoignage text-center';

  const avatar = document.createElement('div');
  avatar.className = 'avatar-client';
  avatar.textContent = initiales(t.prenom, t.nom);

  // Etwal yo selon nòt la
  const etoiles = document.createElement('div');
  etoiles.className = 'etoiles';
  const note = Number(t.note) || 0;
  for (let i = 0; i < 5; i++) {
    const etoile = document.createElement('i');
    etoile.className = i < note ? 'bi bi-star-fill' : 'bi bi-star';
    etoiles.appendChild(etoile);
  }

  const commentaire = document.createElement('p');
  commentaire.className = 'texte-temoignage';
  commentaire.textContent = '« ' + t.commentaire + ' »';

  const nom = document.createElement('h5');
  nom.textContent = (t.prenom || '') + ' ' + (t.nom || '');

  carte.appendChild(avatar);
  carte.appendChild(etoiles);
  carte.appendChild(commentaire);
  carte.appendChild(nom);

  if (t.entreprise) {
    const poste = document.createElement('span');
    poste.className = 'poste';
    poste.textContent = t.entreprise;
    carte.appendChild(poste);
  }

  col.appendChild(carte);
  return col;
}

// De premye lèt yo pou ranpli won avatar la
function initiales(prenom, nom) {
  const p = (prenom || '').trim().charAt(0);
  const n = (nom || '').trim().charAt(0);
  return (p + n).toUpperCase() || '?';
}

function afficherMessageVide(zone) {
  zone.innerHTML = '<p class="text-center text-muted">Aucun témoignage pour le moment.</p>';
}
