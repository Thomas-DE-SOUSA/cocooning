import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { toast } from '@cocooning/design-system';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { describeApiResultError } from '@/shared/application/api-result/describe-api-result-error';
import { NOTE_CARD_NAMESPACE } from '../data/note-card-i18n-namespaces';
import { resolveNoteCommandFailureFollowUp } from '../presenters/note-command-failure.presenter';
import { NoteCommandFailureFollowUpEnum as FollowUp } from '../view-models/note-command.view-model';
import type { NoteCardCommand } from '../view-models/note-card-command.view-model';

// After a card command the page reads the card again (decision 0036). A refusal says why in a toast (decision 0010),
// then signs in again, or reads again a card the other partner changed meanwhile.
export function useNoteCardFeedback() {
    const { t } = useTranslation(NOTE_CARD_NAMESPACE);
    const router = useRouter();
    const refresh = useCallback(() => router.refresh(), [router]);
    const onFailed = useCallback(
        (command: NoteCardCommand, error: ApiError) => {
            toast.error(t(`toast.${command}`), {
                description: describeApiResultError(error, t),
            });
            const followUp = resolveNoteCommandFailureFollowUp(error);
            if (followUp === FollowUp.SIGN_IN) {
                router.replace(WebRouterEnum.ACCOUNT_SIGN_IN);
            }
            if (followUp === FollowUp.REFRESH) refresh();
        },
        [t, router, refresh],
    );
    return { refresh, onFailed };
}
