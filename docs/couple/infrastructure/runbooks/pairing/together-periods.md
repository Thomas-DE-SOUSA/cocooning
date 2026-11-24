---
last-verified: 2026-11-24
---

# Périodes ensemble du couple

Ce runbook enregistre sur la VM les périodes où le couple est ensemble (R9 des [règles de pairing](../../../business-rules/pairing/rules.md)), puis vérifie que l'API les rend. À lire avant la première mise en production d'une version qui affiche le compte des jours, ou quand une date est à corriger.

Niveau de preuve : vérifié en E2E contre un Postgres 17 de test (`apps/couple/api/test/commands/record-together-periods*.e2e-spec.ts`) ; pas encore lancé sur la VM.

## Quand l'utiliser

- Première mise en production de la version qui contient la colonne `couple.together_periods` : la liste est vide.
- Une période change : une séparation, des retrouvailles, une date fausse. La nouvelle liste remplace l'ancienne : on la donne toujours en entier.

## Impact

Sans période, `GET /pairing/couple` rend `togetherPeriods: []` et la PWA ne peut pas compter les jours. Aucun écran de l'app ne modifie la liste ([décision 0045](../../../decisions/pairing/0045-periodes-ensemble-du-couple.md)).

## Diagnostic

Sur la VM, depuis `~/cocooning` :

1. `docker compose -f infrastructure/compose/docker-compose.prod.yml ps api` : le service est `healthy`. Sinon, suivre d'abord le [runbook de mise en production](../../../../platform/runbooks/deployment/production.md).
2. La migration `20261124102747_pairing_together_periods` est passée : le service `migrate` l'applique avant que `api` démarre, comme les autres.

## Résolution

La commande `record-together-periods` ([décision plateforme 0016](../../../../platform/decisions/0016-commandes-d-exploitation-dans-l-api.md)) prend l'adresse e-mail d'un des deux partenaires, puis chaque période dans l'ordre : `AAAA-MM-JJ..AAAA-MM-JJ` pour une période finie, `AAAA-MM-JJ..` pour la période en cours, toujours la dernière. Elle tourne dans un conteneur jetable de l'image `api`, avec l'environnement du service.

1. Lancer la commande (dates d'exemple, à remplacer par les vraies) :

   ```sh
   docker compose -f infrastructure/compose/docker-compose.prod.yml run --rm --no-deps \
     api node dist/commands/record-together-periods/main.js thomas@exemple.fr \
     2020-01-10..2021-03-04 2022-05-01..
   ```

2. La commande affiche `Together periods recorded: 2 periods` et rend `0`. Elle n'affiche jamais les dates.

Les jours se comptent à Paris : une période peut commencer aujourd'hui, jamais demain. Une période finie compte son dernier jour ; la suivante commence au plus tôt le lendemain.

Codes de sortie (`echo $?` juste après) :

| Code | Sens | Message |
|---|---|---|
| `0` | Périodes enregistrées | `Together periods recorded: <n> periods` |
| `64` | Erreur de saisie : pas d'adresse, pas de période, période sans `..` ou avec deux | `Usage: …` |
| `65` | Refus du domaine, rien n'est écrit | `Refused: PAIRING_TOGETHER_PERIODS_INVALID` (jour qui n'existe pas, fin avant le début, désordre, chevauchement, période ouverte avant la dernière, début après aujourd'hui), `PAIRING_COUPLE_NOT_PAIRED`, `PAIRING_COUPLE_NOT_FOUND` |
| `67` | Aucun compte n'a cette adresse | `Unknown account: no account has this email address` |
| `1` | Panne : base injoignable, environnement invalide | `Unexpected failure: <classe>` ou `Invalid environment` |

## Vérification

Relire la colonne en base, sans passer par la PWA :

```sh
docker compose -f infrastructure/compose/docker-compose.prod.yml exec postgres \
  psql -U cocooning -d cocooning -c "SELECT together_periods FROM couple WHERE deleted_at IS NULL AND pairing_status = 'PAIRED';"
```

La liste affichée est celle donnée à la commande, dans le même ordre. L'outbox garde une ligne `pairing.together-periods.recorded` par enregistrement, avec le seul nombre de périodes.

## Escalade

- `Unexpected failure` : lire `docker compose -f infrastructure/compose/docker-compose.prod.yml logs api --tail 50` et vérifier que `postgres` est `healthy`. La commande n'écrit rien tant que la liste n'est pas enregistrée.
- `PAIRING_COUPLE_DATA_CORRUPTED` sur `GET /pairing/couple` (`500`) : la colonne a été modifiée à la main et ne se relit plus. Relancer la commande avec la liste complète la réécrit.
