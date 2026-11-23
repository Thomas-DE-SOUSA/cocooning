import type { NoteTitleForm } from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { toast } from '@cocooning/design-system';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { describeApiResultError } from '@/shared/application/api-result/describe-api-result-error';
import { useRefreshOnReturn } from '@/shared/application/refresh/use-refresh-on-return';
import { NOTE_NAMESPACE } from '../data/note-page-i18n-namespaces';
import type { NoteCommandGateway } from '../gateways/ports/note-command.gateway';
import { resolveNoteCommandFailureFollowUp } from '../presenters/note-command-failure.presenter';
import { NoteCommandFailureFollowUpEnum } from '../view-models/note-command.view-model';
import { useNoteTitleForm } from './use-note-title-form';
import { useRenameNote } from './use-rename-note';

type Note = { readonly noteId: string; readonly title: string };

// Composition hook of the page of a note: router, toasts and form reset live here, not in the container.
export function useNotePageScreen(gateway: NoteCommandGateway, note: Note) {
    const { t } = useTranslation(NOTE_NAMESPACE);
    const router = useRouter();
    const titleForm = useNoteTitleForm(NOTE_NAMESPACE, note.title);
    const refresh = useCallback(() => router.refresh(), [router]);
    useRefreshOnReturn(refresh);
    const onDone = useCallback(
        (form: NoteTitleForm) => {
            titleForm.reset(form);
            refresh();
        },
        [titleForm, refresh],
    );
    // A note made private or deleted by the other is read again: the page then goes back to the list.
    const onFailed = useCallback(
        (error: ApiError) => {
            toast.error(t('toast.renameFailed'), {
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
    const rename = useRenameNote({
        gateway,
        noteId: note.noteId,
        onDone,
        onFailed,
    });
    return {
        ...rename,
        titleForm,
        refresh,
        describeError: (error: ApiError) => describeApiResultError(error, t),
    };
}
