---
nature: technique
status: acceptée
date: 2026-11-24
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-24
validated-on: 2026-11-24
supersedes:
superseded-by:
premortem:
---

# 0048: La grille du mois de l'agenda est le `Calendar` du design system, sur react-day-picker

## Contexte

L'écran de l'agenda montre la grille du mois et, en dessous, les événements du jour choisi ([décision 0046](../agenda/0046-regles-de-l-agenda.md)). La maquette validée par le propriétaire demande un calendrier classique : mois et année choisis dans une liste, semaine qui commence le lundi, jours en français, un cercle terre cuite sur le jour choisi, et sous chaque jour des points à la couleur de l'auteur des événements, creux pour un événement « rien que pour moi ». La décision 0046 renvoie le choix des composants de l'écran à une décision technique prise avec le code. Les jours de l'agenda sont des chaînes `YYYY-MM-DD` de Paris ([décision 0047](../agenda/0047-moments-de-l-agenda-en-heure-de-paris.md)) et la page lit ses données sur le serveur ([décision 0036](0036-lecture-des-donnees-par-la-page-serveur.md)).

## Décision

- La grille est `Calendar` de `@cocooning/design-system`, une fine enveloppe de `DayPicker` (react-day-picker 10) au style shadcn du package : classes aux tokens du thème, chevrons `lucide-react`, aucun texte. Langue (`fr` de `react-day-picker/locale`), libellés des boutons de mois, premier jour de la semaine et bornes des années arrivent en props depuis l'app.
- `CalendarDayButton` dessine un jour (48 px de haut, cible tactile) et reçoit en `marks` ce que l'app dessine sous le numéro. Le module web `agenda` y met les points de l'auteur : terre cuite (`bg-primary`) pour le partenaire qui a créé le couple, sauge foncée (`bg-secondary-foreground`) pour l'autre, un anneau de la même couleur pour un événement privé.
- Contraste des points sur la carte (`--card`), seuil WCAG 1.4.11 de 3:1 pour un élément non textuel : en clair, terre cuite `#a65a33` sur `#fffdf8` 5,0:1 et sauge `#3f5a3c` 7,54:1 ; en sombre, terre cuite `#d98a5f` sur `#27201c` 5,92:1 et sauge `#b9d0b4` 9,73:1. Les deux couleurs se distinguent aussi par leur clarté (1,51:1 entre elles en clair, 1,64:1 en sombre) ; la liste du jour écrit l'auteur en toutes lettres, la couleur n'est jamais seule.
- Le mois passe par l'adresse et le serveur, le jour reste dans le navigateur. L'adresse porte les deux (`/agenda?day=YYYY-MM-DD&month=YYYY-MM`). Changer de mois (chevrons, listes) ou revenir à « Aujourd'hui » navigue : la page serveur relit les événements de la grille visible, du lundi qui précède le 1er au dimanche qui suit le dernier jour (42 jours au plus, sous la limite de l'API), et prépare la liste de chacun de ces jours. Toucher un jour de la grille l'affiche depuis ces données, sans appel au serveur : l'état du container change et l'adresse suit par `window.history.replaceState`, que Next relie à son routeur depuis la version 14.1 (vérifié dans Next 16.4). Le jour choisi au chargement hors de la grille (un lien, un mois parcouru) est lu à part.
- Les jours passent de `YYYY-MM-DD` à `Date` locale composante par composante, et la page fournit « aujourd'hui » (jour de Paris) : le serveur en UTC et le téléphone à Paris dessinent la même grille.

Réponse du propriétaire, le 2026-11-24, à la PR #97 qui la proposait : « go ».

## Alternatives écartées

- **Une grille écrite à la main** : semaines, jours hors du mois, navigation au clavier, rôles ARIA de grille et listes de mois et d'années à réécrire et à tester, pour un rendu que shadcn obtient déjà par react-day-picker.
- **Une autre bibliothèque** (FullCalendar, react-big-calendar, MUI X) : pensées pour des vues semaine et journée sur grand écran, plus lourdes, avec leur propre thème à contourner ; react-day-picker est celle que shadcn enveloppe, livrée avec une entrée CommonJS que Jest résout.
- **Le mois gardé dans l'état du navigateur** : la page ne pourrait plus lire les événements du mois sur le serveur, et un rechargement ou un lien perdrait le mois parcouru.
- **Chaque jour touché relu par le serveur** (`router.push`) : un aller-retour par Tailscale jusqu'à la VM à chaque toucher, avec un squelette possible, pour des événements déjà chargés.

## Conséquences

- `react-day-picker` entre dans le catalogue `calendar` de `pnpm-workspace.yaml`, utilisé par le design system et par l'app (langue `fr`, type des props d'un jour).
- Le chemin de lecture de l'agenda est décrit dans [le front de la PWA](../../architecture/frontend/index.md).
- Le panneau de création et de modification d'un événement viendra par-dessus cet écran, sans changer la grille.

## Risques

- react-day-picker raisonne en `Date` : un jour construit depuis une chaîne ISO (`new Date('2026-11-24')`) tomberait à minuit UTC, la veille à Paris. Les presenters du module `agenda` sont testés sur ce passage.
- Les listes de mois et d'années sont des `select` natifs posés sur la légende : leur apparence ouverte dépend du téléphone.
