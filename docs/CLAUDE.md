# Règles de documentation

## Structure

```
docs/
├── architecture/       # Transverse uniquement : pourquoi, context map, glossaire, conventions
├── guides/             # Guides développeur indépendants du domaine (installation, contribution)
├── design/             # Design system et patterns d'interface partagés (à venir, phase 3)
├── templates/          # Un modèle par type de document (seul emplacement des modèles, exempté d'index.md)
├── platform/           # Transverse au monorepo : infra, CI, outillage, conventions
│   ├── decisions/      # NNNN-slug.md, à plat
│   ├── premortems/     # YYYY-MM-DD-slug.md
│   ├── postmortems/    # YYYY-MM-DD-slug.md
│   ├── ci/             # Workflows, contrôles de PR, hooks locaux
│   ├── gaps/           # Écarts de l'outillage transverse, un fichier par sujet
│   └── runbooks/       # Procédures d'exploitation transverses, par sujet
└── couple/             # Domaine métier : la vie partagée du couple (D1)
    ├── decisions/      # NNNN-slug.md par contexte, numéro unique pour le domaine, registre index.md
    ├── gaps/           # Écarts constatés dans le code, un fichier par module, nouvelles entrées à la fin
    ├── premortems/     # Par contexte, YYYY-MM-DD-slug.md
    ├── postmortems/    # Par date, sans contexte, YYYY-MM-DD-slug.md
    ├── architecture/   # Bounded contexts et patterns techniques du domaine
    ├── business-rules/ # Règles métier, workflows, invariants, glossaires
    ├── infrastructure/ # Base de données, déploiement sur la VM, runbooks du domaine
    └── design/         # Maquettes et specs d'interface propres au domaine
```

Un dossier n'existe que s'il contient un document : on ne crée ni dossier vide ni index sans entrée. Les sous-dossiers de `couple/` arrivent avec le code qu'ils décrivent.

## Règles de placement

### 1. Un fichier = un dossier domaine OU global, jamais entre les deux

Chaque document appartient soit au domaine (`couple/`), soit au niveau global (`architecture/`, `guides/`, `design/`, `platform/`).

**Test de placement** : « Est-ce qu'un autre domaine aurait besoin de ce document ? »
- **Oui** → dossier global
- **Non** → `couple/`

Le niveau `<domaine>/` est gardé même avec un seul domaine : un deuxième domaine s'ajoutera sans rien déplacer.

### 2. Pas de documentation dans le code source

Les fichiers `.md` de documentation ne vivent PAS dans `apps/`, `packages/`, `config/` ou à la racine du monorepo.

**Exceptions** :
- `README.md` à la racine de chaque app ou package (description technique courte)
- `CLAUDE.md` (outillage IA, pas de la documentation humaine)
- `CHANGELOG.md`

Tout le reste va dans `docs/`. Les dossiers `_knowledge/` (règles de code), `_brain/` (mémoire de travail) et `_malta-blueprint/` (analyse locale, jamais versionnée) ne sont pas de la documentation.

### 3. Nommage

- **kebab-case** pour tous les fichiers : `note-sharing.md`, pas `NOTE_SHARING.md`
- **Pas de préfixes ni de suffixes de type** : pas de `PLAN-`, `TODO-`, `how-to-`, `-guide`, `-spec`. Le dossier donne le contexte
- **Pas de majuscules** sauf `CLAUDE.md` et `README.md`

### 4. Quand créer un nouveau dossier domaine

Un nouveau dossier `docs/<domaine>/` est créé quand un bounded context majeur arrive avec ses propres règles métier, son API et son infrastructure, indépendant de `couple`. Sa structure interne suit celle de `couple/`, `gaps/` compris.

### 5. Transverse (`docs/architecture/`)

Ce dossier contient **uniquement** ce qui vaut pour tout le dépôt :
- `why.md` : pourquoi cette architecture
- `context-map.md` : carte des bounded contexts et de leurs relations
- `glossary.md` : termes métier partagés et vocabulaire d'architecture
- `conventions.md` : principes d'architecture et de nommage communs

Les décisions, prémortems et post-mortems du domaine vont dans `couple/decisions/`, `couple/premortems/` et `couple/postmortems/`. Ceux qui touchent tout le monorepo vont dans `platform/`. Les modèles vivent uniquement dans `docs/templates/`.

Une décision acceptée ne se modifie plus : une remise en cause donne une nouvelle décision qui remplace l'ancienne.

### 6. Cycle de vie

- Les plans, suivis de branche, comptes rendus de session et specs de travail ne vont pas dans `docs/` : ce sont des notes de travail (`_brain/journal/`, `_cocooning-output/`, sorties d'agents)
- Les specs d'API ne sont pas documentées ici : les enums de routes et les contrats Zod font foi
- Un document obsolète qui ne porte aucune décision est supprimé : l'historique git le conserve
- Un document obsolète qui porte une décision ou sa justification est conservé et marqué `[OBSOLÈTE - voir <lien>]` en en-tête

## Découpage par module

À l'intérieur de `decisions/`, `architecture/`, `business-rules/` et `infrastructure/runbooks/`, les documents sont rangés par contexte, jamais à plat. Les dossiers reprennent les bounded contexts du code, avec les mêmes noms : `authentication`, `notes`, `agenda`, `messaging`. Il n'y a pas de contexte composite (D3) : un contexte est un module.

```
couple/architecture/
├── index.md
├── notes/
│   ├── index.md
│   ├── aggregate.md
│   └── tables.md
└── agenda/
```

- Le nom d'un dossier de contexte est celui du dossier de code correspondant
- Le contexte étant donné par le dossier, il ne se répète pas dans le nom du fichier : `notes/sharing.md`, pas `notes/notes-sharing.md`
- Créer un dossier ne coûte rien : préférer trois fichiers courts à un fichier de 600 lignes
- Un document qui concerne plusieurs contextes se place à la racine de `couple/<type>/`

## Types de documents

Chaque document est d'un seul type. Le type fixe le dossier et le modèle.

| Type | La question à laquelle il répond | Dossier | Modèle |
|---|---|---|---|
| Décision | Pourquoi a-t-on choisi ça plutôt qu'autre chose ? | `couple/decisions/<contexte>/` ou `platform/decisions/` | `templates/decision.md` |
| Prémortem | Qu'est-ce qui peut faire échouer ce plan ? | `couple/premortems/<contexte>/` ou `platform/premortems/` | `templates/premortem.md` |
| Post-mortem | Que s'est-il passé et qu'en retient-on ? | `couple/postmortems/` ou `platform/postmortems/` | `templates/postmortem.md` |
| Règle métier | Qu'est-ce que le couple veut que l'app impose ? | `couple/business-rules/<contexte>/` | `templates/business-rule.md` |
| Architecture | Comment est-ce construit aujourd'hui ? | `couple/architecture/<contexte>/` | `templates/architecture.md` |
| Runbook | Que faire quand ça arrive en exploitation ? | `couple/infrastructure/runbooks/` ou `platform/runbooks/<sujet>/` | `templates/runbook.md` |
| Guide | Comment fait-on telle tâche ? | `guides/` | `templates/guide.md` |
| Écart | Qu'est-ce que le code fait de travers, ou ne fait pas encore, par rapport à une règle ? | `couple/gaps/<contexte>.md` ou `platform/gaps/<sujet>.md`, une entrée ajoutée à la fin | `templates/gap-entry.md` |

Pour départager règle métier et décision : si l'un des deux partenaires peut dire que c'est faux, c'est une règle métier. Si on aurait pu faire autrement techniquement, c'est une décision. Une règle métier sans source écrite s'écrit d'abord en décision `proposée`.

Un écart porte un seul type, dans cette liste fermée : défaut, échec silencieux, appel externe en boucle, code mort, test manquant, écart avec une règle validée, règle validée non construite, décision à trancher, défaut de test. Une entrée démontrée fausse ou incomplète se corrige en place (Où, Constat, Type), sans changer son numéro ni sa date. Un doublon se clôt par son statut : `clos, doublon de <registre> NNN`. L'`index.md` du dossier `gaps/` tient le compte des entrées ouvertes.

### Décisions : un seul type, une nature

Les noms courants (ADR, BDR, PDR, RFC) désignent tous une décision. Ils ne donnent ni dossier ni modèle à part : un seul modèle, un registre numéroté par domaine et un pour `platform/`, et des champs d'en-tête.

- `nature` : `métier` (voulu par le couple), `technique` (un choix qu'on aurait pu faire autrement ; ADR), `produit` (périmètre ou comportement visible ; PDR)
- `status` : `proposée`, `acceptée`, `remplacée` (avec `superseded-by`), `rejetée`. Une seule forme, au féminin. Une proposition tranchée change de statut, elle ne change pas de fichier.
- `validated-by` : un nom, une date ou une réponse du propriétaire prouvée, sinon `à compléter`. Jamais inventé, ni déduit de l'historique git ou d'une conversation.

Une décision citée par son seul numéro (« décision 0008 ») est celle du registre `couple/decisions/` ; une décision de `platform/decisions/` se cite « décision plateforme NNNN ».

Les décisions du propriétaire suivies dans `_brain/DECISIONS.md` (identifiants `Dn`, `Pn`) deviennent des décisions de `docs/` qui citent leur identifiant.

Autour d'une décision :
- un prémortem cherche ce qui peut faire échouer un plan avant de le lancer ; la décision le cite dans `premortem` et dans « Risques »
- un post-mortem revient sur un incident ; il cite dans `decisions` celles qu'il a produites
- une règle métier modifiée par une décision cite la décision dans sa ligne `Source`

## CLAUDE.md dans le code

Les `CLAUDE.md` du code sont en français **sans accents** (ASCII), avec des titres de section figés : `## A lire avant de commencer`, `## Consignes de code`, `## Tests`, `## Documentation a tenir a jour`, `## Pieges`, `## Commandes`. Un `CLAUDE.md` importe des pages vérifiées, il ne porte ni règle métier ni spec : elles vont dans `docs/`. Un libellé en clair terminé par deux-points précède chaque import `@`. Une page utile seulement pour certaines tâches est citée entre backticks, sans `@`.

- **Contexte de `server-business-logic`** (par exemple `src/notes/`) : suit `docs/templates/claude-server-submodule.md`. Il importe le glossaire, les règles et l'architecture du contexte, et ne garde que les consignes de code propres au contexte. Le gabarit `claude-server-context.md` ne sert que si un contexte composite apparaît (D27).
- **Package** (`packages/couple/server-business-logic`) : importe la knowledge backend une seule fois pour tous les contextes et porte la règle de mise à jour de la documentation. Aucun `CLAUDE.md` sous `src/` n'importe `_knowledge/`, et aucun ne réimporte `_knowledge/core.md`, déjà chargé par la racine.
- **Module de l'API** (`apps/couple/api/src/modules/<contexte>/`) : un stub de quelques lignes qui importe le `CLAUDE.md` du contexte métier, pour chaque module qui a un pendant métier.
- **Package Prisma** (`packages/couple/prisma`) : impose de mettre à jour le `tables.md` du contexte quand une table change.
- **Couches d'exécution et packages transverses** (API, `contract`, shared kernels, `server-infrastructure`, `client-infrastructure`, `design-system`, `config/*`, `.github/`) : un `CLAUDE.md` court qui importe la knowledge utile à la couche et liste, dans « Documentation a tenir a jour », les pages de `docs/` qui décrivent ce code. La première puce est toujours la règle générale : relire toute page qui cite le code modifié, trouvée avec `rg -l '<NomDeClasse>|<chemin/du/fichier>' docs/ _knowledge/`, car une liste ne suffit jamais.
- **App web** (`apps/couple/web/CLAUDE.md`) : importe la knowledge front une seule fois et porte la règle « Documentation a tenir a jour », chargée pour tous les modules.
- **Module web** (`apps/couple/web/src/modules/<module>/`) : suit `docs/templates/claude-web-submodule.md` quand le module a un pendant backend. Il importe le glossaire et les règles du contexte backend tels quels, puis son architecture front. On n'écrit jamais de `business-rules/frontend` : une règle appliquée aussi côté client le dit sur la règle backend. Les petits modules purement front n'ont pas de `CLAUDE.md`. Le gabarit `claude-web-context.md` ne sert que pour un regroupement de modules qui partagent une architecture front.
- **Package `client-business-logic`** : comme `server-business-logic`, il importe la knowledge front une seule fois et porte la règle de mise à jour ; chaque contexte a un `CLAUDE.md` au format `claude-server-submodule.md`.

## Règles d'écriture

- Un fichier traite un seul sujet : cible de 60 à 150 lignes, plafond de 200 lignes, découper au-delà de 200. Les registres d'écarts, les glossaires, les `tables.md` et les `index.md` sont exemptés de ces bornes. La borne basse n'oblige pas à gonfler un sujet court
- Dans `business-rules/<contexte>/`, un sous-dossier `rules/` est autorisé quand le `rules.md` dépasserait 150 lignes
- Prose en français, identifiants de code en anglais entre backticks
- Titre H1 en français, court, sans tirets : c'est lui qui s'affiche dans le menu
- La première phrase dit ce que couvre le fichier et quand le lire
- Toute affirmation se vérifie dans le code. Les exemples viennent d'usages réels, avec le chemin du fichier source
- Pas de section historique ni TODO. Pas d'emojis. Seule exception : tant qu'un code n'existe pas, un `index.md` ou une page transverse peut annoncer ce qui arrive avec la phase qui le livre (« à venir (phase N) ») ; la mention disparaît quand le document ou le code arrive
- Jamais de tiret cadratin ni demi-cadratin : une virgule, deux-points, des parenthèses ou deux phrases
- Chaque dossier a un `index.md` (sauf `templates/`) : une phrase sur ce qu'on y range, une courte présentation facultative (15 lignes de texte au plus), puis la liste des documents. Une présentation plus longue va dans `overview.md` du même dossier, que l'index liste
- Ne pas recopier une règle déjà écrite dans un `CLAUDE.md` ou dans `_knowledge/` : y renvoyer
- Ne jamais citer ni recopier `_malta-blueprint/` : il n'est pas versionné et contient du code tiers
