# Messages

Le fil a deux du couple : des mots flash (`FlashMessage`) et des photos instantanees (`InstantPhoto`), du plus recent au plus ancien, chacun avec son auteur et son heure d'envoi.

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
- Le texte d'un mot et la photo appartiennent au couple : jamais dans un evenement ni dans un log (`core.md` regle 33). Les evenements `*Sent` portent seulement `ownerId`.

## Tests

- `givenFlashMessageOf(context, text)` et `givenInstantPhotoOf(context, bytes)` (`__tests__/fixtures/messaging-test.fakes.ts`) posent un element sans evenement de domaine ; la photo depose aussi son fichier dans `InMemoryFileStorage`. `AS_A`, `AS_B` (le couple) et `AS_STRANGER` (un autre couple) sont les contextes des specs.
- Le faux generateur d'UUID partage son compteur entre agregats et evenements : un element pose prend un identifiant, son evenement le suivant (`idNumber(1)`, `idNumber(3)`, `idNumber(5)` pour trois elements).
- Les signatures acceptees et refusees de R3 sont dans `domain/value-objects/instant-photo-content.vo.spec.ts` ; la pagination du fil dans `list-message-feed.use-case.spec.ts`.
