import type {
    FolderNameForm,
    NoteTitleForm,
    SmartFolderForm,
} from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { useCallback, useState, useTransition } from 'react';
import type { NoteSheetGateways } from '../gateways/ports/note-sheet.gateways';
import type { NoteLocation } from '../view-models/note-place.view-model';
import {
    type NoteSheetCommand,
    NoteSheetCommandEnum,
} from '../view-models/note-sheet-command.view-model';

type Options = {
    readonly gateways: NoteSheetGateways;
    readonly onDone: (command: NoteSheetCommand) => void;
    readonly onFailed: (command: NoteSheetCommand, error: ApiError) => void;
};

type Send = () => Promise<Result<null, ApiError>>;

// One command at a time: every button of the sheet waits while isBusy, only the pending one spins. onDone runs inside
// the transition: the button spins until the refreshed page shows (decision 0036).
export function useNoteSheetCommands({ gateways, onDone, onFailed }: Options) {
    const [isPending, startTransition] = useTransition();
    const [lastCommand, setLastCommand] = useState<NoteSheetCommand | null>(
        null,
    );
    const run = useCallback(
        (command: NoteSheetCommand, send: Send) => {
            setLastCommand(command);
            startTransition(async () => {
                const result = await send();
                if (result.success) {
                    onDone(command);
                    return;
                }
                onFailed(command, result.error);
            });
        },
        [onDone, onFailed],
    );
    const { notes, folders } = gateways;
    return {
        createNote: (form: NoteTitleForm, destination: NoteLocation) =>
            run(NoteSheetCommandEnum.CREATE_NOTE, () =>
                notes.createNote(form, destination),
            ),
        createFolder: (
            form: FolderNameForm | SmartFolderForm,
            destination: NoteLocation,
        ) =>
            run(NoteSheetCommandEnum.CREATE_FOLDER, () =>
                folders.createFolder(form, destination),
            ),
        renameFolder: (folderId: string, form: FolderNameForm) =>
            run(NoteSheetCommandEnum.RENAME_FOLDER, () =>
                folders.renameFolder(folderId, form),
            ),
        deleteFolder: (folderId: string) =>
            run(NoteSheetCommandEnum.DELETE_FOLDER, () =>
                folders.deleteFolder(folderId),
            ),
        moveFolder: (folderId: string, parentFolderId: string | null) =>
            run(NoteSheetCommandEnum.MOVE_FOLDER, () =>
                folders.moveFolder(folderId, parentFolderId),
            ),
        moveNote: (noteId: string, destination: NoteLocation) =>
            run(NoteSheetCommandEnum.MOVE_NOTE, () =>
                notes.moveNote(noteId, destination),
            ),
        deleteNote: (noteId: string) =>
            run(NoteSheetCommandEnum.DELETE_NOTE, () =>
                notes.deleteNote(noteId),
            ),
        pending: isPending ? lastCommand : null,
        isBusy: isPending,
    };
}
