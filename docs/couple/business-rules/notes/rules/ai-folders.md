# Règles des dossiers IA

Comment un dossier IA complète ce que le couple y ajoute. À lire avant de toucher aux dossiers IA, aux fiches ou à l'appel de l'IA. Les dossiers en général suivent [les règles des dossiers](folders.md).

## Le dossier

### R17. Un dossier IA a un sujet et une fiche type

À la création, je choisis « Classique » ou « IA ». Pour un dossier IA, l'IA propose d'après son nom un sujet (une phrase, 280 signes au plus) et une fiche type (de 1 à 10 cases, chacune nommée en 40 signes au plus). Je les corrige avant de créer le dossier, et plus tard aussi ; dans « Partagé », nous les corrigeons tous les deux.

- Dans le code : `ProposeFolderTemplateUseCase` (port `NoteCardWriter.proposeTemplate`, adaptateur Gemini, sans recherche ni plafond), `CreateFolderUseCase` et `SmartFolderValidator.kindOf` (`FolderKindEnum`), `FolderSubject`, `CardTemplate` (`FOLDER_SUBJECT_MAX_LENGTH`, `CARD_TEMPLATE_MAX_FIELDS`, `CARD_FIELD_NAME_MAX_LENGTH`), `EditFolderTemplateUseCase` et `Folder.editTemplate`, sans contrôle de propriétaire (R14).
- Source : [décision 0052](../../../decisions/notes/0052-dossiers-et-dossiers-ia.md) ; les limites sont une proposition de Claude, acceptées par « go ». Validée par : Thomas De Sousa, 2026-11-25 (« go »).

### R18. Un sous-dossier d'un dossier IA hérite et précise

Je crée « Lyon » dans « Restaurants » : il est IA lui aussi, garde la fiche type de « Restaurants », et son nom s'ajoute au contexte des recherches. Si la fiche type de « Restaurants » change, celle de « Lyon » change avec elle.

- Dans le code : `SmartFolderValidator.kindOf` (un dossier créé dans un dossier IA est IA, sans fiche type à lui, sinon `FOLDER_TEMPLATE_INHERITED`) ; `cardContextOf` et `CardContextService` lisent la lignée du dossier (`FolderRepository.findLineage`, une requête) et y trouvent le dossier IA qui porte le sujet et la fiche type, ainsi que les noms des dossiers depuis lui ; `EditFolderTemplateUseCase` corrige la fiche type depuis n'importe quel dossier de l'arbre.
- Source : décision 0052. Validée par : Thomas De Sousa, 2026-11-25 (« go »).

## L'ajout d'un élément

### R19. J'ajoute un élément par son nom, l'IA le complète

Dans un dossier IA, je tape un nom (« Chez Paul »). L'IA cherche sur Internet avec le sujet du dossier et les noms des dossiers au-dessus. S'il y a un doute, elle me montre au plus trois candidats ; je choisis, ou je précise et elle cherche de nouveau. L'IA ne crée jamais d'élément que je n'ai pas tapé.

- Dans le code : `AddNoteCardUseCase` (une note et sa fiche par nom tapé, rien d'autre), `NoteCard.recordCandidates` (`CARD_CANDIDATE_MAX_COUNT`, statut `CHOOSING`), `ChooseNoteCardCandidateUseCase` et `NoteCard.chooseCandidate` (`NoteCardQuery.ofCandidate`), `RefineNoteCardUseCase` et `NoteCard.refine`.
- Source : décision 0052, [décision 0015](../../../decisions/0015-enrichissement-des-envies.md). Validée par : Thomas De Sousa, 2026-11-25 (« go »).

### R20. Un élément est une note avec sa fiche

L'élément ajouté est une note, avec la fiche en haut (une valeur par case) et nos notes libres dessous, que nous écrivons à deux comme dans toute note. La note existe tout de suite, « en recherche » le temps que la fiche se remplisse ; si la recherche échoue, la note reste et je peux réessayer.

- Dans le code : `AddNoteCardUseCase` crée la note dans l'espace du dossier et sa `NoteCard` au statut `PENDING` dans une `UnitOfWork` ; `NoteCard.fail` (`FAILED`), puis `RefreshNoteCardUseCase` ou `RefineNoteCardUseCase` pour réessayer ; `GetNoteUseCase` et `GetNoteSpaceContentsUseCase` rendent la fiche avec la note (`NoteDetailView`).
- Source : décision 0052. Validée par : Thomas De Sousa, 2026-11-25 (« go »).

## La fiche

### R21. Rien n'est inventé

Une information que l'IA ne trouve pas reste « non trouvé ». La fiche garde ses sources (des liens) et la date de sa recherche.

- Dans le code : `NoteCard.recordResult` (`fieldsFilledWith` : une case absente de la réponse vaut `null`, « non trouvé »), `sources` (`NOTE_CARD_SOURCE_MAX_COUNT`) et `searchedAt`.
- Source : décision 0052. Validée par : Thomas De Sousa, 2026-11-25 (« go »).

### R22. Je corrige une case, « Mettre à jour » la respecte

Je corrige une case à la main ; « Mettre à jour » relance la recherche pour les autres cases et garde ma correction. Une case ajoutée à la fiche type se remplit sur les fiches du dossier, dans la limite du plafond du jour (R23).

- Dans le code : `CorrectNoteCardFieldUseCase` et `NoteCard.correctField` (`isManual`, `CARD_FIELD_VALUE_MAX_LENGTH`), `RefreshNoteCardUseCase` et `NoteCard.refresh` (fiche type du dossier, cases corrigées gardées) ; `EditFolderTemplateUseCase` passe la fiche type corrigée aux fiches de tout l'arbre (`NoteCardRepository.findInTree`, `NoteCard.applyEditedTemplate`) : une fiche remplie qui gagne une case repart `PENDING`.
- Source : proposition de Claude (décision 0052). Validée par : Thomas De Sousa, 2026-11-25 (« go »).

### R23. Un plafond de recherches par jour

Le couple fait au plus 30 recherches par jour, tous dossiers confondus. Au-delà, l'app me dit de réessayer demain ; la note est créée quand même.

- Dans le code : `NoteCardEnrichmentService` compte les recherches du couple sur le jour de Paris (`NoteCardSearchCounter`, table `note_card_search`) avant chaque recherche et passe la fiche en `LIMIT_REACHED` au-delà de `NOTE_CARD_DAILY_SEARCH_LIMIT` (`30`, configuration de l'API) ; `AddNoteCardUseCase` crée la note sans compter ; la proposition d'une fiche type (R17) ne compte pas.
- Source : proposition de Claude (décision 0052), pour protéger le quota gratuit de l'IA. Validée par : Thomas De Sousa, 2026-11-25 (« go »).

### R24. Ce qui part chez l'IA

Notre moteur de recherche, sur notre serveur, interroge des moteurs publics avec ce que je tape et le contexte du dossier. Partent chez l'IA le sujet du dossier, les noms des dossiers au-dessus, les cases de la fiche type, ce que je tape et les textes trouvés. Jamais nos notes libres.

- Dans le code : `searchQueryOf` (ce que je tape et les noms des dossiers depuis le dossier IA, vers SearXNG), `noteCardWritingRequestOf` (`NoteCardWritingRequest` : sujet, noms des dossiers, cases à chercher, ce que je tape, résultats et textes des pages), `folderTemplateRequestOf` pour R17 ; le contenu Yjs d'une note n'est jamais lu par ces chemins.
- Source : décision 0052, [décision 0054](../../../decisions/notes/0054-recherche-des-fiches-searxng-et-gemini.md). Validée par : Thomas De Sousa, 2026-11-25 (« go »).

### R25. Une fiche déplacée garde ses valeurs

Je déplace une fiche dans un autre dossier IA : elle prend la fiche type du nouveau dossier, garde les valeurs des cases de même nom, et « Mettre à jour » remplit les autres. Hors d'un dossier IA, elle garde ses valeurs, sans « Mettre à jour ».

- Dans le code : à venir (lot 2).
- Source : proposition de Claude (décision 0052). Validée par : Thomas De Sousa, 2026-11-25 (« go »).

## Cas et exceptions

| Situation | Ce qui s'applique |
|---|---|
| Sujet vide ou trop long | Refusé, `422` `FOLDER_SUBJECT_INVALID` (R17) |
| Fiche type sans case, de plus de 10 cases, case vide, trop longue ou en double (sans tenir compte de la casse) | Refusée, `422` `CARD_TEMPLATE_INVALID` (R17) |
| Dossier IA créé sans sujet ni fiche type | Refusé, `422` `CARD_TEMPLATE_INVALID` (R17) |
| Dossier classique créé avec un sujet ou une fiche type | Refusé, `422` `FOLDER_NOT_SMART` |
| Sujet ou fiche type donnés à un dossier créé dans un dossier IA, ou proposition demandée pour lui | Refusés, `422` `FOLDER_TEMPLATE_INHERITED` (R18) |
| Corriger la fiche type d'un dossier hors d'un arbre IA | Refusé, `422` `FOLDER_NOT_SMART` |
| Ajouter un élément dans un dossier hors d'un arbre IA | Refusé, `422` `FOLDER_NOT_SMART` (R19) |
| Agir sur la fiche d'une note qui n'en a pas | Refusé, `404` `NOTE_CARD_NOT_FOUND` (R20) |
| Choisir, préciser ou mettre à jour une fiche « en recherche », ou choisir hors de `CHOOSING` | Refusé, `409` `NOTE_CARD_STATUS_INVALID` |
| Choisir un candidat que la fiche ne montre pas | Refusé, `422` `NOTE_CARD_CANDIDATE_INVALID` (R19) |
| Précision vide ou trop longue | Refusée, `422` `NOTE_CARD_QUERY_INVALID` (R19) |
| Corriger une case absente de la fiche, ou avec une valeur vide ou trop longue | Refusé, `422` `NOTE_CARD_FIELD_INVALID` (R22) |
| « Mettre à jour » une fiche hors d'un dossier IA | Refusé, `422` `FOLDER_NOT_SMART` (R25) |
| Plus de 30 recherches dans le jour de Paris | La fiche passe « à réessayer demain », `LIMIT_REACHED` ; la note reste (R23) |
| Le moteur de recherche ou l'IA ne répond pas pendant la tâche de fond | La fiche passe `FAILED`, sans détail ; la note reste, « Mettre à jour » réessaie (R20) |
| Deux écritures de la même fiche en même temps | Refusée, `409` `NOTE_CARD_VERSION_CONFLICT` |
| L'IA ne répond pas, ou répond hors des règles de R17 | `503` `NOTE_CARD_WRITER_UNAVAILABLE`, sans détail |
