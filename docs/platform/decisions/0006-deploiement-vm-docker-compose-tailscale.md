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

# 0006: Déploiement sur une VM par `docker compose`, accès Tailscale

## Contexte

Malta se déploie sur Kubernetes avec Helm et Argo CD, sur AWS. Cocooning sert deux personnes et doit rester privé.

## Décision

Cocooning tourne sur une VM, par `docker compose` : l'API, le web, PostgreSQL et Caddy. L'accès passe par Tailscale, en HTTPS sur un nom `*.ts.net`, sur le modèle du projet `cadence`.

Mots du propriétaire, le 2026-11-22, sur les recommandations du blueprint : « OK pour tout ».

## Alternatives écartées

- **Kubernetes, Helm et Argo CD** : un cluster à maintenir pour quatre conteneurs.
- **Un PaaS** (Scaleway Serverless Containers, Fly, Render) : l'application serait exposée sur Internet, et ses données hébergées chez un tiers.

## Conséquences

- Un seul fichier `docker compose` décrit la production ; Caddy termine le HTTPS.
- Tailscale fournit le HTTPS que le Web Push et l'installation de la PWA exigent.
- La CI et le déploiement se construisent en phase 6 ; leur contrôle est le test de démarrage de la pile `docker compose` dans la CI.

## Risques

- Une VM unique est un point de panne unique, sans redondance. La sauvegarde de PostgreSQL est le runbook prioritaire de la phase 6.
- Le Web Push passe par les serveurs de notification d'Apple et Google : la VM doit pouvoir les joindre en sortie.
