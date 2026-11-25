# Glossaire des messages

Les termes propres aux messages, avec leur nom dans le code. Les termes communs (couple, partenaire, propriétaire, message flash, photo instantanée, invitation photo, notification) sont dans le [glossaire transverse](../../../architecture/glossary.md). Tous les noms de code sont ceux du contexte codé.

| Terme | Nom dans le code | Définition |
|---|---|---|
| **Auteur** | `ownerId` | Le partenaire qui a envoyé le mot ou la photo ; sa couleur le marque dans le fil |
| **Fil** | `MessageFeed` | Les mots flash et les photos instantanées du couple, du plus récent au plus ancien |
| **Élément du fil** | `MessageFeedItem` (`MessageFeedItemType` `FLASH_MESSAGE` / `INSTANT_PHOTO`) | Un mot flash ou une photo instantanée tel que le fil le montre, avec son auteur et son heure d'envoi |
| **Heure d'envoi** | `sentAt` | Le moment où le mot ou la photo a été envoyé, montré dans le fil |
| **Mot prêt** | calculé par la PWA (`READY_WORD_KEYS`) | Un mot flash proposé en un toucher (« Je t'aime », « Tu me manques », « Bisous », « J'arrive ») ; envoyé, c'est un mot flash comme un autre |
| **Texte du mot** | `FlashMessageText` | Le texte d'un mot flash, de 1 à 140 signes |
| **Photo du jour** | `InstantPhoto` avec `photoPromptId` | La photo instantanée envoyée en réponse à l'invitation du jour |
| **En retard** | `isLate` (à partir de `lateFrom`) | Une photo du jour envoyée plus de 10 minutes après l'invitation |
| **Heure tirée** | `scheduledAt` | Le moment, tiré au hasard entre 9 h et 21 h (heure de Paris), où l'invitation du jour doit partir ; secret jusque-là |
| **Envoi de l'invitation** | `issue`, `issuedAt` | Le moment où l'app invite les deux partenaires à prendre la photo du jour |
| **Fin de l'invitation** | `closesAt` | Minuit, heure de Paris, à la fin du jour de l'invitation : après, elle est passée (`PHOTO_PROMPT_EXPIRED`) |
| **Photo cachée** | `isHidden` | La photo du jour de l'autre, que je ne vois pas tant que je n'ai pas envoyé la mienne |
| **Retirer** | `withdraw` | L'auteur enlève un mot ou une photo du fil, pour les deux |
| **Abonnement aux notifications** | `PushSubscription` | L'autorisation d'un téléphone à recevoir les notifications Web Push d'un partenaire |
| **Genre de notification** | `PushNotificationKind` (`MESSAGE_RECEIVED`, `PHOTO_PROMPT_ISSUED`, `CALENDAR_EVENT_ADDED`, `NOTE_SHARED`) | Ce que dit une notification, et rien d'autre : la PWA en fait sa phrase (« Ton âme sœur t'a envoyé quelque chose ») |
| **Adresse du téléphone** | `PushEndpoint` | L'adresse du service de notification d'un téléphone abonné ; secrète, jamais journalisée |
| **Relais de l'outbox** | `OutboxRelayScheduler`, `RelayOutboxEventsUseCase` | La tâche de l'API qui lit les événements nouveaux des notes, de l'agenda et des messages et envoie leurs notifications |
