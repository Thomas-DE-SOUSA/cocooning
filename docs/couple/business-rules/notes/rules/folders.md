# Règles des dossiers de notes

Comment le couple range ses notes : les deux espaces et les dossiers classiques. À lire avant de toucher aux dossiers ou à l'accueil des notes. Les dossiers IA ont [leurs propres règles](ai-folders.md).

## Les espaces

### R10. Deux espaces : Partagé et Privé

J'ouvre les notes : je vois « Partagé », que nous voyons tous les deux, et « Privé », que je suis seul à voir. Mon âme sœur a son propre « Privé », que je ne vois pas.

- Dans le code : à venir (lot 1 des dossiers).
- Source : [décision 0052](../../../decisions/notes/0052-dossiers-et-dossiers-ia.md). Validée par : à compléter.

### R11. Une note prend la visibilité de son espace

Une note rangée dans « Partagé » est partagée, une note rangée dans « Privé » est privée. Je déplace ma note de l'un à l'autre : elle est partagée ou devient privée, comme avec R5. Je ne peux pas ranger la note de l'autre dans mon « Privé ».

- Dans le code : à venir (lot 1) ; la visibilité reste celle de `Note.share` et `Note.makePrivate`.
- Source : décision 0052. Validée par : à compléter.

### R12. Les notes d'avant les dossiers sont à la racine de leur espace

Le jour où les dossiers arrivent, nos notes partagées sont à la racine de « Partagé », mes notes privées à la racine de mon « Privé ».

- Dans le code : à venir (lot 1, migration).
- Source : décision 0052. Validée par : à compléter.

## Les dossiers

### R13. Un dossier contient des notes et des dossiers, sans limite de profondeur

Dans un espace ou dans un dossier, je crée une note ou un dossier. Un dossier a un nom de 1 à 60 signes.

- Dans le code : à venir (lot 1).
- Source : décision 0052 ; la limite de 60 signes est une proposition de Claude. Validée par : à compléter.

### R14. Un dossier de « Partagé » est à nous deux

Nous créons, renommons, déplaçons et supprimons tous les deux un dossier de « Partagé ». Un dossier de mon « Privé » n'existe que pour moi, comme une note privée (R4).

- Dans le code : à venir (lot 1).
- Source : décision 0052. Validée par : à compléter.

### R15. Un dossier reste dans son espace

Je déplace un dossier dans un autre dossier du même espace. Un dossier ne passe pas de « Partagé » à « Privé » ni l'inverse : il contiendrait les notes de l'autre. Je déplace les notes une à une (R11).

- Dans le code : à venir (lot 1).
- Source : proposition de Claude (décision 0052). Validée par : à compléter.

### R16. Supprimer un dossier fait remonter son contenu

Je supprime un dossier : ses notes et ses sous-dossiers remontent dans le dossier du dessus. Aucune note ne disparaît avec un dossier, puisque seule sa propriétaire supprime une note (R7).

- Dans le code : à venir (lot 1).
- Source : proposition de Claude (décision 0052). Validée par : à compléter.

## Cas et exceptions

| Situation | Ce qui s'applique |
|---|---|
| Ranger la note de l'autre dans mon « Privé » | Refusé, seule sa propriétaire la rend privée (R5, R11) |
| Ouvrir, renommer ou supprimer un dossier du « Privé » de l'autre | Refusé, `404`, comme un dossier inexistant (R14) |
| Déplacer un dossier vers l'autre espace | Refusé (R15) |
| Déplacer un dossier dans l'un de ses propres sous-dossiers | Refusé |
| Nom de dossier vide ou trop long | Refusé, `422` (R13) |
