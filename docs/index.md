# Documentation Cocooning

Le rangement suit une seule règle : un document appartient soit au domaine `couple`, soit au monorepo entier. Les règles complètes sont dans `docs/CLAUDE.md`.

## Par domaine

| Domaine | Décisions | Prémortems | Post-mortems |
|---|---|---|---|
| [Couple](couple/index.md) (notes, agenda, messages, authentification) | [registre](couple/decisions/index.md) | à venir | à venir |
| [Plateforme](platform/index.md) (monorepo, outillage, infra, CI) | [registre](platform/decisions/index.md) | à venir | à venir |

Chaque domaine range le reste de sa documentation dans `architecture/`, `business-rules/`, `infrastructure/`, `gaps/` et `design/`, créés avec le code qu'ils décrivent.

## Transverse

- [Architecture](architecture/index.md) : pourquoi cette architecture, carte des contextes, glossaire, conventions
- [Guides](guides/index.md) : installation locale, contribution
- `templates/` : un modèle par type de document
- `design/` : design system et patterns d'interface partagés (à venir, phase 3)

## Écrire un document

| Je veux | Modèle | Emplacement | Nom du fichier |
|---|---|---|---|
| Tracer une décision (métier, technique ou produit), ou en proposer une | [decision.md](templates/decision.md) | `couple/decisions/<contexte>/` ou `platform/decisions/` | `NNNN-slug.md`, numéro suivant du registre |
| Chercher les causes d'échec d'un plan avant de le lancer | [premortem.md](templates/premortem.md) | `couple/premortems/<contexte>/` ou `platform/premortems/` | `YYYY-MM-DD-slug.md` |
| Revenir sur un incident | [postmortem.md](templates/postmortem.md) | `couple/postmortems/` ou `platform/postmortems/` | `YYYY-MM-DD-slug.md` |
| Décrire ce que le couple veut que l'app impose | [business-rule.md](templates/business-rule.md) | `couple/business-rules/<contexte>/` | `rules.md` |
| Décrire comment une partie du système est construite | [architecture.md](templates/architecture.md) | `couple/architecture/<contexte>/` | `slug.md` |
| Écrire une procédure d'exploitation | [runbook.md](templates/runbook.md) | `couple/infrastructure/runbooks/` ou `platform/runbooks/<sujet>/` | `slug.md` |
| Expliquer comment faire une tâche de développement | [guide.md](templates/guide.md) | `guides/` | `slug.md` |
| Noter un défaut, un test manquant ou une décision à trancher sans le corriger | [gap-entry.md](templates/gap-entry.md) | `couple/gaps/<contexte>.md` ou `platform/gaps/<sujet>.md` | une entrée ajoutée à la fin |
| Écrire le `CLAUDE.md` d'un contexte ou d'un module | [claude-server-submodule.md](templates/claude-server-submodule.md), [claude-web-submodule.md](templates/claude-web-submodule.md) | à côté du code | `CLAUDE.md` |

Une décision acceptée ne se modifie plus. Une remise en cause donne une nouvelle décision qui remplace l'ancienne, et les deux restent dans le registre.

## Commandes

Les commandes `/coco-doc-decision`, `/coco-doc-write`, `/coco-doc-search` et `/coco-premortem` appliqueront ces règles (à venir, phase 5).
