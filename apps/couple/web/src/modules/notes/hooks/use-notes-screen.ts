import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { toast } from '@cocooning/design-system';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { describeApiResultError } from '@/shared/application/api-result/describe-api-result-error';
import { useRefreshOnReturn } from '@/shared/application/refresh/use-refresh-on-return';
import { NOTES_NAMESPACE } from '../data/notes-i18n-namespaces';
import type { NoteCommandGateway } from '../gateways/ports/note-command.gateway';
import { resolveNoteCommandFailureFollowUp } from '../presenters/note-command-failure.presenter';
import {
    type NoteCommand,
    NoteCommandEnum,
    NoteCommandFailureFollowUpEnum,
} from '../view-models/note-command.view-model';
import { useNoteCommands } from './use-note-commands';
import { useNoteTitleForm } from './use-note-title-form';

const FAILURE_TITLE_KEYS: Readonly<Record<NoteCommand, string>> = {
    CREATE_NOTE: 'toast.createFailed',
    SHARE_NOTE: 'toast.shareFailed',
    MAKE_NOTE_PRIVATE: 'toast.makePrivateFailed',
    DELETE_NOTE: 'toast.deleteFailed',
};

// Composition hook of the screen: the UI side effects (router, toasts, form reset) live here, not in the container.
export function useNotesScreen(gateway: NoteCommandGateway) {
    const { t } = useTranslation(NOTES_NAMESPACE);
    const router = useRouter();
    const titleForm = useNoteTitleForm(NOTES_NAMESPACE, '');
    const [deletionAsked, setDeletionAsked] = useState<string | null>(null);
    const refresh = useCallback(() => router.refresh(), [router]);
    useRefreshOnReturn(refresh);
    const onDone = useCallback(
        (command: NoteCommand) => {
            if (command === NoteCommandEnum.CREATE_NOTE) titleForm.reset();
            refresh();
        },
        [titleForm, refresh],
    );
    const onFailed = useCallback(
        (command: NoteCommand, error: ApiError) => {
            toast.error(t(FAILURE_TITLE_KEYS[command]), {
                description: describeApiResultError(error, t),
            });
            const followUp = resolveNoteCommandFailureFollowUp(error);
            if (followUp === NoteCommandFailureFollowUpEnum.SIGN_IN) {
                router.replace(WebRouterEnum.ACCOUNT_SIGN_IN);
            }
            if (followUp === NoteCommandFailureFollowUpEnum.REFRESH) refresh();
        },
        [t, router, refresh],
    );
    const commands = useNoteCommands({ gateway, onDone, onFailed });
    return {
        ...commands,
        titleForm,
        refresh,
        deletionAsked,
        askDeletion: setDeletionAsked,
        keepNote: () => setDeletionAsked(null),
        deleteNote: (noteId: string) => {
            setDeletionAsked(null);
            commands.deleteNote(noteId);
        },
        describeError: (error: ApiError) => describeApiResultError(error, t),
    };
}
