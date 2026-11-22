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

# 0010: Une seule façon d'afficher une erreur serveur

## Contexte

Quand l'API refuse une action (une note supprimée par l'autre, une saisie invalide), la PWA doit le dire dans la langue de l'utilisateur. L'API répond par un code d'erreur stable, mappé vers un statut HTTP ([décision 0020](../0020-statut-http-des-exceptions.md)). Dans Malta, trois façons coexistaient : le message brut de l'API, en anglais et technique ; une traduction propre à chaque module ; une fonction partagée. Un même code s'affichait différemment d'un écran à l'autre.

## Décision

Une erreur serveur s'affiche par une seule fonction partagée, `describeApiResultError(error, t)`, rangée dans `apps/couple/web/src/shared/application/api-result/`. Elle traduit la clé `apiErrors.<code>` du namespace de l'écran, avec les détails de l'erreur en interpolation, et retombe sur le message de l'API quand le code ou la clé manque. Le toast porte un titre traduit propre à l'action et, en description, le résultat de cette fonction.

## Alternatives écartées

- **Afficher le message de l'API** : technique, en anglais, hors de la langue de l'utilisateur.
- **Une traduction par module** : la même règle dispersée, et des modules qui divergent.
- **Un message générique sans le code** : l'utilisateur ne sait pas pourquoi l'action est refusée, alors que l'API le dit.

## Conséquences

- **Contrôle automatique** : un bloc ESLint `no-restricted-syntax` sur `apps/couple/web/src/modules/**`, livré en phase 3, interdit un `toast.error` dont un argument lit `.message` d'une erreur. Un test de résolution des clés vérifie que chaque code d'exception du contrat `@cocooning/couple-contract` a sa clé `apiErrors.<code>` dans chaque fichier de langue.
- Les clés `apiErrors.<code>` vivent dans le fichier de langue du namespace de l'écran.

## Risques

- Une erreur qui n'est pas une erreur d'API typée affiche le message brut. Les hooks rejettent toujours par le dépliage du résultat d'API partagé.
