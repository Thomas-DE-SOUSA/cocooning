---
nature: technique
status: acceptée
date: 2026-11-23
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-23 (« go » sur la PR #66)
validated-on: 2026-11-23
supersedes:
superseded-by:
premortem:
---

# 0040: Édition à deux par Hocuspocus dans l'API

## Contexte

La [décision 0016](../0016-edition-des-notes-en-temps-reel.md) fixe un éditeur de type Tiptap et une synchronisation par CRDT de type Yjs, et renvoie le choix exact des bibliothèques et du canal au début de l'étape des notes. Cocooning n'a ni worker séparé ni file de messages (décisions P1, D6, D10), la PWA n'est joignable que par `tailscale serve` sur une seule origine, et la session vit dans un cookie HttpOnly posé par la PWA ([décision 0034](../0034-session-revocable.md)). Versions vérifiées le 2026-11-23 : Tiptap 3, Yjs 13, Hocuspocus 4, toutes avec une entrée CommonJS (D31).

## Décision

- L'éditeur est **Tiptap 3** avec l'extension `Collaboration`, sur un document **Yjs**.
- Le serveur de synchronisation est **Hocuspocus 4**, démarré **dans le processus de l'API**, sur le même serveur HTTP, au chemin `/collab` (mise à niveau WebSocket).
- `tailscale serve` route `/collab` vers l'API, tout le reste vers la PWA : le navigateur ouvre `wss://<nom>.ts.net/collab` sur la même origine que la PWA, et le cookie de session part avec la poignée de main.
- À la connexion, Hocuspocus lit le cookie, résout la session comme le garde HTTP (`ResolveSessionUseCase`), trouve le couple formé du partenaire ([décision 0041](../0041-couple-de-la-requete.md)), puis vérifie par un use case du contexte `notes` que la note est lisible pour lui. Sinon, la connexion est refusée sans dire pourquoi.
- Le document de chaque note est un état Yjs binaire, gardé dans la ligne de la note (`content_state`), chargé à la première connexion et enregistré par Hocuspocus après un court délai sans frappe. Le titre, la visibilité et la propriétaire restent des colonnes de l'agrégat `Note`.
- Quand une note devient privée ou est supprimée, l'API ferme les connexions qui n'y ont plus droit.
- Côté PWA, le fournisseur Hocuspocus est un adaptateur de `couple-client-infrastructure`, jamais un socket ouvert dans un composant (`core-frontend.md` règle 12).

## Alternatives écartées

- **Un serveur Hocuspocus séparé** : un conteneur et un déploiement de plus, et une deuxième lecture des sessions et des notes ; contraire à P1.
- **Un relais par une route handler de Next.js** : le serveur Next ne garde pas de WebSocket ouvert de façon fiable, et ajouterait un saut.
- **y-websocket nu** : pas d'authentification ni de persistance prêtes ; Hocuspocus les fournit par ses hooks.
- **Stocker le document en JSON ProseMirror** : perd l'historique CRDT nécessaire pour fusionner les modifications concurrentes.

## Conséquences

- Nouvelle route dans `infrastructure/compose/tailscale/serve.json` et port de l'API exposé dans le réseau du compose.
- Le contexte `notes` reçoit un port de document (`NoteDocumentRepository` ou équivalent) et un use case de contrôle d'accès au document.
- Une page `docs/couple/architecture/notes/collaboration.md` décrit le canal quand il existe.

## Risques

- Un seul processus porte l'API et les WebSockets : un redémarrage coupe l'édition quelques secondes ; le fournisseur se reconnecte et Yjs fusionne.
- Les dernières frappes d'un téléphone qui perd le réseau restent dans sa mémoire jusqu'à la reconnexion ; sans stockage local (y-indexeddb, non retenu ici), elles sont perdues si l'app est tuée avant.
