import type { NoteTitleForm } from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import type { Result } from '@cocooning/shared-kernel/utils';
import { useCallback, useState, useTransition } from 'react';
import type { NoteCommandGateway } from '../gateways/ports/note-command.gateway';
import {
    type NoteCommand,
    NoteCommandEnum,
    type PendingNoteCommand,
} from '../view-models/note-command.view-model';
import type { NoteLocation } from '../view-models/note-place.view-model';

// R2: the list of the home creates its notes at the root of « Partagé ».
const SHARED_ROOT: NoteLocation = {
    space: NoteSpaceEnum.SHARED,
    folderId: null,
};

type Options = {
    readonly gateway: NoteCommandGateway;
    readonly onDone: (command: NoteCommand) => void;
    readonly onFailed: (command: NoteCommand, error: ApiError) => void;
};

// onDone runs inside the transition: the button spins until the refreshed page shows (decision 0036).
export function useNoteCommands({ gateway, onDone, onFailed }: Options) {
    const [isPending, startTransition] = useTransition();
    const [lastCommand, setLastCommand] = useState<PendingNoteCommand | null>(
        null,
    );
    const run = useCallback(
        (
            pending: PendingNoteCommand,
            send: () => Promise<Result<null, ApiError>>,
        ) => {
            setLastCommand(pending);
            startTransition(async () => {
                const result = await send();
                if (result.success) {
                    onDone(pending.command);
                    return;
                }
                onFailed(pending.command, result.error);
            });
        },
        [onDone, onFailed],
    );
    const createNote = useCallback(
        (form: NoteTitleForm) =>
            run({ command: NoteCommandEnum.CREATE_NOTE, noteId: null }, () =>
                gateway.createNote(form, SHARED_ROOT),
            ),
        [run, gateway],
    );
    // One command at a time: every button waits while isBusy, only the pending one spins.
    return {
        createNote,
        deleteNote: (noteId: string) =>
            run({ command: NoteCommandEnum.DELETE_NOTE, noteId }, () =>
                gateway.deleteNote(noteId),
            ),
        pending: isPending ? lastCommand : null,
        isBusy: isPending,
    };
}
