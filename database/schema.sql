-- =====================================================================
-- Script de création de la base de données
-- Site web de gestion d'une entreprise informatique
-- SGBD : PostgreSQL
-- =====================================================================

-- Nou efase tab yo si yo deja egziste pou n ka rekreye baz la pwòp
DROP TABLE IF EXISTS temoignage CASCADE;
DROP TABLE IF EXISTS paiement CASCADE;
DROP TABLE IF EXISTS detail_commande CASCADE;
DROP TABLE IF EXISTS commande CASCADE;
DROP TABLE IF EXISTS contact CASCADE;
DROP TABLE IF EXISTS service CASCADE;
DROP TABLE IF EXISTS client CASCADE;
DROP TABLE IF EXISTS administrateur CASCADE;
DROP TABLE IF EXISTS utilisateur CASCADE;

-- ---------------------------------------------------------------------
-- Tab Utilisateur : tout moun ki gen yon kont (kliyan oswa administratè)
-- ---------------------------------------------------------------------
CREATE TABLE utilisateur (
    id_utilisateur  SERIAL PRIMARY KEY,
    nom             VARCHAR(100) NOT NULL,
    prenom          VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe    VARCHAR(255) NOT NULL,      -- Chiffre ak bcrypt
    telephone       VARCHAR(30),
    adresse         VARCHAR(255),
    role            VARCHAR(20) NOT NULL DEFAULT 'client'
                    CHECK (role IN ('client', 'admin')),
    date_creation   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    statut          VARCHAR(20) NOT NULL DEFAULT 'actif'
                    CHECK (statut IN ('actif', 'inactif'))
);

-- ---------------------------------------------------------------------
-- Tab Client : enfòmasyon anplis pou yon itilizatè ki se yon kliyan
-- ---------------------------------------------------------------------
CREATE TABLE client (
    id_client       SERIAL PRIMARY KEY,
    id_utilisateur  INTEGER NOT NULL UNIQUE
                    REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    entreprise      VARCHAR(150),
    ville           VARCHAR(100),
    pays            VARCHAR(100)
);

-- ---------------------------------------------------------------------
-- Tab Administrateur : enfòmasyon anplis pou yon itilizatè administratè
-- ---------------------------------------------------------------------
CREATE TABLE administrateur (
    id_admin        SERIAL PRIMARY KEY,
    id_utilisateur  INTEGER NOT NULL UNIQUE
                    REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    fonction        VARCHAR(100)
);

-- ---------------------------------------------------------------------
-- Tab Service : sèvis antrepriz la ofri
-- ---------------------------------------------------------------------
CREATE TABLE service (
    id_service      SERIAL PRIMARY KEY,
    nom_service     VARCHAR(150) NOT NULL,
    description     TEXT,
    prix            NUMERIC(10, 2) NOT NULL CHECK (prix >= 0),
    categorie       VARCHAR(100),
    image           VARCHAR(255),
    statut          VARCHAR(20) NOT NULL DEFAULT 'actif'
                    CHECK (statut IN ('actif', 'inactif'))
);

-- ---------------------------------------------------------------------
-- Tab Commande : yon kliyan ka pase plizyè kòmand
-- ---------------------------------------------------------------------
CREATE TABLE commande (
    id_commande     SERIAL PRIMARY KEY,
    id_client       INTEGER NOT NULL
                    REFERENCES client(id_client) ON DELETE CASCADE,
    date_commande   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    montant_total   NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (montant_total >= 0),
    statut          VARCHAR(20) NOT NULL DEFAULT 'en_attente'
                    CHECK (statut IN ('en_attente', 'payee', 'annulee'))
);

-- ---------------------------------------------------------------------
-- Tab Détail_Commande : sèvis ki nan yon kòmand (relasyon plizyè-a-plizyè)
-- ---------------------------------------------------------------------
CREATE TABLE detail_commande (
    id_detail       SERIAL PRIMARY KEY,
    id_commande     INTEGER NOT NULL
                    REFERENCES commande(id_commande) ON DELETE CASCADE,
    id_service      INTEGER NOT NULL
                    REFERENCES service(id_service) ON DELETE RESTRICT,
    quantite        INTEGER NOT NULL DEFAULT 1 CHECK (quantite > 0),
    prix            NUMERIC(10, 2) NOT NULL CHECK (prix >= 0)
);

-- ---------------------------------------------------------------------
-- Tab Paiement : yon kòmand gen yon peman
-- ---------------------------------------------------------------------
CREATE TABLE paiement (
    id_paiement     SERIAL PRIMARY KEY,
    id_commande     INTEGER NOT NULL UNIQUE
                    REFERENCES commande(id_commande) ON DELETE CASCADE,
    montant         NUMERIC(10, 2) NOT NULL CHECK (montant >= 0),
    mode_paiement   VARCHAR(50) NOT NULL DEFAULT 'stripe',
    transaction_id  VARCHAR(255),
    date_paiement   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    statut          VARCHAR(20) NOT NULL DEFAULT 'reussi'
                    CHECK (statut IN ('reussi', 'echoue', 'rembourse'))
);

-- ---------------------------------------------------------------------
-- Tab Contact : mesaj ki soti nan fòm kontak la
-- ---------------------------------------------------------------------
CREATE TABLE contact (
    id_contact      SERIAL PRIMARY KEY,
    nom             VARCHAR(100) NOT NULL,
    prenom          VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL,
    telephone       VARCHAR(30),
    sujet           VARCHAR(200) NOT NULL,
    message         TEXT NOT NULL,
    date_message    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tab Témoignage : avi kliyan yo kite (opsyonèl)
-- ---------------------------------------------------------------------
CREATE TABLE temoignage (
    id_temoignage   SERIAL PRIMARY KEY,
    id_client       INTEGER NOT NULL
                    REFERENCES client(id_client) ON DELETE CASCADE,
    commentaire     TEXT NOT NULL,
    note            SMALLINT CHECK (note BETWEEN 1 AND 5),
    date            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Endèks pou akselere rekèt ki pi frekan yo
-- ---------------------------------------------------------------------
CREATE INDEX idx_commande_client ON commande(id_client);
CREATE INDEX idx_detail_commande ON detail_commande(id_commande);
CREATE INDEX idx_paiement_commande ON paiement(id_commande);
CREATE INDEX idx_temoignage_client ON temoignage(id_client);
