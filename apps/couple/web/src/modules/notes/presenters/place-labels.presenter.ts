import type { TFunction } from 'i18next';
import type { NotePlace } from '../view-models/note-place.view-model';

type Counts = { readonly folderCount: number; readonly noteCount: number };

// R10: a space root is named by the screen's spaces.<SPACE>.name, a folder by its own name.
export const presentPlaceName = (place: NotePlace, t: TFunction): string =>
    place.folder === null ? t(`spaces.${place.space}.name`) : place.folder.name;

// "2 dossiers · 8 notes", without the part that is zero; "Vide" when the folder holds nothing.
export function presentFolderContents(counts: Counts, t: TFunction): string {
    const parts = [
        counts.folderCount > 0
            ? t('folder.folderCount', { count: counts.folderCount })
            : null,
        counts.noteCount > 0
            ? t('folder.noteCount', { count: counts.noteCount })
            : null,
    ].filter((part) => part !== null);
    return parts.length === 0 ? t('folder.empty') : parts.join(' · ');
}
