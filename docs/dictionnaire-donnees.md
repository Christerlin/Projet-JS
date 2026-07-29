# Dictionnaire de données

Base de données : `entreprise_info` (PostgreSQL)

## Table `utilisateur`

| Champ         | Type          | Contraintes                          | Description                       |
| ------------- | ------------- | ------------------------------------ | --------------------------------- |
| id_utilisateur | SERIAL       | Clé primaire                         | Identifiant unique                |
| nom           | VARCHAR(100)  | NOT NULL                             | Nom de famille                    |
| prenom        | VARCHAR(100)  | NOT NULL                             | Prénom                            |
| email         | VARCHAR(150)  | NOT NULL, UNIQUE                     | Adresse courriel (identifiant)    |
| mot_de_passe  | VARCHAR(255)  | NOT NULL                             | Mot de passe chiffré (bcrypt)     |
| telephone     | VARCHAR(30)   |                                      | Numéro de téléphone               |
| adresse       | VARCHAR(255)  |                                      | Adresse postale                   |
| role          | VARCHAR(20)   | NOT NULL, DEFAULT 'client'           | Rôle : `client` ou `admin`        |
| date_creation | TIMESTAMP     | NOT NULL, DEFAULT CURRENT_TIMESTAMP  | Date de création du compte        |
| statut        | VARCHAR(20)   | NOT NULL, DEFAULT 'actif'            | Statut : `actif` ou `inactif`     |

## Table `client`

| Champ         | Type          | Contraintes                          | Description                       |
| ------------- | ------------- | ------------------------------------ | --------------------------------- |
| id_client     | SERIAL        | Clé primaire                         | Identifiant unique du client      |
| id_utilisateur | INTEGER      | NOT NULL, UNIQUE, FK → utilisateur   | Référence à l'utilisateur         |
| entreprise    | VARCHAR(150)  |                                      | Nom de l'entreprise du client     |
| ville         | VARCHAR(100)  |                                      | Ville                             |
| pays          | VARCHAR(100)  |                                      | Pays                              |

## Table `administrateur`

| Champ         | Type          | Contraintes                          | Description                       |
| ------------- | ------------- | ------------------------------------ | --------------------------------- |
| id_admin      | SERIAL        | Clé primaire                         | Identifiant unique de l'admin     |
| id_utilisateur | INTEGER      | NOT NULL, UNIQUE, FK → utilisateur   | Référence à l'utilisateur         |
| fonction      | VARCHAR(100)  |                                      | Fonction de l'administrateur      |

## Table `service`

| Champ         | Type          | Contraintes                          | Description                       |
| ------------- | ------------- | ------------------------------------ | --------------------------------- |
| id_service    | SERIAL        | Clé primaire                         | Identifiant unique du service     |
| nom_service   | VARCHAR(150)  | NOT NULL                             | Nom du service                    |
| description   | TEXT          |                                      | Description du service            |
| prix          | NUMERIC(10,2) | NOT NULL, >= 0                       | Prix du service                   |
| categorie     | VARCHAR(100)  |                                      | Catégorie du service              |
| image         | VARCHAR(255)  |                                      | Chemin vers l'image               |
| statut        | VARCHAR(20)   | NOT NULL, DEFAULT 'actif'            | Statut : `actif` ou `inactif`     |

## Table `commande`

| Champ         | Type          | Contraintes                          | Description                       |
| ------------- | ------------- | ------------------------------------ | --------------------------------- |
| id_commande   | SERIAL        | Clé primaire                         | Identifiant unique de la commande |
| id_client     | INTEGER       | NOT NULL, FK → client                | Client qui passe la commande      |
| date_commande | TIMESTAMP     | NOT NULL, DEFAULT CURRENT_TIMESTAMP  | Date de la commande               |
| montant_total | NUMERIC(10,2) | NOT NULL, DEFAULT 0                  | Montant total de la commande      |
| statut        | VARCHAR(20)   | NOT NULL, DEFAULT 'en_attente'       | `en_attente`, `payee`, `annulee`  |

## Table `detail_commande`

| Champ         | Type          | Contraintes                          | Description                       |
| ------------- | ------------- | ------------------------------------ | --------------------------------- |
| id_detail     | SERIAL        | Clé primaire                         | Identifiant unique de la ligne    |
| id_commande   | INTEGER       | NOT NULL, FK → commande              | Commande associée                 |
| id_service    | INTEGER       | NOT NULL, FK → service               | Service commandé                  |
| quantite      | INTEGER       | NOT NULL, DEFAULT 1, > 0             | Quantité                          |
| prix          | NUMERIC(10,2) | NOT NULL, >= 0                       | Prix unitaire au moment de l'achat |

## Table `paiement`

| Champ         | Type          | Contraintes                          | Description                       |
| ------------- | ------------- | ------------------------------------ | --------------------------------- |
| id_paiement   | SERIAL        | Clé primaire                         | Identifiant unique du paiement    |
| id_commande   | INTEGER       | NOT NULL, UNIQUE, FK → commande      | Commande payée                    |
| montant       | NUMERIC(10,2) | NOT NULL, >= 0                       | Montant payé                      |
| mode_paiement | VARCHAR(50)   | NOT NULL, DEFAULT 'stripe'           | Mode de paiement                  |
| transaction_id | VARCHAR(255) |                                      | Identifiant de transaction Stripe |
| date_paiement | TIMESTAMP     | NOT NULL, DEFAULT CURRENT_TIMESTAMP  | Date du paiement                  |
| statut        | VARCHAR(20)   | NOT NULL, DEFAULT 'reussi'           | `reussi`, `echoue`, `rembourse`   |

## Table `contact`

| Champ         | Type          | Contraintes                          | Description                       |
| ------------- | ------------- | ------------------------------------ | --------------------------------- |
| id_contact    | SERIAL        | Clé primaire                         | Identifiant unique du message     |
| nom           | VARCHAR(100)  | NOT NULL                             | Nom de l'expéditeur               |
| prenom        | VARCHAR(100)  | NOT NULL                             | Prénom de l'expéditeur            |
| email         | VARCHAR(150)  | NOT NULL                             | Courriel de l'expéditeur          |
| telephone     | VARCHAR(30)   |                                      | Téléphone                         |
| sujet         | VARCHAR(200)  | NOT NULL                             | Sujet du message                  |
| message       | TEXT          | NOT NULL                             | Contenu du message                |
| date_message  | TIMESTAMP     | NOT NULL, DEFAULT CURRENT_TIMESTAMP  | Date d'envoi                      |

## Table `temoignage`

| Champ         | Type          | Contraintes                          | Description                       |
| ------------- | ------------- | ------------------------------------ | --------------------------------- |
| id_temoignage | SERIAL        | Clé primaire                         | Identifiant unique du témoignage  |
| id_client     | INTEGER       | NOT NULL, FK → client                | Client auteur                     |
| commentaire   | TEXT          | NOT NULL                             | Contenu du témoignage             |
| note          | SMALLINT      | ENTRE 1 ET 5                         | Note attribuée                    |
| date          | TIMESTAMP     | NOT NULL, DEFAULT CURRENT_TIMESTAMP  | Date du témoignage                |
