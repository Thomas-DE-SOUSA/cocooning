# État du projet

> Mis à jour : 2026-11-22 (23:50). Dernière consolidation : aucune.
> Ce fichier est réécrit, jamais allongé (60 lignes au plus). L'historique est dans `journal/`.

## Où on en est

- **Phase** : phase 1 en cours sur la branche `chore/phase-1-shared-kernels` (depuis `dev`, 10 commits, **non poussée**, pas de PR).
- **Fait (phase 1)** : ADR couple 0023 à 0027 (D12, D13, D14, S1, S2) ; canons `_knowledge/backend/{shared-kernel,prisma,concurrency,adapters}.md` ; `packages/shared-kernel` (30 tests) et `packages/server-infrastructure` (36 tests), verts. D31 : backend CommonJS sur NestJS 11 (ADR plateforme 0011). Détail : `journal/2026-11-22.md`, « Phase 1 lancée » et « server-infrastructure ».
- **Fait (avant)** : phase 0 mergée dans `dev` (PR #1) ; analyse de Malta dans `_malta-blueprint/` ; mémoire du projet en place.

## Le produit (vision du propriétaire, 2026-11-22)

- App pour un couple, iPhone et Samsung, en PWA servie via Tailscale comme `/perso/cadence`.
- Premier lot : notes riches (courses = note titrée « Courses »), agenda partagé, messages (photo + mots flash) avec Web Push. Détail : `journal/2026-11-22.md`, « Vision produit ».

## Prochaine étape

1. Suite de la phase 1 (`00-BLUEPRINT.md` §6, « Phase 1 », sans ce que 0021 et 0026 écartent : ni SQS, ni `MessagingModule`, ni `RolesGuard`, ni `ActiveTenantGuard`, ni table `tenant`, ni permissions), dans l'ordre :
   - `packages/couple/prisma` (Prisma 7, `PrismaService` réentrant, `PrismaUnitOfWork`, verrou consultatif transactionnel, helper d'unicité, soft delete opt-in, gabarit d'outbox, migration `init` sur Postgres 17 ; vérifier l'entrée CommonJS de Prisma 7, D31), puis `couple/shared-kernel`, `couple/contract`, `couple/e2e-shared`.
   - `client-infrastructure` et `design-system` (peuvent attendre la phase 3).
2. Faire valider les 12 ADR fondatrices (`proposée`) ; confirmer le nom du contexte `pairing` (P6).
3. Pousser la branche et ouvrir la PR vers `dev` quand le propriétaire le demande.

## Décisions qui bloquent

- Aucune pour la suite de la phase 1. Zod 4 retenu (D8 appliquée).

## Fichiers chauds

- `_knowledge/backend/*.md`, `packages/shared-kernel/`, `packages/server-infrastructure/`, `config/eslint-config/{boundaries,nest}.js`
- `_malta-blueprint/00-BLUEPRINT.md` §6 (phase 1), `11-backend-infrastructure-apps.md` §10 à §12

## Dépôt

- Dépôt privé `Thomas-DE-SOUSA/cocooning`. `main` stable, `dev` intégration et branche par défaut, une branche par changement depuis `dev` (D23).
- `_malta-blueprint/` reste en local, hors git (B1).
- Plan GitHub gratuit en privé : pas de protection de branche (D29 ouverte).

## Points d'attention

- Malta est en lecture seule. Le blueprint contient du code propriétaire « All Rights Reserved » : ne jamais le publier.
- Les nouveaux hooks ne s'activent qu'après `/hooks` ou un redémarrage de Claude Code.
