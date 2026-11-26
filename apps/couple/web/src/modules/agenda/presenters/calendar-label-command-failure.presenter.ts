import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import {
    type CalendarEventCommandFailureFollowUp,
    CalendarEventCommandFailureFollowUpEnum as FollowUp,
} from '../view-models/calendar-event-command.view-model';

// A refused session goes back to sign-in; a label the other partner changed or deleted is read again. The 21st label
// (CONFLICT, CALENDAR_LABEL_LIMIT_REACHED) only says so: reading again would change nothing.
export function resolveCalendarLabelCommandFailureFollowUp(
    error: ApiError,
): CalendarEventCommandFailureFollowUp {
    if (error.code === ApiErrorCodeEnum.UNAUTHORIZED) return FollowUp.SIGN_IN;
    if (error.code === ApiErrorCodeEnum.NOT_FOUND) return FollowUp.REFRESH;
    if (
        error.backendCode ===
        AgendaExceptionCodeEnum.CALENDAR_LABEL_VERSION_CONFLICT
    ) {
        return FollowUp.REFRESH;
    }
    return FollowUp.NONE;
}
