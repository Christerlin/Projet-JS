# TechnoServ - Site web de gestion d'une entreprise informatique

Application web moderne pour présenter les activités d'une entreprise informatique, gérer
les clients, les services et les paiements en ligne.

> Projet final - Université d'État d'Haïti, Campus Henry Christophe de Limonade (FSG).

## Technologies

| Catégorie      | Technologie                        |
| -------------- | ---------------------------------- |
| Front-end      | HTML5, CSS3, JavaScript, Bootstrap |
| Back-end       | Node.js, Express.js                |
| Base de données | PostgreSQL                        |
| Paiement       | Stripe                             |

## Fonctionnalités

- 6 pages obligatoires : Accueil, À propos, Tarifs, Contact, Connexion, Paiement.
- Deux rôles : Administrateur et Client.
- Inscription, connexion, déconnexion et gestion de profil.
- Sélection de plusieurs services et création de commandes.
- Paiement en ligne sécurisé avec Stripe.
- Formulaire de contact enregistré dans la base de données.
- Panneau d'administration : gestion des services, utilisateurs, paiements et messages.
- Bonus : recherche de services, filtrage par catégorie, avis clients, mode sombre,
  tableau de bord avec graphiques (Chart.js), site responsive.

## Estrikti pwojè a

```
js/
├── config/db.js            # Koneksyon PostgreSQL
├── database/
│   ├── schema.sql          # Kreyasyon tab yo
│   ├── seed.sql            # Done egzanp
│   └── init.js             # Script inisyalizasyon otomatik
├── middleware/auth.js      # Pwoteksyon routes (session + wòl)
├── routes/                 # Routes API yo (auth, services, contact, commandes, paiement, admin, temoignages)
├── public/                 # Front-end (HTML, CSS, JS)
├── docs/                   # Diksyonè done, modèl relasyonèl, ERD
├── server.js               # Pwen antre serveur la
└── package.json
```

## Installation

### 1. Prérequis

- Node.js (version 18 ou plus récente)
- PostgreSQL (version 14 ou plus récente)

### 2. Enstale depandans yo

```bash
npm install
```

### 3. Konfigirasyon anviwònman an

Kopye `.env.example` nan yon fichye `.env` epi ranpli valè yo :

```bash
cp .env.example .env
```

Mete kle Stripe test ou yo (`sk_test_...` ak `pk_test_...`) ansanm ak enfòmasyon
koneksyon PostgreSQL ou yo.

### 4. Inisyalize baz done a

```bash
npm run db:init
```

Sa a kreye baz done a, tout tab yo epi li chaje done egzanp yo.

### 5. Lanse serveur la

```bash
npm start
```

Sit la ap disponib sou `http://localhost:3000`.

## Comptes de démonstration

| Rôle          | Courriel              | Mot de passe |
| ------------- | --------------------- | ------------ |
| Administrateur | admin@entreprise.ht  | admin123     |
| Client        | jean@example.com      | client123    |

## Paiement de test (Stripe)

En mode test, utilisez la carte : **4242 4242 4242 4242**, une date future et
n'importe quel CVC.

## Livrables

Les documents de conception se trouvent dans le dossier [`docs/`](docs/) :

- Dictionnaire de données
- Modèle relationnel
- Diagramme entité-association (ERD)
- Script SQL : [`database/schema.sql`](database/schema.sql)
