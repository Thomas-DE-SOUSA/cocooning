# @cocooning/design-system

Composants d'interface sans domaine de la PWA, et les couleurs du theme. Exporte `Badge` (variantes `secondary` en sauge, `outline` en contour), `Button` (variantes `primary`, `secondary`, `outline`, `ghost`, `destructive` ; `buttonVariants` donne ses classes a un lien), `Calendar` (grille du mois de `react-day-picker` aux couleurs du theme, decision 0048 : libelles, langue et premier jour de la semaine recus en props, `components` remplacable) et `CalendarDayButton` (jour en cercle plein quand il est choisi, accent pour aujourd'hui, `marks` dessines sous le numero, 48 px de haut), `Card` (surface en `rounded-2xl`), `Field` et `FieldError` (groupe d'un champ, erreur annoncee par `role="alert"`, rien quand le champ est valide), `Input` (bordure `destructive` sous `aria-invalid`), `Label`, `Skeleton`, `Spinner` (icone `lucide-react` qui tourne, `aria-label` recu en prop), `Toaster` et `toast` (sonner), `cn`. `@cocooning/design-system/styles.css` porte Tailwind 4 et les tokens de la direction "Lin et terre cuite" (decision plateforme 0017) en hexadecimal, clair et sombre selon le systeme du telephone, les familles `font-sans` (Inter) et `font-display` (Fraunces, sur `h1` a `h3`) et les arrondis.

## A lire avant de commencer

Regles front communes :
@../../_knowledge/core-frontend.md

## Consignes de code

- Aucun domaine, aucun texte : un libelle arrive en prop ou en `children`, jamais en dur ni par `t()`.
- Ni Next, ni domaine, ni infrastructure (boundaries) : le package reste une bibliotheque React pure.
- Une primitive suit le style shadcn : fonction (pas de `forwardRef`, React 19), attribut `data-slot`, variantes par `cva`, classes fusionnees par `cn` pour que `className` gagne. Modele : `src/ui/button.tsx`.
- Imports internes relatifs, jamais `from '@cocooning/design-system'` depuis le package (cycle).
- Une couleur ajoutee : la variable dans `:root` et dans le bloc sombre de `src/styles/globals.css`, puis `--color-*` dans `@theme inline`, contraste WCAG calcule (texte 4,5:1, bordure utile 3:1) et inscrit dans une decision. Pas de couleur en dur dans un composant.
- Cible tactile de 44 px au moins (`Button` en `h-11`) ; carte en `rounded-2xl`, champ et bouton en `rounded-lg`, etiquette en `rounded-sm` (`docs/design/tokens.md`).
- Chaque fichier exporte par `src/index.ts`, exports nommes seulement.
- `*.tsx` : 125 lignes visees, 200 au plus (decision 0008, `max-lines` du lint).
- Un champ de saisie garde un texte d'au moins 16 px (`text-base`) : en dessous, Safari sur iPhone zoome dans la page au focus.
- Un champ de formulaire : `Field` > `Label` + `Input` (`aria-invalid`, `aria-describedby` vers l'`id` de l'erreur) + `FieldError`. Modele : `src/ui/field.spec.tsx`.
- Icones : `lucide-react` seul (`core-frontend.md` regle 10).
- Un composant qui utilise un hook ou un evenement du navigateur commence par `'use client'` (modele : `src/ui/toaster.tsx`).

## Tests

- Une spec `*.spec.tsx` a cote du composant, avec Testing Library, style BDD, sans `should`. Pas de Storybook (decision plateforme 0012) : la spec prouve que le composant s'affiche seul, par ses props.
- Un clic se verifie par un journal ecrit a la main (`const clicks: string[] = []`), jamais `jest.fn` (decision 0001).

## Pieges

- Pas de build : `exports` pointe vers `src`, l'app web compile le package (`transpilePackages`). Le `'use client'` reste donc en tete du fichier livre.
- Tailwind 4 ne lit pas `node_modules` : `@source '../'` dans `globals.css` lui fait voir les classes du package. Sans lui, les classes des composants manquent dans la page.
- `react-day-picker` raisonne en `Date` locales : l'app construit ses jours depuis `YYYY-MM-DD` composante par composante et passe `today`, sinon le serveur (UTC) et le telephone (Paris) ne dessinent pas le meme jour.
- Les variables `--font-inter` et `--font-fraunces` sont posees par l'app (`apps/couple/web/src/app/fonts.ts`) : le package ne charge aucun fichier de police.

## Commandes

- `pnpm --filter @cocooning/design-system test`
- `pnpm --filter @cocooning/design-system check-types`
- `pnpm --filter @cocooning/design-system lint`

## Documentation a tenir a jour

- Tout changement : relire chaque page qui cite le composant modifie, trouvee avec `rg -l '<NomDeComposant>|<chemin/du/fichier>' docs/ _knowledge/ CLAUDE.md`.
- Composant ou couleur ajoute : la table des packages de `docs/couple/architecture/frontend/index.md`.
- Token change ou ajoute : `docs/design/tokens.md`, et la decision plateforme 0017 (remplacee par une nouvelle) si une valeur de la direction change.
