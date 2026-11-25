import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { toast } from '@cocooning/design-system';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { describeApiResultError } from '@/shared/application/api-result/describe-api-result-error';
import {
    MESSAGE_DONE_KEYS,
    MESSAGE_FAILURE_KEYS,
} from '../data/message-toast-keys';
import { MESSAGING_NAMESPACE } from '../data/messaging-i18n-namespaces';
import { resolveMessageCommandFailureFollowUp } from '../presenters/message-command-failure.presenter';
import {
    type MessageCommand,
    MessageCommandFailureFollowUpEnum as FollowUp,
} from '../view-models/message-command.view-model';

// After a command: a short toast, then `settle` closes what the command opened (sheet, preview) and the page reads the feed again.
export function useMessageFeedback(settle: (command: MessageCommand) => void) {
    const { t } = useTranslation(MESSAGING_NAMESPACE);
    const router = useRouter();
    const settleAndRefresh = useCallback(
        (command: MessageCommand) => {
            settle(command);
            router.refresh();
        },
        [settle, router],
    );
    const onDone = useCallback(
        (command: MessageCommand) => {
            toast.success(t(MESSAGE_DONE_KEYS[command]));
            settleAndRefresh(command);
        },
        [t, settleAndRefresh],
    );
    const onFailed = useCallback(
        (command: MessageCommand, error: ApiError) => {
            toast.error(t(MESSAGE_FAILURE_KEYS[command]), {
                description: describeApiResultError(error, t),
            });
            const followUp = resolveMessageCommandFailureFollowUp(error);
            if (followUp === FollowUp.SIGN_IN) {
                router.replace(WebRouterEnum.ACCOUNT_SIGN_IN);
            }
            if (followUp === FollowUp.REFRESH) settleAndRefresh(command);
        },
        [t, router, settleAndRefresh],
    );
    return { onDone, onFailed };
}
