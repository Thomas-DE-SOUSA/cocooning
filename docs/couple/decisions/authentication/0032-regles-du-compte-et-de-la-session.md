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

# 0032: Règles du compte et de la session

## Contexte

La [décision 0019](../0019-authentification-locale.md) fixe le principe : deux comptes locaux, mots de passe hachés par Argon2id, une session longue dans un cookie. Elle laisse ouverts l'identifiant de connexion, la politique de mot de passe, la durée de la session, l'effet d'une déconnexion et la façon de créer les deux comptes. L'étape 2 de la phase 3 construit la connexion : il faut trancher maintenant.

Le propriétaire a reçu ces règles comme recommandations du plan de l'étape, le 2026-11-23, et a répondu : « go ».

## Décision

- Un partenaire se connecte avec son adresse e-mail et son mot de passe. L'adresse est enregistrée sans espaces autour et en minuscules, 254 caractères au plus, et n'appartient qu'à un compte actif. Aucun e-mail n'est jamais envoyé.
- Un mot de passe fait de 12 à 128 caractères. Cette règle s'applique à la création du compte ; à la connexion, seule la longueur maximale est vérifiée.
- Une connexion refusée reçoit toujours la même réponse, que l'adresse soit inconnue ou le mot de passe faux, pour ne pas révéler quels comptes existent.
- Une session dure 90 jours à partir de la connexion, durée lue dans la configuration. Elle n'est pas prolongée par l'usage : au bout de 90 jours, on se reconnecte.
- Se déconnecter ferme toutes les sessions du partenaire, sur tous ses appareils. Les sessions de l'autre partenaire ne changent pas.
- Il n'y a pas d'inscription dans l'application. Les deux comptes sont créés par une commande de l'API lancée sur la VM, qui demande le mot de passe sans l'afficher.
- Hors de cette étape : le changement et la réinitialisation du mot de passe (au plus tard en phase 7, décision 0019), la limite d'essais de connexion et le verrouillage d'un compte.

## Alternatives écartées

- **Un nom d'utilisateur plutôt qu'une adresse e-mail** : le remplissage automatique d'iOS et d'Android reconnaît mieux un champ e-mail, et l'adresse ne se confond pas d'un partenaire à l'autre.
- **Une session glissante, prolongée à chaque visite** : il faudrait réémettre le jeton à chaque requête ; une reconnexion tous les 90 jours ne gêne pas deux personnes.
- **Une déconnexion limitée à l'appareil courant** : il faudrait suivre chaque appareil. Fermer toutes les sessions est la seule réponse utile à un téléphone perdu.
- **Un écran d'inscription** : il ouvrirait la création de comptes à quiconque atteint l'application, pour deux comptes créés une seule fois.
- **Une limite d'essais dès maintenant** : Tailscale ne laisse passer que les appareils du couple, Argon2id ralentit chaque essai et le mot de passe fait au moins 12 caractères.

## Conséquences

- Les règles seront écrites dans les règles métier du contexte `authentication`, qui citeront cette décision.
- La durée de session est une variable d'environnement de l'API (`core.md` règle 8).
- La révocation et le passage du jeton à la PWA suivent la [décision 0034](../0034-session-revocable.md). Les comptes vivent hors du couple ([décision 0033](0033-authentication-hors-du-couple.md)).
- Le changement de mot de passe et la limite d'essais deviennent des écarts du contexte `authentication` dès que son code existe.

## Risques

- Sans limite d'essais, un appareil du tailnet compromis pourrait tenter des mots de passe en masse. Le coût d'Argon2id et la longueur minimale rendent l'attaque lente ; une limite reste possible plus tard.
- Un mot de passe oublié ne se réinitialise pas encore : le propriétaire recrée le compte par la commande, en attendant la phase 7.
