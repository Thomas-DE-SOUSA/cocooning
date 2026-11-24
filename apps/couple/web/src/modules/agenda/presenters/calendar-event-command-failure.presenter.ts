import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    type CalendarEventCommandFailureFollowUp,
    CalendarEventCommandFailureFollowUpEnum,
} from '../view-models/calendar-event-command.view-model';

const STALE_AGENDA_CODES: readonly ApiError['code'][] = [
    ApiErrorCodeEnum.NOT_FOUND,
    ApiErrorCodeEnum.FORBIDDEN,
    ApiErrorCodeEnum.CONFLICT,
];

// Decision 0036: a refused session goes back to sign-in; an event changed by the other partner (made private, deleted) is read again.
export function resolveCalendarEventCommandFailureFollowUp(
    error: ApiError,
): CalendarEventCommandFailureFollowUp {
    if (error.code === ApiErrorCodeEnum.UNAUTHORIZED) {
        return CalendarEventCommandFailureFollowUpEnum.SIGN_IN;
    }
    if (STALE_AGENDA_CODES.includes(error.code)) {
        return CalendarEventCommandFailureFollowUpEnum.REFRESH;
    }
    return CalendarEventCommandFailureFollowUpEnum.NONE;
}
