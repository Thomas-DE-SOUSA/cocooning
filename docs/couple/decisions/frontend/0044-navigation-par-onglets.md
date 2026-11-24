---
nature: produit
status: acceptée
date: 2026-11-24
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-24
validated-on: 2026-11-24
supersedes:
superseded-by:
premortem:
---

# 0044: Navigation par une barre d'onglets en bas

## Contexte

Après la mise en production de la direction artistique ([décision plateforme 0017](../../../platform/decisions/0017-direction-artistique-lin-et-terre-cuite.md)), la PWA n'avait qu'un écran de couple, la liste des notes, avec un bouton « Se déconnecter » en bas de la liste. Le propriétaire a trouvé ce bouton inutile à cet endroit et a demandé une barre de navigation, en bas comme celle de Cadence, ou latérale. L'agenda et les messages arrivent ensuite : la navigation doit les accueillir sans être refaite.

Le rendu a été montré sur la planche (`Navigation`, clair et sombre) avant d'être construit : https://claude.ai/artifact/TqnctvMSZ4tRSVhGwyZFbP.

## Décision

1. **Une barre d'onglets fixée en bas de l'écran**, sur la carte de la direction artistique, avec une marge pour la barre d'accueil du téléphone. Chaque onglet a une icône `lucide-react` et un libellé. L'onglet actif se distingue par la couleur de l'accent, un libellé en gras et une pastille sauge derrière l'icône, jamais par la couleur seule ; il porte `aria-current="page"`.
2. **Un onglet par écran livré.** Aujourd'hui « Notes » (`/`) et « Nous » (`/couple`). « Agenda » puis « Messages » se placent entre les deux quand leur écran existe ; aucun onglet grisé n'annonce un écran à venir.
3. **L'onglet « Nous »** montre la date de formation du couple (le jour où le dernier partenaire l'a rejoint) et, en bas, une carte « Ce téléphone » qui porte la déconnexion. La liste des notes n'a plus de bouton de déconnexion ; l'écran de mise en couple garde le sien, la barre n'y étant pas.
4. **La barre n'apparaît que sur les écrans d'un couple formé qui sont des onglets.** La page d'une note (qui a son lien de retour, et dont le clavier ne doit pas soulever la barre), la connexion et la mise en couple n'en ont pas.
5. **La liste s'appelle « Notes »**, comme son onglet, et plus « Nos notes » : elle mélange les notes partagées et mes notes privées, que l'étiquette distingue.

Réponses du propriétaire, le 2026-11-24 : « pourquoi pas mettre une barre de navigation en bas style Cadence », puis « go » à la proposition d'une barre en bas avec un onglet « Nous » qui reçoit la déconnexion, et « J'aime bien la DA » sur la planche ; pour le titre, « « Notes » (Recommandé) ».

## Alternatives écartées

- **Menu latéral** : utile sur un grand écran ou avec beaucoup de rubriques ; Cocooning tourne sur deux téléphones et aura quatre onglets au plus.
- **Onglets « Agenda » et « Messages » grisés dès maintenant** : un écran vide derrière un onglet, à retirer ou à expliquer.
- **Déconnexion dans une icône de compte en haut à droite** (le menu de compte de Cadence) : un écran « Nous » sert aussi de place aux réglages à venir (notifications).
- **« Nos notes » en deux groupes, partagées et privées** : plus long à parcourir pour une distinction que l'étiquette porte déjà.

## Conséquences

- Les routes à onglets vivent dans le groupe `apps/couple/web/src/app/(tabs)/`, dont le `layout.tsx` pose la barre (`src/shared/ui/tab-bar.tsx`, branchée par `main-navigation.tsx`). Un nouvel écran à onglet ajoute sa route dans ce groupe et une entrée à `TABS`.
- `WebRouterEnum.COUPLE_OVERVIEW` (`/couple`) rejoint les routes du contexte `pairing`, dont `presentCoupleOverviewPage` lit le couple.
- Les prénoms des partenaires ne sont pas affichés : l'API ne les connaît pas. Les montrer demande d'abord une décision sur le compte.

## Risques

- Une barre fixe réduit la hauteur utile de la liste d'environ 70 px : acceptable sur les deux téléphones, à revoir si une liste devient longue.
- Sans `viewport-fit=cover`, la marge du bas (`env(safe-area-inset-bottom)`) vaut zéro : la barre s'arrête au-dessus de la barre d'accueil de l'iPhone, ce qui suffit ; à vérifier sur l'appareil.
