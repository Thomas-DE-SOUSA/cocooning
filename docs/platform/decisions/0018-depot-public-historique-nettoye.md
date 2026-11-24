---
nature: technique
status: acceptée
date: 2026-11-24
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-24
validated-on: 2026-11-24
supersedes: 0002
superseded-by:
premortem:
---

# 0018: Dépôt public, historique nettoyé

## Contexte

Le propriétaire veut rendre le dépôt public, avec un README qui présente l'app. La [décision plateforme 0002](0002-depot-prive-blueprint-local.md) le gardait privé. Un audit avant publication a relevé dans les fichiers et dans l'historique : l'adresse e-mail d'un compte du couple, le nom de l'éditeur de Malta, les chemins du poste du propriétaire, le nom du réseau Tailscale, et deux scripts qui décrivent l'analyse de Malta. GitHub garde aussi une copie des fichiers de chaque pull request, qu'aucune réécriture de l'historique n'efface.

## Décision

1. Le dépôt `Thomas-DE-SOUSA/cocooning` devient public. L'ancien dépôt, avec ses pull requests, est renommé `cocooning-archive` et reste privé.
2. Le nouveau dépôt reçoit l'historique de `main` et de `dev` réécrit : l'adresse e-mail remplacée par une adresse d'exemple, le nom de l'éditeur retiré, les chemins du poste et le nom du réseau Tailscale remplacés, les deux scripts d'analyse de Malta retirés de chaque commit.
3. Les chemins locaux et le nom du réseau vivent dans `CLAUDE.local.md`, non versionné ; les scripts d'analyse de Malta restent sur le poste, listés dans `.gitignore`.
4. `_malta-blueprint/` reste en local, jamais versionné, comme le prévoyait la décision 0002.
5. Aucune donnée personnelle du couple (adresse, date, mot de passe) n'entre dans le dépôt.

Réponses du propriétaire, le 2026-11-24 : « Fait un beau readme pour expliquer tout ça et met le repo en public », puis « Nettoyer puis publier (Recommandé) » et « Nouveau dépôt public propre (Recommandé) ».

## Alternatives écartées

- **Publier tel quel** : l'adresse e-mail d'un partenaire, le nom de l'éditeur et l'historique du projet deviendraient publics, sans retour possible.
- **Réécrire l'historique et ouvrir le même dépôt** : les anciennes pull requests montreraient encore les fichiers d'origine à qui les ouvre.
- **Rester privé** : écarté par le propriétaire.

## Conséquences

- La VM de production et le poste du propriétaire suivent le nouveau dépôt ; la clé de déploiement de la VM y est ajoutée en lecture seule.
- Les numéros de pull request repartent de zéro ; les anciens numéros cités dans `_brain/` et `docs/` renvoient à `cocooning-archive`.
- La décision 0002 est remplacée par celle-ci.

## Risques

- Une copie de l'ancien historique reste dans `cocooning-archive` et sur le poste : elle ne doit jamais redevenir publique.
- Un futur commit peut réintroduire une donnée personnelle : la règle « Aucun identifiant réel dans la mémoire » de `_brain/LESSONS.md` s'applique à tout le dépôt.
