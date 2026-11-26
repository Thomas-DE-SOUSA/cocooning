import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { toast } from '@cocooning/design-system';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { describeApiResultError } from '@/shared/application/api-result/describe-api-result-error';
import {
    CALENDAR_LABEL_DONE_KEYS,
    CALENDAR_LABEL_FAILURE_KEYS,
} from '../data/calendar-label-toast-keys';
import { CALENDAR_LABELS_NAMESPACE } from '../data/calendar-labels-i18n-namespace';
import { resolveCalendarLabelCommandFailureFollowUp } from '../presenters/calendar-label-command-failure.presenter';
import type { CalendarLabelItem } from '../view-models/calendar-label.view-model';
import type { CalendarLabelCommand } from '../view-models/calendar-label-command.view-model';
import { CalendarEventCommandFailureFollowUpEnum as FollowUp } from '../view-models/calendar-event-command.view-model';

type Options = {
    readonly onDone: (
        command: CalendarLabelCommand,
        label: CalendarLabelItem | null,
    ) => void;
    readonly onStale: () => void;
};

// A toast after each label command; what follows a success, or a label changed meanwhile, is the caller's.
export function useCalendarLabelFeedback({ onDone, onStale }: Options) {
    const { t } = useTranslation(CALENDAR_LABELS_NAMESPACE);
    const router = useRouter();
    const done = useCallback(
        (command: CalendarLabelCommand, label: CalendarLabelItem | null) => {
            toast.success(t(CALENDAR_LABEL_DONE_KEYS[command]));
            onDone(command, label);
        },
        [t, onDone],
    );
    const failed = useCallback(
        (command: CalendarLabelCommand, error: ApiError) => {
            toast.error(t(CALENDAR_LABEL_FAILURE_KEYS[command]), {
                description: describeApiResultError(error, t),
            });
            const followUp = resolveCalendarLabelCommandFailureFollowUp(error);
            if (followUp === FollowUp.SIGN_IN) {
                router.replace(WebRouterEnum.ACCOUNT_SIGN_IN);
            }
            if (followUp === FollowUp.REFRESH) onStale();
        },
        [t, router, onStale],
    );
    return { onDone: done, onFailed: failed };
}
