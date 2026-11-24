# Règles des messages

Ce que le couple veut que l'app impose aux mots flash, aux photos instantanées, à l'invitation photo et aux notifications. À lire avant de toucher au contexte `messaging`, au relais des notifications ou à l'onglet « Messages ».

## Envoi

### R1. Un mot ou une photo appartient au couple et à celui qui l'envoie

J'envoie un mot flash ou une photo : il est à notre couple, et j'en suis l'auteur. Ma couleur le marque dans le fil.

- Dans le code : `FlashMessage.send` et `InstantPhoto.send` (`ownerId` et `coupleId` de l'`ExecutionContext`) ; la vue porte `ownerId` et `isOwner`.
- Source : [décision 0050](../../decisions/messaging/0050-regles-des-messages.md), [décision 0018](../../decisions/0018-portee-par-couple-et-proprietaire.md). Validée par : Thomas De Sousa, 2026-11-24.

### R2. Un mot flash fait de 1 à 140 signes

J'écris un mot ou je touche un mot prêt ; les espaces autour ne comptent pas, un mot vide est refusé, il fait 140 signes au plus.

- Dans le code : `FlashMessageText.create` (`FLASH_MESSAGE_TEXT_MAX_LENGTH`), refus `FLASH_MESSAGE_TEXT_INVALID` ; `SendFlashMessageRequestSchema` coupe et borne de même.
- Source : décision 0050. Validée par : Thomas De Sousa, 2026-11-24.

### R3. Une photo prise par l'appareil du téléphone

Je prends la photo avec l'appareil de mon téléphone, je la vois en aperçu, puis je l'envoie ou je la reprends. Elle est en JPEG, PNG, WebP ou HEIC, de 10 Mo au plus.

- Dans le code : `InstantPhotoContent.create` lit le format dans les premiers octets (`detectInstantPhotoContentType`), jamais dans le type déclaré, et borne le poids à `INSTANT_PHOTO_MAX_BYTES` ; multer s'arrête à la même borne. Refus `INSTANT_PHOTO_CONTENT_INVALID`.
- Source : décision 0050 ; les formats et le poids, proposés par Claude, sont à confirmer par le propriétaire.

### R4. Les messages demandent un couple formé

Tant que nous ne sommes pas en couple dans l'app, je n'ai pas de messages.

- Dans le code : `MessagingCoupleGuardService` et `PairedCoupleProvider` ([décision 0041](../../decisions/0041-couple-de-la-requete.md)), refus `MESSAGING_COUPLE_NOT_PAIRED`.
- Source : décision 0050. Validée par : Thomas De Sousa, 2026-11-24.

## Le fil

### R5. Le fil garde tout, du plus récent au plus ancien

Nos mots et nos photos restent dans un fil à deux, que nous revoyons quand nous voulons. Chacun porte son heure ; les miens sont à droite, ceux de l'autre à gauche.

- Dans le code : `MessageFeedService.readPage` et `ListMessageFeedUseCase`, lecture par curseur ([décision 0025](../../decisions/0025-pagination.md)) ; chaque élément porte `sentAt` et `ownerId`.
- Source : décision 0050. Validée par : Thomas De Sousa, 2026-11-24.

### R6. Seul l'auteur retire ce qu'il a envoyé

Je retire un mot ou une photo que j'ai envoyé : il disparaît pour nous deux. Je ne peux pas retirer ce que l'autre m'a envoyé.

- Dans le code : `FlashMessage.withdraw` et `InstantPhoto.withdraw` (suppression douce, `core-backend.md` règle 13 ; refus `FLASH_MESSAGE_RESERVED_TO_OWNER`, `INSTANT_PHOTO_RESERVED_TO_OWNER`) ; `WithdrawInstantPhotoUseCase` supprime le fichier par `FileStorage`.
- Source : décision 0050. Validée par : Thomas De Sousa, 2026-11-24.

## La photo du jour

### R7. Une invitation par jour, la même pour les deux

Chaque jour, à une heure tirée au hasard entre 9 h et 21 h (heure de Paris), l'app nous invite tous les deux en même temps à prendre une photo.

- Dans le code : à venir avec le contexte `messaging` (tâche planifiée de l'API, hasard par un port injecté, `core.md` règle 19).
- Source : décision 0050, [décision 0014](../../decisions/0014-photo-instantanee.md). Validée par : Thomas De Sousa, 2026-11-24.

### R8. On répond jusqu'à minuit, « en retard » après 10 minutes

J'envoie une seule photo du jour, jusqu'à minuit (heure de Paris). Envoyée plus de 10 minutes après l'invitation, elle porte « en retard ». Après minuit, l'invitation est passée.

- Dans le code : à venir avec le contexte `messaging`.
- Source : décision 0050. Validée par : Thomas De Sousa, 2026-11-24.

### R9. La photo du jour de l'autre reste cachée tant que je n'ai pas envoyé la mienne

Je sais que l'autre a envoyé sa photo du jour, mais je ne la vois qu'après avoir envoyé la mienne. Une photo spontanée se voit tout de suite.

- Dans le code : à venir avec le contexte `messaging` ; l'API ne rend pas la photo cachée, la PWA ne fait pas que la flouter.
- Source : décision 0050. Validée par : Thomas De Sousa, 2026-11-24.

## Notifications

### R10. Une notification discrète, chez l'autre seulement

Quand j'envoie un mot ou une photo, le téléphone de l'autre affiche « Ton âme sœur t'a envoyé quelque chose », jamais le texte ni la photo. L'invitation du jour affiche « C'est l'heure de la photo » sur nos deux téléphones.

- Dans le code : à venir avec le relais de l'outbox ([décision 0021](../../decisions/0021-outbox-postgresql-relais-dans-l-api.md)) et le Web Push ; la charge ne porte que des identifiants (`core.md` règle 33).
- Source : décision 0050. Validée par : Thomas De Sousa, 2026-11-24.

### R11. Chaque téléphone s'abonne aux notifications

J'autorise les notifications sur chacun de mes téléphones ; sur iPhone, l'app doit être installée sur l'écran d'accueil. Un abonnement que le service de notification refuse est oublié.

- Dans le code : à venir avec le contexte `messaging`.
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
| Deuxième photo du jour, ou photo du jour après minuit | Refusée, `409` (R8) |
| Lire la photo du jour de l'autre avant d'avoir envoyé la sienne | Non rendue ; le fil dit seulement qu'elle existe (R9) |

## Voir aussi

- [Glossaire des messages](glossary.md)
- [La photo instantanée](../../decisions/0014-photo-instantanee.md)
