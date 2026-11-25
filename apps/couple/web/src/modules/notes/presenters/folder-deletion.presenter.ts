import type { TFunction } from 'i18next';

type Counts = { readonly folderCount: number; readonly noteCount: number };

function contentOf(counts: Counts, t: TFunction): string {
    if (counts.noteCount === 0) {
        return t('deletion.foldersAlone', { count: counts.folderCount });
    }
    const notes = t('deletion.notes', { count: counts.noteCount });
    if (counts.folderCount === 0) return notes;
    const folders = t('deletion.folders', { count: counts.folderCount });
    return t('deletion.both', { notes, folders });
}

// R16: what moves up into the place above when a folder is deleted; no note is ever deleted with it.
export function presentFolderDeletion(
    counts: Counts,
    placeName: string,
    t: TFunction,
): string {
    const total = counts.folderCount + counts.noteCount;
    if (total === 0) return t('deletion.empty');
    return t('deletion.movesUp', {
        count: total,
        content: contentOf(counts, t),
        place: placeName,
    });
}
