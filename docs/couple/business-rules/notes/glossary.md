# Glossaire des notes

Les termes propres aux notes, avec leur nom dans le code. Les termes communs (note, note perso ou partagée, liste de courses, couple, partenaire, propriétaire) sont dans le [glossaire transverse](../../../architecture/glossary.md).

| Terme | Nom dans le code | Définition |
|---|---|---|
| **Titre** | `NoteTitle` | Le nom de la note dans la liste, modifiable par ceux qui la voient |
| **Contenu** | document de la note (Yjs) | Le texte riche de la note : titres, listes, cases à cocher, mise en forme ; synchronisé entre les deux appareils |
| **Partager / rendre privée** | `Note.share`, `Note.makePrivate` | Changer la visibilité d'une note, par sa propriétaire |
| **Supprimer la note** | `Note.delete` | Retirer la note pour les deux, par sa propriétaire (suppression douce) |
| **Espace** | `NoteSpaceEnum` (`SHARED`, `PRIVATE`) | « Partagé » ou « Privé », la racine de l'accueil des notes ; une note y prend sa visibilité |
| **Dossier** | `Folder` | Ce qui range des notes et d'autres dossiers dans un espace, sans limite de profondeur |
| **Dossier classique / dossier IA** | `FolderKindEnum` (`CLASSIC`, `SMART`) | Un dossier IA complète par une IA ce qu'on y ajoute ; un dossier classique ne fait que ranger |
| **Sujet** | `FolderSubject` | La phrase qui dit de quoi parle un dossier IA, contexte de ses recherches |
| **Fiche type** | `CardTemplate` | La liste des cases d'un dossier IA, commune à toutes ses fiches |
| **Case** | `CardField` | Une information de la fiche type (adresse, prix, horaires) |
| **Fiche** | `NoteCard` | Les valeurs des cases en haut d'une note d'un dossier IA, avec leurs sources et la date de la recherche |
| **Lieu** | `Place` | Un restaurant, une boutique, un musée… trouvé sur OpenStreetMap pour compléter une fiche (décision 0055) |
| **Annuaire des lieux** | `PlaceDirectory` | OpenStreetMap, interrogé par Nominatim avec les mots de la recherche |
| **Candidat** | `CardCandidate` | Un des éléments possibles quand le nom tapé est ambigu |
| **Mettre à jour la fiche** | `NoteCard.refresh` | Relancer la recherche en gardant les cases corrigées à la main |
| **Section de listes** | `NoteListKindEnum` (`GROCERIES`, `TASKS`) | Courses ou Tâches, la section de l'onglet Listes où vit une liste ; absente pour une note ordinaire |
| **Emoji de la liste** | `NoteListEmoji` | Un emoji facultatif qui distingue une liste sur l'accueil |
| **Ligne** | élément à cocher du document | Un article de courses ou une tâche d'une liste |
| **Qui a coché** | `checkedBy` | Le partenaire qui a coché une ligne ; sa couleur la marque, vue par qui regarde |
| **Fait** | lignes cochées | La partie basse d'une liste, où descendent les lignes cochées |
| **Reste à cocher** | `openItemCount` | Le nombre de lignes pas encore cochées, montré sur l'accueil |
