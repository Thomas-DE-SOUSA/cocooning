# Messaging

Les messages du couple depuis la PWA : lire le fil, envoyer et retirer un mot flash ou une photo instantanee, lire les octets d'une photo, lire et repondre a l'invitation photo du jour, abonner un telephone aux notifications.

## A lire avant de commencer

Glossaire :
@../../../../../docs/couple/business-rules/messaging/glossary.md

Regles metier :
@../../../../../docs/couple/business-rules/messaging/rules.md

Architecture front :
@../../../../../docs/couple/architecture/frontend/index.md

## Consignes de code

- Un port par agregat, comme cote serveur : `MessageFeedGateway` (`listMessageFeed`), `FlashMessageGateway` (`sendFlashMessage`, `withdrawFlashMessage`), `InstantPhotoGateway` (`sendInstantPhoto`, `withdrawInstantPhoto`, `getInstantPhotoFile`), `PhotoPromptGateway` (`getTodayPhotoPrompt`, `answerPhotoPrompt`), `PushSubscriptionGateway` (`subscribePushNotifications`, `unsubscribePushNotifications`, `getPushPublicKey`). Chacun agit pour le partenaire connecte (decision 0036) : aucune methode ne prend de `coupleId` ni de `userId`.
- Une photo a envoyer est un `InstantPhotoUpload` (`bytes`, `contentType`, `fileName`), construit par l'app web depuis son `File` : jamais de `File`, `Blob` ni `FormData` ici (`core-frontend.md` regle 25). Les octets lus reviennent en `InstantPhotoFile` (`bytes`, `contentType` de `InstantPhotoContentTypeEnum`).
- `createFlashMessageFormSchema(t)` suit R2 comme le contrat : texte coupe, de 1 a `FLASH_MESSAGE_TEXT_MAX_LENGTH`. Cles `form.text.errors.{required,tooLong}` (decision 0031).
- Le fil se lit par curseur (`CursorPaginationQuery`, `cursor` a `null` pour la premiere page, decision 0025). La photo du jour de l'autre arrive `isHidden: true`, sans `contentType`, et son fichier en `NOT_FOUND` (R9).
- Jamais de texte de mot ni d'octets de photo dans un journal ou un message d'erreur (`core.md` regle 33).

## Tests

- Fakes du sous-chemin `testing` : `FakeMessageFeedGateway` (journal `queries`), `FakeFlashMessageGateway`, `FakeInstantPhotoGateway`, `FakePhotoPromptGateway`, `FakePushSubscriptionGateway` (journal `calls`), chacun avec `givenRefusal(error)` qui vaut pour tous les appels. Donnees : `messaging-fixtures.ts` (`A_FLASH_MESSAGE`, `AN_INSTANT_PHOTO`, `A_HIDDEN_PHOTO_OF_THE_DAY`, `A_MESSAGE_FEED_PAGE`, `AN_INSTANT_PHOTO_UPLOAD`, `AN_INSTANT_PHOTO_FILE`, `A_PHOTO_PROMPT_ID`, `A_TODAY_PHOTO_PROMPT`, `A_PUSH_SUBSCRIPTION`, `A_PUSH_PUBLIC_KEY`).
