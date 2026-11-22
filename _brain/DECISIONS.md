# Registre des décisions

> Ce registre suit seulement le **statut** de chaque décision. Les options et les recommandations sont dans `_malta-blueprint/00-BLUEPRINT.md` §8.
> Une décision passe à « décidée » seulement sur une réponse explicite du propriétaire, avec la date et ses mots. Rien ne s'invente.
> Dès que `docs/` existe, chaque décision prise devient une ADR, et sa ligne ici renvoie vers l'ADR.

Statuts possibles : `ouverte`, `décidée`, `appliquée`, `remplacée`.

## Projet et mémoire

| ID | Sujet | Statut | Choix | Date | Bloque |
|---|---|---|---|---|---|
| B1 | `git init` du dépôt, remote privé, versionnement de `_malta-blueprint/` (code propriétaire) | décidée | dépôt privé `Thomas-DE-SOUSA/cocooning` ; `_malta-blueprint/` gardé en local, dans `.gitignore` (« Garder en local ») | 2026-11-22 | — |
| M1 | Mémoire du projet : `CLAUDE.md`, `_brain/`, hooks, skills `brain-*` | appliquée | conçue et mise en place à la demande du propriétaire, à valider | 2026-11-22 | — |

## Blueprint (D1 à D30)

| ID | Sujet | Statut | Choix | Date | Bloque |
|---|---|---|---|---|---|
| D1 | Nom du segment produit | ouverte | — | — | phase 0 |
| D2 | Nom de l'orchestrateur et préfixe des commandes | ouverte | — | — | phase 0 |
| D3 | Objet pivot et contexte composite | ouverte | — | — | phase 2 |
| D4 | Authentification (BC local, IdP central, IdP managé) | ouverte | — | — | phase 2 |
| D5 | Statut HTTP des exceptions | ouverte | — | — | phase 1 |
| D6 | Sémantique de publication des événements | ouverte | — | — | phase 1 |
| D7 | Multi-tenant | ouverte | — | — | phase 1 |
| D8 | Zod 3 ou 4 | ouverte | — | — | phase 1 |
| D9 | Versions majeures (TS, Next, Jest, ESLint) | ouverte | — | — | phase 0 |
| D10 | Cible de déploiement | ouverte | — | — | phase 6 |
| D11 | App mobile | ouverte | — | — | phase 7 |
| D12 | Forme des réactions aux événements et des use cases | ouverte | — | — | phase 2 |
| D13 | Déterminisme (horloge, générateur d'ids) | ouverte | — | — | phase 1 |
| D14 | Pagination | ouverte | — | — | phase 2 |
| D15 | Langues (CLAUDE.md, docs, commits) | ouverte | — | — | phase 0 |
| D16 | Versionnement des espaces de travail des agents | ouverte | — | — | phase 5 |
| D17 | BMAD | ouverte | — | — | phase 5 |
| D18 | Portes de qualité (Stryker, couverture, Playwright, Sonar) | ouverte | — | — | phase 2 |
| D19 | Storybook | ouverte | — | — | phase 3 |
| D20 | Trailer `Co-Authored-By` des commits IA | ouverte | — | — | phase 5 |
| D21 | Plateforme d'observabilité | ouverte | — | — | phase 6 |
| D22 | Assistant IA | ouverte | — | — | phase 7 |
| D23 | Flux de branches | décidée | `main` (stable), `dev` (intégration, branche par défaut), une branche par feature depuis `dev`, commits atomiques (« git atomic branch main qui sera sur un dev puis chaque feature en branch ») | 2026-11-22 | — |
| D24 | Numérotation des ADR fondatrices | ouverte | — | — | phase 0 |
| D25 | Messages Zod traduits et suffixe des schémas | ouverte | — | — | phase 3 |
| D26 | Exceptions aux tailles de fichiers | ouverte | — | — | phase 2 |
| D27 | Ports transverses d'un composite | ouverte | — | — | premier composite |
| D28 | Review agentique au démarrage | ouverte | — | — | phase 5 |
| D29 | Dépôt et plan GitHub | ouverte | — | — | phase 6 |
| D30 | Source réglementaire du langage ubiquitaire | ouverte | — | — | phase 2 |
