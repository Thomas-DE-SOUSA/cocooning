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

# 0021: Outbox PostgreSQL relayée dans le processus de l'API

## Contexte

Un événement de domaine (une photo envoyée, une note partagée) doit déclencher une notification Web Push, même si l'envoi échoue au premier essai. Malta publie ses événements par une outbox, un worker séparé et une file SQS sur AWS. Cocooning tourne sur une VM pour deux utilisateurs.

## Décision

Les événements sont écrits dans une table outbox PostgreSQL, dans la même transaction que l'agrégat. Un relais qui tourne dans le processus de l'API les lit et les distribue, notamment au Web Push. Pas de SQS ni de worker séparé au départ.

Mots du propriétaire, le 2026-11-22, sur les recommandations du blueprint : « OK pour tout ».

## Alternatives écartées

- **Publication directe après la transaction** : un crash entre la sauvegarde et l'envoi perd la notification.
- **Outbox, worker séparé et file SQS, comme Malta** : un service cloud et un processus de plus pour quelques événements par jour.

## Conséquences

- Les noms d'événements suivent la [décision 0004](0004-noms-evenements-litteral.md).
- Le relais tourne dans `apps/couple/api` ; un worker séparé ne viendra que si la charge ou les crons l'exigent.
- La forme des réactions aux événements (D12) et le moment où un événement est marqué publié s'écrivent dans `_knowledge/` avant la phase 2.

## Risques

- Un relais dans l'API s'arrête avec elle : les événements attendent son redémarrage dans la table, sans perte.
- Avec plusieurs instances de l'API, deux relais liraient la même ligne. Un verrou PostgreSQL sur la lecture du relais est la parade ; une seule instance est prévue.
