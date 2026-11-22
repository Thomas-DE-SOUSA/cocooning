---
nature: technique
status: acceptée
date: 2026-11-22
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-22
validated-on: 2026-11-22
supersedes:
superseded-by:
premortem:
---

# 0020: Statut HTTP des exceptions par une table dans le filtre

## Contexte

Une exception du domaine doit devenir une réponse HTTP. Malta avait deux façons : un `statusCode` porté par chaque exception (le domaine connaît alors HTTP), ou une table code vers statut dans le filtre HTTP. Il faut aussi trancher entre `400` et `422` pour une saisie refusée.

## Décision

Le domaine ignore HTTP. Chaque exception porte un code stable ; le filtre HTTP de l'API traduit ce code en statut par une table unique. Une saisie invalide répond `422`.

Mots du propriétaire, le 2026-11-22, sur les recommandations du blueprint : « OK pour tout ».

## Alternatives écartées

- **Un `statusCode` dans chaque exception** : le domaine dépend d'une notion de transport, contre la règle de dépendance hexagonale.
- **`400` pour une saisie invalide** : confond une requête mal formée et une saisie correcte en forme mais refusée.

## Conséquences

- Contrôle : une spec du filtre HTTP, livrée en phase 1, échoue si un code d'exception du contrat n'a pas de statut dans la table.
- Les codes d'exception vivent dans le contrat, qui sert aussi la traduction côté web ([décision 0010](frontend/0010-affichage-erreur-serveur.md)).

## Risques

- Un code ajouté sans entrée dans la table ferait un `500`. La spec de couverture de la table l'empêche.
