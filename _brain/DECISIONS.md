# Registre des décisions

> Ce registre suit seulement le **statut** de chaque décision. Les options et les recommandations sont dans `_malta-blueprint/00-BLUEPRINT.md` §8.
> Une décision passe à « décidée » seulement sur une réponse explicite du propriétaire, avec la date et ses mots. Rien ne s'invente.
> Dès que `docs/` existe, chaque décision prise devient une ADR, et sa ligne ici renvoie vers l'ADR.

Statuts possibles : `ouverte`, `décidée`, `appliquée`, `remplacée`.

## Projet et mémoire

| ID | Sujet | Statut | Choix | Date | Bloque |
|---|---|---|---|---|---|
| B1 | `git init` du dépôt, remote privé, versionnement de `_malta-blueprint/` (code propriétaire) | décidée | dépôt privé `Thomas-DE-SOUSA/cocooning` ; `_malta-blueprint/` gardé en local, dans `.gitignore` (« Garder en local ») → [ADR](../docs/platform/decisions/0002-depot-prive-blueprint-local.md) | 2026-11-22 | — |
| M1 | Mémoire du projet : `CLAUDE.md`, `_brain/`, hooks, skills `brain-*` | appliquée | conçue et mise en place à la demande du propriétaire, à valider | 2026-11-22 | — |

## Produit

| ID | Sujet | Statut | Choix | Date | Bloque |
|---|---|---|---|---|---|
| P1 | But principal : refaire l'architecture Malta, ou livrer le produit couple au plus simple | décidée | option A : la méthode et la structure de Malta, sur une stack et une infra dimensionnées pour deux utilisateurs (« Option A […] je parlais de Malta pour prendre un exemple de comment bien structurer et faire un projet ») ; règle « Mirror Malta » de `CLAUDE.md` corrigée → [ADR](../docs/platform/decisions/0001-methode-malta-dimensionnee-pour-deux.md) | 2026-11-22 | — |
| P2 | Photo instantanée | décidée | PWA, pas de widget : photo prise dans l'app, envoyée directement à l'autre, notification « ton âme sœur t'a envoyé quelque chose » ; deux déclencheurs, spontané et invitation à heure aléatoire façon BeReal (« on peut faire les deux ») → [ADR](../docs/couple/decisions/0014-photo-instantanee.md) | 2026-11-22 | — |
| P3 | Enrichissement | décidée | on saisit nos envies, puis elles sont triées et complétées : API de référence (TMDB, lieux) + IA pour classer et générer les questions ; la saisie du couple reste la source (« ça me va mais on part toujours du principe où c'est nos envies puis elles sont triées ») → [ADR](../docs/couple/decisions/0015-enrichissement-des-envies.md) | 2026-11-22 | — |
| P4 | Premier lot (MVP) | décidée | 1. Notes riches, perso ou partagées ; les courses sont des notes classiques titrées « Courses » (« pour moi les courses c'est une note classique mais titrée courses »), pas de module ni de catalogue dédiés. 2. Agenda partagé. 3. Messages (photo + mots flash) avec Web Push. Lot 2 : activités, wishlist, visionnage, questions IA, fiches lieux, enrichissement → [ADR](../docs/couple/decisions/0013-premier-lot.md) | 2026-11-22 | — |
| P5 | Éditeur de notes | décidée | édition à deux en temps réel (« P5 temps réel ») : éditeur riche type Tiptap + synchronisation CRDT type Yjs ; fonctions calquées sur Apple Notes / Google Keep → [ADR](../docs/couple/decisions/0016-edition-des-notes-en-temps-reel.md) | 2026-11-22 | — |
| P6 | Mise en couple | décidée | un compte par personne, mise en couple par code d'invitation (« un compte par personne qui auront un lien pour s'inviter par un code ») ; contexte dédié `pairing`, confirmé le 2026-11-23 (« garde pairing ») → [ADR](../docs/couple/decisions/0022-mise-en-couple-par-code-d-invitation.md) | 2026-11-22 | — |
| P7 | Numérotation des ADR | décidée | une séquence par registre, comme Malta (« P7 j'aime bien ») → [ADR](../docs/platform/decisions/0010-numerotation-adr-fondatrices.md) | 2026-11-22 | — |
| S1 | Permissions | décidée | pas de modèle rôles / `ressource:action` de Malta : portée par `coupleId` (guard) et propriété/visibilité par `ownerId` (domaine) ; pas d'`ActiveTenantGuard` ni de `MessagingModule` SQS (« OK pour tout », 2026-11-22) → [ADR](../docs/couple/decisions/0026-permissions-par-portee-sans-roles.md) | 2026-11-22 | — |
| S2 | Stockage des photos | décidée | port `FileStorage`, adaptateur disque local (volume Docker de la VM) au départ, compatible S3 plus tard (« OK pour tout », 2026-11-22) → [ADR](../docs/couple/decisions/0027-stockage-des-photos.md) | 2026-11-22 | — |

## Blueprint (D1 à D31)

| ID | Sujet | Statut | Choix | Date | Bloque |
|---|---|---|---|---|---|
| D1 | Nom du segment produit | décidée | `couple` : `packages/couple/<contexte>` (« OK pour tout ») → [ADR](../docs/platform/decisions/0003-segment-metier-couple.md) | 2026-11-22 | — |
| D2 | Nom de l'orchestrateur et préfixe des commandes | décidée | `_cocooning-orch`, `_cocooning-output`, préfixe `coco-` (« OK pour tout ») → [ADR](../docs/platform/decisions/0004-orchestrateur-cocooning-orch.md) | 2026-11-22 | — |
| D3 | Objet pivot et contexte composite | décidée | pivot = le couple, chaque donnée lui appartient ; pas de composite (« OK pour tout ») → [ADR](../docs/couple/decisions/0017-couple-objet-pivot.md) | 2026-11-22 | — |
| D4 | Authentification (BC local, IdP central, IdP managé) | décidée | option A, BC local : deux comptes, Argon2id, JWT en cookie, session longue ; Tailscale en plus (« OK pour tout ») → [ADR](../docs/couple/decisions/0019-authentification-locale.md) | 2026-11-22 | — |
| D5 | Statut HTTP des exceptions | décidée | table code → statut dans le filtre HTTP, 422 pour une saisie invalide (« OK pour tout ») → [ADR](../docs/couple/decisions/0020-statut-http-des-exceptions.md) | 2026-11-22 | — |
| D6 | Sémantique de publication des événements | décidée | outbox PostgreSQL, relais dans le processus de l'API (pas de SQS ni de worker séparé au départ), sert au Web Push (« OK pour tout ») → [ADR](../docs/couple/decisions/0021-outbox-postgresql-relais-dans-l-api.md) | 2026-11-22 | — |
| D7 | Multi-tenant | décidée | pas de multi-tenant ; `coupleId` dans les ports et les index, `ownerId` sur chaque donnée, 404 pour la donnée perso de l'autre (« OK pour tout ») → [ADR](../docs/couple/decisions/0018-portee-par-couple-et-proprietaire.md) | 2026-11-22 | — |
| D8 | Zod 3 ou 4 | décidée | appliquée en phase 1 : Zod 4, les deux libs l'acceptent ; Zod 4 si `@t3-oss/env-nextjs` et `@hookform/resolvers` suivent, sinon 3.25 (« OK pour tout ») → [ADR](../docs/platform/decisions/0005-versions-des-dependances.md) | 2026-11-22 | — |
| D9 | Versions majeures (TS, Next, Jest, ESLint) | décidée | dernières versions stables (Next 16, Jest 30, TS le plus récent supporté par typescript-eslint), confirmées en phase 0 (« OK pour tout ») → [ADR](../docs/platform/decisions/0005-versions-des-dependances.md) | 2026-11-22 | — |
| D10 | Cible de déploiement | décidée | VM + `docker compose` (API, web, Postgres, Caddy), accès Tailscale, HTTPS `*.ts.net`, comme `cadence` (« OK pour tout ») → [ADR](../docs/platform/decisions/0006-deploiement-vm-docker-compose-tailscale.md) | 2026-11-22 | — |
| D11 | App mobile | décidée | pas d'app native ; PWA Next (Serwist, Web Push VAPID) ; `client-business-logic` sans framework (« OK pour tout ») → [ADR](../docs/platform/decisions/0007-pwa-sans-application-native.md) | 2026-11-22 | — |
| D12 | Forme des réactions aux événements et des use cases | décidée | signature unique `execute(context, command)`, `context = { coupleId, userId }` ; réaction à un événement = use case de réaction appelé par un handler d'infrastructure (« OK pour tout », 2026-11-22) → [ADR](../docs/couple/decisions/0023-forme-des-use-cases-et-des-reactions.md) | 2026-11-22 | — |
| D13 | Déterminisme (horloge, générateur d'ids) | décidée | horloge injectée (port `DateTimeProvider`, jamais `new Date()` dans le domaine) ; générateur UUID v7 statique `Uuid.configure()` + `Uuid.resetForTests()` (« OK pour tout », 2026-11-22) → [ADR](../docs/couple/decisions/0024-determinisme-horloge-et-identifiants.md) | 2026-11-22 | — |
| D14 | Pagination | décidée | offset par défaut (page 1, 25 éléments) ; curseur pour le défilement infini (photos, messages) (« OK pour tout », 2026-11-22) → [ADR](../docs/couple/decisions/0025-pagination.md) | 2026-11-22 | — |
| D15 | Langues (CLAUDE.md, docs, commits) | décidée | code, `CLAUDE.md` racine, `_knowledge/`, commits en anglais ; `docs/` en français (« OK pour tout ») → [ADR](../docs/platform/decisions/0008-langues.md) | 2026-11-22 | — |
| D16 | Versionnement des espaces de travail des agents | ouverte | — | — | phase 5 |
| D17 | BMAD | ouverte | — | — | phase 5 |
| D18 | Portes de qualité (Stryker, couverture, Playwright, Sonar) | ouverte | — | — | phase 2 |
| D19 | Storybook | ouverte | — | — | phase 3 |
| D20 | Trailer `Co-Authored-By` des commits IA | ouverte | — | — | phase 5 |
| D21 | Plateforme d'observabilité | ouverte | — | — | phase 6 |
| D22 | Assistant IA | ouverte | — | — | phase 7 |
| D23 | Flux de branches | décidée | `main` (stable), `dev` (intégration, branche par défaut), une branche par feature depuis `dev`, commits atomiques (« git atomic branch main qui sera sur un dev puis chaque feature en branch ») → [ADR](../docs/platform/decisions/0009-flux-de-branches.md) | 2026-11-22 | — |
| D24 | Numérotation des ADR fondatrices | décidée | ADR fondatrices renumérotées 0001 à 0012, chacune citant son contrôle automatique (« OK pour tout ») → [ADR](../docs/platform/decisions/0010-numerotation-adr-fondatrices.md) | 2026-11-22 | — |
| D25 | Messages Zod traduits et suffixe des schémas | ouverte | — | — | phase 3 |
| D26 | Exceptions aux tailles de fichiers | ouverte | — | — | phase 2 |
| D27 | Ports transverses d'un composite | ouverte | — | — | premier composite |
| D28 | Review agentique au démarrage | ouverte | — | — | phase 5 |
| D29 | Dépôt et plan GitHub | ouverte | — | — | phase 6 |
| D30 | Source réglementaire du langage ubiquitaire | ouverte | — | — | phase 2 |
| D31 | Module system du backend (NestJS 12 ESM pur) | décidée | Nest 11 en CommonJS, `uuid` 11, Jest/ts-jest inchangés ; migration ESM plus tard en une décision (« Nest 11 en CommonJS (Recommandé) ») → [ADR](../docs/platform/decisions/0011-backend-commonjs-nest-11.md) | 2026-11-22 | — |
