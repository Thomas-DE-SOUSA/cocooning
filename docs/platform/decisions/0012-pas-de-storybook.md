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

# 0012: Pas de Storybook

## Contexte

Malta fait de Storybook une porte de qualité : une story par vue, comptée par un script. La PWA `apps/couple/web` arrive en phase 3 et il faut savoir si elle porte ce catalogue (décision D19 du propriétaire). Cocooning sert deux utilisateurs et un seul développeur (décision P1).

## Décision

La PWA et le design system n'ont pas de Storybook. Une vue reste affichable seule, sans mock, parce que son test la rend avec des props : c'est ce test qui prouve son isolation. Les écrans se vérifient dans l'app elle-même.

## Alternatives écartées

- **Storybook obligatoire, une story par vue comptée par script (Malta)** : un outil, une configuration et un fichier de plus par vue à maintenir, pour un catalogue que personne d'autre ne consulte.
- **Storybook installé, non bloquant** : un outil qu'on entretient sans obligation finit sans stories à jour ; le coût reste, le bénéfice part.

## Conséquences

- La règle 3 de `_knowledge/core-frontend.md` parle d'une vue rendue seule dans son test, plus de Storybook.
- Aucun fichier `*.stories.tsx` ni dossier `.storybook/` dans le dépôt.
- Réintroduire Storybook demande une nouvelle décision qui remplace celle-ci.

## Risques

- Sans catalogue, un composant du design system ne se voit que dans un écran qui l'utilise : un état rare (erreur, chargement) peut n'être vu qu'en test.
