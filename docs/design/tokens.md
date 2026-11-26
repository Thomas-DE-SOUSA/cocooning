# Tokens

Cette page liste les tokens de la direction « Lin et terre cuite » tels qu'ils sont écrits dans le code, et dit où les changer. À lire avant de styler un écran ou de toucher au thème. Les valeurs, leurs contrastes et leur raison d'être sont dans la [décision plateforme 0017](../platform/decisions/0017-direction-artistique-lin-et-terre-cuite.md) ; cette page ne les répète pas.

## Où ils vivent

- Couleurs, arrondis et familles de polices : `packages/design-system/src/styles/globals.css`. Chaque couleur est une variable de `:root`, redéfinie dans le bloc `prefers-color-scheme: dark`, puis exposée à Tailwind par `@theme inline` (`--color-*`). Le clair ou le sombre suit le réglage du téléphone.
- Fichiers des polices : `apps/couple/web/src/app/fonts.ts` les déclare par `next/font/google`, qui les télécharge au build et les sert depuis la PWA. Il pose `--font-fraunces` et `--font-inter` sur `<html>` (`layout.tsx`, `global-error.tsx`).
- Couleur de la barre du téléphone et du manifeste : `apps/couple/web/src/app/pwa-theme.ts`, copie des deux fonds de page.

Les couleurs sont écrites en hexadécimal, comme dans la décision, pour que les contrastes vérifiés restent exacts.

## Couleurs

| Classe Tailwind | Rôle dans la décision 0017 |
|---|---|
| `bg-background`, `text-foreground` | fond de page, texte |
| `bg-card`, `text-card-foreground` | surface : carte, champ, éditeur |
| `text-muted-foreground` | texte secondaire (date, propriétaire de la note) |
| `bg-muted` | fond discret : squelette, survol d'un bouton `ghost` |
| `bg-primary`, `text-primary-foreground`, `text-primary` | accent terre cuite : bouton principal, lien, case cochée |
| `bg-secondary`, `text-secondary-foreground` | étiquette sauge : « Partagée », outil actif de la barre |
| `bg-destructive`, `text-destructive`, `text-destructive-foreground` | suppression, erreur de champ |
| `border-input` | bordure d'un champ ou d'une case vide (3:1 au moins) |
| `border-border` | bordure décorative d'une carte, bordure par défaut |
| `outline-ring` | anneau de focus |
| `bg-label-sage` à `bg-label-pebble`, `border-label-*` | les huit couleurs d'une étiquette de l'agenda (`sage`, `rose`, `terracotta`, `ochre`, `slate`, `plum`, `mint`, `pebble`), en barre, point ou pastille, jamais en texte ([décision 0057](../couple/decisions/frontend/0057-ecran-pour-qui-et-etiquettes.md)) |
| `bg-label-none` | un événement sans étiquette, neutre |

Un bouton `outline` (texte terre cuite, bordure de champ) prend `bg-card` au survol, pas `bg-muted` : sur `bg-muted`, la terre cuite tombe à 4,3:1.

Une couleur ajoutée suit la consigne de `packages/design-system/CLAUDE.md` et entre dans la décision qui la justifie, contraste calculé.

## Polices

- `font-sans` (Inter) : tout le texte, posé sur `body`.
- `font-display` (Fraunces, axe `SOFT` à 100) : `h1`, `h2` et `h3` la reçoivent par défaut, titres de l'éditeur compris.

## Arrondis et tailles

| Classe | Valeur | Usage |
|---|---|---|
| `rounded-sm` | 8 px | étiquette (`Badge`) |
| `rounded-lg` | 12 px | champ, bouton, barre d'outils |
| `rounded-2xl` | 20 px | carte (`Card`), éditeur |
| `h-11` | 44 px | `Button`, cible tactile minimale |
| `h-12` | 48 px | `Input` |
