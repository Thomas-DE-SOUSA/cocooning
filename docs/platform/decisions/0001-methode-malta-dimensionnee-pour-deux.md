---
nature: technique
status: acceptée
date: 2026-11-22
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-22
validated-on: 2026-11-22
supersedes:
superseded-by:
premortem:
---

# 0001: La méthode de Malta, dimensionnée pour deux utilisateurs

## Contexte

Cocooning reprend Malta, un monorepo d'entreprise (DDD, hexagonal, NestJS, Next.js, outillage agentique), pour une PWA destinée à un couple. Il fallait dire ce qu'on reprend : l'architecture entière, avec son infrastructure, ou seulement la méthode.

## Décision

Cocooning reprend la méthode et la structure de Malta (arborescence, couches, règles, documentation, outillage agentique) sur une stack et une infrastructure dimensionnées pour deux utilisateurs. C'est l'option A.

Mots du propriétaire, le 2026-11-22 : « Option A […] je parlais de Malta pour prendre un exemple de comment bien structurer et faire un projet ».

## Alternatives écartées

- **Répliquer Malta à l'identique**, infrastructure comprise (AWS, SQS, Kubernetes, domaine IAM, application Expo) : un coût d'exploitation sans rapport avec deux utilisateurs.
- **Livrer le produit au plus simple**, sans la structure de Malta : plus rapide au départ, mais sans les règles écrites qui permettent aux agents de travailler juste.

## Conséquences

- La règle « Mirror Malta » de `CLAUDE.md` porte sur la structure et la méthode ; chaque écart d'infrastructure a sa décision ([déploiement](0006-deploiement-vm-docker-compose-tailscale.md), [PWA](0007-pwa-sans-application-native.md), [outbox](../../couple/decisions/0021-outbox-postgresql-relais-dans-l-api.md), [authentification](../../couple/decisions/0019-authentification-locale.md)).
- Malta reste en lecture seule ; l'analyse qui sert de plan vit dans `_malta-blueprint/` ([décision 0002](0002-depot-prive-blueprint-local.md)).

## Risques

- La méthode coûte cher par bounded context pour un petit produit. Le premier lot est volontairement court ([décision couple 0013](../../couple/decisions/0013-premier-lot.md)).
