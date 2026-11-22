# Domaine couple

Ce dossier range la documentation du domaine métier `couple` (D1) : la vie partagée de deux partenaires dans une même application. Toute donnée appartient au couple (D3), chaque donnée a un propriétaire, et une donnée perso n'est visible que de son propriétaire (D7).

Le lot 1 couvre quatre contextes : `authentication` (les deux comptes), `notes` (notes riches, perso ou partagées, éditées à deux en temps réel), `agenda` (calendrier partagé) et `messaging` (photos instantanées et messages flash, notifiés par Web Push). La carte est dans [Carte des contextes](../architecture/context-map.md).

- [Registre des décisions](decisions/index.md)

À venir avec le code de chaque contexte (phase 2) : `business-rules/<contexte>/` (règles et glossaire), `architecture/<contexte>/` (agrégat, tables), `infrastructure/database/`, `gaps/`.
