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

# 0001: Mocks automatiques interdits

## Contexte

Un test de use case ou de hook qui remplace ses collaborateurs par des mocks automatiques (`jest.fn`, `jest.spyOn`, `jest.mock`, `mockImplementation`) vérifie qu'un appel a eu lieu, pas l'état produit. Il casse au moindre refactoring et laisse passer une mutation de valeur. Malta a posé la règle tard et vit avec une dette de plusieurs centaines de specs. Cocooning part de zéro : la règle peut tenir dès le premier fichier, sans clause de migration.

## Décision

Les tests de use case backend et les tests de hook frontend n'utilisent aucun mock automatique. Les collaborateurs sont des fakes écrits à la main, déterministes et inspectables, rangés à côté des tests (`__tests__/secondary/`) ou dans le sous-chemin `testing` du shared-kernel.

Les tests E2E de l'API gardent leur exception. La règle s'applique dès le premier fichier, sans existant à migrer.

## Alternatives écartées

- **Autoriser les mocks automatiques** : les assertions portent sur des appels, pas sur des valeurs ; la suite devient fragile et faible face aux mutants.
- **Les autoriser au cas par cas, justifiés en review** : une règle que seule la review tient finit par céder. Malta l'a constaté.

## Conséquences

- **Contrôle automatique** : la règle `no-restricted-syntax` du bloc des specs unitaires de `config/eslint-config` (appels `jest.fn`, `jest.spyOn`, `jest.mock` dans un `*.spec.ts(x)` hors `*.e2e-spec.ts`) fait échouer `pnpm lint`. Elle est posée en phase 0 avec la configuration ESLint et mord dès les premières specs de la phase 1.
- Le canon des tests de use case de `_knowledge/` porte la règle ; workflows, agents et commandes y renvoient.
- Chaque port a son fake, écrit en même temps que le port.

## Risques

- Écrire un fake coûte plus qu'un `jest.fn()`. Le coût est accepté : le fake sert à tous les tests du port.
