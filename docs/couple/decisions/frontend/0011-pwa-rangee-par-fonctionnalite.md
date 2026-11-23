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

# 0011: La PWA est rangée par fonctionnalité

## Contexte

Cocooning n'a pas d'application native : le client unique est la PWA Next.js `apps/couple/web` ([décision plateforme 0007](../../../platform/decisions/0007-pwa-sans-application-native.md)). Dans Malta, cette décision portait sur l'application mobile, rangée par couche technique : une même fonctionnalité était dispersée dans quatre dossiers sans lien, et rien ne disait où ranger un nouveau fichier. Le web de Malta, lui, suivait déjà le Feature Module Pattern. Cocooning garde le principe et l'applique à son seul client.

## Décision

Le code de la PWA est rangé par fonctionnalité, dans `src/modules/<fonctionnalité>/` : containers, vues, sous-composants, hooks, presenters, view models, gateways et données de la fonctionnalité vivent dans son dossier. Les routes de `src/app/` ne font que monter le container de la fonctionnalité. Seul ce qui sert plusieurs fonctionnalités va dans `src/shared/`, et les primitives visuelles dans `packages/design-system`.

## Alternatives écartées

- **Rangement par couche technique** (`components/`, `hooks/`, `services/` à la racine) : chaque fonctionnalité se disperse et ces dossiers grossissent sans limite.
- **Une convention propre à Cocooning** : un troisième modèle à côté du Feature Module Pattern documenté et de ses modèles d'orchestrateur, sans gain.

## Conséquences

- **Contrôle automatique** : la configuration `eslint-plugin-boundaries` de `config/eslint-config`, étendue en phase 3 à `apps/couple/web`, interdit qu'un module de `src/modules/` importe l'intérieur d'un autre module, et qu'un fichier de `src/app/` importe autre chose que le point d'entrée d'un module ou `src/shared/`. `pnpm lint` échoue.
- Le `CLAUDE.md` de `apps/couple/web` décrit le rangement et pointe vers un module de référence.

## Risques

- La frontière entre composant partagé et composant de fonctionnalité se décide fichier par fichier. Un composant n'entre dans `src/shared/` qu'à sa deuxième fonctionnalité consommatrice.
