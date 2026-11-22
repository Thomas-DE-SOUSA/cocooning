# État du projet

> Mis à jour : 2026-11-22 (22:30). Dernière consolidation : aucune.
> Ce fichier est réécrit, jamais allongé (60 lignes au plus). L'historique est dans `journal/`.

## Où on en est

- **Phase** : phase 0 terminée et vérifiée sur la branche `chore/phase-0-monorepo` (depuis `dev`), **pas encore commitée** : 125 fichiers dans l'arbre de travail.
- **Fait** : analyse complète de Malta (48 rapports, 8 synthèses, blueprint maître, contrôle de 52 affirmations), dans `_malta-blueprint/`.
- **Fait** : la mémoire du projet est en place et testée : `CLAUDE.md`, `_brain/`, les hooks SessionStart, SessionEnd et Stop, les skills `brain-save` et `brain-consolidate`. Les workflows `malta-*` sont enregistrés dans `.claude/workflows/`.

## Le produit (vision du propriétaire, 2026-11-22)

- App pour un couple, iPhone et Samsung, en PWA servie via Tailscale comme `/perso/cadence`.
- Modules évoqués : courses (chez chacun + commune), activités, wishlist, agenda partagé coloré par personne, questions posées par une IA, photo instantanée et mots flash en notification, liste de visionnage enrichie par IA, fiches lieux (prix, genre) filtrables, notes perso ou partagées. Détail : `journal/2026-11-22.md`, « Vision produit ».

## Prochaine étape

1. Obtenir l'accord du propriétaire pour commiter la phase 0 (commits atomiques proposés : outillage `config`, loi `knowledge`, docs, ADR, mémoire `brain`), pousser, PR vers `dev`.
2. Faire valider les 12 ADR fondatrices (`proposée`). P6 (mise en couple par code) et P7 décidées ; confirmer le nom du contexte `pairing`.
3. Phase 1 : noyaux partagés et packages d'infrastructure (`00-BLUEPRINT.md` §6, « Phase 1 »). Décisions à trancher avant : D12, D13, D14 (et D5, D6, D7, D8 déjà décidées).

## Fichiers chauds

- `CLAUDE.md`, `_knowledge/core.md`, `docs/CLAUDE.md`, `config/eslint-config/boundaries.js`
- `_malta-blueprint/00-BLUEPRINT.md` §6 (phase 1)

## Dépôt

- Dépôt privé `Thomas-DE-SOUSA/cocooning`. `main` est stable, `dev` est l'intégration et la branche par défaut, chaque feature a sa branche depuis `dev` (D23).
- `_malta-blueprint/` reste en local, hors git (B1).
- Plan GitHub gratuit en privé : pas de protection de branche, donc la règle « jamais de commit direct sur `main` ni `dev` » tient par discipline (D29 reste ouverte).

## Points d'attention

- Malta est en lecture seule. Le blueprint contient du code propriétaire « All Rights Reserved » : ne jamais le publier.
- Les nouveaux hooks ne s'activent qu'après `/hooks` ou un redémarrage de Claude Code.
