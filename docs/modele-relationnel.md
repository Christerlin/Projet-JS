# Modèle relationnel

Les clés primaires sont **soulignées** (indiquées par `PK`), les clés étrangères par `FK`.

```
utilisateur (PK id_utilisateur, nom, prenom, email, mot_de_passe, telephone,
             adresse, role, date_creation, statut)

client (PK id_client, FK id_utilisateur, entreprise, ville, pays)

administrateur (PK id_admin, FK id_utilisateur, fonction)

service (PK id_service, nom_service, description, prix, categorie, image, statut)

commande (PK id_commande, FK id_client, date_commande, montant_total, statut)

detail_commande (PK id_detail, FK id_commande, FK id_service, quantite, prix)

paiement (PK id_paiement, FK id_commande, montant, mode_paiement,
          transaction_id, date_paiement, statut)

contact (PK id_contact, nom, prenom, email, telephone, sujet, message, date_message)

temoignage (PK id_temoignage, FK id_client, commentaire, note, date)
```

## Contraintes référentielles

- `client.id_utilisateur` → `utilisateur.id_utilisateur`
- `administrateur.id_utilisateur` → `utilisateur.id_utilisateur`
- `commande.id_client` → `client.id_client`
- `detail_commande.id_commande` → `commande.id_commande`
- `detail_commande.id_service` → `service.id_service`
- `paiement.id_commande` → `commande.id_commande` (relation 1..1)
- `temoignage.id_client` → `client.id_client`

## Cardinalités

- Un **utilisateur** est soit un **client**, soit un **administrateur** (1..1).
- Un **client** peut passer plusieurs **commandes** (1..N).
- Une **commande** contient plusieurs **services** via `detail_commande` (N..M).
- Une **commande** possède un seul **paiement** (1..1).
- Un **client** peut laisser plusieurs **témoignages** (1..N).
