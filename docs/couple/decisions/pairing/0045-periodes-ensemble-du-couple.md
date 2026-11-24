---
nature: produit
status: acceptée
date: 2026-11-24
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-24
validated-on: 2026-11-24
supersedes:
superseded-by:
premortem:
---

# 0045: Les périodes ensemble du couple, en base

## Contexte

L'onglet « Nous » doit afficher depuis combien de jours le couple est ensemble. Le compte ne part pas d'une seule date : le couple a été ensemble, s'est séparé, puis s'est retrouvé (message du propriétaire du 2026-11-24 ; les dates réelles restent en base, jamais dans le dépôt). Il faut donc ranger une liste de périodes quelque part, et choisir qui la modifie.

## Décision

Réponse du propriétaire, 2026-11-24 : « Sur le couple, en base (Recommandé) ».

- Les périodes ensemble sont une donnée de l'agrégat `Couple` du contexte `pairing` : colonne `together_periods` (JSONB) de la table `couple`, liste vide pour un couple qui n'en a pas encore.
- Une période est un jour de début et un jour de fin facultatif (`YYYY-MM-DD`) ; la règle R9 des [règles de pairing](../../business-rules/pairing/rules.md) fixe ce qu'une liste doit respecter.
- La liste s'enregistre d'un bloc par la commande d'exploitation `record-together-periods`, lancée sur la VM comme `create-account` ([décision plateforme 0016](../../../platform/decisions/0016-commandes-d-exploitation-dans-l-api.md)). Aucun endpoint ne l'écrit.
- L'API rend la liste dans le corps de chaque réponse de couple (`CoupleResponseSchema`, champ `togetherPeriods`) ; la PWA calcule le nombre de jours.
- L'événement `pairing.together-periods.recorded` ne porte que le nombre de périodes, jamais les dates (règle 33 de `_knowledge/core.md`).

## Alternatives écartées

- **Une variable d'environnement de la PWA** : une donnée du couple rangée comme un réglage technique ; la changer demande un redéploiement, et elle ne suivrait pas le couple dans la base et ses sauvegardes.
- **Un formulaire de saisie dans l'app dès maintenant** : plusieurs pull requests de plus (endpoint, écran, traductions) pour une liste qui change rarement. Il pourra venir plus tard sur le même use case.

## Conséquences

- Nouvelle règle R9 et nouveaux termes « Période ensemble », « Périodes ensemble » dans [le glossaire de pairing](../../business-rules/pairing/glossary.md).
- `Couple.recordTogetherPeriods`, `TogetherPeriodsRecordedEvent` et l'invariant INV-010 dans [l'agrégat](../../architecture/pairing/aggregate.md) ; colonne décrite dans [les tables](../../architecture/pairing/tables.md).
- Nouveaux codes `PAIRING_TOGETHER_PERIODS_INVALID` (`422`) et `PAIRING_COUPLE_NOT_PAIRED` (`409`).
- Procédure dans le [runbook des périodes ensemble](../../infrastructure/runbooks/pairing/together-periods.md).

## Risques

- Changer les périodes demande un accès SSH à la VM : acceptable pour un couple dont le propriétaire administre la VM.
- Les dates sont des données personnelles du couple : elles ne vont ni dans un événement, ni dans un log, ni dans la sortie de la commande.
