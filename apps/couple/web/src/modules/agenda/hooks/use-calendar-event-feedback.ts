import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { toast } from '@cocooning/design-system';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { describeApiResultError } from '@/shared/application/api-result/describe-api-result-error';
import { AGENDA_NAMESPACE } from '../data/agenda-i18n-namespaces';
import {
    CALENDAR_EVENT_DONE_KEYS,
    CALENDAR_EVENT_FAILURE_KEYS,
} from '../data/calendar-event-toast-keys';
import { resolveCalendarEventCommandFailureFollowUp } from '../presenters/calendar-event-command-failure.presenter';
import {
    type CalendarEventCommand,
    CalendarEventCommandFailureFollowUpEnum as FollowUp,
} from '../view-models/calendar-event-command.view-model';

// What the partner sees after a command: a toast, the drawer closed and the month read again (the address keeps the day, decision 0048).
export function useCalendarEventFeedback(onClose: () => void) {
    const { t } = useTranslation(AGENDA_NAMESPACE);
    const router = useRouter();
    const closeAndRefresh = useCallback(() => {
        onClose();
        router.refresh();
    }, [onClose, router]);
    const onDone = useCallback(
        (command: CalendarEventCommand) => {
            toast.success(t(CALENDAR_EVENT_DONE_KEYS[command]));
            closeAndRefresh();
        },
        [t, closeAndRefresh],
    );
    const onFailed = useCallback(
        (command: CalendarEventCommand, error: ApiError) => {
            toast.error(t(CALENDAR_EVENT_FAILURE_KEYS[command]), {
                description: describeApiResultError(error, t),
            });
            const followUp = resolveCalendarEventCommandFailureFollowUp(error);
            if (followUp === FollowUp.SIGN_IN) {
                router.replace(WebRouterEnum.ACCOUNT_SIGN_IN);
            }
            if (followUp === FollowUp.REFRESH) closeAndRefresh();
        },
        [t, router, closeAndRefresh],
    );
    return { onDone, onFailed };
}
