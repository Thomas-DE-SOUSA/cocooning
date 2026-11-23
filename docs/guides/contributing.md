# Contribuer

Ce guide décrit comment une modification entre dans le dépôt : branche, commits, contrôles locaux, documentation. À lire avant le premier commit. Les règles elles-mêmes sont dans le `CLAUDE.md` racine et dans `_knowledge/core.md` : ce guide y renvoie.

## Avant de commencer

Le dépôt est installé ([Installer le dépôt en local](local-setup.md)).

## Étapes

1. Partir de `dev` à jour et créer une branche par modification : `git switch dev && git pull && git switch -c feat/<sujet>`. Préfixes acceptés : `feat/`, `fix/`, `chore/`, `docs/`, `refactor/`, `test/` (`.validate-branch-namerc`). Résultat attendu : la branche existe et son nom passe le hook de pre-commit.
2. Faire des commits atomiques au format Conventional Commits, en anglais, avec un scope de la liste fermée de `commitlint.config.ts` : `feat(notes): share a note with the partner`. Résultat attendu : le hook `commit-msg` accepte le message.
3. Mettre à jour dans le même commit le `CLAUDE.md` du dossier touché et les pages de `docs/` qu'il liste, et, pour une nouvelle variable d'environnement, `.env.example` et le schéma Zod (section « Environment variable lifecycle » du `CLAUDE.md` racine).
4. Fusionner la branche dans `dev`, puis `dev` dans `main` quand `dev` est stable (décision D23). On ne commite jamais directement sur `main` ni sur `dev`.

## Vérifier le résultat

`pnpm lint`, `pnpm check-types` et `pnpm test` passent sur la branche avant la fusion. `pnpm lint` lance d'abord `scripts/check-event-names.mjs` (décision 0004), puis l'ESLint de chaque package : mocks automatiques dans les specs (décision 0001), hasard et `uuid` dans le code métier (décision 0024), enums, frontières.

## En cas de problème

| Symptôme | Cause | Correction |
|---|---|---|
| Commit refusé : nom de branche invalide | Préfixe absent ou majuscules | `git branch -m <préfixe>/<nom-en-kebab-case>` |
| Commit refusé : scope inconnu | Le scope n'est pas dans `commitlint.config.ts` | Utiliser un scope existant, ou l'ajouter dans le commit qui crée le contexte ou l'app |

## Voir aussi

- [Installer le dépôt en local](local-setup.md)
- [Conventions](../architecture/conventions.md)
