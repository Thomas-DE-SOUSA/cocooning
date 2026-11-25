# Règles des notes

Ce que le couple veut que l'app impose aux notes. À lire avant de toucher au contexte `notes`, à l'éditeur ou aux écrans des notes.

## À la création

### R1. Une note appartient au couple et à celle qui la crée

Je crée une note : elle est à notre couple, et j'en suis la propriétaire.

- Dans le code : `CreateNoteUseCase`, `Note.create`.
- Source : [décision 0039](../../decisions/notes/0039-regles-des-notes.md), [décision 0018](../../decisions/0018-portee-par-couple-et-proprietaire.md). Validée par : Thomas De Sousa, 2026-11-23.

### R2. Une note est partagée à sa création

Ma nouvelle note est tout de suite visible et modifiable par mon âme sœur ; je peux la rendre privée ensuite. Avec les dossiers, une note créée dans « Privé » est privée dès sa création (R11 des [règles des dossiers](rules/folders.md)).

- Dans le code : `Note.create`, visibilité de l'espace (`visibilityOfSpace`) ; `CreateNoteRequestSchema` crée à la racine de « Partagé » sans espace ni dossier, `CreateNoteUseCase` dans l'espace et le dossier demandés.
- Source : décision 0039, [décision 0052](../../decisions/notes/0052-dossiers-et-dossiers-ia.md). Validée par : Thomas De Sousa, 2026-11-23 et 2026-11-25.

### R3. Les notes demandent un couple formé

Tant que nous ne sommes pas en couple dans l'app, je n'ai pas de notes.

- Dans le code : `NoteCoupleGuardService` et `PairedCoupleProvider` ([décision 0041](../../decisions/0041-couple-de-la-requete.md)), refus `NOTE_COUPLE_NOT_PAIRED`.
- Source : décision 0039. Validée par : Thomas De Sousa, 2026-11-23.

## Visibilité

### R4. Une note privée n'existe que pour sa propriétaire

Ma note privée n'apparaît pas chez l'autre, et l'app ne lui dit même pas qu'elle existe.

- Dans le code : `NoteRepository.findVisibleById` et `findVisible` filtrent par la requête, `GetNoteUseCase` ouvre une note ; `NotePreconditionService.loadVisibleNote` refuse `NOTE_NOT_FOUND` (`core.md` règle 27).
- Source : décision 0039, décision 0018. Validée par : Thomas De Sousa, 2026-11-23.

### R5. Seule la propriétaire change la visibilité

Je partage ma note ou je la rends privée ; l'autre ne peut ni l'un ni l'autre. Quand je la rends privée, elle disparaît de chez l'autre, même s'il l'éditait.

- Dans le code : `ShareNoteUseCase`, `MakeNotePrivateUseCase`, `NoteAccessValidator.ensureOwner` (`NOTE_RESERVED_TO_OWNER`).
- Source : décision 0039. Validée par : Thomas De Sousa, 2026-11-23.

## Édition à deux

### R6. Les deux partenaires modifient une note partagée en même temps

Nous écrivons tous les deux dans la liste de courses en même temps : rien ne se perd, chacun voit les frappes de l'autre.

- Dans le code : `RenameNoteUseCase` pour le titre ; le contenu passe par le canal temps réel, `AuthorizeNoteDocumentUseCase`, `LoadNoteDocumentUseCase`, `SaveNoteDocumentUseCase` ([décision 0040](../../decisions/notes/0040-edition-a-deux-par-hocuspocus-dans-l-api.md)).
- Source : [décision 0016](../../decisions/0016-edition-des-notes-en-temps-reel.md), décision 0039. Validée par : Thomas De Sousa, 2026-11-23.

## Suppression

### R7. Seule la propriétaire supprime une note

Je supprime ma note : elle disparaît pour nous deux. L'autre ne peut pas supprimer une note que j'ai créée.

- Dans le code : `DeleteNoteUseCase`, `Note.delete` (suppression douce, `core-backend.md` règle 13).
- Source : décision 0039. Validée par : Thomas De Sousa, 2026-11-23.

## Le titre

### R8. Un titre fait de 1 à 120 signes

Je donne un titre à ma note ; les espaces autour ne comptent pas, un titre vide est refusé.

- Dans le code : `NoteTitle.create`, `NOTE_TITLE_MAX_LENGTH` (`@cocooning/couple-shared-kernel/limits`).
- Source : proposition de Claude avec le domaine, acceptée par le propriétaire (« OK pour 120 », 2026-11-23). Validée par : Thomas De Sousa, 2026-11-23.

## Notification

### R9. Une note qui devient visible pour l'autre le notifie

Je crée une note partagée, ou je partage une note privée : le téléphone de l'autre affiche « Ton âme sœur a partagé une note avec toi », sans le titre. Une note privée ne notifie personne.

- Dans le code : le relais de l'outbox du contexte `messaging` lit `note_event` ; `pushNotificationsOf` (`messaging/domain/models/push-notification-plan.ts`) fait d'un `NoteCreatedEvent` de visibilité `SHARED` (toute note créée, R2) ou d'un `NoteSharedEvent` un `NOTE_SHARED` pour l'autre partenaire seulement ; `NoteMadePrivateEvent` ne notifie personne ([décision 0051](../../decisions/messaging/0051-relais-des-notifications.md)). Dans la PWA, le service worker affiche la phrase de `NOTE_SHARED` (`pushNotificationOf`, `apps/couple/web/src/app/sw-push-notification.ts`) ; un toucher ouvre l'accueil des notes.
- Source : [décision 0050](../../decisions/messaging/0050-regles-des-messages.md). Validée par : Thomas De Sousa, 2026-11-24.

## Cas et exceptions

| Situation | Ce qui s'applique |
|---|---|
| Lire, modifier ou supprimer la note privée de l'autre | Refusée, `404`, comme une note inexistante (R4) |
| Supprimer la note partagée de l'autre, ou changer sa visibilité | Refusée, `403` `NOTE_RESERVED_TO_OWNER` (R5, R7) |
| Toute action sur les notes sans couple formé | Refusée, `404` `NOTE_COUPLE_NOT_PAIRED` (R3, décision 0041) |
| Note inconnue, supprimée ou privée de l'autre | Refusée, `404` `NOTE_NOT_FOUND` (R4) |
| Deux écritures de la même note en même temps | Refusée, `409` `NOTE_VERSION_CONFLICT` |
| Titre vide ou trop long | Refusé, `422` `NOTE_TITLE_INVALID` (R8) |

## Voir aussi

- [Règles des dossiers](rules/folders.md) et [des dossiers IA](rules/ai-folders.md)
- [Glossaire des notes](glossary.md)
- [Décision 0040](../../decisions/notes/0040-edition-a-deux-par-hocuspocus-dans-l-api.md) : le canal temps réel
