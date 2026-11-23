---
nature: technique
status: acceptée
date: 2026-11-23
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-23
validated-on: 2026-11-23
supersedes:
superseded-by:
premortem:
---

# 0031: Schémas de formulaire construits avec la traduction

## Contexte

Les messages d'erreur d'un formulaire (« ce champ est obligatoire ») s'affichent en français et ne sont jamais écrits en dur. Malta laisse coexister deux façons de faire : une clé i18n brute traduite à l'affichage, ou un schéma qui reçoit la fonction de traduction. Le suffixe des fichiers de schéma n'est pas fixé non plus. La PWA doit choisir avant son premier formulaire (décision D25 du propriétaire).

## Décision

- Un schéma de formulaire se construit par une factory qui reçoit la fonction de traduction : `create<X>Schema(t)`. Chaque message est déjà traduit quand Zod le produit.
- Les clés suivent la forme `form.<field>.errors.<type>` dans le namespace de la fonctionnalité.
- Un fichier de schéma porte le suffixe `*.zod.ts`, celui des contrats de la phase 2. Un seul suffixe pour tout le dépôt.

## Alternatives écartées

- **Clé brute traduite à l'affichage (`t(error.message)`)** : le schéma reste plus simple, mais une clé oubliée ou mal écrite s'affiche telle quelle à l'utilisateur, sans que rien ne le signale.
- **Suffixe `*.schema.ts`** : il obligerait à renommer les contrats existants ou à vivre avec deux suffixes.

## Conséquences

- Les règles 6 et 8 de `_knowledge/core-frontend.md` et `docs/architecture/conventions.md` fixent la convention.
- Le schéma dépend de `t` : le container ou le hook de formulaire le construit, mémoïsé sur `t`.
- Les schémas de contrat de `packages/couple/contract` restent sans traduction : ils valident la frontière de l'API, pas un formulaire.

## Risques

- Un schéma de formulaire et le contrat de la même requête peuvent dériver. Le schéma de formulaire réutilise les bornes du contrat (longueurs, formats) plutôt que de les redéfinir.
