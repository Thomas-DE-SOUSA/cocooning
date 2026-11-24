# Messages

Le fil a deux du couple : des mots flash (`FlashMessage`) et des photos instantanees (`InstantPhoto`), du plus recent au plus ancien, chacun avec son auteur et son heure d'envoi. Chaque jour, une invitation photo (`PhotoPrompt`) tiree entre 9 h et 21 h (heure de Paris) appelle une photo du jour, cachee a l'autre tant qu'il n'a pas envoye la sienne.

## A lire avant de commencer

Glossaire :
@../../../../../docs/couple/business-rules/messaging/glossary.md

Regles metier :
@../../../../../docs/couple/business-rules/messaging/rules.md

Architecture :
@../../../../../docs/couple/architecture/messaging/index.md

## Consignes de code

- Les use cases recoivent l'`ExecutionContext` complet, construit par l'API avec `MessagingCoupleGuardService` (decision 0041) ; aucun use case ne lit le couple lui-meme.
- Les deux partenaires voient tout le fil : pas de visibilite, seul le retrait est reserve a l'auteur (R6, `*_RESERVED_TO_OWNER`, 403). Un element retire ou d'un autre couple repond `*_NOT_FOUND`, filtre par la requete.
- Le fil se lit par `MessageFeedService.readPage` : une requete par sorte (`findNewest`, `limit + 1`), fusion en memoire par identifiant UUID v7 decroissant, curseur = identifiant du dernier element rendu (decision 0025). Jamais de lecture element par element.
- Les octets d'une photo ne passent jamais par l'agregat ni par un evenement : `InstantPhotoContent` les valide (signature, poids, R3), puis le use case les depose par `FileStorage` sous `InstantPhoto.fileKey`, qui commence par le `coupleId` (decision 0027). Le type de contenu vient des octets, jamais de ce que declare le client.
- Invitation photo : `PhotoPrompt.draw` tire la minute par `SecureRandomGenerator` (jamais `Math.random`), `issueIfDue` l'envoie une fois, `answerAt` donne `isLate` ou refuse. Le jour, la fenetre et minuit sont ceux de Paris : toujours `domain/value-objects/couple-time.ts` (`coupleCalendarDayAt`, `coupleInstantOf`), jamais un calcul d'heure a la main. L'heure tiree (`scheduledAt`) ne sort ni dans une vue ni dans un evenement.
- `SchedulePhotoPromptsUseCase.execute()` n'a ni contexte ni commande : seule la tache planifiee de l'API le lance. Ses lectures sont groupees (`findPairedCoupleIds`, seule lecture entre couples, puis `findOfDay(coupleIds, day)`) et ses ecritures passent par un seul `saveAll`. Les evenements d'une invitation ont pour `userId` `SCHEDULED_TASK_USER_ID` (UUID nul).
- R9 : une photo du jour de l'autre est cachee a qui n'a pas repondu a la meme invitation (`isHiddenFrom`). Toute lecture d'une photo passe par `PhotoOfTheDayService.answeredBy` (fil) ou `InstantPhotoPreconditionService.ensureVisibleTo` (fichier, 404) : une nouvelle route qui rend une photo doit faire de meme.
- Le texte d'un mot et la photo appartiennent au couple : jamais dans un evenement ni dans un log (`core.md` regle 33). Les evenements `*Sent` portent seulement `ownerId`.

## Tests

- `givenFlashMessageOf(context, text)` et `givenInstantPhotoOf(context, bytes)` (`__tests__/fixtures/messaging-test.fakes.ts`) posent un element sans evenement de domaine ; la photo depose aussi son fichier dans `InMemoryFileStorage`. `AS_A`, `AS_B` (le couple) et `AS_STRANGER` (un autre couple) sont les contextes des specs.
- Le faux generateur d'UUID partage son compteur entre agregats et evenements : un element pose prend un identifiant, son evenement le suivant (`idNumber(1)`, `idNumber(3)`, `idNumber(5)` pour trois elements).
- `givenPhotoPromptOf(coupleId, issued, day)` et `givenPhotoOfTheDayOf(context, photoPrompt)` (`__tests__/fixtures/messaging-test.prompts.ts`) posent une invitation tiree a 10 h de Paris (envoyee a l'horloge courante si `issued`) et une photo du jour. `NOW` vaut 11 h a Paris : une invitation posee a `NOW` est envoyee aussitot ; pour une invitation secrete, reculer l'horloge avant 10 h.
- Les changements d'heure (fin mars, fin octobre) sont dans `couple-time.spec.ts` et `photo-prompt-schedule.spec.ts` ; le jour manque (API arretee jusqu'a minuit) dans `photo-prompt.aggregate.spec.ts`.
- Les signatures acceptees et refusees de R3 sont dans `domain/value-objects/instant-photo-content.vo.spec.ts` ; la pagination du fil dans `list-message-feed.use-case.spec.ts`.
