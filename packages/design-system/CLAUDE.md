# @cocooning/design-system

Composants d'interface sans domaine de la PWA, et les couleurs du theme. Exporte `Badge` (variantes `secondary` en sauge, `outline` en contour), `Button` (variantes `primary`, `secondary`, `outline`, `ghost`, `destructive` ; `buttonVariants` donne ses classes a un lien), `Calendar` (grille du mois de `react-day-picker` aux couleurs du theme, decision 0048 : libelles, langue et premier jour de la semaine recus en props, `components` remplacable) et `CalendarDayButton` (jour en cercle plein quand il est choisi, accent pour aujourd'hui, `marks` dessines sous le numero, 48 px de haut), `Card` (surface en `rounded-2xl`), `Drawer`, `DrawerContent`, `DrawerHeader`, `DrawerTitle` et `DrawerDescription` (feuille qui monte du bas, de `vaul` sur le dialogue Radix : poignee `Drawer.Handle`, seule a tirer la feuille (`handleOnly`), voile `bg-background/70`, `max-w-lg`, au-dessus de la barre d'onglets), `Field` et `FieldError` (groupe d'un champ, erreur annoncee par `role="alert"`, rien quand le champ est valide), `Input` (bordure `destructive` sous `aria-invalid`), `Label`, `Skeleton`, `Spinner` (icone `lucide-react` qui tourne, `aria-label` recu en prop), `SwipeToDelete` (ligne glissee vers la gauche sur un bouton "Supprimer" `destructive`, decision 0049 : a moitie elle reste ouverte, au-dela de 60 % de la largeur elle supprime au lacher, `isRemoved` la fait sortir ; `use-swipe-to-delete.ts` et `swipe-release.ts` lui sont internes, non exportes), `Switch` (interrupteur de 48 sur 28 px de `@radix-ui/react-switch`, `role="switch"` et `aria-checked`), `Textarea` (comme `Input`, sur plusieurs lignes), `Toaster` et `toast` (sonner), `useCloseOnOutsidePress` (un appui hors de l'element ferme ce qu'il a ouvert : la ligne de `SwipeToDelete`, un menu), `cn`. `@cocooning/design-system/styles.css` porte Tailwind 4 et les tokens de la direction "Lin et terre cuite" (decision plateforme 0017) en hexadecimal, clair et sombre selon le systeme du telephone, dont les huit couleurs d'etiquette de l'agenda et le neutre (`bg-label-*`, `border-label-*`, decision 0057), les familles `font-sans` (Inter) et `font-display` (Fraunces, sur `h1` a `h3`) et les arrondis.

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
- `vaul` et `@radix-ui/react-switch` suivent shadcn (pas de decision) ; ils livrent une entree CommonJS (D31), Jest les charge tels quels ; jsdom n'ayant pas `ResizeObserver`, `src/testing/resize-observer-stub.ts` le remplace (`setupFiles` de `jest.config.mjs`), comme dans l'app web. `DrawerContent` porte toujours un `DrawerTitle`, et un `DrawerDescription` pour `aria-describedby` (le dialogue Radix previent sinon). Seule la feuille du bas existe : une autre direction s'ajoute le jour ou un ecran la demande.
- Feuille et clavier de l'iPhone : `repositionInputs={false}` par defaut. Safari remonte deja le champ touche au-dessus du clavier ; `vaul` remontait la feuille en plus et son haut sortait de l'ecran. `handleOnly` par defaut : sinon, tirer vers le bas en haut du formulaire ferme la feuille. Verifie seulement sur le telephone, jsdom n'a pas de clavier.
- `vaul` injecte une feuille de style hors couche (`[data-vaul-handle]` : couleur, taille, opacite), qui l'emporte sur les utilitaires de Tailwind 4 (`@layer utilities`) : la poignee force ses classes par `!` (`bg-muted-foreground/40!`).
- jsdom n'a pas `PointerEvent` : un evenement `pointer` y perd ses coordonnees. `src/testing/pointer-event-stub.ts` (`setupFiles`) le definit sur `MouseEvent`. Une spec de `SwipeToDelete` fixe `offsetWidth` et `setPointerCapture` de l'element, et tape comme un doigt (`pointerdown`, `pointerup`, puis `click`).
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
