# NovaTech - Site web de gestion d'une entreprise informatique

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
| Factures       | PDFKit                             |

## Fonctionnalités

- 6 pages obligatoires : Accueil, À propos, Tarifs, Contact, Connexion, Paiement.
- Deux rôles : Administrateur et Client.
- Inscription, connexion, déconnexion et gestion de profil.
- Mots de passe hachés avec bcrypt, minimum 8 caractères vérifié côté serveur.
- Sélection de plusieurs services et création de commandes.
- Espace client : consultation des services achetés et historique des paiements.
- Paiement en ligne sécurisé avec Stripe.
- Formulaire de contact enregistré dans la base de données.
- Panneau d'administration : gestion des services, utilisateurs, paiements et messages.
- Génération de factures PDF téléchargeables depuis l'espace client.

### Bonus réalisés

| Bonus | État |
| ----- | ---- |
| Tableau de bord administrateur avec statistiques | Fait |
| Recherche de services | Fait |
| Filtrage par catégorie | Fait |
| Avis et évaluations des clients | Fait |
| Génération de factures PDF | Fait |
| Mode sombre | Fait |
| Site entièrement responsive | Fait |
| Tableau de bord avec graphiques (Chart.js) | Fait |
| Notifications en temps réel | Fait |
| Envoi d'e-mails de confirmation | Non réalisé |

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
├── utils/facture-pdf.js    # Konstwiksyon faktir PDF yo
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

## Déploiement

Le projet fonctionne sur tout hébergeur qui exécute un processus Node en continu
(Render, Railway, Fly.io) avec une base PostgreSQL gérée (Neon, Supabase).

Le fichier [`render.yaml`](render.yaml) décrit le service prêt à l'emploi pour
Render : depuis le tableau de bord, choisissez **New > Blueprint**, sélectionnez
ce dépôt, et Render lira ce fichier. Il demandera les trois secrets et générera
lui-même `SESSION_SECRET`.

Variables d'environnement à définir sur l'hébergeur :

| Variable | Valeur |
| -------- | ------ |
| `DATABASE_URL` | Chaîne de connexion fournie par la base gérée |
| `SESSION_SECRET` | Une chaîne aléatoire longue |
| `STRIPE_SECRET_KEY` | Clé `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | Clé `pk_test_...` |
| `NODE_ENV` | `production` |

Quand `DATABASE_URL` est présente, elle remplace les cinq variables `DB_*` et le
SSL est activé automatiquement. Initialisez ensuite le schéma une seule fois :

```bash
DATABASE_URL="..." npm run db:init
```

Le serveur appelle `app.set('trust proxy', 1)` : sans cela, le cookie de session
marqué `secure` ne serait jamais transmis derrière le proxy HTTPS de
l'hébergeur, et la connexion échouerait silencieusement.

Gardez les clés Stripe **de test** en production : la carte de démonstration
continue de fonctionner et aucune transaction réelle n'est possible.

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
