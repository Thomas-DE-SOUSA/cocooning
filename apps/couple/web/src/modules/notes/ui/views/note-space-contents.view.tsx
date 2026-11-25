'use client';

import { useTranslation } from 'react-i18next';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';
import type { FolderListItem } from '../../view-models/note-space-screen.view-model';
import type { NoteRowItem } from '../../view-models/note-card-line.view-model';
import { FolderRow } from '../components/folder-row';
import { NoteRow } from '../components/note-row';
import { NotesSection } from '../components/notes-section';

type Props = {
    readonly folders: readonly FolderListItem[];
    readonly notes: readonly NoteRowItem[];
    readonly onFolderActions: (folder: FolderListItem) => void;
    readonly onNoteActions: (note: NoteRowItem) => void;
};

// R13: the folders of the place first, then its notes.
export function NoteSpaceContentsView({
    folders,
    notes,
    onFolderActions,
    onNoteActions,
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
                <NotesSection title={t('sections.folders')}>
                    {folders.map((folder) => (
                        <FolderRow
                            key={folder.folderId}
                            folder={folder}
                            onActions={() => onFolderActions(folder)}
                        />
                    ))}
                </NotesSection>
            )}
            {notes.length === 0 ? null : (
                <NotesSection title={t('sections.notes')}>
                    {notes.map((note) => (
                        <NoteRow
                            key={note.noteId}
                            note={note}
                            onActions={() => onNoteActions(note)}
                        />
                    ))}
                </NotesSection>
            )}
        </>
    );
}
