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

# 0049: Supprimer un événement de l'agenda en le glissant vers la gauche

## Contexte

Sur l'agenda en production, supprimer un événement demande d'ouvrir sa feuille, de toucher « Supprimer l'événement », puis « Supprimer pour nous deux ». Le propriétaire veut une suppression rapide depuis la liste du jour, par un glissement. La règle R9 ([décision 0046](../agenda/0046-regles-de-l-agenda.md)) permet déjà à chacun des deux de supprimer un événement partagé, et un événement privé n'est vu que par son auteur : tout événement de la liste est supprimable par celui qui la regarde.

Le rendu a été montré sur la planche (`Agenda-suppression`, clair et sombre) avant d'être construit : https://claude.ai/artifact/TqnctvMSZ4tRSVhGwyZFbP.

## Décision

1. **Glisser une carte de la liste du jour vers la gauche** fait apparaître, derrière elle, un bouton « Supprimer » rouge (`destructive`) avec une corbeille.
2. **Glissée à moitié**, la carte reste ouverte sur le bouton ; le toucher supprime l'événement pour les deux. Glisser vers la droite, toucher la carte ou toucher ailleurs la referme.
3. **Glissée sur la plus grande partie de sa largeur**, la carte supprime l'événement au lâcher, sans autre question, comme dans Mail sur iPhone.
4. La carte sort de la liste tout de suite ; un toast « Événement supprimé » confirme. Un refus la fait revenir, avec le toast d'erreur de la feuille.
5. La feuille garde sa propre suppression, avec confirmation, pour qui ne fait pas le geste ou n'a pas d'écran tactile.

Réponses du propriétaire, le 2026-11-24 : « faudrait une suppression rapide, slide vers la gauche ou droite pour supprimer l'evenement » ; pour la confirmation, « les deux » (bouton à toucher et glissement complet) ; pour le sens, « Vers la gauche (Recommandé) » ; « Ouais je valide la maquette ».

## Alternatives écartées

- **Glisser dans les deux sens** : la droite reste libre, et le geste habituel des deux téléphones est la gauche.
- **Bouton à toucher seulement** : plus sûr, mais le propriétaire veut aussi le geste complet.
- **Annulation par le toast** : l'API n'a pas de restauration d'un événement supprimé ; l'ajouter serait un nouveau cas d'usage.

## Conséquences

- Le design system gagne `SwipeToDelete`, écrit sur les événements `pointer` du navigateur, sans bibliothèque. Le défilement vertical reste au navigateur (`touch-action: pan-y`).
- Le module web `agenda` lance la suppression depuis la liste par `useCalendarEventQuickDeletion`, sur la même commande que la feuille ; l'API ne change pas.

## Risques

- Un glissement complet involontaire supprime pour les deux, sans retour possible. Le seuil (60 % de la largeur) et le geste horizontal, distingué du défilement après 10 px, limitent ce risque ; à revoir si le couple supprime par erreur.
- Le geste n'existe qu'au toucher : au clavier, le bouton reste inaccessible tant que la carte est fermée (`inert`), et la feuille reste le chemin.
