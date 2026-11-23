---
last-verified: 2026-11-23
---

# Comptes du couple

Ce runbook crée les deux comptes de Cocooning sur la VM, vérifie qu'ils se connectent, et dit quoi faire d'un mot de passe oublié.

Niveau de preuve : exécuté sur la VM le 2026-11-23 par `docker compose run` (création des deux comptes du couple, vérification `curl` à `200`) ; auparavant en local, dans l'image `runner` sur un terminal réel, contre un Postgres 17 jetable (refus d'une adresse prise, `401`).

## Quand l'utiliser

- Première mise en production d'une version qui contient l'écran de connexion : aucun compte n'existe, personne ne peut se connecter.
- Un partenaire a oublié son mot de passe.

## Impact

Sans compte, la PWA ne laisse passer personne : toutes les routes de l'API, sauf la santé et la connexion, répondent `401`. L'application n'a pas d'écran d'inscription (R6 des [règles](../../../business-rules/authentication/rules.md)).

## Diagnostic

Sur la VM, depuis `~/cocooning` :

1. `docker compose -f infrastructure/compose/docker-compose.prod.yml ps api` : le service est `healthy`. Sinon, suivre d'abord le [runbook de mise en production](../../../../platform/runbooks/deployment/production.md).
2. Compter les comptes actifs :

   ```sh
   docker compose -f infrastructure/compose/docker-compose.prod.yml exec postgres \
     psql -U cocooning -d cocooning -c "SELECT email_address, created_at FROM account WHERE deleted_at IS NULL;"
   ```

## Résolution

### Créer un compte

La commande `create-account` ([décision plateforme 0016](../../../../platform/decisions/0016-commandes-d-exploitation-dans-l-api.md)) prend l'adresse e-mail en argument et demande deux fois le mot de passe, sans l'afficher. Le mot de passe ne passe jamais en argument : il finirait dans l'historique du shell. Elle tourne dans un conteneur jetable de l'image `api`, avec l'environnement du service.

1. Lancer la commande pour le premier partenaire :

   ```sh
   docker compose -f infrastructure/compose/docker-compose.prod.yml run --rm --no-deps \
     api node dist/commands/create-account/main.js thomas@exemple.fr
   ```

2. Taper le mot de passe (12 à 128 caractères), Entrée, puis le retaper. La commande affiche `Account created: <adresse>, userId <uuid>` et rend `0`.
3. Recommencer pour le second partenaire, avec son adresse. Chacun choisit son mot de passe et le tape lui-même.

`--no-deps` réutilise le Postgres déjà démarré. L'adresse est enregistrée en minuscules, sans espaces autour (R1).

Codes de sortie (`echo $?` juste après) :

| Code | Sens | Message |
|---|---|---|
| `0` | Compte créé | `Account created: …` |
| `64` | Erreur de saisie : pas d'adresse, mots de passe différents, saisie interrompue (Ctrl-C, Ctrl-D) | `Usage: …`, `The two passwords differ`, `Password input closed` |
| `65` | Refus du domaine, rien n'est écrit | `Refused: AUTHENTICATION_EMAIL_ADDRESS_INVALID`, `_PASSWORD_TOO_WEAK` ou `_ACCOUNT_ALREADY_EXISTS` |
| `1` | Panne : base injoignable, environnement invalide | `Unexpected failure: <classe>` ou `Invalid environment` |

Ni le mot de passe ni son hachage ne sont jamais affichés, même sur un refus.

### Mot de passe oublié

Aucun use case ne change ni ne réinitialise un mot de passe ([écart 003](../../../gaps/authentication.md)). La seule voie est de recréer le compte, ce qui lui donne un nouveau `userId`.

- **Avant la mise en couple** : retirer l'ancien compte, puis le recréer comme ci-dessus.

  ```sh
  docker compose -f infrastructure/compose/docker-compose.prod.yml exec postgres \
    psql -U cocooning -d cocooning -c "UPDATE account SET deleted_at = now() WHERE email_address = 'thomas@exemple.fr' AND deleted_at IS NULL;"
  ```

  La ligne reste en base (suppression douce) ; l'index unique ne compte que les comptes actifs, l'adresse redevient libre.
- **Après la mise en couple** : ne pas recréer le compte. Le couple garde l'ancien `userId` : le nouveau compte serait hors du couple, et l'autre partenaire ne pourrait pas en rejoindre un autre (R1 des [règles de pairing](../../../business-rules/pairing/rules.md)). Le mot de passe reste perdu tant que l'écart 003 n'est pas traité.

## Vérification

Vérifier la connexion sur `POST /authentication/session`. L'API n'écoute que sur le réseau du compose : `curl` tourne dans un conteneur de ce réseau. Le mot de passe est lu sans écho et envoyé par l'entrée standard, jamais en argument. Seul le statut s'affiche, pas le jeton.

```sh
read -rs -p 'Mot de passe : ' COCOONING_PASSWORD; echo
printf '{"emailAddress":"%s","password":"%s"}' 'thomas@exemple.fr' "$COCOONING_PASSWORD" \
  | docker run --rm -i --network cocooning_default curlimages/curl:8.11.1 \
      -sS -o /dev/null -w '%{http_code}\n' -X POST http://api:3100/authentication/session \
      -H 'Content-Type: application/json' --data-binary @-
unset COCOONING_PASSWORD
```

- `200` : le compte se connecte.
- `401` : adresse ou mot de passe faux (la réponse ne dit pas lequel, R3).
- `422` : le corps n'est pas du JSON valide. Un mot de passe qui contient `"` ou `\` casse ce `printf` : vérifier alors depuis la PWA.

## Escalade

- `Unexpected failure` : lire `docker compose -f infrastructure/compose/docker-compose.prod.yml logs api --tail 50` et vérifier que `postgres` est `healthy`. La commande n'écrit rien tant que le compte n'est pas enregistré.
- Un compte créé par erreur (mauvaise adresse) : le retirer avec le `UPDATE` du mot de passe oublié, tant qu'il n'est dans aucun couple.
