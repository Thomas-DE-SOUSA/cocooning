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

# 0030: Vérification du JWT de session en phase 2

## Contexte

La [décision 0019](0019-authentification-locale.md) place l'authentification dans un contexte local : JWT dans un cookie, session longue, et seulement la vérification du jeton en phase 2. Il faut choisir l'algorithme de signature et la forme du garde.

## Décision

- Le jeton est signé en HS256 avec un secret partagé (`AUTH_JWT_SECRET`, au moins 32 caractères), lu par la configuration de l'API. L'API est la seule à signer et à vérifier : une paire de clés n'apporte rien.
- Le jeton voyage dans un cookie `HttpOnly`, `Secure`, `SameSite=Lax`, dont le nom est une constante de configuration. Il ne porte que `sub` (l'identifiant du partenaire) et son expiration.
- Un garde global de l'API refuse par défaut (401) toute route qui n'est pas marquée publique. Une route publique se déclare par un décorateur `@Public()`. Le garde donne au contrôleur le `PartnerContext` (décision 0029).
- En phase 2, aucun endpoint ne signe de jeton : les tests E2E en signent avec le même secret. La connexion arrive avec le contexte `authentication`.

## Alternatives écartées

- **RS256 avec un signeur de test, comme Malta** : utile quand un fournisseur d'identité signe et que des services vérifient ; ici un seul processus fait les deux.
- **Une spec de couverture des routes** : avec un garde qui refuse par défaut, une route oubliée est fermée, pas ouverte. La spec n'apporterait rien.

## Conséquences

- Nouvelle variable d'environnement `AUTH_JWT_SECRET` dans l'API.
- Le contexte `authentication` réutilisera le même secret pour signer à la connexion.

## Risques

- Un secret qui fuit permet de forger des sessions : il ne vit que dans le `.env` de la VM, jamais dans git.
