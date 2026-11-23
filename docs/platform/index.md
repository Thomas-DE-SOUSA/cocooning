# Plateforme

Ce dossier range ce qui est transverse au monorepo : outillage, CI, infrastructure de déploiement, et les décisions, prémortems, post-mortems, écarts et runbooks qui les concernent.

La production tourne sur la VM Oracle de Cadence : l'API, l'app web et PostgreSQL par `docker compose`, accessibles seulement par Tailscale, en HTTPS sur `cocooning.<tailnet>.ts.net` ([décision plateforme 0015](decisions/0015-production-sur-la-vm-oracle.md)). Ni AWS, ni Kubernetes.

- [Registre des décisions](decisions/index.md)
- [Écarts](gaps/index.md)
- [Runbooks](runbooks/index.md)

À venir : `ci/` (avec la CI GitHub Actions), `premortems/` et `postmortems/` à leur première entrée.
