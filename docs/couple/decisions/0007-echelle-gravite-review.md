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

# 0007: Une échelle de gravité à trois niveaux pour les reviews

## Contexte

Les reviews de Cocooning seront faites par des agents (commandes `/coco-review`, lentilles, workflows de l'orchestrateur `_cocooning-orch`). Dans Malta, trois échelles de gravité coexistaient selon l'outil, et un même constat changeait de niveau, donc de verdict. La forme de la review agentique au démarrage reste ouverte (D28, phase 5), mais l'échelle doit être fixée avant d'écrire le premier outil.

## Décision

Toute review utilise une seule échelle à trois niveaux, avec ces identifiants :

- **Critique** (`CRITICAL`) : bloque la fusion, à corriger avant de continuer ;
- **Important** (`IMPORTANT`) : à traiter, risque de bug ou de dérive d'architecture ;
- **Mineur** (`MINOR`) : facultatif, style ou petite amélioration.

Le verdict est PASS si aucun constat n'est Critique. Aucun workflow n'ajoute de seuil propre.

## Alternatives écartées

- **Quatre niveaux** (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) : la frontière entre les deux derniers ne change aucune action.
- **Un seuil d'Importants par workflow** : un second critère de verdict, propre à un outil, fait passer ou échouer une même review selon l'outil qui la lance.

## Conséquences

- **Contrôle automatique** : `scripts/check-doctrine-drift.mjs`, livré en phase 5 avec l'outillage agentique, échoue si une autre échelle (`HIGH`, `MAJOR`, `MEDIUM`, `LOW`, `info`) apparaît dans `_knowledge/`, `_cocooning-orch/`, `.claude/commands/`, `.claude/workflows/` ou `.claude/skills/`. Il tourne au `pre-commit`.
- L'échelle est écrite une fois dans `_knowledge/` ; les rapports YAML comptent `critical`, `important`, `minor`.

## Risques

- Malta a modifié sa décision après acceptation pour y ajouter des outils oubliés. Ici, un outil nouveau qui garde sa propre échelle donne une nouvelle décision, pas une retouche de celle-ci.
