---
nature: produit
status: acceptée
date: 2026-11-22
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-22
validated-on: 2026-11-22
supersedes:
superseded-by:
premortem:
---

# 0022: Un compte par personne, mise en couple par code d'invitation

## Contexte

Le couple est l'objet pivot ([décision 0017](0017-couple-objet-pivot.md)) et toute donnée porte un `coupleId` ([décision 0018](0018-portee-par-couple-et-proprietaire.md)). Il faut dire comment deux comptes deviennent un couple, et quel contexte porte ce lien.

## Décision

Chaque personne a son propre compte. Un partenaire crée le couple et obtient un code d'invitation ; l'autre saisit ce code pour rejoindre le couple. Un couple compte exactement deux membres.

Mots du propriétaire, le 2026-11-22 : « un compte par personne qui auront un lien pour s'inviter par un code […] un système pour pouvoir faire en sorte qu'un compte user puisse se mettre avec un autre compte ».

Le lien est porté par un contexte dédié, `pairing` (agrégat `Couple`), distinct d'`authentication`, qui ne gère que les comptes et les sessions. Ce découpage et ce nom sont proposés par Claude et restent à confirmer avant la phase 2.

## Alternatives écartées

- **Deux comptes créés d'avance, sans invitation** : simple, mais rien ne permet de refaire le lien ni d'ouvrir l'app à un autre couple.
- **Le lien dans `authentication`** : mélange l'identité et la vie du couple, et grossit un contexte qui doit rester petit.

## Conséquences

- Tant qu'un compte n'a pas rejoint de couple, il ne voit que l'écran d'invitation : aucun `coupleId`, donc aucune donnée.
- Les règles fines (durée de validité et usage unique du code, quitter un couple, sort des données) s'écrivent dans `docs/couple/business-rules/pairing/` avec le contexte.

## Risques

- Un code d'invitation qui fuite permet de rejoindre le couple : usage unique et expiration courte à prévoir dans les règles métier.
