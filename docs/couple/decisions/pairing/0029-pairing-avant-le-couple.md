---
nature: technique
status: proposée
date: 2026-11-23
deciders: []
validated-by: à compléter
validated-on:
supersedes:
superseded-by:
premortem:
---

# 0029: Le contexte `pairing` travaille avant qu'un couple existe

## Contexte

La [décision 0023](../0023-forme-des-use-cases-et-des-reactions.md) donne à chaque use case la signature `execute(context, command)`, avec `context = { coupleId, userId }`. La [décision 0018](../0018-portee-par-couple-et-proprietaire.md) et `core.md` règle 27 exigent `coupleId` en premier paramètre de chaque méthode de port. Or le contexte `pairing` sert justement à des partenaires qui n'ont pas encore de couple : créer un couple, rejoindre un couple par son code, savoir où l'on en est. Il faut dire comment ces deux règles s'appliquent avant que le `coupleId` existe.

## Décision

- Les use cases de `pairing` reçoivent un `PartnerContext = { userId }`, type du shared-kernel générique à côté d'`ExecutionContext`. Leur signature reste `execute(context, command)`. Seul `pairing` l'utilise ; tous les autres contextes gardent `ExecutionContext`.
- Les événements de `pairing` portent l'`ExecutionContext` complet : au moment où ils naissent, le couple existe.
- Le port `CoupleRepository` a deux recherches sans `coupleId`, les seules du dépôt : par partenaire (`findByPartner(userId)`) et par code d'invitation (`findByInvitationCode(code)`). Chacune s'appuie sur un index unique (un partenaire n'est que dans un couple, un code n'existe qu'une fois). La sauvegarde, elle, filtre par l'identifiant du couple.
- Le JWT ne porte que l'identité du partenaire (`sub`). Quand les contextes du couple arriveront (notes, agenda, messaging), la couche API construira leur `ExecutionContext` en lisant le couple du partenaire par un port étroit de `pairing` ; un partenaire sans couple y recevra un refus.

## Alternatives écartées

- **Créer un couple vide à l'inscription** : `coupleId` existerait toujours, mais un partenaire qui rejoint son âme sœur laisserait derrière lui un couple orphelin à supprimer, et la décision 0022 dit qu'un compte sans couple n'a aucun `coupleId`.
- **`coupleId` nullable dans `ExecutionContext`** : chaque contexte du couple devrait vérifier qu'il n'est pas nul, et la règle d'isolation ne se lirait plus dans le type.
- **Le `coupleId` dans le JWT** : il faudrait réémettre le jeton au moment de la mise en couple, et un jeton ancien garderait un couple périmé.

## Conséquences

- `core.md` règle 27 et `_knowledge/backend/prisma.md` règle 7 gardent leur force partout ailleurs ; les deux recherches de `pairing` sont citées comme seules exceptions dans l'architecture de `pairing`, écrite avec son code.
- Une requête par appel sert à résoudre le couple du partenaire ; pour deux utilisateurs, c'est négligeable.

## Risques

- Une recherche sans `coupleId` copiée dans un autre contexte serait une fuite. La revue la refuse hors de `pairing`.
