# La mémoire de Cocooning

Ce dossier sert de mémoire de travail à Claude sur ce projet. Grâce à lui, un `/clear`, une compaction ou une nouvelle session ne fait rien perdre. La mémoire grandit à chaque session et reste rapide à charger.

## Le principe : quatre niveaux

La mémoire grandit, mais le contexte chargé à chaque session reste petit. Plus le savoir est volumineux, plus il est rangé loin et chargé tard.

| Niveau | Chargé | Contenu | Budget |
|---|---|---|---|
| 0. Toujours | à chaque session, après `/clear` et après compaction | `CLAUDE.md`, plus `STATE.md` et `INDEX.md` qu'il importe ; l'index de la mémoire automatique de Claude | environ 300 lignes au total |
| 1. Selon le dossier | quand Claude travaille dans un dossier | le `CLAUDE.md` de ce dossier, puis le `_knowledge/` qu'il importe (modèle Malta) | court, par dossier |
| 2. À la demande | quand la question le demande, via `INDEX.md` | `DECISIONS.md`, `LESSONS.md`, les synthèses de `_malta-blueprint/`, `docs/`, le contenu des skills | illimité, lu par section |
| 3. Archive | jamais chargé en entier, seulement cherché (`rg`) | `journal/`, `_malta-blueprint/raw/`, les transcripts | illimité |

`INDEX.md` est le routeur : pour chaque question, il donne le fichier et la section exacte. Claude ne lit jamais une synthèse entière. Il lit la section utile, ou il confie une lecture large à un sous-agent pour garder son propre contexte léger.

## Les fichiers

| Fichier | Rôle | Règle d'écriture |
|---|---|---|
| `STATE.md` | où on en est, prochaine étape, blocages | **réécrit** à chaque sauvegarde, 60 lignes au plus |
| `INDEX.md` | carte « question → fichier et section » | une ligne par entrée, liens vérifiés par script |
| `DECISIONS.md` | statut de chaque décision du propriétaire | « décidée » seulement sur une réponse explicite ; devient une ADR quand `docs/` existe |
| `LESSONS.md` | pièges, incidents, leçons | symptôme → règle ; promue en règle si elle revient |
| `journal/AAAA-MM-JJ.md` | récit de chaque session | **ajout seulement**, jamais chargé automatiquement |
| `journal/sessions.log` | une ligne par session terminée (date, raison, transcript) | écrit par le hook de fin de session |

## Où va chaque savoir

Chaque type de savoir a une seule place. Le `CLAUDE.md` racine renvoie ici avant toute écriture.

| Ce que tu as appris | Où ça va |
|---|---|
| L'état courant, la prochaine étape, les blocages | `_brain/STATE.md` (réécrit) |
| Une décision du propriétaire | `_brain/DECISIONS.md`, puis une décision dans `docs/<domaine>/decisions/` ou `docs/platform/decisions/` (modèle `docs/templates/decision.md`) |
| Une idée ou une option soulevée mais non tranchée | `_brain/DECISIONS.md`, statut `ouverte`, avec qui l'a soulevée et quand |
| Une leçon non évidente, un incident, un piège | `_brain/LESSONS.md` |
| Ce qui s'est passé dans une session | `_brain/journal/AAAA-MM-JJ.md` (ajout seulement) |
| Une règle de code | `_knowledge/` (règle ajoutée en fin de liste, jamais renumérotée) |
| Un savoir sur un dossier ou un module | le `CLAUDE.md` de ce dossier |
| Une procédure faite deux fois | un skill dans `.claude/skills/<nom>/SKILL.md` |
| Une préférence personnelle du propriétaire | la mémoire automatique de Claude, pas le dépôt |

## Ce qui est automatique

Trois hooks sont déclarés dans `.claude/settings.json`, avec leurs scripts dans `.claude/hooks/` :

1. **Démarrage** (au lancement, à la reprise, après `/clear`, après compaction) : `brain-session-start.sh` ajoute au contexte une ligne de santé. Elle donne l'âge de `STATE.md`, la session précédente et son transcript, et signale les budgets dépassés. Si `STATE.md` est plus ancien que la session précédente, Claude récupère ce qui manque avec `scripts/brain-last-session.sh`.
2. **Fin de session** (`/clear`, sortie) : `brain-session-end.sh` note la session dans `journal/sessions.log`. C'est le filet de sécurité si une sauvegarde a été oubliée.
3. **Rappel de sauvegarde** (fin de chaque réponse) : `brain-stop.sh` vérifie si du travail a modifié des fichiers depuis la dernière mise à jour de `STATE.md`, et si `STATE.md` a plus de 20 minutes. Si oui, il demande à Claude de mettre la mémoire à jour avant de rendre la main. Le délai se règle avec la variable `BRAIN_STATE_THROTTLE_MIN`.

`CLAUDE.md` importe `STATE.md` et `INDEX.md`, donc après un `/clear` Claude repart directement au bon endroit.

## Ce que tu peux déclencher

- `/brain-save` : sauvegarde complète (STATE, journal, décisions, leçons, index). À lancer avant un `/clear` si tu veux être sûr. Claude le fait aussi de lui-même après chaque étape et chaque décision.
- `/brain-consolidate` : ménage et distillation. Le savoir répété du journal monte au bon endroit, les budgets sont tenus, les vieux journaux archivés. À lancer une fois par semaine, à la fin d'une phase, ou quand le hook signale un dépassement.
- `scripts/check-brain.sh` : contrôle manuel des budgets et des liens.

## Comment la mémoire grossit sans ralentir

Elle grossit par **distillation**, pas par accumulation :

- une correction de ta part devient une règle (ou un retour dans la mémoire automatique si c'est une préférence personnelle) ;
- une procédure faite deux fois devient un skill (`.claude/skills/<nom>/SKILL.md`), dont seule la description est chargée en permanence ;
- une décision devient une ADR ;
- un incident devient une leçon, puis une règle s'il se répète ;
- le savoir sur un dossier va dans le `CLAUDE.md` de ce dossier, chargé seulement quand on y travaille.

Le niveau 0 a un budget fixe, contrôlé par `scripts/check-brain.sh`. Tout le reste peut grandir sans limite, parce que seul l'index pointe vers lui.

## Avant et après le portage de Malta

Depuis la phase 0 (2026-11-22), on suit le modèle de Malta : `_knowledge/` porte les règles, les `CLAUDE.md` de dossier les importent, `docs/` garde les décisions et l'architecture. Le blueprint reste la référence pour ce qui n'est pas encore porté (fiches `_knowledge/backend` et `frontend`, orchestrateur en phase 5). `_brain/` reste la couche de continuité entre sessions : état, journal, leçons, index. C'est le seul ajout volontaire par rapport à la structure de Malta.

## Limites à connaître

- **Hooks** : ils ne s'activent qu'après `/hooks` ou un redémarrage de Claude Code. On les désactive aussi depuis `/hooks`.
- **Transcripts** : ils sont supprimés après 30 jours par défaut. Pour les garder plus longtemps, mets `"cleanupPeriodDays": 365` dans `~/.claude/settings.json`.
- **Git** : la vraie garantie de durée, c'est git (historique, retour arrière, sauvegarde distante). Voir la décision B1.
- **Chemin** : lance toujours Claude depuis la racine du dépôt, au chemin exact noté dans `CLAUDE.local.md`, car la mémoire automatique de Claude dépend de la casse du chemin. `_brain/`, lui, suit le dossier où qu'il soit.
