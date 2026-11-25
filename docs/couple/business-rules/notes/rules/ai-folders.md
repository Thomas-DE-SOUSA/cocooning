# Règles des dossiers IA

Comment un dossier IA complète ce que le couple y ajoute. À lire avant de toucher aux dossiers IA, aux fiches ou à l'appel de l'IA. Les dossiers en général suivent [les règles des dossiers](folders.md).

## Le dossier

### R17. Un dossier IA a un sujet et une fiche type

À la création, je choisis « Classique » ou « IA ». Pour un dossier IA, l'IA propose d'après son nom un sujet (une phrase, 280 signes au plus) et une fiche type (de 1 à 10 cases, chacune nommée en 40 signes au plus). Je les corrige avant de créer le dossier, et plus tard aussi ; dans « Partagé », nous les corrigeons tous les deux.

- Dans le code : à venir (lot 2).
- Source : [décision 0052](../../../decisions/notes/0052-dossiers-et-dossiers-ia.md) ; les limites sont une proposition de Claude, acceptées par « go ». Validée par : Thomas De Sousa, 2026-11-25 (« go »).

### R18. Un sous-dossier d'un dossier IA hérite et précise

Je crée « Lyon » dans « Restaurants » : il est IA lui aussi, garde la fiche type de « Restaurants », et son nom s'ajoute au contexte des recherches. Si la fiche type de « Restaurants » change, celle de « Lyon » change avec elle.

- Dans le code : à venir (lot 2).
- Source : décision 0052. Validée par : Thomas De Sousa, 2026-11-25 (« go »).

## L'ajout d'un élément

### R19. J'ajoute un élément par son nom, l'IA le complète

Dans un dossier IA, je tape un nom (« Chez Paul »). L'IA cherche sur Internet avec le sujet du dossier et les noms des dossiers au-dessus. S'il y a un doute, elle me montre au plus trois candidats ; je choisis, ou je précise et elle cherche de nouveau. L'IA ne crée jamais d'élément que je n'ai pas tapé.

- Dans le code : à venir (lot 2).
- Source : décision 0052, [décision 0015](../../../decisions/0015-enrichissement-des-envies.md). Validée par : Thomas De Sousa, 2026-11-25 (« go »).

### R20. Un élément est une note avec sa fiche

L'élément ajouté est une note, avec la fiche en haut (une valeur par case) et nos notes libres dessous, que nous écrivons à deux comme dans toute note. La note existe tout de suite, « en recherche » le temps que la fiche se remplisse ; si la recherche échoue, la note reste et je peux réessayer.

- Dans le code : à venir (lot 2).
- Source : décision 0052. Validée par : Thomas De Sousa, 2026-11-25 (« go »).

## La fiche

### R21. Rien n'est inventé

Une information que l'IA ne trouve pas reste « non trouvé ». La fiche garde ses sources (des liens) et la date de sa recherche.

- Dans le code : à venir (lot 2).
- Source : décision 0052. Validée par : Thomas De Sousa, 2026-11-25 (« go »).

### R22. Je corrige une case, « Mettre à jour » la respecte

Je corrige une case à la main ; « Mettre à jour » relance la recherche pour les autres cases et garde ma correction. Une case ajoutée à la fiche type se remplit sur les fiches du dossier, dans la limite du plafond du jour (R23).

- Dans le code : à venir (lot 2).
- Source : proposition de Claude (décision 0052). Validée par : Thomas De Sousa, 2026-11-25 (« go »).

### R23. Un plafond de recherches par jour

Le couple fait au plus 30 recherches par jour, tous dossiers confondus. Au-delà, l'app me dit de réessayer demain ; la note est créée quand même.

- Dans le code : à venir (lot 2), plafond dans la configuration.
- Source : proposition de Claude (décision 0052), pour protéger le quota gratuit de l'IA. Validée par : Thomas De Sousa, 2026-11-25 (« go »).

### R24. Ce qui part chez l'IA

Notre moteur de recherche, sur notre serveur, interroge des moteurs publics avec ce que je tape et le contexte du dossier. Partent chez l'IA le sujet du dossier, les noms des dossiers au-dessus, les cases de la fiche type, ce que je tape et les textes trouvés. Jamais nos notes libres.

- Dans le code : à venir (lot 2).
- Source : décision 0052, [décision 0054](../../../decisions/notes/0054-recherche-des-fiches-searxng-et-gemini.md) . Validée par : Thomas De Sousa, 2026-11-25 (« go »).

### R25. Une fiche déplacée garde ses valeurs

Je déplace une fiche dans un autre dossier IA : elle prend la fiche type du nouveau dossier, garde les valeurs des cases de même nom, et « Mettre à jour » remplit les autres. Hors d'un dossier IA, elle garde ses valeurs, sans « Mettre à jour ».

- Dans le code : à venir (lot 2).
- Source : proposition de Claude (décision 0052). Validée par : Thomas De Sousa, 2026-11-25 (« go »).
