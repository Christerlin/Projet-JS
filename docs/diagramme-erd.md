# Diagramme entité-association (ERD)

Diagramme au format Mermaid. Il s'affiche directement sur GitHub et dans la plupart
des éditeurs Markdown.

```mermaid
erDiagram
    UTILISATEUR ||--o| CLIENT : "est"
    UTILISATEUR ||--o| ADMINISTRATEUR : "est"
    CLIENT ||--o{ COMMANDE : "passe"
    COMMANDE ||--|{ DETAIL_COMMANDE : "contient"
    SERVICE ||--o{ DETAIL_COMMANDE : "figure dans"
    COMMANDE ||--|| PAIEMENT : "possède"
    CLIENT ||--o{ TEMOIGNAGE : "laisse"

    UTILISATEUR {
        int id_utilisateur PK
        string nom
        string prenom
        string email UK
        string mot_de_passe
        string telephone
        string adresse
        string role
        timestamp date_creation
        string statut
    }

    CLIENT {
        int id_client PK
        int id_utilisateur FK
        string entreprise
        string ville
        string pays
    }

    ADMINISTRATEUR {
        int id_admin PK
        int id_utilisateur FK
        string fonction
    }

    SERVICE {
        int id_service PK
        string nom_service
        string description
        decimal prix
        string categorie
        string image
        string statut
    }

    COMMANDE {
        int id_commande PK
        int id_client FK
        timestamp date_commande
        decimal montant_total
        string statut
    }

    DETAIL_COMMANDE {
        int id_detail PK
        int id_commande FK
        int id_service FK
        int quantite
        decimal prix
    }

    PAIEMENT {
        int id_paiement PK
        int id_commande FK
        decimal montant
        string mode_paiement
        string transaction_id
        timestamp date_paiement
        string statut
    }

    CONTACT {
        int id_contact PK
        string nom
        string prenom
        string email
        string telephone
        string sujet
        string message
        timestamp date_message
    }

    TEMOIGNAGE {
        int id_temoignage PK
        int id_client FK
        string commentaire
        int note
        timestamp date
    }
```

> Note : la table `CONTACT` n'a aucune relation directe : elle enregistre les messages
> envoyés depuis le formulaire de contact, y compris par des visiteurs non inscrits.
