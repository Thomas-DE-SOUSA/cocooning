# Plateforme

Ce dossier range ce qui est transverse au monorepo : outillage, CI, infrastructure de déploiement, et les décisions, prémortems, post-mortems, écarts et runbooks qui les concernent.

L'hébergement cible est une VM qui fait tourner l'API, l'app web, PostgreSQL et Caddy avec `docker compose`, accessible seulement par Tailscale, en HTTPS sur un nom `*.ts.net` (D10). Ni AWS, ni Kubernetes.

- [Registre des décisions](decisions/index.md)
- [Écarts](gaps/index.md)

À venir : `ci/` (avec la CI GitHub Actions), `runbooks/` (avec le déploiement sur la VM, phase 6), `premortems/` et `postmortems/` à leur première entrée.
