import type {
    FolderNameForm,
    NoteTitleForm,
} from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { useCallback, useState, useTransition } from 'react';
import type { FolderCommandGateway } from '../gateways/ports/folder-command.gateway';
import type { NoteCommandGateway } from '../gateways/ports/note-command.gateway';
import type { NoteLocation } from '../view-models/note-place.view-model';
import {
    type NoteSheetCommand,
    NoteSheetCommandEnum,
} from '../view-models/note-sheet-command.view-model';

type Options = {
    readonly gateways: {
        readonly notes: NoteCommandGateway;
        readonly folders: FolderCommandGateway;
    };
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
        createFolder: (form: FolderNameForm, destination: NoteLocation) =>
            run(NoteSheetCommandEnum.CREATE_FOLDER, () =>
                folders.createFolder(form, destination),
            ),
        pending: isPending ? lastCommand : null,
        isBusy: isPending,
    };
}
