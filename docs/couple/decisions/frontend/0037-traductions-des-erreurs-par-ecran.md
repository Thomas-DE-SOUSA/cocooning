---
nature: technique
status: proposée
date: 2026-11-23
deciders: [Thomas De Sousa]
validated-by: à compléter
validated-on:
supersedes:
superseded-by:
premortem:
---

# 0037: Chaque écran traduit les erreurs qu'il peut recevoir

## Contexte

La [décision 0010](0010-affichage-erreur-serveur.md) range les clés `apiErrors.<code>` dans le fichier de langue de l'écran et annonce un test qui vérifie que « chaque code d'exception du contrat » a sa clé. Le contrat compte déjà quatorze codes (`authentication`, `pairing`) et en comptera bien plus. Exiger tous les codes dans chaque écran ferait traduire, dans l'écran de connexion, des refus de mise en couple qu'il ne reçoit jamais ([écart frontend 002](../../gaps/frontend.md)). Le plan de l'étape 3 (D37) propose de trancher cette portée.

## Décision

- Le fichier `data/<module>-i18n-namespaces.ts` d'un module liste, par écran, les codes de contrat que ses actions peuvent recevoir.
- Sa spec vérifie, dans chaque langue, une clé `apiErrors.<code>` pour chacun de ces codes et pour chaque code de `ApiErrorCodeEnum`, plus les clés `form.<champ>.errors.<type>` de ses schémas de formulaire.
- Un code ajouté à une réponse que l'écran reçoit s'ajoute à sa liste dans le même changement. `describeApiResultError` retombe sur la clé du type d'échec, puis sur le message de l'API, pour un code oublié.

## Alternatives écartées

- **Tous les codes du contrat dans chaque écran** : des dizaines de traductions inutiles par écran, recopiées à chaque nouveau code.
- **Un namespace commun `apiErrors`** : un même code s'afficherait pareil partout, alors qu'un refus se dit mieux dans les mots de l'écran (« code d'invitation » plutôt que « donnée invalide »).

## Conséquences

- Le module `authentication` passe à cette forme (sa liste de codes quitte la spec pour `data/authentication-i18n-namespaces.ts`) avec le premier écran du module `pairing`, qui la reprend.
- L'écart frontend 002 est clos par cette décision.

## Risques

- Une liste incomplète laisse un refus s'afficher avec le texte générique de son type d'échec, ou avec le message de l'API : la revue de chaque module compare la liste aux exceptions que ses use cases backend peuvent lever.
