# Glossaire des messages

Les termes propres aux messages, avec leur nom dans le code. Les termes communs (couple, partenaire, propriétaire, message flash, photo instantanée, invitation photo, notification) sont dans le [glossaire transverse](../../../architecture/glossary.md). Les noms de code sont une proposition, confirmée quand le contexte est codé.

| Terme | Nom dans le code | Définition |
|---|---|---|
| **Auteur** | `ownerId` | Le partenaire qui a envoyé le mot ou la photo ; sa couleur le marque dans le fil |
| **Fil** | `MessageFeed` | Les mots flash et les photos instantanées du couple, du plus récent au plus ancien |
| **Mot prêt** | calculé par la PWA | Un mot flash proposé en un toucher (« Je t'aime », « Tu me manques », « Bisous », « J'arrive ») ; envoyé, c'est un mot flash comme un autre |
| **Texte du mot** | `FlashMessageText` | Le texte d'un mot flash, de 1 à 140 signes |
| **Photo du jour** | `InstantPhoto` avec `photoPromptId` | La photo instantanée envoyée en réponse à l'invitation du jour |
| **En retard** | `isLate` | Une photo du jour envoyée plus de 10 minutes après l'invitation |
| **Retirer** | `withdraw` | L'auteur enlève un mot ou une photo du fil, pour les deux |
| **Abonnement aux notifications** | `PushSubscription` | L'autorisation d'un téléphone à recevoir les notifications Web Push d'un partenaire |
