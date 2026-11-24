# Index de la mémoire : où trouver quoi

> Une ligne par entrée. On lit la section indiquée, jamais tout le fichier : `grep -n '^## ' <fichier>`, puis Read avec offset.
> Les numéros 00 à 99 désignent les fichiers de `_malta-blueprint/` (instantané de Malta au commit `ef877b4bf`, en lecture seule).

## Mémoire de travail

| Question | Où |
|---|---|
| Où en est-on, quelle est la prochaine étape ? | [STATE.md](STATE.md) (déjà chargé) |
| Quelles décisions sont prises ou ouvertes ? | [DECISIONS.md](DECISIONS.md) |
| Quels pièges et quelles leçons connaît-on ? | [LESSONS.md](LESSONS.md) |
| Qu'a-t-on fait tel jour ? | [journal/](journal/), `rg -n "<mot>" _brain/journal` |
| Quelles références et directions pour la DA, où est la planche ? | [journal/2026-11-24.md](journal/2026-11-24.md), « Direction artistique : recherche » et « … : planche publiée » |
| Comment fonctionne cette mémoire ? | [README.md](README.md) |

## Loi et documentation de Cocooning

| Question | Où |
|---|---|
| Règles de code (39 règles cœur, backend, frontend, review) | [_knowledge/core.md](../_knowledge/core.md), `core-backend.md`, `core-frontend.md`, `core-review.md` |
| Canons backend (shared-kernel, Prisma, concurrence, adaptateurs, contrats Zod) | [_knowledge/backend/](../_knowledge/backend/) |
| Charte de `docs/`, modèle de `CLAUDE.md` par niveau | [docs/CLAUDE.md](../docs/CLAUDE.md) |
| Modèles (ADR, runbook, règle métier…) | [docs/templates/](../docs/templates/) |
| Pourquoi cette architecture, carte des contextes, glossaire, conventions | [docs/architecture/](../docs/architecture/index.md) |
| Installation locale, contribution | [docs/guides/](../docs/guides/index.md) |
| Registres des ADR | [plateforme](../docs/platform/decisions/index.md), [couple](../docs/couple/decisions/index.md) |
| Où ranger chaque savoir | [README.md](README.md), « Où va chaque savoir » |

## Référence Malta : plan et cadrage

| Question | Où |
|---|---|
| Plan de mise en place, phase par phase | [00](../_malta-blueprint/00-BLUEPRINT.md) §6 |
| Arborescence cible de Cocooning | [00](../_malta-blueprint/00-BLUEPRINT.md) §4 |
| Renommages Malta → Cocooning | [00](../_malta-blueprint/00-BLUEPRINT.md) §5 |
| Décisions à prendre (options et recommandations) | [00](../_malta-blueprint/00-BLUEPRINT.md) §8 |
| Les 30 règles d'or | [00](../_malta-blueprint/00-BLUEPRINT.md) §9 |
| Ce qu'il ne faut pas reproduire | [00](../_malta-blueprint/00-BLUEPRINT.md) §7 |
| Stack et versions | [00](../_malta-blueprint/00-BLUEPRINT.md) §3, [40](../_malta-blueprint/40-monorepo-outillage-ci-infra.md) §2 |
| Affirmations vérifiées et corrigées | [99](../_malta-blueprint/99-ecarts-et-verifications.md) |
| Détail brut d'une zone de Malta | [raw/](../_malta-blueprint/raw/) (liste : 00 §2.2) |

## Backend

| Question | Où |
|---|---|
| Couches et règle de dépendance | [10](../_malta-blueprint/10-backend-domaine-application.md) §1 |
| Anatomie d'un bounded context, suffixes de fichiers | [10](../_malta-blueprint/10-backend-domaine-application.md) §3 |
| Primitives du shared-kernel (code) | [10](../_malta-blueprint/10-backend-domaine-application.md) §5 |
| Agrégats, VO, enums | [10](../_malta-blueprint/10-backend-domaine-application.md) §6 |
| Exceptions, événements, ports | [10](../_malta-blueprint/10-backend-domaine-application.md) §7 à §9 |
| Use cases et guard services | [10](../_malta-blueprint/10-backend-domaine-application.md) §11 |
| Checklist d'un nouveau bounded context | [10](../_malta-blueprint/10-backend-domaine-application.md) §18 |
| Bootstrap NestJS, env Zod, AppModule | [11](../_malta-blueprint/11-backend-infrastructure-apps.md) §3 à §5 |
| Câblage des modules (`useFactory`) | [11](../_malta-blueprint/11-backend-infrastructure-apps.md) §6 |
| Contrôleurs, DTO, mappers | [11](../_malta-blueprint/11-backend-infrastructure-apps.md) §7 |
| Prisma 7 | [11](../_malta-blueprint/11-backend-infrastructure-apps.md) §10 |
| Repositories, transactions, verrous | [11](../_malta-blueprint/11-backend-infrastructure-apps.md) §11 et §12 |
| Outbox, SQS, worker, crons | [11](../_malta-blueprint/11-backend-infrastructure-apps.md) §13 |

## Frontend

| Question | Où |
|---|---|
| Couches front et chaîne de données | [20](../_malta-blueprint/20-frontend-web-mobile.md) §1 et §2 |
| Socle Next.js | [20](../_malta-blueprint/20-frontend-web-mobile.md) §6 |
| Feature Module Pattern | [20](../_malta-blueprint/20-frontend-web-mobile.md) §7 |
| Design system, mobile Expo | [20](../_malta-blueprint/20-frontend-web-mobile.md) §9 et §10 |

## Système agentique

| Question | Où |
|---|---|
| Hiérarchie des CLAUDE.md, `_knowledge/` | [30](../_malta-blueprint/30-systeme-agentique.md) §2 et §3 |
| Orchestrateur Archon, commandes, workflows | [30](../_malta-blueprint/30-systeme-agentique.md) §4 à §6 |
| Garde-fous mécaniques, BMAD, skills | [30](../_malta-blueprint/30-systeme-agentique.md) §8, §11, §13 |
| Plan de portage de l'outillage IA | [30](../_malta-blueprint/30-systeme-agentique.md) §16 |

## Outillage, qualité, conventions, transverses

| Question | Où |
|---|---|
| pnpm, turbo, packages de config, ESLint boundaries | [40](../_malta-blueprint/40-monorepo-outillage-ci-infra.md) §4 à §7 |
| Docker local, CI GitHub Actions | [40](../_malta-blueprint/40-monorepo-outillage-ci-infra.md) §11 et §16 |
| Recette de scaffold (essentiel ou superflu) | [40](../_malta-blueprint/40-monorepo-outillage-ci-infra.md) §19 |
| Règles de qualité, canon des tests de use case | [50](../_malta-blueprint/50-qualite-tests-review.md) §2 et §4 |
| E2E, Stryker, doctrine de review | [50](../_malta-blueprint/50-qualite-tests-review.md) §7, §10, §12 |
| Philosophie, langage ubiquitaire, nommage | [60](../_malta-blueprint/60-documentation-conventions-philosophie.md) §1 à §3 |
| `docs/`, modèles (ADR…), registre des ADR | [60](../_malta-blueprint/60-documentation-conventions-philosophie.md) §4, §5, §7 |
| Variables d'environnement, conventions git | [60](../_malta-blueprint/60-documentation-conventions-philosophie.md) §8 et §9 |
| IAM, multi-tenant, permissions | [70](../_malta-blueprint/70-transverses-iam-ia-multitenant.md) §2 à §4 |
| Assistant IA, observabilité | [70](../_malta-blueprint/70-transverses-iam-ia-multitenant.md) §5 et §6 |

## Outils de la mémoire

| Outil | Où |
|---|---|
| Skills `/brain-save` et `/brain-consolidate` | [.claude/skills/](../.claude/skills/) |
| Hooks (démarrage, fin de session, rappel de sauvegarde) | [.claude/settings.json](../.claude/settings.json), [.claude/hooks/](../.claude/hooks/) |
| Contrôle des budgets et des liens | [scripts/check-brain.sh](../scripts/check-brain.sh) |
| Récupérer la fin de la dernière session | [scripts/brain-last-session.sh](../scripts/brain-last-session.sh) |
| Relancer l'analyse de Malta | [.claude/workflows/](../.claude/workflows/) |
