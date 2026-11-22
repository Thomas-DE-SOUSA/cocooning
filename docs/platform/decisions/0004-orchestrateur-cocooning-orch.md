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

# 0004: L'orchestrateur `_cocooning-orch` et le préfixe `coco-`

## Contexte

L'outillage agentique de Malta vit dans un dossier d'orchestrateur nommé d'après le domaine, avec ses sorties dans un dossier voisin et des commandes préfixées. Cocooning a besoin des mêmes noms.

## Décision

L'orchestrateur s'appelle `_cocooning-orch`, ses sorties `_cocooning-output`, et les commandes Claude Code sont préfixées `coco-` (par exemple `/coco-review`).

Mots du propriétaire, le 2026-11-22, sur les recommandations du blueprint : « OK pour tout ».

## Alternatives écartées

- **`_couple-orch` et `couple-`**, miroir strict de Malta : l'orchestrateur sert tout le dépôt, pas seulement le domaine.
- **Préfixe `/cocooning-`** : plus long à taper, sans gain.

## Conséquences

- Contrôle : en phase 5, `scripts/check-prompt-paths.mjs` échoue si une commande, un agent ou un workflow cite un chemin d'orchestrateur ou une commande qui n'existe pas.
- La politique de versionnement de `_cocooning-output` reste ouverte (D16, phase 5).

## Risques

- Aucun risque notable : un renommage reste possible par une recherche et remplacement tant que la phase 5 n'a pas commencé.
