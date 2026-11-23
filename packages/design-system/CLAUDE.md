# @cocooning/design-system

Composants d'interface sans domaine de la PWA, et les couleurs du theme. Exporte `Button` (variantes `primary`, `secondary`, `ghost`, `destructive`), `Input` (bordure `destructive` sous `aria-invalid`), `Label`, `Skeleton`, `Toaster` et `toast` (sonner), `cn`. `@cocooning/design-system/styles.css` porte Tailwind 4 et les tokens en oklch, clair et sombre selon le systeme du telephone.

## A lire avant de commencer

Regles front communes :
@../../_knowledge/core-frontend.md

## Consignes de code

- Aucun domaine, aucun texte : un libelle arrive en prop ou en `children`, jamais en dur ni par `t()`.
- Ni Next, ni domaine, ni infrastructure (boundaries) : le package reste une bibliotheque React pure.
- Une primitive suit le style shadcn : fonction (pas de `forwardRef`, React 19), attribut `data-slot`, variantes par `cva`, classes fusionnees par `cn` pour que `className` gagne. Modele : `src/ui/button.tsx`.
- Imports internes relatifs, jamais `from '@cocooning/design-system'` depuis le package (cycle).
- Une couleur ajoutee : la variable dans `:root` et dans le bloc sombre de `src/styles/globals.css`, puis `--color-*` dans `@theme inline`. Pas de couleur en dur dans un composant.
- Chaque fichier exporte par `src/index.ts`, exports nommes seulement.
- `*.tsx` : 125 lignes visees, 200 au plus (decision 0008, `max-lines` du lint).
- Un champ de saisie garde un texte d'au moins 16 px (`text-base`) : en dessous, Safari sur iPhone zoome dans la page au focus.
- Un composant qui utilise un hook ou un evenement du navigateur commence par `'use client'` (modele : `src/ui/toaster.tsx`).

## Tests

- Une spec `*.spec.tsx` a cote du composant, avec Testing Library, style BDD, sans `should`. Pas de Storybook (decision plateforme 0012) : la spec prouve que le composant s'affiche seul, par ses props.
- Un clic se verifie par un journal ecrit a la main (`const clicks: string[] = []`), jamais `jest.fn` (decision 0001).

## Pieges

- Pas de build : `exports` pointe vers `src`, l'app web compile le package (`transpilePackages`). Le `'use client'` reste donc en tete du fichier livre.
- Tailwind 4 ne lit pas `node_modules` : `@source '../'` dans `globals.css` lui fait voir les classes du package. Sans lui, les classes des composants manquent dans la page.
- Palette provisoire (choix du proprietaire, 2026-11-23) en attendant son identite visuelle.

## Commandes

- `pnpm --filter @cocooning/design-system test`
- `pnpm --filter @cocooning/design-system check-types`
- `pnpm --filter @cocooning/design-system lint`

## Documentation a tenir a jour

- Tout changement : relire chaque page qui cite le composant modifie, trouvee avec `rg -l '<NomDeComposant>|<chemin/du/fichier>' docs/ _knowledge/ CLAUDE.md`.
- Composant ou couleur ajoute : la table des packages de `docs/couple/architecture/frontend/index.md`.
