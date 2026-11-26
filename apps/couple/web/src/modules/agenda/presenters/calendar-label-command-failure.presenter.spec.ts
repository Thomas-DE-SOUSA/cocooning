import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { CalendarEventCommandFailureFollowUpEnum as FollowUp } from '../view-models/calendar-event-command.view-model';
import { resolveCalendarLabelCommandFailureFollowUp } from './calendar-label-command-failure.presenter';

const aRefusal = (
    code: ApiError['code'],
    backendCode: string | null,
): ApiError => ({ code, message: 'Refused', backendCode });

describe('Feature: what follows a refused label command', () => {
    it.each([
        [
            'a refused session',
            aRefusal(ApiErrorCodeEnum.UNAUTHORIZED, null),
            FollowUp.SIGN_IN,
        ],
        [
            'a label deleted by the other partner',
            aRefusal(ApiErrorCodeEnum.NOT_FOUND, 'CALENDAR_LABEL_NOT_FOUND'),
            FollowUp.REFRESH,
        ],
        [
            'a label changed at the same time',
            aRefusal(
                ApiErrorCodeEnum.CONFLICT,
                'CALENDAR_LABEL_VERSION_CONFLICT',
            ),
            FollowUp.REFRESH,
        ],
        [
            'the 21st label',
            aRefusal(ApiErrorCodeEnum.CONFLICT, 'CALENDAR_LABEL_LIMIT_REACHED'),
            FollowUp.NONE,
        ],
        [
            'a network error',
            aRefusal(ApiErrorCodeEnum.NETWORK_ERROR, null),
            FollowUp.NONE,
        ],
    ])('%s', (_label, error, followUp) => {
        expect(resolveCalendarLabelCommandFailureFollowUp(error)).toBe(
            followUp,
        );
    });
});
