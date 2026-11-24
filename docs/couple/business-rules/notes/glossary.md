# Glossaire des notes

Les termes propres aux notes, avec leur nom dans le code. Les termes communs (note, note perso ou partagée, liste de courses, couple, partenaire, propriétaire) sont dans le [glossaire transverse](../../../architecture/glossary.md).

| Terme | Nom dans le code | Définition |
|---|---|---|
| **Titre** | `NoteTitle` | Le nom de la note dans la liste, modifiable par ceux qui la voient |
| **Contenu** | document de la note (Yjs) | Le texte riche de la note : titres, listes, cases à cocher, mise en forme ; synchronisé entre les deux appareils |
| **Partager / rendre privée** | `Note.share`, `Note.makePrivate` | Changer la visibilité d'une note, par sa propriétaire |
| **Supprimer la note** | `Note.delete` | Retirer la note pour les deux, par sa propriétaire (suppression douce) |
