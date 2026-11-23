# Leçons et pièges

> Une entrée = un symptôme, la règle qu'on en tire, la date. On ajoute une leçon quand quelque chose de non évident a coûté du temps.
> Une leçon qui revient deux fois devient une règle : dans `_knowledge/` une fois porté, dans le `CLAUDE.md` du dossier concerné, ou dans un skill.

## Orchestration multi-agents

- **2026-11-22 : la limite d'usage bloque un workflow sans le signaler.** Symptôme : un workflow « en cours » qui ne bouge plus depuis des heures. Les agents ont reçu une erreur 429 (`usage_limit_reached`, « monthly spend limit ») et le workflow ne reprend pas seul, même après le reset. Règle : avant d'annoncer « ça tourne », vérifier l'activité réelle (date de modification des `agent-*.jsonl` et de `journal.jsonl` dans le dossier de transcripts du workflow). Si c'est bloqué : `TaskStop`, puis un **nouveau** script qui ne lance que la suite et réutilise les fichiers déjà écrits. Pas de reprise à l'aveugle.
- **2026-11-22 : ordre de grandeur des coûts.** L'analyse de Malta a mobilisé 48 analystes, puis 10 agents de synthèse, blueprint et contrôle. La phase de synthèse seule a consommé environ 2,7 M tokens en environ 38 min. Règle : annoncer le coût estimé avant toute orchestration de plus de 10 agents.
- **2026-11-22 : les sous-agents ne voient pas les CLAUDE.md de Malta.** Leur cwd est Cocooning, donc les `CLAUDE.md` de Malta ne leur sont pas injectés. Chaque prompt doit être autonome, selon la règle « Sub-agent prompting » de `CLAUDE.md`.

## Environnement

- **Casse du chemin.** Lancer Claude Code depuis `<repo-root>` (avec un D majuscule). Le dossier de mémoire automatique de Claude dépend de l'écriture exacte du chemin, alors que la mémoire du dépôt (`_brain/`) n'en dépend pas.
- **Les transcripts expirent.** Claude Code supprime les transcripts après 30 jours par défaut (`cleanupPeriodDays`). La mémoire ne doit jamais dépendre d'un transcript : `scripts/brain-last-session.sh` n'est qu'un filet de sécurité.
- **Les hooks se chargent au démarrage.** Un hook ajouté pendant la session ne s'active qu'après `/hooks` ou un redémarrage.

- **pnpm** : le pnpm global est en 10.5.2, le dépôt exige 12.21.0 (`packageManager`). Lancer `corepack pnpm@12.21.0 <cmd>` ; dans zsh, pas de variable `P="corepack pnpm@…"` puis `$P` (pas de découpage des mots), utiliser `eval` ou écrire la commande en entier.
- **Hooks git actifs** : `pnpm install` lance `husky` et règle `core.hooksPath=.husky/_`. Tout commit exige une branche valide, un message conventionnel et un scope de `commitlint.config.ts`.
- **ESM pur (2026-11-22)** : NestJS 12 et `uuid` 12 et plus sont en ESM pur (D31) ; Jest et NestJS tournent en CommonJS. Vérifier `npm view <pkg> type exports` avant d'ajouter une dépendance runtime.
- **Realm Jest (2026-11-22)** : une erreur `fs` levée sous Jest n'est pas `instanceof Error` ; tester la propriété `code`.
- **`.gitignore` ancré (2026-11-23)** : dans le `.gitignore` racine, un motif qui contient un `/` (`public/sw.js`) ne vise que la racine ; écrire `**/public/sw.js*`. Vérifier avec `git status --short -uall`.
- **`pgrep -f` se voit lui-même (2026-11-23)** : dans `ssh host '... pgrep -f "motif"'`, le `bash -c` qui porte la commande contient le motif ; une attente `until ... ! pgrep -f` ne finit jamais. Tester l'état (`docker compose ps`) plutôt que le processus.
- **Aucun identifiant réel dans la mémoire (2026-11-23)** : le journal a porté les adresses e-mail des deux comptes, poussées sur GitHub (revue des étapes 2 et 3). Écrire « le compte de Pauline », « celui du propriétaire » ; jamais une adresse, un mot de passe ni un jeton, même provisoire.
- **Scopes de commit** : `shared-kernel` ou `decisions` ne sont pas des scopes (ni `lint` : prendre `config`) ; un commit d'un package transverse se fait sans scope (`feat: …`). Un commit refusé par commitlint laisse ses fichiers indexés : le commit suivant les emporte (PR #44, 2026-11-23). Vérifier `git log --stat` avant de pousser.
- **`next build` lit les pages (2026-11-23)** : « Collecting page data » charge les pages et ce qu'elles importent. Une page qui lit l'API : `dynamic = 'force-dynamic'`, fabrique appelée à la requête, validation de l'env sautée pendant `NEXT_PHASE` build. Tester `pnpm --filter couple-web build` sans variables.
- **Versions (2026-11-22)** : typescript-eslint 8.73 n'accepte pas TS 7 (`<6.1.0`), d'où TS 6.0. `minimumReleaseAge: 1440` refuse une version publiée il y a moins de 24 h (ex. lint-staged 17.6.2) : prendre la précédente. `eslint-plugin-react` 7.37 ne déclare pas encore ESLint 10 en peer : à régler en phase 3.

## Malta

- **Le blueprint est un instantané.** Il décrit Malta au commit `ef877b4bf` (2026-11-20). Si Malta évolue, relancer `.claude/workflows/malta-deep-analysis.js` (complet et coûteux) ou `malta-blueprint-synthesis.js` (synthèse seule, à partir de `raw/`).
- **L'IAM est hors scope dans Malta.** Le `CLAUDE.md` de Malta l'exclut. Le propriétaire a levé cette exclusion pour l'analyse du 2026-11-22. Pour toute autre lecture de Malta, ne toucher à l'IAM que sur demande explicite.
- **Code propriétaire.** `_malta-blueprint/` contient des extraits de code propriétaire « All Rights Reserved ». Il est dans `.gitignore` et ne part jamais sur GitHub (décision B1). Sur un clone neuf, il est absent : les liens de `INDEX.md` vers lui sont alors morts. Pour le recréer, lancer le workflow `malta-deep-analysis` (coûteux) depuis une machine qui a Malta.

## Règles provisoires

Depuis la phase 0 (2026-11-22), la loi du code est `_knowledge/core*.md`. Les fiches thématiques (`_knowledge/backend/`, `frontend/`) arrivent avec leur phase ; d'ici là, le blueprint §9 et les synthèses font foi pour les sujets non couverts. Rien n'est en attente ici.
- **Paquets ESM typés (2026-11-23)** : Hocuspocus 4 et Yjs ont une entrée `require` mais des déclarations ESM seules ; TS 6 refuse l'import depuis l'API CommonJS (TS1479), même en `module: NodeNext`. Les charger par `createRequire` et les typer par `import type ... with { 'resolution-mode': 'import' }` dans un seul fichier (`apps/couple/api/src/modules/notes/esm-packages.ts`). crossws (couche WebSocket de Hocuspocus) est ESM seul : utiliser `ws`.
- **HocuspocusProvider (2026-11-23)** : avec un `websocketProvider` fourni, appeler `provider.attach()` ; une fermeture de document par le serveur ne se rouvre pas seule.
