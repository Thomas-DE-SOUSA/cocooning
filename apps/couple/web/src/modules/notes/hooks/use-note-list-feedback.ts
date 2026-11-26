import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { toast } from '@cocooning/design-system';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { describeApiResultError } from '@/shared/application/api-result/describe-api-result-error';
import { NOTE_LISTS_NAMESPACE } from '../data/note-lists-i18n-namespaces';
import { NOTE_LIST_FAILURE_KEYS } from '../data/note-list-toast-keys';
import { noteListHref } from '../presenters/note-list-href.presenter';
import { resolveNoteCommandFailureFollowUp } from '../presenters/note-command-failure.presenter';
import { NoteCommandFailureFollowUpEnum as FollowUp } from '../view-models/note-command.view-model';
import type { NoteListCommand } from '../view-models/note-list-command.view-model';

// A created list opens at once; a refusal says why in a toast (decision 0010), then signs in again or reads the page
// again when the other partner changed the list meanwhile.
export function useNoteListFeedback() {
    const { t } = useTranslation(NOTE_LISTS_NAMESPACE);
    const router = useRouter();
    const onCreated = useCallback(
        (noteId: string) => router.push(noteListHref(noteId)),
        [router],
    );
    const onFailed = useCallback(
        (command: NoteListCommand, error: ApiError) => {
            toast.error(t(NOTE_LIST_FAILURE_KEYS[command]), {
                description: describeApiResultError(error, t),
            });
            const followUp = resolveNoteCommandFailureFollowUp(error);
            if (followUp === FollowUp.SIGN_IN) {
                router.replace(WebRouterEnum.ACCOUNT_SIGN_IN);
            }
            if (followUp === FollowUp.REFRESH) router.refresh();
        },
        [t, router],
    );
    return { onCreated, onFailed };
}
