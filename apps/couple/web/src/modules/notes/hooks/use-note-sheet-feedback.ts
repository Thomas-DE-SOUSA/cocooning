import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { toast } from '@cocooning/design-system';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { describeApiResultError } from '@/shared/application/api-result/describe-api-result-error';
import { NOTE_SPACE_NAMESPACE } from '../data/note-space-i18n-namespaces';
import { NOTE_SHEET_FAILURE_KEYS } from '../data/note-sheet-toast-keys';
import { resolveNoteCommandFailureFollowUp } from '../presenters/note-command-failure.presenter';
import { NoteCommandFailureFollowUpEnum as FollowUp } from '../view-models/note-command.view-model';
import type { NoteSheetCommand } from '../view-models/note-sheet-command.view-model';

// After a command the sheet closes and the page reads the place again (decision 0036). A refusal says why in a toast
// (decision 0010), then signs in again, or reads again a place the other partner changed meanwhile.
export function useNoteSheetFeedback(onClose: () => void) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    const router = useRouter();
    const closeAndRefresh = useCallback(() => {
        onClose();
        router.refresh();
    }, [onClose, router]);
    const onFailed = useCallback(
        (command: NoteSheetCommand, error: ApiError) => {
            toast.error(t(NOTE_SHEET_FAILURE_KEYS[command]), {
                description: describeApiResultError(error, t),
            });
            const followUp = resolveNoteCommandFailureFollowUp(error);
            if (followUp === FollowUp.SIGN_IN) {
                router.replace(WebRouterEnum.ACCOUNT_SIGN_IN);
            }
            if (followUp === FollowUp.REFRESH) closeAndRefresh();
        },
        [t, router, closeAndRefresh],
    );
    return { onDone: closeAndRefresh, onFailed };
}
