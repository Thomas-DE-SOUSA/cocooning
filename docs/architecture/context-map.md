# Carte des contextes

Cette page donne les bounded contexts du domaine `couple`, ce que chacun possède et comment ils dépendent les uns des autres. À lire avant de créer un contexte ou de faire parler deux contextes entre eux. `pairing` est le premier contexte codé (phase 2) ; la carte décrit la cible du lot 1, décidée par le propriétaire (P4, D1, D3).

## Le pivot : le couple

Toute donnée appartient à un couple (D3). Il n'y a pas de multi-tenant (D7) : le `coupleId` joue le rôle d'isolation que tient le `tenantId` d'un produit multi-tenant. Il est le premier paramètre de chaque méthode de port et la première colonne de chaque index. Chaque donnée porte aussi un `ownerId`, le partenaire qui l'a créée. Une donnée privée d'un partenaire répond 404, jamais 403, à l'autre partenaire.

Il n'y a pas de contexte composite (D3) : chaque contexte est un module autonome.

## Contextes du lot 1

| Contexte | Ce qu'il possède | Ce qu'il fournit aux autres |
|---|---|---|
| `authentication` | Les deux comptes (`Account`), hors du couple ([décision 0033](../couple/decisions/authentication/0033-authentication-hors-du-couple.md)), les mots de passe (Argon2id), la session révocable en cookie JWT ([décision 0034](../couple/decisions/0034-session-revocable.md)) | L'identité du partenaire connecté (`userId`) |
| `pairing` | Le couple (`Couple`), ses deux partenaires et le code d'invitation ([décision 0022](../couple/decisions/0022-mise-en-couple-par-code-d-invitation.md)) | Le `coupleId` du partenaire connecté, lu par la couche API ([décision 0029](../couple/decisions/pairing/0029-pairing-avant-le-couple.md)) |
| `notes` | Les notes riches, perso ou partagées, éditées à deux en temps réel (Tiptap et Yjs, P5) ; une liste de courses est une note titrée « Courses » | Rien : aucun autre contexte ne lit les notes |
| `agenda` | Les événements du calendrier partagé, leurs catégories, l'auteur visible, une couleur par partenaire | Rien au lot 1 |
| `messaging` | Les photos instantanées (spontanées ou sur invitation à heure aléatoire, P2) et les messages flash | Des événements de domaine qui déclenchent les notifications Web Push |

## Relations

```
authentication ──(userId)──> pairing ──(coupleId)──> notes, agenda, messaging
notes, agenda, messaging ──(événements via outbox)──> relais de l'API ──> Web Push
```

- Les contextes métier ne lisent ni les tables d'`authentication` ni celles de `pairing` : ils reçoivent `userId` et `coupleId` du contexte d'exécution, posé par la couche API.
- Les événements de domaine sont écrits dans l'outbox PostgreSQL dans la même transaction que l'agrégat. Un relais qui tourne dans le processus de l'API les publie et envoie les notifications Web Push (D6). Il n'y a ni file de messages ni worker séparé.
- L'édition en temps réel des notes passe par un serveur Hocuspocus (P5). Son raccordement au contexte `notes` (persistance du document Yjs, contrôle d'accès) est décrit avec le contexte (à venir, phase 2).

## Points ouverts

- Le lot 2 (activités, wishlist, liste de visionnage, questions IA, fiches lieux, enrichissement par TMDB, une API de lieux et l'IA, P3) ajoutera des contextes ; leurs noms ne sont pas décidés.

## Voir aussi

- [Glossaire](glossary.md)
- [Pourquoi cette architecture](why.md)
