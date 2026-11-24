# Glossaire des messages

Les termes propres aux messages, avec leur nom dans le code. Les termes communs (couple, partenaire, propriétaire, message flash, photo instantanée, invitation photo, notification) sont dans le [glossaire transverse](../../../architecture/glossary.md). Les noms de code des mots flash, des photos spontanées et du fil sont ceux du contexte codé ; ceux de la photo du jour et des notifications restent une proposition.

| Terme | Nom dans le code | Définition |
|---|---|---|
| **Auteur** | `ownerId` | Le partenaire qui a envoyé le mot ou la photo ; sa couleur le marque dans le fil |
| **Fil** | `MessageFeed` | Les mots flash et les photos instantanées du couple, du plus récent au plus ancien |
| **Élément du fil** | `MessageFeedItem` (`MessageFeedItemType` `FLASH_MESSAGE` / `INSTANT_PHOTO`) | Un mot flash ou une photo instantanée tel que le fil le montre, avec son auteur et son heure d'envoi |
| **Heure d'envoi** | `sentAt` | Le moment où le mot ou la photo a été envoyé, montré dans le fil |
| **Mot prêt** | calculé par la PWA | Un mot flash proposé en un toucher (« Je t'aime », « Tu me manques », « Bisous », « J'arrive ») ; envoyé, c'est un mot flash comme un autre |
| **Texte du mot** | `FlashMessageText` | Le texte d'un mot flash, de 1 à 140 signes |
| **Photo du jour** | `InstantPhoto` avec `photoPromptId` | La photo instantanée envoyée en réponse à l'invitation du jour |
| **En retard** | `isLate` | Une photo du jour envoyée plus de 10 minutes après l'invitation |
| **Retirer** | `withdraw` | L'auteur enlève un mot ou une photo du fil, pour les deux |
| **Abonnement aux notifications** | `PushSubscription` | L'autorisation d'un téléphone à recevoir les notifications Web Push d'un partenaire |
