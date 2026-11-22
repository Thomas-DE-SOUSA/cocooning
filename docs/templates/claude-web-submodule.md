# <Module>

<Une phrase : ce que le partenaire fait dans ce module, dans le vocabulaire du couple.>

## A lire avant de commencer

<Le glossaire et les regles du contexte backend, reutilises tels quels : `docs/couple/business-rules/<contexte>/`. Sans glossaire cote backend, omettre le glossaire. Depuis `apps/couple/web/src/modules/<module>/`, le chemin est `@../../../../../../docs/couple/business-rules/<contexte>/glossary.md`.>

Glossaire :
@<chemin relatif>/glossary.md

Regles metier (`rules.md`, ou chaque `rules/<page>.md` quand le contexte a un dossier `rules/`) :
@<chemin relatif>/rules.md

<Libelle en clair de la page d'architecture front, une ligne avant chaque import :>
@<chemin relatif vers docs/couple/architecture/frontend/<module>/<page>.md>

<Rien d'autre : la knowledge front est importee une seule fois par `apps/couple/web/CLAUDE.md`, jamais module par module, et la regle de mise a jour de la documentation y est portee une seule fois.>

## Consignes de code

<Facultatif. Seulement les consignes de code propres au module et absentes de la knowledge front. Pas d'ecarts connus ici : ils vont dans `docs/couple/gaps/`.>

## Tests

<Facultatif. Seulement ce que les specs colocalisees ne disent pas : un helper ou une fixture qui couvre un cas metier non evident, avec la regle concernee.>
