# Pourquoi cette architecture

Cette page explique pourquoi Cocooning, une application pour deux personnes, est construite en couches DDD et hexagonales comme un projet d'équipe. À lire avant de juger qu'une contrainte est de trop.

## Le choix de départ

Cocooning reprend la méthode et la structure du projet Malta (couches, bounded contexts, `CLAUDE.md` par couche, règles numérotées, documentation dans le dépôt), mais pas son dimensionnement (décision P1 dans `_brain/DECISIONS.md`). La stack et l'infrastructure sont taillées pour deux utilisateurs : une VM, `docker compose`, PostgreSQL, pas de multi-tenant, pas de file de messages, pas d'app native.

La méthode reste parce que le code est écrit en grande partie par des agents IA. Un agent écrit du bon code quand on lui donne le savoir au bon moment : les règles de `_knowledge/`, chargées par les `CLAUDE.md`, et le glossaire et les règles du contexte importés à l'ouverture du dossier. Le savoir du projet est un artefact chargé dans le contexte des agents, pas un wiki à côté du code.

## Les problèmes que l'architecture évite

Chaque contrainte doit se rattacher à l'un de ces problèmes. Une contrainte qui ne s'y rattache pas est de la cérémonie, et KISS l'emporte (`_knowledge/core.md` règle 14).

1. **Une règle dupliquée.** Une règle métier (une note perso invisible pour l'autre, par exemple) a un seul lieu : l'agrégat ou son repository, pas trois écrans.
2. **Le couplage à la base.** Le domaine ne connaît pas Prisma : changer une table ne touche que l'adaptateur.
3. **Des tests impossibles.** Le domaine et les use cases se testent sans base, sans réseau et sans horloge réelle, avec des fakes écrits à la main.
4. **Une deuxième interface impossible.** La logique client vit dans `client-business-logic`, sans framework (D11) : une autre interface reste possible sans recopier la logique.

## Trois approches, trois questions

| Approche | Question à laquelle elle répond | Ce qu'elle impose |
|---|---|---|
| Clean Architecture | Comment organiser fichiers et responsabilités ? | Couches Domain, Application, Infrastructure, Interface ; dépendances vers l'intérieur |
| DDD | Comment faire refléter le métier par le code ? | Bounded contexts, agrégats, value objects, événements de domaine, langage ubiquitaire |
| Hexagonal | Comment ne dépendre ni d'une base ni d'un framework ? | Ports en classes abstraites dans le domaine, adaptateurs Prisma et HTTP à l'extérieur |

Le CQRS n'est utilisé que là où il paie : aucun contexte du lot 1 n'a de read model.

## La règle d'or

Les dépendances pointent toujours vers l'intérieur : le domaine ne connaît ni Prisma, ni NestJS, ni React (`_knowledge/core.md` règle 17). Une règle d'architecture qui compte est vérifiée par une machine, sinon elle dérive : les frontières sont contrôlées par ESLint (`config/eslint-config`).

## Où vit chaque type de logique

| Type de logique | Lieu | Ce qu'il ne fait jamais |
|---|---|---|
| Invariant (ce qui doit toujours être vrai) | Agrégat | Lire une autre table, appeler un port |
| Calcul métier pur sans état | Domain service, instancié en ligne (décision 0005) | Être un provider NestJS |
| Lecture d'état d'un autre contexte | Guard service injecté (décision 0006) | Imposer un invariant : le guard interroge, l'agrégat refuse |
| Orchestration | Use case | Contenir une règle métier ou une méthode privée |
| Donnée validée immuable | Value object | Être muté |
| Fait passé | Événement de domaine, nom littéral `EVENT_NAME` (décision 0004) | Être modifié après émission |
| Dépendance vers l'extérieur | Port (classe abstraite, jeton d'injection) | Être une interface TypeScript |
| Forme d'une requête | Schéma Zod du contrat | Porter une règle métier |
| Extraction HTTP | Contrôleur | Mapper, vérifier l'existence, logger du métier |
| Mapping base et domaine | Repository (adaptateur) | Appliquer une règle à l'hydratation |
| Erreur vers HTTP | Filtre global et sa table code vers statut (D5) | Exposer le message d'une erreur inattendue |

Le flux d'une mutation se lit comme une recette : valider, charger, appliquer le domaine, persister, publier, renvoyer.

## Gouvernance du savoir

- Le code fait foi pour ce qui est construit. Un écart entre code et doc s'écrit dans `gaps/`, il ne s'efface pas.
- Une seule source par sujet : les autres renvoient.
- Un `CLAUDE.md` importe des pages vérifiées, il ne porte pas de règles.
- La loi précède le code : `_knowledge/` et `docs/` existent avant le premier fichier de code, et chaque règle s'applique dès ce premier fichier.
- Rien ne s'invente : une source ou un validateur inconnu reste « à compléter ».

## Voir aussi

- [Conventions](conventions.md)
- [Carte des contextes](context-map.md)
