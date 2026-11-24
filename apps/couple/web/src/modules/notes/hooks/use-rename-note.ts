import type { NoteTitleForm } from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { useCallback, useTransition } from 'react';
import type { NoteCommandGateway } from '../gateways/ports/note-command.gateway';

type Options = {
    readonly gateway: NoteCommandGateway;
    readonly noteId: string;
    readonly onDone: (form: NoteTitleForm) => void;
    readonly onFailed: (error: ApiError) => void;
};

// onDone runs inside the transition: the button spins until the refreshed page shows (decision 0036).
export function useRenameNote({ gateway, noteId, onDone, onFailed }: Options) {
    const [isPending, startTransition] = useTransition();
    const renameNote = useCallback(
        (form: NoteTitleForm) =>
            startTransition(async () => {
                const result = await gateway.renameNote(noteId, form);
                if (result.success) {
                    onDone(form);
                    return;
                }
                onFailed(result.error);
            }),
        [gateway, noteId, onDone, onFailed],
    );
    return { renameNote, isRenaming: isPending };
}
