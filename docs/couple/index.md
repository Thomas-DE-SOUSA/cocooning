# Domaine couple

Ce dossier range la documentation du domaine métier `couple` (D1) : la vie partagée de deux partenaires dans une même application. Toute donnée appartient au couple (D3), chaque donnée a un propriétaire, et une donnée perso n'est visible que de son propriétaire (D7).

Le lot 1 couvre cinq contextes : `authentication` (les deux comptes), `pairing` (la mise en couple par code d'invitation), `notes` (notes riches, perso ou partagées, éditées à deux en temps réel), `agenda` (calendrier partagé) et `messaging` (photos instantanées et messages flash, notifiés par Web Push). La carte est dans [Carte des contextes](../architecture/context-map.md).

- [Registre des décisions](decisions/index.md)
- [Règles métier](business-rules/index.md)
- [Architecture](architecture/index.md)
- [Écarts](gaps/index.md)
- [Infrastructure](infrastructure/index.md)

Les tables de chaque contexte sont décrites dans `architecture/<contexte>/tables.md`, à commencer par [celles de la mise en couple](architecture/pairing/tables.md). À venir (phase 2) : `infrastructure/database/`.
