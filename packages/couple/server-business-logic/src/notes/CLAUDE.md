# Notes

Les notes du couple : un titre, une proprietaire, une visibilite (partagee ou privee), un dossier ; le contenu riche, edite a deux en temps reel, est un document Yjs a part. Les dossiers (`Folder`, decision 0052) rangent les notes dans les deux espaces « Partage » et « Prive » (`NoteSpaceEnum`) ; un dossier IA (decision 0054) porte un sujet et une fiche type, et chaque note qu'on y ajoute a sa fiche (`NoteCard`).

## A lire avant de commencer

Glossaire :
@../../../../../docs/couple/business-rules/notes/glossary.md

Regles metier :
@../../../../../docs/couple/business-rules/notes/rules.md

Architecture :
@../../../../../docs/couple/architecture/notes/index.md

## Consignes de code

- Les use cases recoivent l'`ExecutionContext` complet, construit par l'API avec `NoteCoupleGuardService` (decision 0041) ; aucun use case ne lit le couple lui-meme.
- La visibilite se filtre dans la requete (`findVisibleById`, `findVisible`), jamais en memoire apres chargement : la note privee de l'autre repond `NOTE_NOT_FOUND` comme une note inexistante (R4).
- Le contenu (etat Yjs) passe par `NoteContentRepository`, a part de l'agregat : `AuthorizeNoteDocumentUseCase` a la connexion, `LoadNoteDocumentUseCase`, `SaveNoteDocumentUseCase`. Une action qui retire la note appelle `NoteCollaborationProvider` apres la publication (R5 `disconnectAllBut`, R7 `disconnectEveryone`).
- Le titre et le contenu appartiennent au couple : jamais dans un evenement ni dans un log (`core.md` regle 33). Le nom d'un dossier aussi.
- L'espace d'une note est sa visibilite (`visibilityOfSpace`, `spaceOfVisibility`) : jamais une colonne de plus sur `Note`. Changer d'espace passe par le changement de visibilite (proprietaire seule, R5) et ramene la note a la racine du nouvel espace (R11).
- Un dossier visible se charge par `FolderPreconditionService` (`loadVisibleFolder`, `loadDestination`), filtre dans la requete (`FolderRepository`, R14) ; le dossier de « Prive » de l'autre repond `FOLDER_NOT_FOUND`.
- Les codes `FOLDER_*` sont dans `NoteExceptionCodeEnum` et levent `NoteException` : une seule exception par contexte (`domain.md` regle 15).
- Les evenements des dossiers vont dans l'outbox `note_event`. La remontee de R16 (`FolderRepository.moveContentUp`) est une requete groupee sans evenement, dans la meme `UnitOfWork` que la suppression (`DeleteFolderUseCase`).
- Dossiers IA (decision 0054) : le genre se decide dans `Folder.create` (`SmartFolderValidator.kindOf`) ; seul le dossier en haut d'un arbre IA porte sujet et fiche type (`SmartFolderSettings`), ses sous-dossiers les lisent par `CardContextService` sur la lignee (`findLineage`). L'IA passe par le port `NoteCardWriter` ; ni le sujet, ni les cases, ni un nom ne vont dans un evenement ou un log.
- Fiches (`NoteCard`, R19 a R22) : une par note, lue par la note visible (`NoteCardPreconditionService.loadCardOf`) ; les cases se calculent dans `card-fields.ts` (`fieldsAdopting`, `fieldsFilledWith`, `fieldsCorrecting`), jamais dans un use case ; un arbre de fiches s'ecrit par `NoteCardRepository.saveAll` dans la meme `UnitOfWork` que le dossier (R22) ; une note deplacee emmene sa fiche (`NoteCardRelocationService`, R25), dans la `UnitOfWork` de `MoveNoteUseCase`.
- Tache de fond (decision 0054) : `EnrichPendingNoteCardsUseCase` reserve un lot (`claimPending`, lecture entre couples), `NoteCardEnrichmentService.enrichAll` traite les fiches une a une et enregistre chacune ; seuls `NOTE_CARD_SEARCH_UNAVAILABLE` et `NOTE_CARD_WRITER_UNAVAILABLE` passent une fiche `FAILED`, toute autre erreur remonte au minuteur. Le plafond de R23 se compte avant la recherche (`NoteCardSearchCounter`), le jour de Paris est l'affaire de l'adaptateur.
- Chemin, nombres et remontee se lisent ou s'ecrivent en une requete chacun (`core.md` regle 9), jamais en boucle.

## Tests

- `givenNoteOf(context, title, folder)` et `givenPrivateNoteOf(context, title)` (`__tests__/fixtures/notes-test.context.ts`) posent une note sans evenement ; `givenFolderOf(context, name, parent, space)` et `givenPrivateFolderOf(context, name)` un dossier ; `givenSmartFolderOf(context, name, parent, space)` un dossier IA (fiche type `PROPOSED_TEMPLATE` en haut de l'arbre, heritee dessous) ; `AS_A`, `AS_B` (le couple) et `AS_STRANGER` (un autre couple) sont les contextes des specs.
- `givenCardOf(note, fieldNames)`, `givenFilledCardOf(note, values, sources)` et `givenChoosingCardOf(note, candidates)` posent une fiche ; `NoteCardInMemoryRepository` lit l'arbre de R22 sur les notes et les dossiers en memoire.
- `FakeWebSearchProvider`, `FakeWebPageReader`, `NoteCardSearchInMemoryCounter` (jour de Paris par `Intl`) et `FakeNoteCardWriter.willWrite`, `willBreak` servent la tache de fond ; `DAILY_SEARCH_LIMIT`, `ENRICHMENT_BATCH_SIZE` dans le contexte de test.
- `FolderInMemoryRepository` recoit le `NoteInMemoryRepository` : sa remontee de R16 deplace aussi les notes, comme l'adaptateur.
- `FakeNoteCardWriter` enregistre ce qui partirait chez l'IA (`templateRequests`) et repond `PROPOSED_TEMPLATE`, une proposition choisie (`willPropose`) ou l'IA indisponible (`willBeUnavailable`).
- `FakePairedCoupleProvider.givenPairedCouple(coupleId, userIds)` repond comme `pairing` pour un couple forme.
