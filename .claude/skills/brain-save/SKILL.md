---
name: brain-save
description: Sauvegarde la mémoire du projet Cocooning (STATE.md, journal, décisions, leçons, index) pour que rien ne soit perdu au prochain /clear. À utiliser quand l'utilisateur dit "sauvegarde", "save", "on va clear", "garde ça en mémoire", à la fin de chaque étape terminée, après chaque décision du propriétaire, et quand le hook Stop le demande.
---

# Sauvegarder la mémoire

Le but : la prochaine session, sans rien de cette conversation, doit pouvoir reprendre exactement où on en est. Écris pour un lecteur qui n'a que les fichiers.

## Étapes

1. **`_brain/STATE.md` : réécrire, pas allonger.** Garde les sections : « Où on en est », « Prochaine étape », « Décisions qui bloquent », « Points d'attention », « Fichiers chauds ». Mets à jour la date en tête. Retire ce qui est fini ou obsolète. 60 lignes au plus.
2. **Journal : `_brain/journal/AAAA-MM-JJ.md`, ajout seulement.** Crée le fichier du jour s'il n'existe pas (`# Journal du AAAA-MM-JJ`). Ajoute une section `## <titre de l'étape>` de 5 à 15 lignes : demande, fait, décidé, appris, fichiers touchés, en attente. Les faits, pas le récit des hésitations.
3. **Décisions : `_brain/DECISIONS.md`.** Une décision passe à `décidée` seulement sur une réponse explicite du propriétaire : note la date et le choix avec ses mots. Une question nouvelle devient une ligne `ouverte`. Dès que `docs/` existe, chaque décision prise devient aussi une ADR, et la ligne renvoie vers elle.
4. **Leçons : `_brain/LESSONS.md`.** Seulement si quelque chose de non évident a coûté du temps ou failli casser. Format : date, symptôme, règle.
5. **Savoir durable : à sa vraie place, pas dans `_brain/`.** Une règle de code va dans `_knowledge/` une fois porté (avant : `LESSONS.md`, section « Règles provisoires »). Le savoir sur un dossier va dans son `CLAUDE.md`. Une procédure faite deux fois devient un skill dans `.claude/skills/<nom>/SKILL.md`.
6. **Index : `_brain/INDEX.md`.** Un nouveau fichier ou une nouvelle section importante ajoute une ligne « question → fichier et section ». Rien d'autre.
7. **Mémoire automatique de Claude.** Seulement les préférences personnelles du propriétaire et ses retours sur la façon de travailler. Jamais les faits du projet : ils vivent dans le dépôt.
8. **Contrôle.** Lance `scripts/check-brain.sh`. S'il signale un dépassement, corrige-le (raccourcir, déplacer vers le niveau à la demande) ou suis le skill `brain-consolidate`.
9. **Réponse.** Une seule ligne : `Mémoire sauvegardée : <ce qui a changé>`.

## Règles

- Un fait vit à un seul endroit. Pour le citer ailleurs, mets un lien.
- Dates absolues (`2026-11-22`), jamais « hier » ni « la semaine dernière ».
- Pas de secret, de mot de passe ni de jeton dans aucun de ces fichiers.
- Rien d'inventé : une information non confirmée reste marquée « à confirmer ».
