---
nature: produit
status: acceptée
date: 2026-11-25
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-25
validated-on: 2026-11-25
supersedes:
superseded-by:
premortem:
---

# 0053: L'écran des espaces et des dossiers de notes

## Contexte

La [décision 0052](../notes/0052-dossiers-et-dossiers-ia.md) range les notes dans deux espaces, « Partagé » et « Privé », et dans des dossiers. Le serveur et la couche client existent (PR #20 et #21). Il reste l'écran de la PWA : où l'on voit les espaces, comment on entre dans un dossier, crée, renomme, déplace et supprime. Deux maquettes de la planche le montrent, « Notes, dossiers et dossiers IA » et « Notes, actions et déplacement », validées par le propriétaire (« go », 2026-11-25).

## Décision

- **L'accueil des notes** montre deux cartes, « Partagé » (« Vu par vous deux ») et « Privé » (« Rien que pour toi »), avec le nombre de dossiers et de notes de chacune, puis « Modifiées récemment », les dernières notes modifiées.
- **Un espace ou un dossier** s'ouvre sur un écran avec un retour vers le niveau du dessus, ses dossiers puis ses notes. Un bouton « + » propose « Nouvelle note » et « Nouveau dossier », créés à cet endroit.
- **« ⋯ » sur un dossier** propose Renommer, Déplacer et Supprimer. La suppression demande une confirmation qui dit où remonte son contenu ; aucune note n'est supprimée (R16).
- **« ⋯ » sur une note** propose Déplacer et, pour sa propriétaire, Supprimer. La page d'une note propose les mêmes actions et revient à son dossier.
- **Déplacer** ouvre un sélecteur : on choisit l'espace, on descend dans les dossiers, puis « Déplacer ici ». Une note de l'autre ne quitte pas « Partagé » ; un dossier reste dans son espace (R11, R15).
- **« Partager » et « Rendre privée » disparaissent des cartes de notes** : ranger une note dans l'autre espace le fait (R11).
- **Au lot 1, « Nouveau dossier » ne propose pas le choix Classique / IA**, qui arrive avec les dossiers IA.

## Alternatives écartées

- **Garder la liste de toutes les notes à l'accueil** ([décision 0039](../notes/0039-regles-des-notes.md)) : les dossiers n'y auraient pas de place, et la liste mélangerait les espaces.
- **Garder « Partager » et « Rendre privée » à côté du déplacement** : deux façons de faire la même chose, et une note partagée resterait dans un dossier de « Privé ».
- **Le glissement pour supprimer, comme dans l'agenda** ([décision 0049](0049-suppression-par-glissement.md)) : une ligne porte ici plusieurs actions, et la suppression d'un dossier doit dire où va son contenu.

## Conséquences

- L'accueil de la PWA n'est plus la liste des notes de la décision 0039.
- Les espaces et les dossiers ont leur route web ; l'onglet « Notes » reste actif dans un espace, un dossier et la page d'une note.
- Les commandes de partage et de passage en privé de la PWA sont retirées ; les routes de l'API restent.

## Risques

- Une note demande un toucher de plus pour être créée, puisque l'accueil n'a plus de « + ». À revoir si le couple le trouve lent.
