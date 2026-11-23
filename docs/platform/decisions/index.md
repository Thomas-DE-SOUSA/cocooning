# Décisions Plateforme

Le registre des décisions qui touchent tout le monorepo : dépôt, outillage, versions, déploiement, conventions transverses. Les décisions du domaine sont dans [le registre couple](../../couple/decisions/index.md).

- Un fichier par décision, nommé `NNNN-slug.md`, créé depuis `docs/templates/decision.md`. Nature et statut : `docs/CLAUDE.md`, section « Décisions ».
- La numérotation est propre à ce registre : on prend le suivant, quel que soit le sujet.
- Une décision acceptée ne se modifie plus : une remise en cause donne une nouvelle décision qui remplace l'ancienne.

| N° | Décision | Nature | Statut | Date | Validé par |
|---|---|---|---|---|---|
| 0001 | [La méthode de Malta, dimensionnée pour deux utilisateurs](0001-methode-malta-dimensionnee-pour-deux.md) | technique | acceptée | 2026-11-22 | Thomas De Sousa |
| 0002 | [Dépôt privé, analyse de Malta gardée en local](0002-depot-prive-blueprint-local.md) | technique | acceptée | 2026-11-22 | Thomas De Sousa |
| 0003 | [Le segment métier s'appelle `couple`](0003-segment-metier-couple.md) | technique | acceptée | 2026-11-22 | Thomas De Sousa |
| 0004 | [L'orchestrateur `_cocooning-orch` et le préfixe `coco-`](0004-orchestrateur-cocooning-orch.md) | technique | acceptée | 2026-11-22 | Thomas De Sousa |
| 0005 | [Versions des dépendances majeures](0005-versions-des-dependances.md) | technique | acceptée | 2026-11-22 | Thomas De Sousa |
| 0006 | [Déploiement sur une VM par `docker compose`, accès Tailscale](0006-deploiement-vm-docker-compose-tailscale.md) | technique | remplacée par 0015 | 2026-11-22 | Thomas De Sousa |
| 0007 | [Une PWA, sans application native](0007-pwa-sans-application-native.md) | technique | acceptée | 2026-11-22 | Thomas De Sousa |
| 0008 | [Langues du dépôt](0008-langues.md) | technique | acceptée | 2026-11-22 | Thomas De Sousa |
| 0009 | [Flux de branches : `main`, `dev` et une branche par changement](0009-flux-de-branches.md) | technique | acceptée | 2026-11-22 | Thomas De Sousa |
| 0010 | [Numérotation des décisions fondatrices de 0001 à 0012](0010-numerotation-adr-fondatrices.md) | technique | acceptée | 2026-11-22 | Thomas De Sousa |
| 0011 | [Backend en CommonJS sur NestJS 11](0011-backend-commonjs-nest-11.md) | technique | acceptée | 2026-11-22 | Thomas De Sousa |
| 0012 | [Pas de Storybook](0012-pas-de-storybook.md) | technique | acceptée | 2026-11-23 | Thomas De Sousa |
| 0013 | [Couverture de 100 % sur le code métier, sans Stryker](0013-portes-de-qualite.md) | technique | acceptée | 2026-11-23 | Thomas De Sousa |
| 0014 | [Socle technique de la PWA](0014-socle-technique-de-la-pwa.md) | technique | acceptée | 2026-11-23 | Thomas De Sousa |
| 0015 | [Production sur la VM Oracle de Cadence, sans Caddy](0015-production-sur-la-vm-oracle.md) | technique | acceptée | 2026-11-23 | Thomas De Sousa |
