---
nature: technique
status: acceptée
date: 2026-11-22
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-23
validated-on: 2026-11-23
supersedes:
superseded-by:
premortem:
---

# 0012: Principes de l'observabilité frontend

## Contexte

Sans remontée d'observabilité, une erreur dans la PWA meurt dans le navigateur de l'un des deux utilisateurs, et on l'apprend quand il s'en plaint. Malta a choisi Grafana Faro sur une pile LGTM ; la plateforme d'observabilité de Cocooning reste ouverte (D21, phase 6). Seuls les principes, indépendants de l'outil, sont fixés ici.

## Décision

- Le code de fonctionnalité ne parle qu'à un port `ObservabilityReporter`, distinct du `Logger`. Le SDK de l'outil retenu ne vit que dans son adaptateur.
- Ce qui remonte est une vraie `Error`, avec sa pile ; jamais un `Result` métier (un refus attendu n'est pas un incident).
- Les erreurs côté serveur Next (rendu serveur, server actions, route handlers) sont capturées par l'instrumentation serveur, puisqu'un SDK navigateur ne les voit pas.
- Les données personnelles (contenu des notes, messages, photos, adresses) sont retirées avant l'envoi, côté client.

## Alternatives écartées

- **Appeler le SDK de l'outil directement** : changer d'outil, ou n'en avoir aucun au départ, imposerait de toucher le code de chaque fonctionnalité.
- **Rien remonter** : acceptable pour deux utilisateurs au début, mais le port ne coûte presque rien et rend la décision D21 réversible.

## Conséquences

- **Contrôle automatique** : `no-restricted-imports` dans `config/eslint-config`, livré en phase 3, interdit `@grafana/faro-*`, `@sentry/*` et `@opentelemetry/*` dans `apps/couple/web/src` hors du dossier de l'adaptateur d'observabilité. Le test du filtre de données personnelles arrive en phase 6 avec l'adaptateur.
- Tant que D21 est ouverte, l'adaptateur par défaut écrit dans la console.
- Acceptée comme principes seulement (2026-11-23) : aucun outil n'est imposé ; le choix reste la décision D21.

## Risques

- Un filtre de données personnelles incomplet enverrait du contenu privé du couple à un tiers. D'où le nettoyage côté client et son test.
