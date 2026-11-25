import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { NoteSheetGateways } from '../gateways/ports/note-sheet.gateways';
import { NoteSheetCommandEnum } from '../view-models/note-sheet-command.view-model';
import type { NoteListItem } from '../view-models/notes-screen.view-model';
import { useNoteSheetCommands } from './use-note-sheet-commands';
import { useNoteSheetFeedback } from './use-note-sheet-feedback';

type Options = {
    readonly gateways: NoteSheetGateways;
    readonly note: NoteListItem;
    readonly exitHref: string | null;
    readonly onClose: () => void;
};

// Composition hook of the sheet of a note: R7, its owner deletes it after one more question, since it goes for both;
// from the page of the note, the partner then goes back to the place it was in.
export function useNoteActionsSheet({
    gateways,
    note,
    exitHref,
    onClose,
}: Options) {
    const [isDeletionAsked, setIsDeletionAsked] = useState(false);
    const router = useRouter();
    const { onDone, onFailed } = useNoteSheetFeedback(onClose);
    const onDeleted = useCallback(() => {
        if (exitHref === null) {
            onDone();
            return;
        }
        onClose();
        router.replace(exitHref);
    }, [exitHref, onDone, onClose, router]);
    const commands = useNoteSheetCommands({
        gateways,
        onDone: onDeleted,
        onFailed,
    });
    return {
        isDeletionAsked,
        askDeletion: () => setIsDeletionAsked(true),
        isDeleting: commands.pending === NoteSheetCommandEnum.DELETE_NOTE,
        isBusy: commands.isBusy,
        deleteNote: () => commands.deleteNote(note.noteId),
    };
}
