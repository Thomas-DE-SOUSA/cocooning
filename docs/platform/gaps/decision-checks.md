# Écarts : contrôles automatiques des décisions

Écarts constatés dans l'outillage `contrôles automatiques des décisions` : ce que les décisions annoncent comme contrôle et ce qui tourne vraiment. On ajoute en fin de fichier ; une entrée traitée garde sa trace avec son nouveau statut.

### 001. Le contrôle des mocks automatiques est arrivé en phase 2, pas en phase 0

- Type : règle validée non construite
- Constaté le : 2026-11-23, revue de la branche `chore/decision-guardrails` (PR #10)
- Où : `config/eslint-config/base.js:14`
- Constat : la décision 0001 annonce une règle ESLint posée en phase 0 et active dès les premières specs de la phase 1. Elle n'existait pas : la phase 1 a tourné sans contrôle. Aucune spec n'utilisait `jest.fn`, `jest.spyOn` ou `jest.mock` quand la règle est arrivée.
- Règle concernée : [décision 0001](../../couple/decisions/0001-mocks-automatiques-interdits.md)
- Statut : corrigé le 2026-11-23 (PR #10) : la règle fait échouer `pnpm lint`.

### 002. Le contrôle des noms d'événements ne tourne pas en CI

- Type : règle validée non construite
- Constaté le : 2026-11-23, revue de la branche `chore/decision-guardrails` (PR #10)
- Où : `package.json:22`, `scripts/check-event-names.mjs`
- Constat : la décision 0004 annonce un contrôle qui tourne dans `pnpm lint` et en CI. Il tourne dans `pnpm lint`, mais le dépôt n'a pas encore de CI : un push qui saute le lint local n'est pas arrêté.
- Règle concernée : [décision 0004](../../couple/decisions/0004-noms-evenements-litteral.md)
- Statut : ouvert, se ferme avec la première CI GitHub Actions.
