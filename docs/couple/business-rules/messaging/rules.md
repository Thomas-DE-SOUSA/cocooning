# Règles des messages

Ce que le couple veut que l'app impose aux mots flash, aux photos instantanées, à l'invitation photo et aux notifications. À lire avant de toucher au contexte `messaging`, au relais des notifications ou à l'onglet « Messages ».

## Envoi

### R1. Un mot ou une photo appartient au couple et à celui qui l'envoie

J'envoie un mot flash ou une photo : il est à notre couple, et j'en suis l'auteur. Ma couleur le marque dans le fil.

- Dans le code : `FlashMessage.send` et `InstantPhoto.send` (`ownerId` et `coupleId` de l'`ExecutionContext`) ; la vue porte `ownerId` et `isOwner`.
- Source : [décision 0050](../../decisions/messaging/0050-regles-des-messages.md), [décision 0018](../../decisions/0018-portee-par-couple-et-proprietaire.md). Validée par : Thomas De Sousa, 2026-11-24.

### R2. Un mot flash fait de 1 à 140 signes

J'écris un mot ou je touche un mot prêt ; les espaces autour ne comptent pas, un mot vide est refusé, il fait 140 signes au plus.

- Dans le code : `FlashMessageText.create` (`FLASH_MESSAGE_TEXT_MAX_LENGTH`), refus `FLASH_MESSAGE_TEXT_INVALID` ; `SendFlashMessageRequestSchema` coupe et borne de même. Côté PWA, `createFlashMessageFormSchema` applique la même coupe et les mêmes bornes avant l'envoi.
- Source : décision 0050. Validée par : Thomas De Sousa, 2026-11-24.

### R3. Une photo prise par l'appareil du téléphone

Je prends la photo avec l'appareil de mon téléphone, je la vois en aperçu, puis je l'envoie ou je la reprends. Elle est en JPEG, PNG, WebP ou HEIC, de 10 Mo au plus.

- Dans le code : `InstantPhotoContent.create` lit le format dans les premiers octets (`detectInstantPhotoContentType`), jamais dans le type déclaré, et borne le poids à `INSTANT_PHOTO_MAX_BYTES` ; multer s'arrête à la même borne. Refus `INSTANT_PHOTO_CONTENT_INVALID`. Côté PWA, l'écran « Messages » ouvre l'appareil par un champ fichier (`capture="environment"`), montre l'aperçu, et ne refuse avant l'envoi qu'un fichier vide ou plus lourd que `INSTANT_PHOTO_MAX_BYTES` (`presentInstantPhotoRefusalKey`, revérifié par la server action) ; jamais le type déclaré, qu'un iPhone peut donner en `image/heif` ou pas du tout. `createInstantPhotoFormSchema`, qui vérifie aussi le type, n'est pas utilisé par l'écran. L'API reste seule juge des octets.
- Source : décision 0050 ; les formats et le poids, proposés par Claude, sont à confirmer par le propriétaire.

### R4. Les messages demandent un couple formé

Tant que nous ne sommes pas en couple dans l'app, je n'ai pas de messages.

- Dans le code : `MessagingCoupleGuardService` et `PairedCoupleProvider` ([décision 0041](../../decisions/0041-couple-de-la-requete.md)), refus `MESSAGING_COUPLE_NOT_PAIRED`.
- Source : décision 0050. Validée par : Thomas De Sousa, 2026-11-24.

## Le fil

### R5. Le fil garde tout, du plus récent au plus ancien

Nos mots et nos photos restent dans un fil à deux, que nous revoyons quand nous voulons. Chacun porte son heure ; les miens sont à droite, ceux de l'autre à gauche.

- Dans le code : `MessageFeedService.readPage` et `ListMessageFeedUseCase`, lecture par curseur ([décision 0025](../../decisions/0025-pagination.md)) ; chaque élément porte `sentAt` et `ownerId`. Côté PWA, `presentMessageFeedDays` groupe le fil par jour de Paris (« Aujourd'hui », « Hier », puis la date) avec l'heure de Paris de chaque élément ; « Voir les plus anciens » lit la page suivante.
- Source : décision 0050. Validée par : Thomas De Sousa, 2026-11-24.

### R6. Seul l'auteur retire ce qu'il a envoyé

Je retire un mot ou une photo que j'ai envoyé : il disparaît pour nous deux. Je ne peux pas retirer ce que l'autre m'a envoyé.

- Dans le code : `FlashMessage.withdraw` et `InstantPhoto.withdraw` (suppression douce, `core-backend.md` règle 13 ; refus `FLASH_MESSAGE_RESERVED_TO_OWNER`, `INSTANT_PHOTO_RESERVED_TO_OWNER`) ; `WithdrawInstantPhotoUseCase` supprime le fichier par `FileStorage`. Côté PWA, seuls mes éléments sont des boutons : un toucher ouvre la feuille « Retirer pour nous deux » ou « Garder » (pas d'appui long, peu fiable dans une PWA sur iPhone).
- Source : décision 0050. Validée par : Thomas De Sousa, 2026-11-24.

## La photo du jour

### R7. Une invitation par jour, la même pour les deux

Chaque jour, à une heure tirée au hasard entre 9 h et 21 h (heure de Paris), l'app nous invite tous les deux en même temps à prendre une photo.

- Dans le code : `PhotoPromptScheduler` (tâche planifiée de l'API, une fois par minute) appelle `SchedulePhotoPromptsUseCase` ; `PhotoPromptScheduleService` lit d'une requête les invitations du jour de Paris de tous les couples formés (`PairedCoupleProvider.findPairedCoupleIds`), tire celle qui manque (`PhotoPrompt.draw`, minute tirée par le port `SecureRandomGenerator`, `core.md` règle 19) et envoie celle dont l'heure est venue (`PhotoPrompt.issueIfDue`, événement `PhotoPromptIssuedEvent` dans l'outbox). L'heure tirée reste secrète : aucune route ne la rend avant l'envoi. Une invitation par couple et par jour (index unique `photo_prompt_couple_id_day_key`).
- Source : décision 0050, [décision 0014](../../decisions/0014-photo-instantanee.md). Validée par : Thomas De Sousa, 2026-11-24.

### R8. On répond jusqu'à minuit, « en retard » après 10 minutes

J'envoie une seule photo du jour, jusqu'à minuit (heure de Paris). Envoyée plus de 10 minutes après l'invitation, elle porte « en retard ». Après minuit, l'invitation est passée.

- Dans le code : `AnswerPhotoPromptUseCase` ; `PhotoPrompt.answerAt` refuse après minuit (`PHOTO_PROMPT_EXPIRED`) et donne `isLate` ; `PhotoPromptPreconditionService.ensureNotAnsweredBy` refuse une seconde photo du jour (`PHOTO_PROMPT_ALREADY_ANSWERED`), comme l'index unique partiel `instant_photo_couple_id_photo_prompt_id_owner_id_key` pour deux envois simultanés. Une photo du jour retirée (R6) ne compte plus : l'auteur peut en envoyer une autre avant minuit.
- Source : décision 0050. Validée par : Thomas De Sousa, 2026-11-24.

### R9. La photo du jour de l'autre reste cachée tant que je n'ai pas envoyé la mienne

Je sais que l'autre a envoyé sa photo du jour, mais je ne la vois qu'après avoir envoyé la mienne. Une photo spontanée se voit tout de suite.

- Dans le code : `isHiddenFrom` (`domain/models/photo-of-the-day.ts`) ; `ListMessageFeedUseCase` rend la photo cachée avec `isHidden: true` et sans `contentType`, et `InstantPhotoPreconditionService.ensureVisibleTo` fait répondre `404` à son fichier. L'API ne rend pas la photo cachée, la PWA ne fait pas que la flouter : elle n'en connaît pas l'adresse, montre un cadenas et « Envoie la tienne pour voir la sienne », et ne demande jamais ses octets.
- Source : décision 0050. Validée par : Thomas De Sousa, 2026-11-24.

## Notifications

### R10. Une notification discrète, chez l'autre seulement

Quand j'envoie un mot ou une photo, le téléphone de l'autre affiche « Ton âme sœur t'a envoyé quelque chose », jamais le texte ni la photo. L'invitation du jour affiche « C'est l'heure de la photo » sur nos deux téléphones.

- Dans le code : `OutboxRelayScheduler` (relais de l'outbox dans l'API, toutes les cinq secondes, [décision 0021](../../decisions/0021-outbox-postgresql-relais-dans-l-api.md)) appelle `RelayOutboxEventsUseCase` ; `pushNotificationsOf` (`domain/models/push-notification-plan.ts`) fait d'un `FlashMessageSentEvent` ou d'un `InstantPhotoSentEvent` un `MESSAGE_RECEIVED` pour l'autre partenaire seulement, et d'un `PhotoPromptIssuedEvent` un `PHOTO_PROMPT_ISSUED` pour les deux ; `PushNotificationService` l'envoie à chaque téléphone abonné par `PushNotificationSender` (`WebPushNotificationSender`). La charge ne porte que le genre de la notification (`PushNotificationKindEnum`), ni texte, ni photo, ni identifiant (`core.md` règle 33) ; la phrase française est celle de la PWA ([décision 0051](../../decisions/messaging/0051-relais-des-notifications.md)).
- Source : décision 0050. Validée par : Thomas De Sousa, 2026-11-24.

### R11. Chaque téléphone s'abonne aux notifications

J'autorise les notifications sur chacun de mes téléphones ; sur iPhone, l'app doit être installée sur l'écran d'accueil. Un abonnement que le service de notification refuse est oublié.

- Dans le code : `SubscribePushNotificationsUseCase` (`PUT /push-subscriptions`, un abonnement par téléphone, idempotent sur l'`endpoint`, qui suit le partenaire connecté sur ce téléphone), `UnsubscribePushNotificationsUseCase` (le partenaire oublie un de ses téléphones), `GetPushPublicKeyUseCase` (clé publique VAPID). `PushSubscription`, `PushEndpoint` et `PushSubscriptionKeys` valident l'abonnement (`PUSH_SUBSCRIPTION_INVALID`). Un abonnement que le service répond `404` ou `410` est supprimé par `PushNotificationService` (`PushDeliveryOutcomeEnum.GONE`).
- Source : décision 0050. Validée par : Thomas De Sousa, 2026-11-24.

## Cas et exceptions

| Situation | Ce qui s'applique |
|---|---|
| Mot vide ou trop long | Refusé, `422` `FLASH_MESSAGE_TEXT_INVALID` (R2) |
| Photo d'un autre format ou trop lourde, ou envoi sans photo | Refusée, `422` `INSTANT_PHOTO_CONTENT_INVALID` (R3) |
| Toute action sur les messages sans couple formé | Refusée, `404` `MESSAGING_COUPLE_NOT_PAIRED` (R4, décision 0041) |
| Retirer un mot ou une photo de l'autre | Refusé, `403` `FLASH_MESSAGE_RESERVED_TO_OWNER` ou `INSTANT_PHOTO_RESERVED_TO_OWNER` (R6) |
| Mot ou photo inconnu, déjà retiré ou d'un autre couple | Refusé, `404` `FLASH_MESSAGE_NOT_FOUND` ou `INSTANT_PHOTO_NOT_FOUND` |
| Deux retraits du même élément au même moment | Le second refusé, `409` `FLASH_MESSAGE_VERSION_CONFLICT` ou `INSTANT_PHOTO_VERSION_CONFLICT` |
| Deuxième photo du jour du même partenaire, même envoyée au même moment | Refusée, `409` `PHOTO_PROMPT_ALREADY_ANSWERED` (R8) |
| Photo du jour à minuit ou après (heure de Paris) | Refusée, `409` `PHOTO_PROMPT_EXPIRED` (R8) |
| Photo du jour avant l'envoi de l'invitation, ou pour une invitation inconnue ou d'un autre couple | Refusée, `404` `PHOTO_PROMPT_NOT_FOUND` : avant l'envoi, l'invitation est secrète et répond comme une invitation inconnue (R7) |
| Lire l'invitation du jour avant son envoi | `200` avec `photoPrompt: null` : l'heure tirée n'est jamais dite (R7) |
| Lire la photo du jour de l'autre avant d'avoir envoyé la sienne | Le fil la rend avec `isHidden: true`, sans `contentType` ; son fichier répond `404` `INSTANT_PHOTO_NOT_FOUND` (R9) |
| Retirer sa photo du jour | Elle ne compte plus : une autre peut partir avant minuit, et la photo de l'autre redevient cachée jusque-là (R6, R8, R9) |
| L'API arrêtée à l'heure tirée | L'invitation part au premier passage de la tâche après le redémarrage, avant minuit ; jamais un autre jour (R7) |
| Abonnement d'une adresse qui n'est pas en `https`, ou clés hors base64url ou trop longues | Refusé, `422` (validation du contrat, puis `PUSH_SUBSCRIPTION_INVALID`) (R11) |
| Oublier le téléphone de l'autre, d'un autre couple ou un téléphone inconnu | Refusé, `404` `PUSH_SUBSCRIPTION_NOT_FOUND` (R11) |
| Le même téléphone abonné deux fois au même moment | Un seul abonnement ; le second peut être refusé, `409` `PUSH_SUBSCRIPTION_VERSION_CONFLICT` (R11) |
| Le service de notification répond `404` ou `410` | L'abonnement est oublié (R11) |
| Le service de notification échoue autrement (délai, `429`, `5xx`) | Journalisé, l'abonnement est gardé, la notification est perdue : jamais réessayée (décision 0051) |
| Plusieurs mots envoyés coup sur coup | Une notification par passage du relais et par téléphone (R10) |
| Une note ou un événement privé | Aucune notification (R9 des notes, R10 de l'agenda) |
| Deux passages de la tâche en même temps (redémarrage) | Le second échoue sur l'index unique ou la version, `PHOTO_PROMPT_VERSION_CONFLICT`, journalisé ; rien n'est tiré ni envoyé deux fois (R7) |

## Voir aussi

- [Glossaire des messages](glossary.md)
- [La photo instantanée](../../decisions/0014-photo-instantanee.md)
