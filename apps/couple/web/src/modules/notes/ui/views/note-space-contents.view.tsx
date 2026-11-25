'use client';

import { useTranslation } from 'react-i18next';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';
import type { FolderListItem } from '../../view-models/note-space-screen.view-model';
import type { NoteListItem } from '../../view-models/notes-screen.view-model';
import { FolderRow } from '../components/folder-row';
import { NoteRow } from '../components/note-row';
import { NoteSpaceSection } from '../components/note-space-section';

type Props = {
    readonly folders: readonly FolderListItem[];
    readonly notes: readonly NoteListItem[];
    readonly onFolderActions: (folder: FolderListItem) => void;
};

// R13: the folders of the place first, then its notes.
export function NoteSpaceContentsView({
    folders,
    notes,
    onFolderActions,
}: Props) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    if (folders.length === 0 && notes.length === 0) {
        return (
            <p className="text-center text-sm text-muted-foreground">
                {t('empty')}
            </p>
        );
    }
    return (
        <>
            {folders.length === 0 ? null : (
                <NoteSpaceSection title={t('sections.folders')}>
                    {folders.map((folder) => (
                        <FolderRow
                            key={folder.folderId}
                            folder={folder}
                            onActions={() => onFolderActions(folder)}
                        />
                    ))}
                </NoteSpaceSection>
            )}
            {notes.length === 0 ? null : (
                <NoteSpaceSection title={t('sections.notes')}>
                    {notes.map((note) => (
                        <NoteRow
                            key={note.noteId}
                            note={note}
                        />
                    ))}
                </NoteSpaceSection>
            )}
        </>
    );
}
