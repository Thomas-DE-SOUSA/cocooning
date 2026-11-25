---
nature: technique
status: acceptée
date: 2026-11-25
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-25
validated-on: 2026-11-25
supersedes:
superseded-by:
premortem:
---

# 0054: Les fiches se remplissent par SearXNG sur la VM et Gemini gratuit, en tâche de fond dans l'API

## Contexte

La [décision 0052](0052-dossiers-et-dossiers-ia.md) prévoyait Gemini dans son offre gratuite, avec sa recherche Google. L'essai de la clé du propriétaire, le 2026-11-25, l'a démenti : la clé marche, les modèles Gemini 3 répondent gratuitement, mais la recherche Google est refusée en gratuit (réponse `429`, quota nul) et Gemini 2.5, le seul qui l'incluait, est fermé aux nouveaux comptes. Sans recherche, l'IA répondrait de mémoire et inventerait (R21). Le propriétaire veut rester gratuit : « A », soit notre propre moteur de recherche et Gemini gratuit (2026-11-25), puis accepte cette décision (« go », 2026-11-25).

## Décision

- **La recherche** passe par SearXNG, moteur de métarecherche open source, dans un conteneur de plus du compose de production, joignable seulement par l'API sur le réseau interne, sans port publié, réponses en JSON. Il interroge des moteurs publics avec ce que le couple tape et le contexte du dossier.
- **La lecture** : l'API prend les premiers résultats (titre, adresse, extrait) et lit le texte des trois premières pages en parallèle, borné en taille et en temps.
- **L'IA** est Gemini gratuit, sans outil de recherche, par l'API Interactions (`/v1beta/interactions`) et `fetch`, sans SDK. Elle reçoit le sujet, le chemin du dossier, les cases et les textes lus ; elle rend un JSON validé par Zod : candidats si le nom est ambigu (R19), sinon une valeur par case, « non trouvé » si les textes ne la donnent pas (R21), et les adresses des sources utilisées. Les mêmes appels, sans recherche, proposent le sujet et les cases d'un nouveau dossier (R17).
- **Deux ports** dans le contexte `notes` : `WebSearchProvider` (adaptateur SearXNG) et `NoteCardWriter` (adaptateur Gemini), chacun avec son faux pour les tests ; on pourra changer l'un sans l'autre.
- **En tâche de fond dans l'API** : la note est créée tout de suite avec sa fiche « en recherche » ; un `NoteCardEnrichmentScheduler` (comme `PhotoPromptScheduler`, `setInterval` non bloquant, désactivé en E2E par une variable) prend les fiches en attente par lot réservé (`FOR UPDATE SKIP LOCKED`) et les remplit, ou les passe « à choisir » (candidats) ou « échec ». Pas de file de messages ni d'application à part (P1, D10, D11).
- **Le plafond** de R23 se compte par couple et par jour de Paris, en base, avant chaque recherche.
- **Les données** : le dossier porte son genre (`CLASSIC`, `SMART`), son sujet et sa fiche type (au premier dossier IA ; ses sous-dossiers les lisent par le chemin, R18) ; la fiche d'une note est une table à part (statut, valeurs avec la marque « corrigée à la main » de R22, sources, date, candidats).
- **Nouvelles variables de l'API** : l'adresse de SearXNG, la clé et le modèle de Gemini, le plafond par jour, l'interrupteur et l'intervalle de la tâche ; et le secret de SearXNG dans le `.env` de la VM.

## Alternatives écartées

- **Gemini avec sa recherche Google** : refusée en gratuit pour ce compte (essai du 2026-11-25).
- **Activer la facturation** (« B ») : le propriétaire veut rester gratuit.
- **Gemini sans recherche** : il répondrait de mémoire et inventerait (R21).
- **Une IA installée sur la VM** : sans carte graphique, trop lente et moins précise, et elle prendrait la mémoire de l'app.
- **Remplir la fiche pendant la requête HTTP** : 10 à 30 secondes d'attente, perdues si le téléphone se verrouille.

## Conséquences

- R24 change : SearXNG part de notre VM vers des moteurs publics avec ce que nous tapons, Gemini reçoit en plus les textes trouvés ; jamais nos notes libres.
- Le compose de production gagne un conteneur, et la VM un peu de mémoire occupée. Le runbook de déploiement dit comment vérifier SearXNG.
- Les PR du lot 2 : le serveur (données, ports, tâche), la partie client, l'écran, puis la mise en production avec la clé de Gemini, que le propriétaire ajoute lui-même au `.env` de la VM.

## Risques

- **Blocage par les moteurs** : les grands moteurs bloquent parfois SearXNG. À deux, quelques recherches par jour devraient passer ; sinon la fiche passe « échec » et l'on réessaie, la note reste.
- **Précision** : moins bonne qu'avec la recherche Google de Gemini ; « non trouvé » et la correction à la main la compensent.
- **Conditions de Google** : l'offre gratuite reste réservée hors de l'UE (risque accepté, décision 0052).
- **Clé exposée** : la clé d'essai a été collée dans une conversation ; elle est à changer avant la mise en production.
