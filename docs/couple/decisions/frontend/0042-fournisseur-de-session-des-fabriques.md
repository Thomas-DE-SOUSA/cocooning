---
nature: technique
status: acceptée
date: 2026-11-23
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-23
validated-on: 2026-11-23
supersedes: 0036 (seulement la première conséquence, sur la fabrique `authentication`)
superseded-by:
premortem:
---

# 0042: Une fabrique reçoit la session dès qu'un de ses use cases agit pour le partenaire connecté

## Contexte

La [décision 0036](0036-lecture-des-donnees-par-la-page-serveur.md) dit, dans ses conséquences, que la fabrique `authentication` de `@cocooning/couple-client-infrastructure` ne prend pas de fournisseur de session, puisque la connexion précède la session. Depuis la déconnexion ([décision 0034](../0034-session-revocable.md)), `SignOutUseCase` appelle `DELETE /authentication/session` au nom du partenaire connecté : `createAuthenticationModule` reçoit donc `getSessionToken`, que seule la déconnexion lit ([écart frontend 004](../../gaps/frontend.md)). Le reste de la décision 0036 reste en vigueur.

## Décision

- La fabrique d'un contexte reçoit `getSessionToken`, sans l'appeler, dès qu'un de ses use cases agit pour le partenaire connecté : `createAuthenticationModule(apiBaseUrl, timeoutMs, getSessionToken)`, comme `createPairingModule` et `createNotesModule`.
- Seules les gateways de ces use cases passent par `sessionRequest` ; un appel public de la même fabrique (la connexion) n'envoie pas de cookie.
- Une fabrique dont aucun use case n'agit pour le partenaire connecté ne reçoit pas de fournisseur de session.

## Alternatives écartées

- **Suivre la décision 0036 et retirer le fournisseur de `createAuthenticationModule`** : sans session, l'API répond `401`, que `SignOutUseCase` compte comme une session fermée. Le cookie serait retiré de ce navigateur, mais les sessions des autres appareils resteraient ouvertes.
- **Deux fabriques, une pour la connexion et une pour la déconnexion** : un contexte aurait deux points d'entrée côté client pour une seule gateway, sans rien gagner.

## Conséquences

- La règle vaut pour toutes les fabriques des contextes du couple, rappelée dans [le `CLAUDE.md` de `couple-client-infrastructure`](../../../../packages/couple/client-infrastructure/CLAUDE.md).
- L'écart frontend 004 est clos.
- [Le front de la PWA](../../architecture/frontend/index.md) décrit la déconnexion avec cette décision.

## Risques

- Une fabrique peut recevoir un fournisseur qu'un appel public n'utilise pas : le test de la gateway vérifie qu'un appel public part sans en-tête `Cookie`.
