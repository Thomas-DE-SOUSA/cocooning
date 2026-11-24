# Cocooning

**Notre petit monde à deux.** Cocooning est une application pour un couple : des notes que l'on écrit ensemble en direct, un agenda partagé, et bientôt des photos et des petits mots doux. Elle s'installe sur l'iPhone et sur Android comme une vraie app, et elle ne parle qu'à notre propre serveur.

Deux utilisateurs, un serveur, aucune donnée chez personne d'autre.

---

## Ce que fait l'app

### Notes
- Des notes riches : titres, gras, italique, listes, cases à cocher.
- **Écrites à deux en même temps** : chaque frappe de l'un apparaît chez l'autre en moins d'une seconde.
- Partagées par défaut, ou gardées pour soi. Une liste de courses est simplement une note titrée « Courses ».

### Agenda
- Un calendrier classique : on parcourt les mois et les années, on touche un jour, on y ajoute un événement.
- Un titre, un jour, des heures si on veut, plusieurs jours pour un week-end ou un voyage, une description.
- Partagé par défaut, avec une case **« Rien que pour moi »** pour préparer une surprise : l'autre ne voit même pas qu'il existe.
- Chaque événement porte la couleur de son auteur.

### Nous
- Le compteur de notre histoire : « Ensemble dans notre cocooning depuis 2 969 jours ».
- La déconnexion de ce téléphone.

### Bientôt
- **Messages** : une photo prise sur le moment, des mots flash (« je t'aime », « coucou »), avec une notification sur le téléphone de l'autre.

---

## Comment c'est construit

```
            iPhone, Android (PWA installée)
                        │  Tailscale (réseau privé)
                        ▼
   ┌──────────────── VM Oracle (docker compose) ────────────────┐
   │  tailscale serve ──► web  : Next.js 16, la PWA             │
   │                 └──► api  : NestJS 11, /collab (WebSocket) │
   │                       │                                    │
   │                       ▼                                    │
   │                   PostgreSQL 17  (sauvegarde chaque nuit)  │
   └────────────────────────────────────────────────────────────┘
```

- **Une PWA**, pas d'app native : installée depuis Safari ou Chrome, plein écran, hors ligne pour la coquille de l'app.
- **Accessible seulement par Tailscale** : rien n'est exposé sur Internet, le réseau privé fait office de porte d'entrée.
- **Édition à deux** par Yjs, Tiptap et Hocuspocus, servi par l'API elle-même.
- **Une direction artistique** pensée pour le cocon : « Lin et terre cuite », crème, terre cuite et sauge, en clair et en sombre, contrastes WCAG vérifiés.

### L'architecture

Le code suit le **Domain-Driven Design** et l'**architecture hexagonale** (ports et adaptateurs), dans un monorepo **pnpm + Turborepo**. Chaque fonctionnalité est un *bounded context* : `authentication`, `pairing` (la mise en couple), `notes`, `agenda`, puis `messaging`.

```
apps/couple/
├── api/                        NestJS : composition, contrôleurs, adaptateurs, commandes d'exploitation
└── web/                        Next.js : la PWA, un module par fonctionnalité
packages/
├── couple/
│   ├── server-business-logic/  Domaine et application (TypeScript pur, aucun framework)
│   ├── client-business-logic/  Logique du téléphone (cas d'usage, formulaires), sans framework
│   ├── client-infrastructure/  Appels à l'API
│   ├── contract/               Contrats HTTP en Zod, partagés par l'API et la PWA
│   ├── prisma/                 Schéma, migrations, unité de travail
│   ├── shared-kernel/          Enums, limites et routes du domaine
│   └── e2e-shared/             Harnais de tests de bout en bout (Postgres jetable)
├── shared-kernel/              Primitives DDD, ports, exceptions
├── server-infrastructure/      Plomberie NestJS, logs, horloge, événements
├── client-infrastructure/      Le client HTTP unique
└── design-system/              Composants (style shadcn) et tokens Tailwind 4
```

Les dépendances pointent toujours vers le domaine : le métier ne connaît ni NestJS, ni Prisma, ni React.

### La stack

| Domaine | Outils |
|---|---|
| Langage | TypeScript, Node 22 |
| Serveur | NestJS 11, Prisma 7, PostgreSQL 17, Zod, pino |
| PWA | Next.js 16 (App Router), React 19, Tailwind 4, Serwist, react-hook-form |
| Composants | style shadcn, react-day-picker, vaul, Radix, lucide |
| Temps réel | Yjs, Tiptap 3, Hocuspocus |
| Qualité | Jest, Testing Library, Testcontainers, ESLint, Prettier, commitlint, husky |
| Déploiement | Docker Compose, Tailscale, VM Oracle |

---

## Démarrer en local

Prérequis : Node 22, Corepack (pnpm 12), Docker.

```bash
corepack enable
pnpm install
pnpm build
```

Puis suivre le guide [Installer le dépôt en local](docs/guides/local-setup.md) : base PostgreSQL, fichiers `.env`, création des comptes, démarrage de l'API (port 3100) et de la PWA (port 3200), essai sur le téléphone.

| Commande | Rôle |
|---|---|
| `pnpm dev` | Lance tout en mode développement |
| `pnpm build` | Construit chaque app et package |
| `pnpm test` | Tests unitaires |
| `pnpm --filter couple-api test:e2e` | Tests de bout en bout contre un vrai PostgreSQL |
| `pnpm lint`, `pnpm check-types` | Lint et vérification des types |
| `pnpm format` | Prettier |

Avant chaque commit : `pnpm check-types && pnpm lint && pnpm test && pnpm build`, puis les tests de bout en bout.

---

## Comment on travaille

- **Une branche par changement**, depuis `dev` ; `dev` est l'intégration, `main` ce qui tourne en production. Commits conventionnels en anglais.
- **Une PR à la fois**, relue, mergée seulement après accord.
- **Les règles d'abord** : chaque fonctionnalité commence par ses règles métier et ses décisions écrites dans `docs/`, puis une maquette validée, puis le code.
- **La documentation vit avec le code** : chaque dossier a son `CLAUDE.md`, mis à jour dans le même commit que le code qu'il décrit.
- **Écrit avec Claude Code** : le dépôt porte sa propre mémoire de projet (`_brain/`), pour reprendre le fil d'une session à l'autre.

---

## Où lire la suite

| Sujet | Où |
|---|---|
| Pourquoi cette architecture, carte des contextes, glossaire | [docs/architecture/](docs/architecture/index.md) |
| Règles métier de chaque fonctionnalité | [docs/couple/business-rules/](docs/couple/business-rules/index.md) |
| Décisions (produit et techniques) | [domaine](docs/couple/decisions/index.md), [plateforme](docs/platform/decisions/index.md) |
| Design system et tokens | [docs/design/](docs/design/index.md) |
| Installer, contribuer | [docs/guides/](docs/guides/index.md) |
| Mise en production | [runbook](docs/platform/runbooks/deployment/production.md) |
| Règles de code | [_knowledge/](_knowledge/core.md) |
