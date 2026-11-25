---
nature: produit
status: proposée
date: 2026-11-25
deciders: [Thomas De Sousa]
validated-by: à compléter
validated-on:
supersedes:
superseded-by:
premortem:
---

# 0052: Dossiers de notes et dossiers IA

## Contexte

Les notes forment une seule liste ([décision 0039](0039-regles-des-notes.md)). Le propriétaire veut les ranger en dossiers et sous-dossiers, comme dans Google Drive, et veut des dossiers qui complètent ce qu'on y ajoute : on tape le nom d'un restaurant ou d'un cadeau, une IA cherche sur Internet et en fait un récapitulatif. Ce qu'il en dit, le 2026-11-25 : « il faut vraiment réfléchir à comment conceptualiser la chose car c'est quelque chose de très précis, c'est ça qui fait la force de l'application ». C'est la forme concrète de l'enrichissement des envies ([décision 0015](../0015-enrichissement-des-envies.md)). Le concept a été cadré avec lui par questions, puis dessiné sur la planche (maquette « Notes, dossiers et dossiers IA »).

## Décision

- **Deux espaces à l'accueil des notes** : « Partagé », vu par les deux, et « Privé », propre à chaque partenaire. Réponse : « Deux dossiers Partagé / Privé (Recommandé) ». Une note prend la visibilité de l'espace où elle est ; la ranger dans l'autre espace la partage ou la rend privée.
- **Des dossiers et des sous-dossiers**, sans limite de profondeur, qui contiennent des notes et d'autres dossiers.
- **Un dossier est classique ou IA**, au choix à sa création, sur n'importe quel sujet : il n'y a pas de liste de types dans l'app (« ça peut être une infinité »).
- **Un dossier IA a un sujet et une fiche type.** Le sujet est une phrase ; la fiche type est la liste des cases qui comptent pour ce sujet. L'IA les propose d'après le nom, le couple les ajuste. Réponse : « L'IA propose, on ajuste (Recommandé) ».
- **Un élément s'ajoute par son nom.** L'IA cherche sur Internet avec le contexte du dossier ; en cas de doute, elle montre des candidats et le couple choisit. L'élément est une note, avec la fiche en cases en haut et les notes libres du couple dessous, éditées à deux. Réponses : « Une note pré-remplie (Recommandé) », « Des cases en haut de la note (Recommandé) ».
- **Un cadeau se décrit, il ne se suggère pas** : on tape un cadeau précis, l'IA le complète. Réponse : « Décrire un cadeau précis (Recommandé) ».
- **Un sous-dossier d'un dossier IA hérite et précise** : il garde la fiche type de son parent et son nom s'ajoute au contexte des recherches. Réponse : « Hérite et précise (Recommandé) ».
- **Rien n'est inventé** : une information introuvable reste « non trouvé » ; chaque fiche garde ses sources et la date de sa recherche.
- **L'IA est Gemini, dans son offre gratuite**, derrière un port remplaçable, avec une clé sur un compte Google dédié à Cocooning. Réponses : « J'aimerais plus une clé API gratuite », « j'accepte les risques ».
- **Livraison en deux lots** : lot 1, les espaces et les dossiers classiques, sans IA ; lot 2, les dossiers IA, sans tri des fiches. Ensuite, une par une : Envie → Fait avec l'avis du couple, coller un lien ou partager depuis une autre app, carte des lieux et questions au dossier.

## Alternatives écartées

- **Des types de dossiers écrits dans l'app** (Restaurants, Cadeaux) : le propriétaire veut n'importe quel sujet.
- **Un bouton « Compléter avec l'IA » sur n'importe quelle note** : plus simple, mais les fiches d'un dossier ne se comparent plus et la recherche perd le contexte du dossier. Il pourra venir en plus.
- **Le récapitulatif écrit comme du texte dans la note** : pas de comparaison entre fiches ni de mise à jour case par case.
- **Une IA qui propose des idées de cadeaux** : la liste ne serait plus celle du couple (décision 0015).
- **Gemini payant** (recommandé par Claude, coût estimé entre 0 et 1 € par mois) ou un moteur de recherche installé sur la VM : le propriétaire veut une offre gratuite et accepte les risques de celle de Gemini.
- **Trier les fiches au lot 2** : les cases sont du texte (« 25 à 35 € ») ; trier demanderait de typer les cases. Plus tard.

## Conséquences

- Les règles sont écrites dans [les règles des dossiers](../../business-rules/notes/rules/folders.md) (R10 à R16) et [des dossiers IA](../../business-rules/notes/rules/ai-folders.md) (R17 à R25) ; R2 des [règles des notes](../../business-rules/notes/rules.md) change : une note créée prend la visibilité de son espace.
- L'accueil des notes n'est plus la liste des notes (décision 0039) mais les deux espaces.
- Les notes existantes vont dans la racine de leur espace, selon leur visibilité.
- Le lot 2 demande une décision technique : où vit la fiche (contexte `notes` ou contexte à part), la recherche en tâche de fond dans l'API, le port de l'IA, la variable de la clé.

## Risques

- **Conditions de Google** : l'offre gratuite de l'API Gemini est réservée par ses conditions à des utilisateurs hors de l'Espace économique européen, de la Suisse et du Royaume-Uni. Google peut couper la clé. Seules les fiches s'arrêtent alors ; les notes et les dossiers restent, et le port permet de changer d'IA. Risque accepté par le propriétaire le 2026-11-25.
- **Quotas non publiés** : la recherche gratuite ne marche que sur les modèles Gemini 2.5 Flash, qui seront retirés un jour ; un plafond par jour dans l'app protège le quota.
- **Précision** : une IA qui lit le web se trompe surtout sur ce qui change (horaires, prix). Les sources, la date, « non trouvé » et la correction à la main limitent ces erreurs sans les supprimer. Des sources de référence (lieux, films) pourront compléter plus tard (décision 0015).
