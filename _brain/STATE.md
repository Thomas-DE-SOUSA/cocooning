# État du projet

> Mis à jour : 2026-11-22. Dernière consolidation : aucune.
> Ce fichier est réécrit, jamais allongé (60 lignes au plus). L'historique est dans `journal/`.

## Où on en est

- **Phase** : avant la phase 0. Aucun code Cocooning n'existe encore.
- **Fait** : analyse complète de Malta (48 rapports, 8 synthèses, blueprint maître, contrôle de 52 affirmations), dans `_malta-blueprint/`.
- **Fait** : la mémoire du projet est en place et testée : `CLAUDE.md`, `_brain/`, les hooks SessionStart, SessionEnd et Stop, les skills `brain-save` et `brain-consolidate`. Les workflows `malta-*` sont enregistrés dans `.claude/workflows/`.

## Prochaine étape

1. Obtenir du propriétaire les décisions qui bloquent la phase 0 (liste ci-dessous).
2. Lancer la phase 0 du blueprint : squelette du monorepo et packages de configuration (`00-BLUEPRINT.md` §6, « Phase 0 »).

## Décisions qui bloquent la phase 0

Détail et statut dans `DECISIONS.md`, options et recommandations dans `00-BLUEPRINT.md` §8.

- **D1** : nom du segment produit (par défaut `product`).
- **D2** : nom de l'orchestrateur et préfixe des commandes (recommandé : `_cocooning-orch`, `coco-`).
- **D7** : multi-tenant ou non (recommandé : `tenantId` dans les ports dès le départ).
- **D4** : authentification (recommandé : option A, un bounded context local).
- **D8 / D9** : versions (recommandé : parité Malta, soit TS 5.9, Next 15.5, Zod 3).

## Dépôt

- Dépôt privé `Thomas-DE-SOUSA/cocooning`. `main` est stable, `dev` est l'intégration et la branche par défaut, chaque feature a sa branche depuis `dev` (D23).
- `_malta-blueprint/` reste en local, hors git (B1).
- Plan GitHub gratuit en privé : pas de protection de branche, donc la règle « jamais de commit direct sur `main` ni `dev` » tient par discipline (D29 reste ouverte).

## Points d'attention

- Malta est en lecture seule. Le blueprint contient du code propriétaire « All Rights Reserved » : ne jamais le publier.
- Les nouveaux hooks ne s'activent qu'après `/hooks` ou un redémarrage de Claude Code.

## Fichiers chauds

- `_malta-blueprint/00-BLUEPRINT.md` (plan maître)
- `_brain/DECISIONS.md`
