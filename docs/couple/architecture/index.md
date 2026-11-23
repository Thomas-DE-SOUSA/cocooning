# Architecture du couple

Ce dossier décrit comment chaque bounded context du domaine `couple` est construit aujourd'hui : agrégats, invariants, flux et tables. Les principes communs à tout le dépôt sont dans [l'architecture transverse](../../architecture/index.md).

- [Comptes et connexion](authentication/index.md) : contexte `authentication`, les deux comptes et leurs sessions
- [Mise en couple](pairing/index.md) : contexte `pairing`, le couple et son code d'invitation
- [Front](frontend/index.md) : packages de la PWA et chemin d'un appel à l'API
