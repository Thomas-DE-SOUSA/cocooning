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

# 0027: Photos stockées sur disque derrière un port `FileStorage`

## Contexte

Les photos instantanées ([décision 0014](0014-photo-instantanee.md)) sont des fichiers qu'il faut garder hors de la base. Malta stocke ses fichiers sur S3. Cocooning tourne sur une VM avec `docker compose` ([décision plateforme 0006](../../platform/decisions/0006-deploiement-vm-docker-compose-tailscale.md)), sans AWS. Décision S2 du propriétaire.

## Décision

- Le domaine parle à un port `FileStorage` (classe abstraite du shared-kernel) : déposer, lire, supprimer un fichier par sa clé.
- Le premier adaptateur écrit sur le disque local, dans un volume Docker de la VM ; son dossier racine vient de la configuration.
- Les clés de fichier commencent par le `coupleId` : la portée par couple vaut aussi pour les fichiers.

Mots du propriétaire, le 2026-11-22, sur les recommandations du blueprint : « OK pour tout ».

## Alternatives écartées

- **S3 ou un stockage objet compatible dès le départ** : un service de plus à héberger ou à payer, pour quelques photos par jour.
- **Photos en base (`bytea`)** : la base grossit vite et ses sauvegardes avec.

## Conséquences

- Un adaptateur compatible S3 pourra remplacer l'adaptateur disque sans toucher au domaine.
- La sauvegarde de la VM doit couvrir le volume des photos (runbook à écrire avec le déploiement, phase 6).

## Risques

- Une perte du disque de la VM perd les photos qui ne sont pas sauvegardées.
