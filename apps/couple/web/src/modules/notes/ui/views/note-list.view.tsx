'use client';

import { useTranslation } from 'react-i18next';
import { NOTES_NAMESPACE } from '../../data/notes-i18n-namespaces';
import type { PendingNoteCommand } from '../../view-models/note-command.view-model';
import type { NoteListItem } from '../../view-models/notes-screen.view-model';
import { NoteItem } from '../components/note-item';

type Props = {
    readonly notes: readonly NoteListItem[];
    readonly pending: PendingNoteCommand | null;
    readonly isBusy: boolean;
    readonly deletionAsked: string | null;
    readonly onAskDeletion: (noteId: string) => void;
    readonly onConfirmDeletion: (noteId: string) => void;
    readonly onKeep: () => void;
};

export function NoteListView({ notes, pending, ...props }: Props) {
    const { t } = useTranslation(NOTES_NAMESPACE);
    if (notes.length === 0) {
        return (
            <p className="text-center text-sm text-muted-foreground">
                {t('empty')}
            </p>
        );
    }
    return (
        <ul className="flex w-full flex-col gap-3">
            {notes.map((note) => (
                <NoteItem
                    key={note.noteId}
                    note={note}
                    pendingCommand={
                        pending?.noteId === note.noteId ? pending.command : null
                    }
                    isBusy={props.isBusy}
                    isDeletionAsked={props.deletionAsked === note.noteId}
                    onAskDeletion={() => props.onAskDeletion(note.noteId)}
                    onConfirmDeletion={() =>
                        props.onConfirmDeletion(note.noteId)
                    }
                    onKeep={props.onKeep}
                />
            ))}
        </ul>
    );
}
