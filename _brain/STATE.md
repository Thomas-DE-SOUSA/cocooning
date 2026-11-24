# État du projet

> Mis à jour : 2026-11-24 (direction A : décision #80 et tokens #81 mergés ; PR des écrans des notes ouverte, en attente du « go »). Dernière consolidation : aucune.
> Ce fichier est réécrit, jamais allongé (60 lignes au plus). L'historique est dans `journal/`.

## Où on en est

- **Étape « notes » de la phase 3 terminée** (D40 à D43) : PR #66 à #77, release #78 mergée dans `main` le 2026-11-24. Liste des notes à l'accueil, page `/notes/:noteId` avec renommage, éditeur Tiptap à deux par Hocuspocus, route `/collab` dans `tailscale serve`. Détail : `journal/2026-11-23.md` (sections « Étape notes ») et `journal/2026-11-24.md`.
- **#78 en production et vérifiée** le 2026-11-24 (conteneurs recréés à 08:49 UTC, migrations, santé, `/collab` → 101 avec `curl --http1.1`). Détail : `journal/2026-11-24.md`, « Production de #78 vérifiée ».
- **Planche de direction artistique publiée** (D44) : https://claude.ai/artifact/TqnctvMSZ4tRSVhGwyZFbP, A, B, C en clair et sombre, contrastes WCAG vérifiés. Détail : `journal/2026-11-24.md`, « Direction artistique : planche publiée ».
- Écarts fermés (D41) : frontend 004 (décision 0042), authentication 002 et 005 (décision 0043).
- **Fait avant** : phases 0 à 2, phase 3 étapes 1 à 3 (socle web, connexion, mise en couple), en production depuis le 2026-11-23.

## Le produit (vision du propriétaire, 2026-11-22)

- App pour un couple, iPhone et Samsung, en PWA servie via Tailscale comme `/perso/cadence`.
- Premier lot : notes riches (courses = note titrée « Courses »), agenda partagé, messages (photo + mots flash) avec Web Push. Détail : `journal/2026-11-22.md`, « Vision produit ».

## Production

- https://cocooning.<tailnet>.ts.net, VM Oracle `cadence` (`ssh cadence`), clone de `main` dans `~/cocooning`, secrets dans `~/cocooning/infrastructure/compose/.env`, `pg_dump` nocturne dans `~/backups`. Procédure : `docs/platform/runbooks/deployment/production.md`.

## Prochaine étape

Ordre validé par le propriétaire le 2026-11-24 (« on part sur ça ») :
1. **Essai réel à deux** dans la même note (jamais fait) ; PR `docs/` à proposer : ajouter `--http1.1` au curl de `/collab` dans le runbook de production (« Vérification »).
2. **Direction artistique A « Lin et terre cuite »** (D44, décision plateforme 0017 #80, tokens #81) : PR des écrans des notes ouverte (`feat/notes-art-direction` : `Card`, `Badge`, bouton `outline`, liste et note sur le modèle de la planche), merger après le « go ». Pas vue en vrai : à regarder sur les téléphones après release. Ensuite : connexion et mise en couple dans le même style, puis une release vers `main`. Le `Toaster` garde les couleurs de sonner (`richColors`).
3. **Agenda partagé** (pas de notifications).
4. **Messages** (photo, mots flash) avec le relais de l'outbox dans l'API (décision 0021) et le Web Push : la « phase 4 » adaptée.

Mode de travail : pas d'autonomie. Une PR à la fois, résumée au propriétaire ; merger seulement après son « go ».

**Avant chaque commit** : `pnpm check-types && pnpm lint && pnpm test && pnpm build` à la racine, puis `pnpm --filter couple-api test:e2e`. Nouveau package : copier la forme de `packages/server-infrastructure/`, `CLAUDE.md` dans le même commit, entrée CommonJS de toute dépendance vérifiée (D31), versions dans les catalogues de `pnpm-workspace.yaml`.

## Décisions qui bloquent

- Écart frontend 006 : l'adaptateur Hocuspocus vit dans le module web `notes`, contre la décision 0040 ; une décision est à proposer.
- D26 (tailles de fichiers) : `couple.aggregate.ts` 158 lignes, `note.aggregate.ts` 150, `notes-test.context.ts` ~136, `notes-test-app.ts` ~128 ; specs E2E au-delà de 100 lignes (`join-couple`, `renew-invitation-code`, `cancel-couple`, `session-guard`, `account-prisma-repository`, `note-prisma-repository-writes`).
- Écarts ouverts aussi : frontend 003 (routes et containers sans test) et 005 (liste limitée à 100 notes, laissé ouvert par le propriétaire), authentication 001 et 003.

## Fichiers chauds

- `apps/couple/web/src/modules/notes/`, `apps/couple/web/src/app/{(home),notes}/`, `apps/couple/web/src/shared/{ui,application/refresh}/`
- `packages/design-system/src/` (prochaine étape), `apps/couple/web/src/app/layout.tsx`, `docs/couple/gaps/frontend.md`
- `infrastructure/compose/tailscale/serve.json`, `docs/platform/runbooks/deployment/production.md`

## Dépôt

- Dépôt privé `Thomas-DE-SOUSA/cocooning`. `main` stable, `dev` intégration et branche par défaut, une branche par changement depuis `dev` (D23). Pas de protection de branche (D29 ouverte).
- `_malta-blueprint/` reste en local, hors git (B1).

## Points d'attention

- Le couple du propriétaire et de Pauline est formé en production (2026-11-23).
- Malta est en lecture seule. Le blueprint contient du code propriétaire « All Rights Reserved » : ne jamais le publier.
- `.env` locaux : lecture interdite par une règle de permission ; le propriétaire autorise à y ajouter une variable sans demander (2026-11-23). Celui de la VM se modifie par `ssh cadence`, seulement pour une release validée.
- Le scope de commit `infra` n'existe pas : un changement de `infrastructure/` lié à un contexte prend son scope (`chore(notes): …`).
