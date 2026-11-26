import type { NoteListForm } from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { useCallback, useState, useTransition } from 'react';
import type { NoteListCommandGateway } from '../gateways/ports/note-list-command.gateway';
import {
    type NoteListCommand,
    NoteListCommandEnum,
} from '../view-models/note-list-command.view-model';

type Options = {
    readonly gateway: NoteListCommandGateway;
    readonly onCreated: (noteId: string) => void;
    readonly onFailed: (command: NoteListCommand, error: ApiError) => void;
};

// One command at a time; the follow-up runs inside the transition, so the button spins until the next page shows.
export function useNoteListCommands({ gateway, onCreated, onFailed }: Options) {
    const [isPending, startTransition] = useTransition();
    const [lastCommand, setLastCommand] = useState<NoteListCommand | null>(
        null,
    );
    const run = useCallback(
        <T>(
            command: NoteListCommand,
            send: () => Promise<Result<T, ApiError>>,
            onDone: (value: T) => void,
        ) => {
            setLastCommand(command);
            startTransition(async () => {
                const result = await send();
                if (result.success) onDone(result.value);
                else onFailed(command, result.error);
            });
        },
        [onFailed],
    );
    return {
        createList: (form: NoteListForm) =>
            run(
                NoteListCommandEnum.CREATE_LIST,
                () => gateway.createList(form),
                onCreated,
            ),
        pending: isPending ? lastCommand : null,
        isBusy: isPending,
    };
}
