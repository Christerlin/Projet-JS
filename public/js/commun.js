// Fonksyon pataje pou tout paj yo : sesyon, mòd sonm, dekoneksyon

// Ti asistan pou rele API a fasilman
const api = {
  async get(url) {
    const rep = await fetch(url);
    return rep.json();
  },
  async post(url, corps) {
    const rep = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corps),
    });
    return { statut: rep.status, donnees: await rep.json() };
  },
  async put(url, corps) {
    const rep = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corps),
    });
    return { statut: rep.status, donnees: await rep.json() };
  },
  async supprimer(url) {
    const rep = await fetch(url, { method: 'DELETE' });
    return { statut: rep.status, donnees: await rep.json() };
  },
};

// Chèche itilizatè konekte a epi mete bar navigasyon an ajou
async function chargerSession() {
  try {
    const rep = await fetch('/api/auth/moi');
    if (rep.ok) {
      const { utilisateur } = await rep.json();
      return utilisateur;
    }
  } catch (e) {
    // Pa gen sesyon aktif
  }
  return null;
}

// Mete zòn koneksyon nan navbar la ajou selon eta a
async function mettreAJourNavbar() {
  const zone = document.getElementById('zone-auth');
  if (!zone) return;
  const utilisateur = await chargerSession();

  if (utilisateur) {
    const lienAdmin =
      utilisateur.role === 'admin'
        ? '<li><a class="dropdown-item" href="/admin.html"><i class="bi bi-speedometer2 me-2"></i>Administration</a></li>'
        : '<li><a class="dropdown-item" href="/tableau-bord.html"><i class="bi bi-person me-2"></i>Mon espace</a></li>';
    zone.innerHTML = `
      <div class="dropdown">
        <button class="btn btn-primaire dropdown-toggle" data-bs-toggle="dropdown">
          <i class="bi bi-person-circle me-1"></i>${utilisateur.prenom}
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          ${lienAdmin}
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="#" id="lien-deconnexion"><i class="bi bi-box-arrow-right me-2"></i>Déconnexion</a></li>
        </ul>
      </div>`;
    document.getElementById('lien-deconnexion').addEventListener('click', async (e) => {
      e.preventDefault();
      await fetch('/api/auth/deconnexion', { method: 'POST' });
      window.location.href = '/';
    });
  } else {
    zone.innerHTML = `<a class="btn btn-primaire" href="/signin.html"><i class="bi bi-box-arrow-in-right me-1"></i>Sign In</a>`;
  }
}

// -------------------- Mòd sonm --------------------
function initialiserTheme() {
  const themeEnregistre = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', themeEnregistre);
  const bouton = document.getElementById('btn-theme');
  if (bouton) {
    mettreAJourIconeTheme(themeEnregistre);
    bouton.addEventListener('click', () => {
      const actuel = document.documentElement.getAttribute('data-theme');
      const nouveau = actuel === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nouveau);
      localStorage.setItem('theme', nouveau);
      mettreAJourIconeTheme(nouveau);
    });
  }
}

function mettreAJourIconeTheme(theme) {
  const bouton = document.getElementById('btn-theme');
  if (bouton) {
    bouton.innerHTML = theme === 'dark' ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon-stars"></i>';
  }
}

// Fòmate yon montan an dola
function formaterPrix(montant) {
  return Number(montant).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' $';
}

// Lanse tout bagay lè paj la chaje
document.addEventListener('DOMContentLoaded', () => {
  initialiserTheme();
  mettreAJourNavbar();
});
