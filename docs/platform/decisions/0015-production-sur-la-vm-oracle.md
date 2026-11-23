---
nature: technique
status: acceptée
date: 2026-11-23
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-23
validated-on: 2026-11-23
supersedes: 0006
superseded-by:
premortem:
---

# 0015: Production sur la VM Oracle de Cadence, sans Caddy

## Contexte

La [décision plateforme 0006](0006-deploiement-vm-docker-compose-tailscale.md) prévoyait une VM, `docker compose`, Caddy pour le HTTPS et un accès Tailscale, construits en phase 6. Le propriétaire veut Cocooning en production dès la fin de l'étape 1 de la phase 3, pour installer la PWA sur les deux téléphones. Une VM Oracle Cloud « Always Free » (ARM, Ubuntu) fait déjà tourner Cadence, exposé par `tailscale serve` sur le port 443 de la VM.

## Décision

- Cocooning tourne sur la même VM que Cadence, par `infrastructure/compose/docker-compose.prod.yml` : `postgres` (PostgreSQL 17, volume nommé), `migrate` (cible `runner-init`, applique les migrations Prisma puis s'arrête), `api` (cible `runner`), `web` (Next.js) et `tailscale`.
- Le conteneur `tailscale` donne à Cocooning son propre nom, `https://cocooning.<tailnet>.ts.net`, et termine le HTTPS par `tailscale serve`. Le `web` partage son réseau ; aucun port n'est ouvert sur la VM, et l'API n'est joignable que depuis le réseau du compose.
- Pas de Caddy : Tailscale fournit le certificat et le seul point d'entrée est le web.
- Les images se construisent sur la VM (`docker compose up -d --build`) depuis un clone du dépôt privé par une clé de déploiement en lecture seule. Ni registre d'images, ni CI de déploiement pour l'instant.
- Procédure : [runbook de mise en production](../runbooks/deployment/production.md).

Réponses du propriétaire, le 2026-11-23 : « je veux en prod » ; à la question du périmètre, « Web + API + PostgreSQL (Recommandé) » ; à la question de l'adresse, « Nom dédié (Recommandé) ».

## Alternatives écartées

- **Caddy devant le web et l'API** : un conteneur et une configuration de plus pour un HTTPS que Tailscale fournit déjà.
- **Un autre port sur le nom de la VM** (`tailscale serve --https=8443`) : rien à créer, mais une adresse avec port pour une PWA installée, partagée avec Cadence.
- **Le web seul** : il faudrait refaire le compose et les secrets à l'étape 2, qui a besoin de l'API et de la base.
- **Attendre la phase 6** : la PWA ne s'installe qu'en HTTPS, et l'essai sur les vrais téléphones vaut mieux tôt.

## Conséquences

- Les Dockerfiles suivent la forme de Malta : `infrastructure/docker/nest/Dockerfile` (cibles `runner` et `runner-init`) et `infrastructure/docker/next/Dockerfile`, avec `turbo prune` et un `.dockerignore` en liste blanche. `infrastructure/CLAUDE.md` en porte les pièges.
- Une nouvelle variable de l'API arrive aussi dans le bloc `environment` de `api` du compose (ou dans `infrastructure/compose/.env.example` si c'est un secret), dans le même commit.
- La CI (phase 6) aura à construire ces images et à démarrer la pile.

## Risques

- La VM est un point de panne unique, partagé avec Cadence. La sauvegarde de PostgreSQL est décrite dans le runbook ; sa copie hors de la VM reste à organiser.
- Construire sur la VM consomme sa mémoire : un build qui échoue faute de mémoire se relance, ou l'on agrandit la forme de la VM dans les limites gratuites.
