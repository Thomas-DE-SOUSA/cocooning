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

# 0055: Les fiches d'un lieu se complètent par OpenStreetMap

## Contexte

Premier essai du propriétaire, le 2026-11-25 : la fiche de « Folie Piment », restaurant connu, n'avait presque pas d'adresse. SearXNG trouvait bien Uber Eats, TheFork et des annuaires ([décision 0054](0054-recherche-des-fiches-searxng-et-gemini.md)), mais ces pages s'affichent par JavaScript : la lecture du serveur n'en tire presque aucun texte, et Gemini écrit « non trouvé » (R21). Le propriétaire demande pourquoi ne pas prendre les informations de Google Maps.

L'API Places de Google demande d'activer la facturation et ses conditions interdisent de garder adresse et horaires au-delà de 30 jours, alors qu'une fiche se garde. OpenStreetMap, interrogé par Nominatim, rend pour « Folie Piment » l'adresse, la cuisine, les horaires et le téléphone, sans clé ; ses données se gardent en citant la source (licence ODbL). La [décision 0015](../0015-enrichissement-des-envies.md) prévoyait déjà « une API de lieux ».

## Décision

- Pour chaque fiche, l'API interroge aussi Nominatim (OpenStreetMap) avec ce que le couple a tapé et le contexte du dossier. Si la réponse est un lieu (restaurant, bar, café, musée, boutique, hébergement…), ses données (nom, adresse, type, cuisine, horaires, téléphone, site) passent en tête des textes donnés à Gemini, avant les pages web ; OpenStreetMap devient l'une des sources de la fiche.
- Un port de plus dans le contexte `notes` (`PlaceDirectory`), son adaptateur Nominatim et son faux. Rien ne change pour l'écran, sinon la source affichée.
- Nominatim est appelé selon sa politique d'usage : une requête à la fois, un `User-Agent` qui nomme l'app, peu d'appels (au plus un par recherche, sous le plafond de 30 par jour) ; adresse, délai et `User-Agent` viennent de la configuration.
- Réponse du propriétaire : « go » (2026-11-25), après la comparaison entre Google Maps et OpenStreetMap.

## Alternatives écartées

- **L'API Places de Google** : facturation à activer, données à ne pas garder au-delà de 30 jours.
- **Lire les pages par un navigateur sans tête** pour exécuter leur JavaScript : lourd pour la VM et fragile.
- **Rester sur les pages web seules** : les grands sites de restaurants n'y donnent presque rien.

## Conséquences

- R24 change : ce que le couple tape part aussi chez OpenStreetMap (Nominatim).
- Une variable de plus pour l'adresse de Nominatim, une pour son délai, une pour le `User-Agent` (avec un moyen de contact, demandé par sa politique d'usage).
- La fiche cite « OpenStreetMap » parmi ses sources, comme le demande la licence.

## Risques

- **Couverture** : un lieu absent d'OpenStreetMap, ou sans horaires, retombe sur les pages web.
- **Homonymes** : Nominatim peut rendre un lieu du même nom dans une autre ville ; le contexte du dossier (sa ville) et les candidats de R19 limitent l'erreur.
- **Disponibilité** : Nominatim est un service public gratuit, sans garantie ; s'il ne répond pas, la fiche se fait sans lui.
