---
nature: technique
status: proposée
date: 2026-11-22
deciders: []
validated-by: à compléter
validated-on:
supersedes:
superseded-by:
premortem:
---

# 0003: Identifiants tirés par `Uuid.generateValue()`

## Contexte

Un agrégat crée son identifiant. Deux façons s'opposent : un générateur statique configurable une fois par process, ou un port `IdGenerator` injecté partout où un identifiant naît. Malta a laissé les deux coexister, puis a tranché pour le générateur statique, déjà majoritaire et déterministe en test. La question du déterminisme (horloge et identifiants) reste ouverte pour Cocooning sous le numéro D13 du registre du propriétaire, à trancher avant la phase 1.

## Décision

En production, un identifiant se tire par `Uuid.generateValue()`, depuis la fabrique `generate()` du value object d'identité. En test, il est rendu déterministe par `Uuid.configure` avec un fournisseur factice à compteur, configuré par le contexte de test et remis à zéro entre deux tests.

C'est une exception limitée aux identifiants : la date, l'heure et toute autre source de hasard restent derrière un port injecté. Aucun port `IdGenerator` n'est créé.

## Alternatives écartées

- **Injecter un port `IdGenerator` partout** : il faut passer le port à chaque agrégat ou sortir la création d'identifiant vers le use case, pour un déterminisme que le générateur configurable donne déjà.
- **Laisser les deux motifs coexister** : chaque nouveau contexte rouvre la question.

## Conséquences

- **Contrôle automatique** : en phase 1, avec `packages/shared-kernel`, la règle `no-restricted-syntax` et `no-restricted-imports` du code métier (`domain/`, `application/`, `__tests__/`) de `config/eslint-config` interdit `crypto.randomUUID`, les paquets `uuid` et `Math.random` hors du shared-kernel. Une spec du shared-kernel vérifie que `Uuid.configure` rend une suite déterministe.
- Le shared-kernel expose `Uuid`, `Uuid.configure` et le fournisseur factice dans son sous-chemin `testing`.

## Risques

- `Uuid.configure` est un état global : un fichier de spec n'instancie qu'un seul contexte de test.
- Si D13 est tranchée pour un port injecté, cette proposition est rejetée et remplacée.
