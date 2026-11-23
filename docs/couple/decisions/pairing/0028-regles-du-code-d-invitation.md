---
nature: produit
status: acceptée
date: 2026-11-23
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-23
validated-on: 2026-11-23
supersedes:
superseded-by:
premortem:
---

# 0028: Règles du code d'invitation et de la mise en couple

## Contexte

La [décision 0022](../0022-mise-en-couple-par-code-d-invitation.md) fixe le principe : un partenaire crée le couple et obtient un code, l'autre le saisit pour le rejoindre. Elle renvoie les règles fines au contexte `pairing`. Le propriétaire a lancé la phase 2 en autonomie le 2026-11-23 sans les trancher ; Claude les propose ici pour que le code puisse avancer, et elles restent à valider.

## Décision

- Un partenaire appartient à un seul couple à la fois.
- Un partenaire sans couple crée un couple. Il en est le premier membre, le couple est en attente (`PENDING`) et porte un code d'invitation.
- Le code fait 8 caractères, tirés au hasard par le port `SecureRandomGenerator` dans un alphabet de 32 signes sans caractères ambigus (lettres majuscules sans `I` ni `O`, chiffres de 2 à 9). Sa saisie ignore la casse et les espaces.
- Le code est valable 48 heures, durée lue dans la configuration (`PAIRING_INVITATION_CODE_TTL_HOURS`), et sert une seule fois.
- Un partenaire sans couple qui saisit un code valable devient le second membre. Le couple passe à `PAIRED` et le code disparaît.
- Un code inconnu, expiré ou déjà utilisé reçoit la même réponse, pour ne rien révéler : `PAIRING_INVITATION_CODE_INVALID`.
- Le créateur d'un couple en attente peut renouveler le code : un nouveau code, une nouvelle échéance, l'ancien ne vaut plus rien.
- Hors phase 2 : quitter un couple et le sort des données, à décider avec le propriétaire.

## Alternatives écartées

- **Lien d'invitation à cliquer** : demande d'envoyer une URL, et la PWA ouverte depuis un lien sur iPhone ne garde pas toujours la session. Un code se dicte.
- **Code de 6 chiffres** : 10⁶ combinaisons seulement ; 8 signes sur 32 en donnent environ 10¹², ce qui rend la devinette inutile sans limiteur de débit.
- **Code sans expiration** : un code qui traîne dans une conversation reste une porte ouverte sur le couple (risque de la décision 0022).

## Conséquences

- Les règles sont écrites dans [les règles de pairing](../../business-rules/pairing/rules.md), qui citent cette décision.
- La durée de validité est une variable d'environnement de l'API (`core.md` règle 8).

## Risques

- Sans limiteur de débit, un attaquant derrière Tailscale pourrait tenter des codes en masse. L'espace de 10¹² codes et l'expiration à 48 heures rendent l'attaque vaine pour deux utilisateurs ; un limiteur reste possible plus tard.
