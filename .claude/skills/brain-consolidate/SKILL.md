---
name: brain-consolidate
description: Consolide et élague la mémoire du projet Cocooning pour qu'elle grossisse sans ralentir. Le savoir répété du journal monte à sa vraie place, les budgets sont tenus, les liens morts et les doublons sont retirés, les vieux journaux sont archivés. À utiliser quand scripts/check-brain.sh ou le hook de démarrage signale un dépassement, à la fin d'une phase du blueprint, une fois par semaine, ou quand l'utilisateur dit "consolide", "fais le ménage dans ta mémoire".
---

# Consolider la mémoire

La mémoire grossit par distillation, pas par accumulation. Le niveau toujours chargé (`CLAUDE.md`, `STATE.md`, `INDEX.md`) reste petit. Le reste peut grandir parce qu'il est seulement indexé.

## Étapes

1. **État des lieux.** Lance `scripts/check-brain.sh`. Lis la ligne « Dernière consolidation » en tête de `_brain/STATE.md`.
2. **Relire le journal depuis la dernière consolidation.** S'il dépasse environ 300 lignes, confie la lecture à un sous-agent. Demande-lui une liste « fait répété ou durable → destination proposée », pas un résumé.
3. **Distiller chaque fait durable vers sa place :**
   - une décision prise devient une ADR dans `docs/` une fois `docs/` créé, et sa ligne dans `DECISIONS.md` renvoie vers l'ADR ;
   - une leçon vue deux fois devient une règle dans `_knowledge/` ou dans le `CLAUDE.md` du dossier, et l'entrée de `LESSONS.md` renvoie vers elle ;
   - une procédure refaite devient un skill dans `.claude/skills/<nom>/SKILL.md`, avec une description qui dit quand l'utiliser ;
   - un savoir sur un dossier va dans le `CLAUDE.md` de ce dossier.
4. **Élaguer.**
   - Dans `STATE.md`, retirer ce qui est terminé.
   - Dans `DECISIONS.md`, réduire à une ligne de renvoi une décision transcrite en ADR.
   - Dans `LESSONS.md`, retirer les doublons, et corriger ou supprimer une leçon devenue fausse.
   - Dans `INDEX.md`, retirer les entrées mortes.
   - Dans la mémoire automatique de Claude, supprimer ce qui est faux ou déjà écrit dans le dépôt.
5. **Archiver.**
   - Les journaux de plus de 30 jours sont concaténés dans `_brain/journal/archive/AAAA-MM.md` (un fichier par mois). Supprimer ensuite les fichiers du jour concaténés. Ils restent cherchables avec `rg`.
   - Ne garder que les 200 dernières lignes de `_brain/journal/sessions.log`.
6. **Diviser plutôt que tasser.** Si `INDEX.md` approche de son budget, on ne compresse pas les lignes. On crée un sous-index par domaine (par exemple `docs/index.md`, ou un `CLAUDE.md` de dossier) et `INDEX.md` y renvoie en une ligne.
7. **Clore.** Mets à jour « Dernière consolidation : AAAA-MM-JJ » dans `STATE.md`. Ajoute au journal du jour une section `## Consolidation` qui liste ce qui a été déplacé, supprimé et archivé. Relance `scripts/check-brain.sh` : il doit répondre `OK`.

## Règles

- Ne jamais supprimer une information sans l'avoir d'abord déplacée à sa place, ou sans l'avoir vérifiée comme fausse ou obsolète.
- Ne jamais réécrire l'histoire. On ne modifie pas un journal passé : on l'archive.
- `_malta-blueprint/` est une référence figée (Malta au commit `ef877b4bf`). On ne la consolide pas. On la rafraîchit seulement avec `.claude/workflows/malta-*.js`, sur demande du propriétaire.
