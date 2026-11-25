import type { NoteCardNameForm } from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { useCallback, useState, useTransition } from 'react';
import type { NoteCardCommandGateway } from '../gateways/ports/note-card-command.gateway';
import {
    type NoteCardCommand,
    NoteCardCommandEnum,
} from '../view-models/note-card-command.view-model';

type Options = {
    readonly gateway: NoteCardCommandGateway;
    readonly onDone: (command: NoteCardCommand) => void;
    readonly onFailed: (command: NoteCardCommand, error: ApiError) => void;
};

type Send = () => Promise<Result<null, ApiError>>;

// One card command at a time, like the sheets of the notes: onDone runs inside the transition, so the button spins
// until the page read again shows (decision 0036).
export function useNoteCardCommands({ gateway, onDone, onFailed }: Options) {
    const [isPending, startTransition] = useTransition();
    const [lastCommand, setLastCommand] = useState<NoteCardCommand | null>(
        null,
    );
    const run = useCallback(
        (command: NoteCardCommand, send: Send) => {
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
    return {
        addNoteCard: (folderId: string, form: NoteCardNameForm) =>
            run(NoteCardCommandEnum.ADD, () =>
                gateway.addNoteCard(folderId, form),
            ),
        pending: isPending ? lastCommand : null,
        isBusy: isPending,
    };
}
