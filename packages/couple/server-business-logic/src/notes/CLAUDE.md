# Notes

Les notes du couple : un titre, une proprietaire, une visibilite (partagee ou privee) ; le contenu riche, edite a deux en temps reel, est un document Yjs a part.

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
- Le titre et le contenu appartiennent au couple : jamais dans un evenement ni dans un log (`core.md` regle 33).

## Tests

- `givenNoteOf(context, title)` et `givenPrivateNoteOf(context, title)` (`__tests__/fixtures/notes-test.context.ts`) posent une note sans evenement ; `AS_A`, `AS_B` (le couple) et `AS_STRANGER` (un autre couple) sont les contextes des specs.
- `FakePairedCoupleProvider.givenPairedCouple(coupleId, userIds)` repond comme `pairing` pour un couple forme.
