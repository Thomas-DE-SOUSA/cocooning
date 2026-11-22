# Installer le dépôt en local

Ce guide installe le monorepo sur un poste de développement et vérifie que les contrôles passent. À suivre à la première installation ou après un changement de version de Node ou de pnpm.

En phase 0, le dépôt ne contient que l'outillage (configurations TypeScript, ESLint, Prettier, Jest, hooks git) et la documentation. Aucune application ne démarre encore : l'API, l'app web, PostgreSQL en local et les variables d'environnement arrivent avec les phases 1 à 3.

## Avant de commencer

- Node.js 22 ou plus récent (`engines.node` du `package.json` racine).
- pnpm à la version fixée par `packageManager` dans le `package.json` racine ; Corepack l'active avec `corepack enable`.
- Un accès au dépôt privé `git@github.com:Thomas-DE-SOUSA/cocooning.git`.

## Étapes

1. Cloner le dépôt et se placer sur `dev` : `git clone git@github.com:Thomas-DE-SOUSA/cocooning.git && cd cocooning && git switch dev`. Résultat attendu : la branche `dev` est active.
2. Installer les dépendances : `pnpm install`. Résultat attendu : l'installation se termine sans erreur et le script `prepare` installe les hooks Husky (`.husky/`).
3. Lancer les contrôles : `pnpm lint`, `pnpm check-types`, `pnpm test`. Résultat attendu : les trois commandes se terminent sans erreur.

## Vérifier le résultat

`git config core.hooksPath` affiche le dossier des hooks Husky, et un commit sur une branche mal nommée est refusé par `validate-branch-name`.

## En cas de problème

| Symptôme | Cause | Correction |
|---|---|---|
| pnpm refuse de s'exécuter ou installe une autre version | Corepack inactif | `corepack enable`, puis relancer `pnpm install` |
| Un paquet récent est refusé à l'installation | `minimumReleaseAge` de `pnpm-workspace.yaml` exige un jour d'ancienneté | Attendre, ou choisir la version précédente |

## Voir aussi

- [Contribuer](contributing.md)
