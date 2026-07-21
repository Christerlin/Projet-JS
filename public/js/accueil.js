// Script paj akèy la — chaje temwayaj kliyan yo depi baz done a

document.addEventListener('DOMContentLoaded', chargerTemoignages);

async function chargerTemoignages() {
  const zone = document.getElementById('zone-temoignages');
  try {
    const rep = await fetch('/api/temoignages');
    if (!rep.ok) throw new Error();
    const { temoignages } = await rep.json();

    if (!temoignages || temoignages.length === 0) {
      zone.innerHTML = '<p class="text-center text-muted">Aucun témoignage pour le moment.</p>';
      return;
    }

    // Nou vide zòn nan anvan nou ranpli l ankò
    zone.innerHTML = '';
    temoignages.forEach((t) => {
      const col = document.createElement('div');
      col.className = 'col-md-6';

      const carte = document.createElement('div');
      carte.className = 'carte';

      // Etwal yo selon nòt la
      const etoiles = document.createElement('div');
      etoiles.className = 'etoiles mb-2';
      const note = Number(t.note) || 0;
      for (let i = 0; i < 5; i++) {
        const etoile = document.createElement('i');
        etoile.className = i < note ? 'bi bi-star-fill' : 'bi bi-star';
        etoiles.appendChild(etoile);
      }

      // Nou itilize textContent pou done ki soti nan baz la (evite XSS)
      const commentaire = document.createElement('p');
      commentaire.textContent = '« ' + t.commentaire + ' »';

      const auteur = document.createElement('p');
      auteur.className = 'fw-bold mb-0';
      auteur.textContent = t.prenom + ' ' + t.nom + (t.entreprise ? ' — ' + t.entreprise : '');

      carte.appendChild(etoiles);
      carte.appendChild(commentaire);
      carte.appendChild(auteur);
      col.appendChild(carte);
      zone.appendChild(col);
    });
  } catch (e) {
    zone.innerHTML = '<p class="text-center text-muted">Aucun témoignage pour le moment.</p>';
  }
}
