---
nature: technique
status: proposée
date: 2026-11-22
deciders: []
validated-by: à compléter
validated-on:
supersedes:
superseded-by:
premortem:
---

# 0008: Taille d'un composant React jusqu'à 125 lignes

## Contexte

La PWA `apps/couple/web` suit le Feature Module Pattern : containers, vues, sous-composants, hooks, presenters, gateways et view models. Un repère de taille sert de signal en review. Malta a eu deux chiffres contradictoires pour un composant (80 et 125 lignes) avant de trancher pour 125. Les exceptions aux tailles de fichiers restent une question ouverte (D26, phase 2).

## Décision

Un composant React tient en environ 125 lignes ; au-delà, on extrait des sous-composants nommés. Les autres fichiers front (hooks, presenters, gateways, view models) gardent un repère d'environ 80 lignes, le backend environ 100 lignes. Le chiffre est un repère de revue : un dépassement se justifie en une ligne dans la PR.

## Alternatives écartées

- **80 lignes pour un composant** : une vue de formulaire avec ses sections et son état de chargement dépasse vite 80 lignes sans mélanger deux sujets ; tenir ce chiffre disperse une vue sur des fichiers sans nom métier.
- **Aucun repère chiffré** : la review perd son signal pour repérer les composants qui mêlent état, mutations et rendu.

## Conséquences

- **Contrôle automatique** : la règle ESLint `max-lines` (lignes vides et commentaires exclus) fixée à 200 sur les `*.tsx` de `apps/couple/web/src` et de `packages/design-system`, livrée en phase 3 avec le socle web, fait échouer `pnpm lint` au-delà du plafond. Entre 125 et 200 lignes, la lentille frontend de `/coco-review` (phase 5) signale un constat Mineur sans justification dans la PR.
- `_knowledge/` (structure d'un module front) et les modèles de vue de l'orchestrateur disent 125 lignes.

## Risques

- Un composant qui mêle deux sujets peut rester sous 125 lignes. La règle « un fichier, une responsabilité » reste le critère premier, la taille n'est qu'un signal.
