-- =====================================================================
-- Donnees d'exemple (jeu de test) pour la base de donnees
-- Site web de gestion d'une entreprise informatique
-- =====================================================================
-- NÒT: modpas yo chiffre ak bcrypt.
--   admin@entreprise.ht  -> admin123
--   jean@example.com     -> client123

-- ---------------------------------------------------------------------
-- Itilizatè yo
-- ---------------------------------------------------------------------
INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, telephone, adresse, role) VALUES
('Admin', 'Système', 'admin@entreprise.ht', '$2a$10$9iS7SrnzFSKkLDyoswJBh.KG6xadAVFmkOZorzvOFwgRlys/W7n1a', '+509 3000 0000', 'Limonade, Haïti', 'admin'),
('Pierre', 'Jean', 'jean@example.com', '$2a$10$R5vQQwLW4552DX1hAnYv1uXzG1.DpV2vJI9obczGvwYxPb1eFXO1m', '+509 3111 1111', 'Cap-Haïtien, Haïti', 'client'),
('Louis', 'Marie', 'marie@example.com', '$2a$10$R5vQQwLW4552DX1hAnYv1uXzG1.DpV2vJI9obczGvwYxPb1eFXO1m', '+509 3222 2222', 'Port-au-Prince, Haïti', 'client'),
('Exantus', 'David', 'david@example.com', '$2a$10$R5vQQwLW4552DX1hAnYv1uXzG1.DpV2vJI9obczGvwYxPb1eFXO1m', '+509 3333 3333', 'Limonade, Haïti', 'client');

-- Lyen administratè a
INSERT INTO administrateur (id_utilisateur, fonction) VALUES
(1, 'Gestionnaire principal');

-- Lyen kliyan yo
INSERT INTO client (id_utilisateur, entreprise, ville, pays) VALUES
(2, 'TechPlus SA', 'Cap-Haïtien', 'Haïti'),
(3, 'InfoService', 'Port-au-Prince', 'Haïti'),
(4, 'Compagnie X', 'Limonade', 'Haïti');

-- ---------------------------------------------------------------------
-- Sèvis yo (baze sou tablo egzanp nan konsiy la)
-- ---------------------------------------------------------------------
INSERT INTO service (nom_service, description, prix, categorie) VALUES
('Développement Web', 'Création de site web moderne et responsive', 800.00, 'Développement'),
('Base de données', 'Conception et optimisation de bases de données SQL', 500.00, 'Base de données'),
('Sécurité informatique', 'Audit de sécurité et protection des systèmes', 700.00, 'Sécurité'),
('Consultation technique', 'Assistance et conseil en informatique', 300.00, 'Consultation'),
('Développement logiciel', 'Programmation de logiciels sur mesure', 1200.00, 'Développement');

-- ---------------------------------------------------------------------
-- Yon kòmand egzanp ki deja peye (pou tès panel admin)
-- ---------------------------------------------------------------------
INSERT INTO commande (id_client, montant_total, statut) VALUES
(1, 1300.00, 'payee');

INSERT INTO detail_commande (id_commande, id_service, quantite, prix) VALUES
(1, 1, 1, 800.00),
(1, 2, 1, 500.00);

INSERT INTO paiement (id_commande, montant, mode_paiement, transaction_id, statut) VALUES
(1, 1300.00, 'stripe', 'pi_exemple_123456', 'reussi');

-- ---------------------------------------------------------------------
-- Temwayaj yo (pou paj HOME)
-- ---------------------------------------------------------------------
INSERT INTO temoignage (id_client, commentaire, note) VALUES
(1, 'Un service exceptionnel et une équipe très professionnelle.', 5),
(2, 'Notre site web a transformé notre présence en ligne. Merci !', 5),
(3, 'La sécurité de nos données est désormais assurée. Merci pour votre accompagnement de qualité !', 5);

-- ---------------------------------------------------------------------
-- Mesaj kontak egzanp
-- ---------------------------------------------------------------------
INSERT INTO contact (nom, prenom, email, telephone, sujet, message) VALUES
('Toussaint', 'Paul', 'paul@example.com', '+509 3444 4444', 'Demande de devis', 'Bonjour, je souhaite un devis pour un site e-commerce.');
