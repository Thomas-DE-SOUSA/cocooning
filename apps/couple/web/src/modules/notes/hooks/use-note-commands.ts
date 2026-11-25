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
    const onNote = useCallback(
        (command: NoteCommand, noteId: string) =>
            run({ command, noteId }, () =>
                sendOnNote(gateway, command, noteId),
            ),
        [run, gateway],
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
        shareNote: (noteId: string) =>
            onNote(NoteCommandEnum.SHARE_NOTE, noteId),
        makeNotePrivate: (noteId: string) =>
            onNote(NoteCommandEnum.MAKE_NOTE_PRIVATE, noteId),
        deleteNote: (noteId: string) =>
            onNote(NoteCommandEnum.DELETE_NOTE, noteId),
        pending: isPending ? lastCommand : null,
        isBusy: isPending,
    };
}

function sendOnNote(
    gateway: NoteCommandGateway,
    command: NoteCommand,
    noteId: string,
): Promise<Result<null, ApiError>> {
    if (command === NoteCommandEnum.SHARE_NOTE)
        return gateway.shareNote(noteId);
    if (command === NoteCommandEnum.MAKE_NOTE_PRIVATE) {
        return gateway.makeNotePrivate(noteId);
    }
    return gateway.deleteNote(noteId);
}
