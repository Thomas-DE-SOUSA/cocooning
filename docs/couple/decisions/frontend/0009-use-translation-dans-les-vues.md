---
nature: technique
status: acceptée
date: 2026-11-22
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-23
validated-on: 2026-11-23
supersedes:
superseded-by:
premortem:
---

# 0009: Traduction autorisée dans les vues

## Contexte

Dans le Feature Module Pattern, la vue est affichable et testable seule : elle reçoit ses données et ses callbacks en props par son view model. Malta interdisait tout hook dans une vue sauf `useForm`, et imposait au container de construire un objet `translations` ; son module de référence appelait pourtant `useTranslation()` dans ses vues, si bien qu'un agent qui copiait la référence contredisait la knowledge. La PWA `apps/couple/web` doit choisir avant sa première vue.

## Décision

Une vue peut appeler `useTranslation()`. C'est le seul hook qu'elle appelle en plus de `useForm` (et des hooks d'animation de formulaire du design system). Elle ne lance ni requête ni mutation, n'importe ni server action ni gateway, n'appelle pas `useRouter`. Passer les libellés par le view model reste permis, sans être obligatoire.

## Alternatives écartées

- **Toutes les traductions par le view model** : le container recopie chaque clé de la vue dans un objet mémoïsé et typé, pour un gain nul en isolation dès que Storybook charge l'i18n.
- **N'importe quel hook dans la vue** : la vue perd ce qui la rend affichable et testable seule.

## Conséquences

- **Contrôle automatique** : un bloc ESLint sur `apps/couple/web/src/modules/**/ui/views/*.view.tsx`, livré en phase 3, combine `no-restricted-syntax` (tout appel `use*` autre que `useTranslation`, `useForm` et les hooks d'animation du design system) et `no-restricted-imports` (`next/navigation`, `**/gateways/**`, `**/actions/**`). `pnpm lint` échoue.
- Le namespace de traduction d'une vue suit le chemin de sa fonctionnalité, comme pour le container.

## Risques

- Deux vues d'un même module peuvent choisir des namespaces différents. La règle de namespace par chemin de fonctionnalité de `_knowledge/` s'applique à la vue.
