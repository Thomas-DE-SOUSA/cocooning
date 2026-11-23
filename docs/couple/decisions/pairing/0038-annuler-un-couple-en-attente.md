---
nature: produit
status: acceptée
date: 2026-11-23
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-23
validated-on: 2026-11-23
supersedes:
superseded-by:
premortem:
---

# 0038: Annuler un couple en attente

## Contexte

La [décision 0028](0028-regles-du-code-d-invitation.md) laisse un partenaire créer un couple, mais pas en sortir. La revue des étapes 2 et 3 (2026-11-23) a montré l'impasse : si les deux partenaires appuient chacun sur « Créer notre couple », chacun a un couple en attente, et la saisie du code de l'autre est refusée par R1 dans les deux sens. Seule une requête SQL sur la VM les débloque. Le couple du propriétaire n'est pas encore formé en production.

## Décision

- Le seul membre d'un couple en attente (`PENDING`) peut l'annuler. Le couple disparaît, son code ne vaut plus rien et le partenaire peut de nouveau créer un couple ou en rejoindre un.
- Un couple formé (`PAIRED`) ne s'annule pas : `PAIRING_COUPLE_ALREADY_PAIRED`. Quitter un couple formé reste à décider.
- Un partenaire sans couple reçoit `PAIRING_COUPLE_NOT_FOUND`.
- Le couple est supprimé en douceur (`deletedAt`, `core-backend.md` règle 13) et enregistre l'événement `pairing.couple.cancelled`. Ses lignes `couple_partner`, sans cycle de vie propre, sont effacées : l'index unique sur `user_id` libère le partenaire.

## Alternatives écartées

- **Seulement mettre « Rejoindre » en premier et confirmer « Créer »** : rend l'erreur plus rare sans la rendre réparable ; un appui de trop garde l'impasse.
- **Rejoindre en abandonnant automatiquement son propre couple en attente** : un code saisi supprimerait un couple sans que le partenaire l'ait demandé.
- **Suppression définitive du couple** : contraire à la suppression douce par défaut, et l'historique des événements du couple perdrait son agrégat.

## Conséquences

- Nouvelle règle R8 dans [les règles de pairing](../../business-rules/pairing/rules.md) ; agrégat et invariants dans [l'architecture de pairing](../../architecture/pairing/aggregate.md).
- Nouveau point d'entrée `DELETE /pairing/couple` (204), puis un bouton dans l'écran d'attente de la PWA.

## Risques

- Un partenaire qui annule par erreur doit recréer un couple et renvoyer un nouveau code : acceptable pour deux utilisateurs.
