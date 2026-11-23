---
nature: technique
status: acceptée
date: 2026-11-23
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-23
validated-on: 2026-11-23
supersedes:
superseded-by:
premortem:
---

# 0033: Le contexte `authentication` travaille hors du couple

## Contexte

`core.md` règle 27 et la [décision 0018](../0018-portee-par-couple-et-proprietaire.md) exigent `coupleId` en premier paramètre de chaque méthode de port et en première colonne de chaque index. La [décision 0023](../0023-forme-des-use-cases-et-des-reactions.md) donne à chaque use case la signature `execute(context, command)`. La [décision 0029](../pairing/0029-pairing-avant-le-couple.md) a déjà assoupli ces règles pour `pairing`, en le disant seule exception.

Or un compte existe avant le couple : c'est `pairing` qui crée le couple ([décision 0022](../0022-mise-en-couple-par-code-d-invitation.md)), et un partenaire doit être connecté pour le créer. Au moment de la connexion, on ne connaît même pas encore le partenaire.

## Décision

- Le compte (`Account`) n'a pas de `coupleId`. Son identifiant est le `userId` du partenaire, le `sub` du jeton de session.
- Le port `AccountRepository` a deux recherches : par identifiant (clé primaire) et par adresse e-mail (index unique sur les comptes actifs). Ce sont, avec les deux de `pairing`, les seules recherches sans `coupleId` du dépôt.
- Les use cases qui précèdent toute identité (connexion, résolution d'une session, création d'un compte par la commande) ont la signature `execute(command)`, sans contexte. Ceux qui suivent la connexion (déconnexion) reçoivent le `PartnerContext` de la décision 0029.
- Aucune clé étrangère ne relie `couple_partner.user_id` à la table des comptes : les deux contextes restent indépendants, chacun avec ses tables.
- Les contextes du couple ne lisent jamais les tables d'`authentication` : ils reçoivent le `userId` du contexte d'exécution.

## Alternatives écartées

- **Un `coupleId` nullable sur le compte** : il serait nul pour tout compte qui n'a pas encore de couple, et rien ne le lirait ; la règle d'isolation ne protège rien ici.
- **Un contexte d'exécution factice pour la connexion** : un `userId` inventé avant la vérification du mot de passe tromperait le lecteur sur ce que le code sait.
- **Une clé étrangère vers les comptes** : chaque fixture de `pairing` devrait d'abord créer des comptes, et `pairing` dépendrait des tables d'`authentication`.

## Conséquences

- `core.md` règle 27, `_knowledge/backend/domain.md` règle 17, `_knowledge/backend/prisma.md` règle 7 et les `CLAUDE.md` qui citent `pairing` comme seule exception citent aussi cette décision, dans la PR qui crée le contexte.
- Les exceptions sont décrites dans l'architecture du contexte `authentication`, comme celles de `pairing` dans [son architecture](../../architecture/pairing/index.md).

## Risques

- Une recherche sans `coupleId` copiée dans un contexte du couple serait une fuite. La revue la refuse hors de `pairing` et d'`authentication`.
