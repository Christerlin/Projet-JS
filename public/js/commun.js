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
          <i class="bi bi-person-circle me-1"></i><span id="nom-utilisateur"></span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          ${lienAdmin}
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="#" id="lien-deconnexion"><i class="bi bi-box-arrow-right me-2"></i>Déconnexion</a></li>
        </ul>
      </div>`;
    // Prenon an soti nan sa itilizatè a tape, donk li pase pa textContent.
    // Si nou te mete l dirèkteman nan innerHTML, yon prenon ki gen balize
    // HTML ladan l t ap egzekite nan navigatè a.
    document.getElementById('nom-utilisateur').textContent = utilisateur.prenom;
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

// -------------------- Meni mobil --------------------
function initialiserMenuMobile() {
  const bouton = document.getElementById('boutonHamburger');
  const menu = document.getElementById('menu-principal');
  if (!bouton || !menu) return;

  bouton.addEventListener('click', () => {
    const ouvri = menu.classList.toggle('ouvri');
    bouton.classList.toggle('ouvri', ouvri);
    bouton.setAttribute('aria-expanded', String(ouvri));
  });

  // Lè yon lyen klike, nou fèmen meni an pou l pa rete ouvè
  menu.querySelectorAll('a').forEach((lien) => {
    lien.addEventListener('click', () => {
      menu.classList.remove('ouvri');
      bouton.classList.remove('ouvri');
      bouton.setAttribute('aria-expanded', 'false');
    });
  });
}

// -------------------- Chan telefòn --------------------
// Endikatif +509 la deja parèt akote chan an, donk moun nan tape 8 chif
// sèlman. Nou netwaye sa l tape a lamenm pou lèt ak siy pa antre ditou.
function initialiserChampsTelephone() {
  document.querySelectorAll('input[name="telephone"]').forEach((champ) => {
    champ.addEventListener('input', () => {
      const propre = champ.value.replace(/\D/g, '').slice(0, 8);
      if (champ.value !== propre) {
        champ.value = propre;
      }
    });
  });
}

// -------------------- Bouton pou montre modpas la --------------------
function initialiserBoutonsOeil() {
  document.querySelectorAll('.btn-oeil').forEach((bouton) => {
    const champ = bouton.parentElement.querySelector('input');
    if (!champ) return;

    bouton.addEventListener('click', () => {
      const montre = champ.type === 'password';
      champ.type = montre ? 'text' : 'password';
      bouton.querySelector('i').className = montre ? 'bi bi-eye-slash' : 'bi bi-eye';
      bouton.setAttribute('aria-label', montre ? 'Masquer le mot de passe' : 'Afficher le mot de passe');
    });
  });
}

// Retire endikatif la ak espas yo pou yon nimewo ki soti nan baz la ka
// parèt nan chan an kòm 8 chif tou senp.
function telephoneLocal(valeur) {
  const chiffres = String(valeur || '').replace(/\D/g, '');
  if (chiffres.length === 11 && chiffres.startsWith('509')) {
    return chiffres.slice(3);
  }
  return chiffres.slice(-8);
}

// Fòmate yon montan an dola
function formaterPrix(montant) {
  return Number(montant).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' $';
}

// Lanse tout bagay lè paj la chaje
document.addEventListener('DOMContentLoaded', () => {
  initialiserTheme();
  mettreAJourNavbar();
  initialiserMenuMobile();
  initialiserChampsTelephone();
  initialiserBoutonsOeil();
});
