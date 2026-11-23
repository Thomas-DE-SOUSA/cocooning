# Notes

Les notes du couple depuis la PWA : lister une page, creer, renommer, partager, rendre privee, supprimer. Le contenu edite a deux passe par le canal temps reel, hors de ce paquet (decision 0040).

## A lire avant de commencer

Glossaire :
@../../../../../docs/couple/business-rules/notes/glossary.md

Regles metier :
@../../../../../docs/couple/business-rules/notes/rules.md

Architecture front :
@../../../../../docs/couple/architecture/frontend/index.md

## Consignes de code

- `NotesGateway` agit toujours pour le partenaire connecte : son adaptateur renvoie la session a l'API (decision 0036), l'API trouve le couple (decision 0041). Aucune methode ne prend de `coupleId` ni de `userId`.
- `createNoteTitleFormSchema(t)` suit R8 comme le contrat : coupe, 1 a `NOTE_TITLE_MAX_LENGTH`. Cles `form.title.errors.{required,tooLong}` (decision 0031).
- Une action reservee a la proprietaire refusee arrive en `FORBIDDEN` (`NOTE_RESERVED_TO_OWNER`) ; la note privee de l'autre en `NOT_FOUND` (R4).

## Tests

- `FakeNotesGateway` (sous-chemin `@cocooning/couple-client-business-logic/testing`) : journal `calls`, `givenRefusal(error)` (vaut pour tous les appels), `A_SHARED_NOTE`, `A_NOTE_PAGE`.
