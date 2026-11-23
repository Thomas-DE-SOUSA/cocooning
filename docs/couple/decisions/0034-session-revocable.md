---
nature: technique
status: acceptée
date: 2026-11-23
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-23
validated-on: 2026-11-23
supersedes: 0030
superseded-by:
premortem:
---

# 0034: Session révocable, cookie posé par la PWA

## Contexte

La [décision 0030](0030-verification-du-jwt-en-phase-2.md) vérifie un jeton HS256 qui ne porte que `sub` et son expiration : une session ne peut pas être fermée avant son terme, alors que la [décision 0032](authentication/0032-regles-du-compte-et-de-la-session.md) veut qu'une déconnexion ferme toutes les sessions du partenaire. Il faut aussi dire comment le jeton arrive jusqu'au navigateur : l'API n'est pas publiée sur le tailnet, seul le serveur Next lui parle.

Le propriétaire a reçu ces choix comme recommandations du plan de l'étape 2 de la phase 3, le 2026-11-23, et a répondu : « go ».

## Décision

- Le jeton reste signé en HS256 avec `AUTH_JWT_SECRET`, par l'API seule. Il porte `sub` (l'identifiant du partenaire), `ver` (la version de session du compte) et son expiration.
- Le compte porte une version de session. Se déconnecter l'incrémente : tout jeton émis avant ne vaut plus rien.
- Le garde global de l'API refuse toujours par défaut (401) toute route qui n'est pas marquée `@Public()`. Après la signature et l'expiration, il vérifie par un use case que le compte existe et que sa version de session est celle du jeton, puis donne au contrôleur le `PartnerContext` ([décision 0029](pairing/0029-pairing-avant-le-couple.md)).
- La connexion répond le jeton et son échéance dans le corps. Seul le serveur Next appelle cette route : sa server action pose le cookie dans le navigateur, `HttpOnly`, `Secure`, `SameSite=Lax`, sur tout le site, jusqu'à l'échéance. Le jeton n'est jamais rendu au code client.
- Le nom du cookie est une constante du contrat, partagée par l'API et la PWA. Les appels suivants du serveur Next à l'API transmettent ce cookie.

## Alternatives écartées

- **Changer `AUTH_JWT_SECRET` pour révoquer** : rien à coder, mais les deux partenaires sont déconnectés à chaque fois, et seul le propriétaire peut le faire sur la VM.
- **Une table de sessions, une ligne par appareil** : utile pour fermer un seul appareil, ce que la décision 0032 ne demande pas.
- **Un `Set-Cookie` de l'API relayé par Next** : le serveur Next devrait lire les en-têtes de réponse et analyser le cookie pour le reposer, sans rien gagner, puisque le navigateur ne parle jamais à l'API.

## Conséquences

- Chaque requête authentifiée lit le compte par sa clé primaire ; pour deux utilisateurs, c'est négligeable.
- Les jetons de test des E2E portent `ver`, et les tests créent les comptes de leurs partenaires.
- La PWA vérifie la présence du cookie pour rediriger vers la connexion ; la vraie barrière reste l'API.

## Risques

- Un jeton volé reste valable jusqu'à ce que son partenaire se déconnecte : la déconnexion de l'appareil restant est la réponse, `AUTH_JWT_SECRET` le dernier recours.
- Safari peut refuser un cookie `Secure` sur `http://localhost` : on essaie la PWA sur téléphone par `tailscale serve`, en HTTPS.
