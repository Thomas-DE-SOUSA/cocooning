# Décisions Couple

Le registre unique des décisions du domaine `couple`, dans l'ordre chronologique. Les fichiers sont rangés par module, avec les mêmes noms que le code.

- Un fichier par décision, nommé `NNNN-slug.md`, créé depuis `docs/templates/decision.md`. Nature (métier, technique, produit) et statut (proposée, acceptée, remplacée, rejetée) : `docs/CLAUDE.md`, section « Décisions ».
- Le numéro est unique pour tout le domaine : on prend le suivant de ce registre, quel que soit le module.
- Rangement : `<contexte>/<sous-module>/` pour un sous-module, `<contexte>/` pour une décision qui en touche plusieurs, la racine pour une décision qui touche plusieurs contextes.
- Une décision acceptée ne se modifie plus : une remise en cause donne une nouvelle décision qui remplace l'ancienne.
- Les décisions 0001 à 0012 sont les décisions fondatrices reprises de Malta ([plateforme 0010](../../platform/decisions/0010-numerotation-adr-fondatrices.md)) : validées par le propriétaire le 2026-11-23, la 0012 comme principes seulement.

| N° | Module | Décision | Nature | Statut | Date | Validé par |
|---|---|---|---|---|---|---|
| 0001 | transverse | [Mocks automatiques interdits](0001-mocks-automatiques-interdits.md) | technique | acceptée | 2026-11-23 | Thomas De Sousa |
| 0002 | transverse | [Enums en objets `as const`](0002-enums-as-const.md) | technique | acceptée | 2026-11-23 | Thomas De Sousa |
| 0003 | transverse | [Identifiants tirés par `Uuid.generateValue()`](0003-identifiants-uuid-generate-value.md) | technique | acceptée | 2026-11-23 | Thomas De Sousa |
| 0004 | transverse | [Nom d'un événement en littéral sur sa classe](0004-noms-evenements-litteral.md) | technique | acceptée | 2026-11-23 | Thomas De Sousa |
| 0005 | transverse | [Les domain services ne sont pas des providers](0005-domain-services-hors-providers.md) | technique | acceptée | 2026-11-23 | Thomas De Sousa |
| 0006 | transverse | [Les guard services sont des providers injectables](0006-guard-services-providers.md) | technique | acceptée | 2026-11-23 | Thomas De Sousa |
| 0007 | transverse | [Une échelle de gravité à trois niveaux pour les reviews](0007-echelle-gravite-review.md) | technique | acceptée | 2026-11-23 | Thomas De Sousa |
| 0008 | frontend | [Taille d'un composant React jusqu'à 125 lignes](frontend/0008-taille-composant-react.md) | technique | acceptée | 2026-11-23 | Thomas De Sousa |
| 0009 | frontend | [Traduction autorisée dans les vues](frontend/0009-use-translation-dans-les-vues.md) | technique | acceptée | 2026-11-23 | Thomas De Sousa |
| 0010 | frontend | [Une seule façon d'afficher une erreur serveur](frontend/0010-affichage-erreur-serveur.md) | technique | acceptée | 2026-11-23 | Thomas De Sousa |
| 0011 | frontend | [La PWA est rangée par fonctionnalité](frontend/0011-pwa-rangee-par-fonctionnalite.md) | technique | acceptée | 2026-11-23 | Thomas De Sousa |
| 0012 | frontend | [Principes de l'observabilité frontend](frontend/0012-observabilite-frontend-principes.md) | technique | acceptée | 2026-11-23 | Thomas De Sousa |
| 0013 | transverse | [Le premier lot : notes, agenda partagé et messages](0013-premier-lot.md) | produit | acceptée | 2026-11-22 | Thomas De Sousa |
| 0014 | transverse | [La photo instantanée, dans la PWA](0014-photo-instantanee.md) | produit | acceptée | 2026-11-22 | Thomas De Sousa |
| 0015 | transverse | [Nos envies d'abord, enrichies ensuite](0015-enrichissement-des-envies.md) | produit | acceptée | 2026-11-22 | Thomas De Sousa |
| 0016 | transverse | [Édition des notes à deux en temps réel](0016-edition-des-notes-en-temps-reel.md) | technique | acceptée | 2026-11-22 | Thomas De Sousa |
| 0017 | transverse | [Le couple est l'objet pivot, sans contexte composite](0017-couple-objet-pivot.md) | technique | acceptée | 2026-11-22 | Thomas De Sousa |
| 0018 | transverse | [Portée des données par `coupleId` et `ownerId`, sans multi-tenant](0018-portee-par-couple-et-proprietaire.md) | technique | acceptée | 2026-11-22 | Thomas De Sousa |
| 0019 | transverse | [Authentification locale, deux comptes](0019-authentification-locale.md) | technique | acceptée | 2026-11-22 | Thomas De Sousa |
| 0020 | transverse | [Statut HTTP des exceptions par une table dans le filtre](0020-statut-http-des-exceptions.md) | technique | acceptée | 2026-11-22 | Thomas De Sousa |
| 0021 | transverse | [Outbox PostgreSQL relayée dans le processus de l'API](0021-outbox-postgresql-relais-dans-l-api.md) | technique | acceptée | 2026-11-22 | Thomas De Sousa |
| 0022 | transverse | [Un compte par personne, mise en couple par code d'invitation](0022-mise-en-couple-par-code-d-invitation.md) | produit | acceptée | 2026-11-22 | Thomas De Sousa |
| 0023 | transverse | [Une seule signature de use case, des réactions aux événements en use cases](0023-forme-des-use-cases-et-des-reactions.md) | technique | acceptée | 2026-11-22 | Thomas De Sousa |
| 0024 | transverse | [Horloge injectée, identifiants UUID v7 par un générateur configurable](0024-determinisme-horloge-et-identifiants.md) | technique | acceptée | 2026-11-22 | Thomas De Sousa |
| 0025 | transverse | [Pagination par offset, curseur pour le défilement infini](0025-pagination.md) | technique | acceptée | 2026-11-22 | Thomas De Sousa |
| 0026 | transverse | [Pas de rôles ni de permissions, une portée par couple et par propriétaire](0026-permissions-par-portee-sans-roles.md) | technique | acceptée | 2026-11-22 | Thomas De Sousa |
| 0027 | transverse | [Photos stockées sur disque derrière un port `FileStorage`](0027-stockage-des-photos.md) | technique | acceptée | 2026-11-22 | Thomas De Sousa |
| 0028 | pairing | [Règles du code d'invitation et de la mise en couple](pairing/0028-regles-du-code-d-invitation.md) | produit | acceptée | 2026-11-23 | Thomas De Sousa |
| 0029 | pairing | [Le contexte `pairing` travaille avant qu'un couple existe](pairing/0029-pairing-avant-le-couple.md) | technique | acceptée | 2026-11-23 | Thomas De Sousa |
| 0030 | transverse | [Vérification du JWT de session en phase 2](0030-verification-du-jwt-en-phase-2.md) | technique | remplacée par [0034](0034-session-revocable.md) | 2026-11-23 | Thomas De Sousa |
| 0031 | frontend | [Schémas de formulaire construits avec la traduction](frontend/0031-messages-zod-traduits.md) | technique | acceptée | 2026-11-23 | Thomas De Sousa |
| 0032 | authentication | [Règles du compte et de la session](authentication/0032-regles-du-compte-et-de-la-session.md) | produit | acceptée | 2026-11-23 | Thomas De Sousa |
| 0033 | authentication | [Le contexte `authentication` travaille hors du couple](authentication/0033-authentication-hors-du-couple.md) | technique | acceptée | 2026-11-23 | Thomas De Sousa |
| 0034 | transverse | [Session révocable, cookie posé par la PWA](0034-session-revocable.md) | technique | acceptée | 2026-11-23 | Thomas De Sousa |
| 0035 | frontend | [Formulaires par react-hook-form, server action qui rend un résultat](frontend/0035-formulaires-de-la-pwa.md) | technique | acceptée | 2026-11-23 | Thomas De Sousa |
| 0036 | frontend | [Les données se lisent dans la page serveur, avec le cookie de session](frontend/0036-lecture-des-donnees-par-la-page-serveur.md) | technique | acceptée | 2026-11-23 | Thomas De Sousa |
| 0037 | frontend | [Chaque écran traduit les erreurs qu'il peut recevoir](frontend/0037-traductions-des-erreurs-par-ecran.md) | technique | acceptée | 2026-11-23 | Thomas De Sousa |
| 0038 | pairing | [Annuler un couple en attente](pairing/0038-annuler-un-couple-en-attente.md) | produit | acceptée | 2026-11-23 | Thomas De Sousa |
| 0039 | notes | [Règles des notes](notes/0039-regles-des-notes.md) | produit | acceptée | 2026-11-23 | Thomas De Sousa |
| 0040 | notes | [Édition à deux par Hocuspocus dans l'API](notes/0040-edition-a-deux-par-hocuspocus-dans-l-api.md) | technique | acceptée | 2026-11-23 | Thomas De Sousa |
| 0041 | transverse | [Le couple de la requête vient de `pairing`](0041-couple-de-la-requete.md) | technique | acceptée | 2026-11-23 | Thomas De Sousa |
| 0042 | frontend | [Une fabrique reçoit la session dès qu'un de ses use cases agit pour le partenaire connecté](frontend/0042-fournisseur-de-session-des-fabriques.md) | technique | acceptée | 2026-11-23 | Thomas De Sousa |
| 0043 | authentication | [Le tailnet borne les essais de connexion, la PWA ne transmet plus le navigateur](authentication/0043-le-tailnet-borne-les-essais-de-connexion.md) | technique | acceptée | 2026-11-23 | Thomas De Sousa |
| 0044 | frontend | [Navigation par une barre d'onglets en bas](frontend/0044-navigation-par-onglets.md) | produit | acceptée | 2026-11-24 | Thomas De Sousa |
| 0045 | pairing | [Les périodes ensemble du couple, en base](pairing/0045-periodes-ensemble-du-couple.md) | produit | acceptée | 2026-11-24 | Thomas De Sousa |
| 0046 | agenda | [Règles de l'agenda](agenda/0046-regles-de-l-agenda.md) | produit | acceptée | 2026-11-24 | Thomas De Sousa |
| 0047 | agenda | [Les jours et les heures de l'agenda sont ceux de Paris, sans instant](agenda/0047-moments-de-l-agenda-en-heure-de-paris.md) | technique | acceptée | 2026-11-24 | Thomas De Sousa |
| 0048 | frontend | [La grille du mois de l'agenda est le `Calendar` du design system, sur react-day-picker](frontend/0048-calendrier-react-day-picker.md) | technique | acceptée | 2026-11-24 | Thomas De Sousa |
| 0049 | frontend | [Supprimer un événement de l'agenda en le glissant vers la gauche](frontend/0049-suppression-par-glissement.md) | produit | acceptée | 2026-11-24 | Thomas De Sousa |
| 0050 | messaging | [Règles des messages](messaging/0050-regles-des-messages.md) | produit | acceptée | 2026-11-24 | Thomas De Sousa |
| 0051 | messaging | [Le relais des notifications, dans l'API, au moins une fois](messaging/0051-relais-des-notifications.md) | technique | acceptée | 2026-11-24 | Thomas De Sousa |
| 0052 | notes | [Dossiers de notes et dossiers IA](notes/0052-dossiers-et-dossiers-ia.md) | produit | acceptée | 2026-11-25 | Thomas De Sousa |
| 0053 | frontend | [L'écran des espaces et des dossiers de notes](frontend/0053-ecran-des-espaces-et-des-dossiers.md) | produit | acceptée | 2026-11-25 | Thomas De Sousa |
| 0054 | notes | [Les fiches se remplissent par SearXNG sur la VM et Gemini gratuit, en tâche de fond dans l'API](notes/0054-recherche-des-fiches-searxng-et-gemini.md) | technique | acceptée | 2026-11-25 | Thomas De Sousa |
| 0055 | notes | [Les fiches d'un lieu se complètent par OpenStreetMap](notes/0055-fiches-completees-par-openstreetmap.md) | technique | acceptée | 2026-11-25 | Thomas De Sousa |
| 0056 | agenda | [Pour qui est un événement, et des étiquettes de couleur](agenda/0056-pour-qui-et-etiquettes.md) | produit | acceptée | 2026-11-25 | Thomas De Sousa |
| 0057 | frontend | [Couleurs des étiquettes et feuille imbriquée de l'agenda](frontend/0057-ecran-pour-qui-et-etiquettes.md) | technique | acceptée | 2026-11-26 | Thomas De Sousa |
