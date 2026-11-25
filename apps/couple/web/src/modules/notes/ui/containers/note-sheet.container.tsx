'use client';

import { noteSheetGateways } from '../../gateways';
import { useNoteActionsSheet } from '../../hooks/use-note-actions-sheet';
import { presentMovedNote } from '../../presenters/moved-item.presenter';
import type { NotePlaceLevel } from '../../view-models/note-space-screen.view-model';
import {
    NoteSheetKindEnum,
    type NoteSheetTarget,
} from '../../view-models/note-sheet.view-model';
import type { NoteListItem } from '../../view-models/notes-screen.view-model';
import { NoteActionsSheetView } from '../views/note-actions-sheet.view';
import { NoteDeletionSheetView } from '../views/note-deletion-sheet.view';

type Props = {
    readonly note: NoteListItem;
    readonly level: NotePlaceLevel;
    readonly exitHref: string | null;
    readonly onClose: () => void;
    readonly onOpen: (target: NoteSheetTarget) => void;
};

// The sheet of a note; « Déplacer » turns it into the move picker, starting from the level of the note.
export function NoteSheetContainer({
    note,
    level,
    exitHref,
    onClose,
    onOpen,
}: Props) {
    const sheet = useNoteActionsSheet({
        gateways: noteSheetGateways,
        note,
        exitHref,
        onClose,
    });
    if (sheet.isDeletionAsked) {
        return (
            <NoteDeletionSheetView
                title={note.title}
                isPending={sheet.isDeleting}
                isBusy={sheet.isBusy}
                onConfirm={sheet.deleteNote}
                onKeep={onClose}
            />
        );
    }
    return (
        <NoteActionsSheetView
            note={note}
            onMove={() =>
                onOpen({
                    kind: NoteSheetKindEnum.MOVE,
                    item: presentMovedNote(note, level.place),
                    level,
                })
            }
            onAskDeletion={sheet.askDeletion}
        />
    );
}
