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

# 0043: Le tailnet borne les essais de connexion, la PWA ne transmet plus le navigateur

## Contexte

La [décision 0032](0032-regles-du-compte-et-de-la-session.md) a remis à plus tard la limite d'essais de connexion, suivie depuis par l'[écart authentication 002](../../gaps/authentication.md). La règle 13 de `_knowledge/core-frontend.md` faisait transmettre à la connexion l'adresse IP et le User-Agent du navigateur (`x-forwarded-for`, `user-agent`), que l'API ne lit nulle part (écart authentication 005). Les deux écarts attendaient la même question : l'API doit-elle compter les essais, et par quoi ? Le propriétaire a tranché le 2026-11-23 (D41).

## Décision

- L'API ne limite pas les essais de connexion et ne verrouille aucun compte. Seuls les appareils du tailnet atteignent la PWA et l'API ([décision 0019](../0019-authentification-locale.md)) ; Argon2id ralentit chaque essai et le mot de passe fait au moins 12 caractères.
- La PWA ne transmet ni l'adresse IP ni le User-Agent du navigateur à l'API : `SignInUseCase` et `AuthenticationGateway.signIn` ne prennent que la requête du contrat. La règle 13 de `core-frontend.md` dit maintenant qu'aucune server action ne transmet le contexte du navigateur.

## Alternatives écartées

- **Verrouiller un compte après plusieurs échecs** : une colonne, un use case et des E2E pour une attaque qui suppose un appareil du couple déjà compromis ; un verrou bloquerait aussi la partenaire légitime.
- **Limiter par adresse IP** : il faudrait `trust proxy` dans l'API et vérifier ce que `tailscale serve` met dans `x-forwarded-for`, dont le premier élément peut être forgé par un client. Le plus lourd, pour deux appareils connus.
- **Garder la transmission pour plus tard** : un code sans lecteur (règle 4 de `core.md`) et un en-tête forgeable que personne ne contrôle.

## Conséquences

- Les écarts authentication 002 et 005 sont clos.
- `sign-in-client-context.service.ts` et le type `SignInClientContext` disparaissent ; la connexion part avec les seuls en-têtes de la requête JSON.
- [Les règles du contexte](../../business-rules/authentication/rules.md) et [le front de la PWA](../../architecture/frontend/index.md) citent cette décision.
- Une limite d'essais, si elle revient, part d'une nouvelle décision qui choisit d'abord sa clé (compte ou appareil).

## Risques

- Un appareil du tailnet compromis peut essayer des mots de passe sans fin. Argon2id rend chaque essai lent ; des essais en rafale occupent les 4 fils de calcul de l'API et ralentissent les autres requêtes sans la faire tomber.
- Un essai refusé n'est journalisé qu'avec son code : on ne saura pas quel appareil essayait.
