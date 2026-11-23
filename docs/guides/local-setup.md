# Installer le dépôt en local

Ce guide installe le monorepo sur un poste de développement, vérifie que les contrôles passent et démarre l'API du couple. À suivre à la première installation ou après un changement de version de Node ou de pnpm.

Le dépôt contient l'outillage, les packages, l'API NestJS (`apps/couple/api`) et le socle de la PWA Next.js (`apps/couple/web`).

## Avant de commencer

- Node.js 22 ou plus récent (`engines.node` du `package.json` racine).
- pnpm à la version fixée par `packageManager` dans le `package.json` racine ; Corepack l'active avec `corepack enable`.
- Docker, pour la base PostgreSQL locale et les tests d'intégration et E2E.
- Un accès au dépôt privé `git@github.com:Thomas-DE-SOUSA/cocooning.git`.

## Étapes

1. Cloner le dépôt et se placer sur `dev` : `git clone git@github.com:Thomas-DE-SOUSA/cocooning.git && cd cocooning && git switch dev`. Résultat attendu : la branche `dev` est active.
2. Installer les dépendances : `pnpm install`. Résultat attendu : l'installation se termine sans erreur et le script `prepare` installe les hooks Husky (`.husky/`).
3. Lancer les contrôles : `pnpm lint`, `pnpm check-types`, `pnpm test`, `pnpm build`. Résultat attendu : les quatre commandes se terminent sans erreur.

## Démarrer l'API

1. Démarrer PostgreSQL 17 avec les identifiants des fichiers `.env.example` : `docker run -d --name cocooning-postgres -e POSTGRES_USER=cocooning -e POSTGRES_PASSWORD=cocooning -e POSTGRES_DB=cocooning -p 127.0.0.1:5432:5432 postgres:17-alpine`. Si le port 5432 est déjà pris, en choisir un autre et le reporter dans les deux `.env` ci-dessous.
2. Créer les deux fichiers d'environnement à partir des exemples : `cp packages/couple/prisma/.env.example packages/couple/prisma/.env` et `cp apps/couple/api/.env.example apps/couple/api/.env`. Dans `apps/couple/api/.env`, remplacer `AUTH_JWT_SECRET` par la sortie de `openssl rand -base64 48`. Les `.env` ne sont jamais versionnés.
3. Appliquer les migrations : `pnpm --filter @cocooning/couple-prisma db:deploy`.
4. Lancer l'API : `pnpm --filter couple-api... build`, puis `pnpm --filter couple-api dev`. Le script reconstruit et relance l'API à chaque changement de `apps/couple/api/src`. `pnpm dev:couple`, depuis la racine, construit d'abord les packages puis les recompile en continu ; l'API relit leur `dist/` à son prochain redémarrage.

Les variables de l'API, leur rôle et leur valeur de développement sont commentés dans `apps/couple/api/.env.example`. `PAIRING_INVITATION_CODE_TTL_HOURS` fixe la durée de validité d'un code d'invitation, en heures entières (`48` en développement, [décision 0028](../couple/decisions/pairing/0028-regles-du-code-d-invitation.md)) : un `.env` créé avant son arrivée doit la recevoir, sinon l'API refuse de démarrer. Au démarrage, l'API valide son environnement (`apps/couple/api/src/env.ts`) et s'arrête si une variable manque ou sort de ses bornes.

## Démarrer la PWA

Lancer `pnpm --filter couple-web... build` une première fois (il construit les packages dont l'app dépend), puis `pnpm --filter couple-web dev`. La PWA répond sur http://localhost:3200 (l'API garde le port 3100). Elle n'a encore besoin d'aucune variable d'environnement.

## Vérifier le résultat

- `git config core.hooksPath` affiche le dossier des hooks Husky, et un commit sur une branche mal nommée est refusé par `validate-branch-name`.
- `curl -i http://localhost:3100/health` répond `200` et `{"status":"UP"}` (port `PORT` du `.env`). Une route non publique répond `401` sans cookie de session valide ; en phase 2, aucun endpoint ne crée encore de session ([décision 0030](../couple/decisions/0030-verification-du-jwt-en-phase-2.md)). Pour essayer les routes de `pairing` (`POST /pairing/couple`, `GET /pairing/couple`), signer un jeton HS256 avec `AUTH_JWT_SECRET` (un `sub` UUID et un `exp`) et l'envoyer dans le cookie `cocooning_session`.
- http://localhost:3200 affiche « Bienvenue sur Cocooning », une adresse inconnue la page « Page introuvable ».
- `pnpm --filter couple-api test:e2e` démarre son propre PostgreSQL dans Docker et passe sans `.env`.

## En cas de problème

| Symptôme | Cause | Correction |
|---|---|---|
| pnpm refuse de s'exécuter ou installe une autre version | Corepack inactif | `corepack enable`, puis relancer `pnpm install` |
| Un paquet récent est refusé à l'installation | `minimumReleaseAge` de `pnpm-workspace.yaml` exige un jour d'ancienneté | Attendre, ou choisir la version précédente |
| L'API s'arrête au démarrage sur une erreur Zod | Variable absente ou invalide dans `apps/couple/api/.env` | Comparer avec `.env.example` ; `AUTH_JWT_SECRET` fait au moins 32 caractères |
| `EADDRINUSE` au démarrage de l'API | Le port `PORT` est déjà pris | Changer `PORT` dans `apps/couple/api/.env` |
| `Cannot find module '.../dist/...'` | Un package n'est pas construit | `pnpm --filter couple-api... build` |

## Voir aussi

- [Contribuer](contributing.md)
