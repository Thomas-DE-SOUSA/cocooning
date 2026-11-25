# Messaging

Le partenaire lit le fil du couple (mots flash et photos, dans l'ordre d'une messagerie : le plus ancien en haut, le plus recent en bas, ou l'ecran s'ouvre), envoie un mot tape ou un mot pret, prend une photo avec l'appareil du telephone et l'envoie apres l'apercu, repond a l'invitation photo du jour, et retire ce qu'il a envoye.

## A lire avant de commencer

Glossaire :
@../../../../../../docs/couple/business-rules/messaging/glossary.md

Regles metier :
@../../../../../../docs/couple/business-rules/messaging/rules.md

Architecture front (chemin d'une lecture, session, erreurs, onglet "Messages") :
@../../../../../../docs/couple/architecture/frontend/index.md

## Consignes de code

- Lecture par la page serveur (decision 0036) : `src/app/(tabs)/messages/page.tsx` lit en parallele `loadMyCouple()` du module `pairing`, `loadFirstMessageFeedPage()` et `loadTodayPhotoPrompt()` (`services/load-messages.service.ts`, `server-only`), applique `resolveHomeDestination`, puis `presentMessagesPage` (`UNAUTHORIZED` vers la connexion, `MESSAGING_COUPLE_NOT_PAIRED` vers `/pairing`, R4). La page fait le `redirect()`, jamais le presenter. `messagingModule()` (`services/messaging-module.factory.ts`) construit le module a chaque appel avec `getSessionToken`.
- Le view model garde la premiere page brute (`MessageFeedPageResponse`) et `today` (jour de Paris lu par le serveur) : `presentMessageFeedDays` (`presenters/message-feed.presenter.ts`) la presente dans le navigateur avec les pages plus anciennes, groupees par jour de Paris ("Aujourd'hui", "Hier", puis la date, `presenters/feed-day-heading.presenter.ts`), heure `HH:MM` de Paris (`presenters/paris-time.presenter.ts`). Un element vu deux fois n'est montre qu'une fois.
- Ordre (R5) : `presentMessageFeedDays` rend les jours et les elements du plus ancien au plus recent ; `hooks/use-scroll-to-latest.ts` descend au dernier element a l'ouverture et a chaque nouvel element, pas quand des pages plus anciennes arrivent.
- Pages plus anciennes (R5, decision 0025) : bouton "Voir les plus anciens", en haut du fil, `hooks/use-older-messages.ts` par la server action `messaging-older-messages.action.ts` (curseur revalide par `CursorPaginationQuerySchema`, `MESSAGE_FEED_PAGE_SIZE` de `data/`). `MessagesScreenContainer` cle `MessageFeedContainer` par le `nextCursor` de la premiere page : si la premiere page a glisse (nouveau mot), les pages plus anciennes lues sont oubliees, sans trou ni doublon ; un element retire disparait des pages plus anciennes par `forget`.
- Photo (R3, R5, R9) : une photo visible pointe vers le route handler `src/app/api/instant-photos/[instantPhotoId]/route.ts` (`WebRouterEnum.INSTANT_PHOTO_FILE`, `loadInstantPhotoFile`, `services/instant-photo-file.service.ts`) qui renvoie les octets avec leur `Content-Type` et `Cache-Control: private, no-store` (`INSTANT_PHOTO_CACHE_CONTROL`), 404 sur tout refus, 401 sur une session refusee. Une photo du jour cachee (`isHidden`) devient `HIDDEN_PHOTO`, sans adresse : le navigateur ne demande jamais ses octets. `next/image` en `unoptimized` (le lint refuse `<img>`), `loading="lazy"`.
- Prise de vue : `hooks/use-photo-capture.ts` ouvre un `<input type="file" accept="image/*" capture="environment">` (`ui/containers/photo-capture.container.tsx`), verifie le seul poids (`presentInstantPhotoRefusalKey`, jamais le type declare : un iPhone peut declarer `image/heif` ou rien), puis montre l'apercu plein ecran (`ui/views/photo-preview.view.tsx`, "Reprendre", "Envoyer"). Ouverte depuis la carte de l'invitation, la photo garde `photoPromptId` et part par `AnswerPhotoPromptUseCase` (R8) ; sinon par `SendInstantPhotoUseCase`. L'apercu est une URL `blob:` liberee a l'abandon et apres l'envoi.
- Envoi d'une photo : la server action recoit un `FormData` (champ `INSTANT_PHOTO_FORM_FIELD`), `services/instant-photo-commands.service.ts` reverifie le poids et construit l'`InstantPhotoUpload`. La limite de corps des server actions et du proxy est relevee a `INSTANT_PHOTO_REQUEST_BODY_LIMIT` dans `next.config.ts`.
- Mot (R2) : `hooks/use-flash-message-form.ts` (react-hook-form, `createFlashMessageFormSchema(t)`, erreurs sous le champ), revalide par `services/message-commands.service.ts`. Mots prets : `READY_WORD_KEYS` (`data/`), un toucher envoie le libelle traduit (`SEND_READY_WORD`, qui laisse le mot tape intact). Champ en `text-base` (16 px, pas de zoom sur iPhone).
- Retrait (R6) : un toucher sur mon element (bouton) ouvre la feuille `Drawer` "Retirer pour nous deux" / "Garder" (`ui/views/withdraw-sheet.view.tsx`) ; ceux de l'autre ne sont pas des boutons. Pas d'appui long : peu fiable dans une PWA iOS (selection du texte, menu de l'image).
- Commandes : `hooks/use-message-commands.ts` (une a la fois, `pending` dit laquelle), `hooks/use-message-feedback.ts` (toast court, `settle` ferme ce que la commande a ouvert, puis `router.refresh()` ; un refus passe par `describeApiResultError` et `resolveMessageCommandFailureFollowUp` : connexion sur `UNAUTHORIZED`, relecture sur `NOT_FOUND`, `FORBIDDEN`, `CONFLICT`). `hooks/use-messages-refresh.ts` relit au retour au premier plan et sur "Reessayer".
- Carte de l'invitation (R7 a R9) : `presentPhotoPromptCard` donne l'heure d'envoi, les minutes avant "en retard" comptees a la lecture de la page (pas de minuterie), et si l'autre a deja repondu ; repondue, une ligne discrete ; rien avant l'envoi ni apres minuit.
- Ecran fixe au-dessus de la barre d'onglets : `ui/views/message-composer.view.tsx` est `fixed` a `bottom-[calc(4.5rem+env(safe-area-inset-bottom))]`, la page garde `pb-40` pour que le dernier element ne passe pas dessous.
- Codes que l'ecran recoit : `MESSAGING_SCREEN_ERROR_CODES` (`data/`, codes `messaging` sauf `PUSH_SUBSCRIPTION_*`, qui viendront avec l'interrupteur des notifications), chacun avec sa cle `apiErrors.<code>` dans `src/i18n/locales/fr/messaging/messages.json` (decision 0037).
- Pas d'abonnement aux notifications ici : il arrive avec le service worker du Web Push.

## Tests

- `FakeMessageCommandGateway` (`gateways/fake/`, `givenOutcome(operation, outcome)`) pour `useMessageCommands` ; les fakes de `@cocooning/couple-client-business-logic/testing` pour les services. `services/instant-photo-commands.service.spec.ts` tourne en environnement `node` (`@jest-environment node`) : le `File` de jsdom n'a pas `arrayBuffer()`.
- `presenters/__tests__/feed-items.ts` (`aWord`, `aPhotoOfTheDay`) pour un element d'un scenario ; une heure de `sentAt` en UTC se lit une heure plus tard a Paris en hiver.
- Les vues se testent seules par leurs props (le composeur dans un harnais avec `useFlashMessageForm`, la feuille dans un `Drawer` ouvert). Le route handler, `useMessageFeedback` (routeur de Next), `usePhotoCapture` et les containers ne se testent pas (ecart frontend 003, piege t3-env).
