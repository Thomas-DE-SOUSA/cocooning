# Agrégats des messages

Cette page décrit les trois agrégats du contexte `messaging` : leur état, leurs transitions et les invariants qu'ils garantissent. À lire avant de toucher à `flash-message.aggregate.ts`, `instant-photo.aggregate.ts` ou `photo-prompt.aggregate.ts`.

## Rôle et limites

`FlashMessage` porte un mot flash, `InstantPhoto` une photo instantanée : leur couple, leur auteur, leur heure d'envoi, et le texte du mot ou le format de la photo. Les deux ne changent jamais après l'envoi ; leur seule transition est le retrait par l'auteur. Les octets de la photo ne sont pas dans l'agrégat : ils sont validés par `InstantPhotoContent` puis déposés par `FileStorage` sous `fileKey`. Une photo du jour est une `InstantPhoto` qui porte `photoPromptId` et `isLate`.

`PhotoPrompt` porte l'invitation photo d'un couple pour un jour de Paris : son jour, l'instant tiré (`scheduledAt`, secret) et l'instant où elle est partie (`issuedAt`). Elle est tirée une fois, envoyée une fois, et ne change plus ensuite ; elle n'est jamais supprimée.

## Comment c'est construit

| Élément | Rôle | Chemin |
|---|---|---|
| `FlashMessage.send(input, now)` | L'auteur devient propriétaire, le mot appartient au couple ; enregistre `FlashMessageSentEvent` (R1, R2) | `domain/models/flash-message.aggregate.ts` |
| `InstantPhoto.send(input, now)` | Idem pour une photo, avec son format détecté ; enregistre `InstantPhotoSentEvent` (R1, R3) | `domain/models/instant-photo.aggregate.ts` |
| `FlashMessage.withdraw(userId, now)`, `InstantPhoto.withdraw(userId, now)` | Suppression douce, auteur seul ; enregistre `FlashMessageWithdrawnEvent` ou `InstantPhotoWithdrawnEvent` (R6) | idem |
| `sentAt` | L'heure d'envoi, `createdAt` des métadonnées (R5) | idem |
| `InstantPhoto.fileKey` | `<coupleId>/instant-photos/<instantPhotoId>`, la clé du fichier (décision 0027) | `domain/models/instant-photo.aggregate.ts` |
| `fromSnapshot`, `toSnapshot` | Relecture sans validation, sérialisation en primitives et dates ISO | idem |
| `InstantPhotoContent.create(bytes)` | Format par la signature, au plus `INSTANT_PHOTO_MAX_BYTES` (R3) | `domain/value-objects/instant-photo-content.vo.ts` |
| `InstantPhoto.answer(input, answer, now)` | La photo du jour : `photoPromptId` et `isLate` viennent de `PhotoPrompt.answerAt` ; enregistre `InstantPhotoSentEvent` (R8) | `domain/models/instant-photo.aggregate.ts` |
| `PhotoPrompt.draw(input, secureRandomGenerator, now)` | Tire la minute de l'invitation entre 9 h et 21 h, heure de Paris ; enregistre `PhotoPromptDrawnEvent` (R7) | `domain/models/photo-prompt.aggregate.ts` |
| `PhotoPrompt.issueIfDue(now)` | Envoie l'invitation dès son heure, une seule fois et avant minuit de son jour ; enregistre `PhotoPromptIssuedEvent` (R7) | idem |
| `PhotoPrompt.answerAt(now)` | Refuse avant l'envoi (`PHOTO_PROMPT_NOT_FOUND`) et à partir de minuit (`PHOTO_PROMPT_EXPIRED`), par `PhotoPromptAnswerValidator` ; rend `isLate`, vrai plus de 10 minutes après l'envoi (R8) | idem, `domain/services/photo-prompt-answer.validator.ts` |
| `PhotoPrompt.closesAt` | Minuit de Paris qui suit son jour (R8) | idem |

## Événements

| Événement | `EVENT_NAME` | Données |
|---|---|---|
| `FlashMessageSentEvent` | `messaging.flash-message.sent` | `ownerId` |
| `FlashMessageWithdrawnEvent` | `messaging.flash-message.withdrawn` | aucune (`null`) |
| `InstantPhotoSentEvent` | `messaging.instant-photo.sent` | `ownerId` |
| `InstantPhotoWithdrawnEvent` | `messaging.instant-photo.withdrawn` | aucune (`null`) |
| `PhotoPromptDrawnEvent` | `messaging.photo-prompt.drawn` | aucune (`null`) : l'heure tirée reste secrète |
| `PhotoPromptIssuedEvent` | `messaging.photo-prompt.issued` | aucune (`null`) : le relais invitera les deux partenaires du couple (R10, à venir) |

Chaque événement porte l'`ExecutionContext` complet. Celui d'une invitation a pour `userId` l'UUID nul (`SCHEDULED_TASK_USER_ID`, `domain/events/photo-prompt-fact.ts`) : c'est l'app, pas un partenaire, qui tire et envoie. `ownerId` dira au relais qui notifier : l'autre partenaire seulement (R10, à venir). Aucun événement ne porte le texte d'un mot ni la photo.

## Invariants

| N° | Invariant | Appliqué par |
|---|---|---|
| INV-001 | Un mot flash fait de 1 à `FLASH_MESSAGE_TEXT_MAX_LENGTH` signes, sans espaces autour (`FLASH_MESSAGE_TEXT_INVALID`, R2) | `FlashMessageText.create` |
| INV-002 | Une photo est un JPEG, un PNG, un WebP ou un HEIC reconnu par ses octets, d'au plus `INSTANT_PHOTO_MAX_BYTES` (`INSTANT_PHOTO_CONTENT_INVALID`, R3) | `InstantPhotoContent.create` |
| INV-003 | Seul l'auteur retire un mot ou une photo (`FLASH_MESSAGE_RESERVED_TO_OWNER`, `INSTANT_PHOTO_RESERVED_TO_OWNER`, R6) | agrégats (`withdraw`) |
| INV-004 | L'auteur, le couple, le texte et le format ne changent jamais | agrégats (propriétés `readonly`) |
| INV-005 | Les agrégats ne modifient jamais `version` ; ils partent de 1 et la base l'incrémente | agrégats, repositories |
| INV-006 | Une invitation par couple et par jour de Paris, tirée entre 9 h et 21 h (R7) | `PhotoPrompt.draw`, index unique `photo_prompt_couple_id_day_key` |
| INV-007 | Une invitation part une seule fois, à son heure ou après, jamais après minuit de son jour (R7) | `PhotoPrompt.issueIfDue` |
| INV-008 | Une photo du jour répond à une invitation partie, avant minuit, une seule fois par partenaire vivante (R8) | `PhotoPrompt.answerAt`, `PhotoPromptPreconditionService`, index unique partiel `instant_photo_couple_id_photo_prompt_id_owner_id_key` |

## Décisions liées

- [Décision 0050](../../decisions/messaging/0050-regles-des-messages.md) : règles des messages
- [Décision 0027](../../decisions/0027-stockage-des-photos.md) : photos sur disque derrière `FileStorage`
