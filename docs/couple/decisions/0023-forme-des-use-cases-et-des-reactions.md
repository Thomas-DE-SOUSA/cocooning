---
nature: technique
status: acceptée
date: 2026-11-22
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-22
validated-on: 2026-11-22
supersedes:
superseded-by:
premortem:
---

# 0023: Une seule signature de use case, des réactions aux événements en use cases

## Contexte

Chez Malta, les use cases ont plusieurs formes (`execute(command)`, `execute(tenantId, userId, command)`, un contexte d'exécution passé à part) et certaines réactions aux événements portent de la logique dans le handler d'infrastructure. Chaque nouveau contexte rouvre la question. Cocooning n'a qu'un couple par donnée et deux partenaires : la portée d'un appel tient en deux identifiants. Décision D12 du propriétaire.

## Décision

- Tout use case expose une seule méthode publique, `execute(context, command)`. `context` est un objet `{ coupleId, userId }` construit par le contrôleur à partir de l'utilisateur authentifié, jamais depuis le corps de la requête. `command` porte la saisie validée.
- Une réaction à un événement de domaine est un use case de réaction (`on-<evenement>` côté infrastructure, use case nommé par son effet côté application). Le handler d'infrastructure ne fait que reconstruire le contexte depuis l'événement, appeler le use case et tenir la frontière d'erreur (`core-backend.md` règles 8 et 16).
- Le contexte d'exécution est un type du shared-kernel, unique pour tout le dépôt.

Mots du propriétaire, le 2026-11-22, sur les recommandations du blueprint : « OK pour tout ».

## Alternatives écartées

- **Signatures libres, comme Malta** : chaque use case choisit l'ordre de ses paramètres, la règle d'isolation (`core.md` règle 27) se vérifie au cas par cas.
- **Logique de réaction dans le handler** : la logique échappe aux tests de use case et à la couche application.

## Conséquences

- La règle d'isolation par couple se lit dans chaque signature : `context.coupleId` est le premier argument passé aux ports.
- Les tests de use case construisent le contexte une fois par test ; les handlers se testent sans logique métier.
- Le shared-kernel expose `ExecutionContext` ; `_knowledge/backend/shared-kernel.md` le décrit.

## Risques

- Une opération sans utilisateur (relais, tâche planifiée) doit fournir un `userId` : on prend celui qui a déclenché l'événement, porté par l'événement lui-même.
