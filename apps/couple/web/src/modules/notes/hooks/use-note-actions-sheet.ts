import { useState } from 'react';
import type { NoteSheetGateways } from '../gateways/ports/note-sheet.gateways';
import { NoteSheetCommandEnum } from '../view-models/note-sheet-command.view-model';
import type { NoteListItem } from '../view-models/notes-screen.view-model';
import { useNoteSheetCommands } from './use-note-sheet-commands';
import { useNoteSheetFeedback } from './use-note-sheet-feedback';

type Options = {
    readonly gateways: NoteSheetGateways;
    readonly note: NoteListItem;
    readonly onClose: () => void;
};

// Composition hook of the sheet of a note: R7, its owner deletes it after one more question, since it goes for both.
export function useNoteActionsSheet({ gateways, note, onClose }: Options) {
    const [isDeletionAsked, setIsDeletionAsked] = useState(false);
    const feedback = useNoteSheetFeedback(onClose);
    const commands = useNoteSheetCommands({ gateways, ...feedback });
    return {
        isDeletionAsked,
        askDeletion: () => setIsDeletionAsked(true),
        isDeleting: commands.pending === NoteSheetCommandEnum.DELETE_NOTE,
        isBusy: commands.isBusy,
        deleteNote: () => commands.deleteNote(note.noteId),
    };
}
