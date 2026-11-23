---
nature: technique
status: acceptée
date: 2026-11-23
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-23
validated-on: 2026-11-23
supersedes:
superseded-by:
premortem:
---

# 0035: Formulaires par react-hook-form, server action qui rend un résultat

## Contexte

L'écran de connexion est le premier formulaire de la PWA, et il sert de modèle aux notes et à l'agenda. Le guide de Next 16 montre `useActionState`, `<form action>` et `redirect()` dans l'action. Malta, la règle 3 de `_knowledge/core-frontend.md` (`useForm` dans la vue) et la [décision 0031](0031-messages-zod-traduits.md) (schéma construit par le hook de formulaire) supposent react-hook-form. Dans Next 16.4, `redirect()` dans une server action rejette la promesse de l'appel côté navigateur (`server-action-reducer.js`), et une action appelée hors ligne, ou depuis une page antérieure à un déploiement, rejette aussi. Le choix revient au propriétaire (D36).

## Décision

- Un formulaire de la PWA passe par react-hook-form et `zodResolver`, avec le schéma `create<X>Schema(t)` mémoïsé sur `t` dans un hook `use-<x>-form.ts`. Les erreurs de validation s'affichent sous le champ dès la sortie du champ.
- La server action revalide l'entrée par le même schéma, construit avec la traduction du serveur ([règle 14](../../../../_knowledge/core-frontend.md)), et rend un `Result`, jamais un `redirect()`. Le container navigue après un succès (`router.replace`).
- L'adaptateur `server-action` de la gateway du module transforme un rejet de l'appel en `NETWORK_ERROR` : un hook reçoit toujours un `Result`.
- Le `<form>` porte `method="post"` et `noValidate` : un envoi parti avant l'hydratation ne met jamais un champ dans l'URL.

## Alternatives écartées

- **`useActionState` et `redirect()`, la forme du guide de Next** : marche sans JavaScript, mais une erreur n'apparaît qu'après l'aller-retour au serveur, React vide les champs après chaque envoi, même refusé, et le rejet de `redirect()` se confond avec un rejet réseau. Le service worker sert le JavaScript depuis le cache : la page sans JavaScript ne se présente presque jamais.
- **Appeler la server action directement depuis le composant** : plus court, mais un hook qui importe une action ne se teste plus avec un fake (règle 21, [décision 0001](../0001-mocks-automatiques-interdits.md)).

## Conséquences

- Chaque module de formulaire suit `apps/couple/web/src/modules/authentication/` : `hooks/use-sign-in-form.ts`, `hooks/use-sign-in.ts`, `gateways/server-action/`, et le service de l'action testé sans mock.
- Le chemin d'un appel et la gestion des erreurs sont décrits dans [le front de la PWA](../../architecture/frontend/index.md).

## Risques

- Sans JavaScript, le formulaire se recharge sans connecter. Accepté pour deux utilisateurs qui ouvrent la PWA installée.
- Une navigation côté client après le succès coûte un second aller-retour. Négligeable sur le tailnet.
