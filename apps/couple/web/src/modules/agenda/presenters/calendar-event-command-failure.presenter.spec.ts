import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { CalendarEventCommandFailureFollowUpEnum as FollowUp } from '../view-models/calendar-event-command.view-model';
import { resolveCalendarEventCommandFailureFollowUp } from './calendar-event-command-failure.presenter';

const aRefusal = (
    code: (typeof ApiErrorCodeEnum)[keyof typeof ApiErrorCodeEnum],
) => ({ code, message: 'Refused', backendCode: null });

describe('Feature: what follows a refused command of the drawer', () => {
    it.each([
        [ApiErrorCodeEnum.UNAUTHORIZED, FollowUp.SIGN_IN],
        [ApiErrorCodeEnum.NOT_FOUND, FollowUp.REFRESH],
        [ApiErrorCodeEnum.FORBIDDEN, FollowUp.REFRESH],
        [ApiErrorCodeEnum.CONFLICT, FollowUp.REFRESH],
        [ApiErrorCodeEnum.VALIDATION_ERROR, FollowUp.NONE],
        [ApiErrorCodeEnum.NETWORK_ERROR, FollowUp.NONE],
    ])('answers %s with %s', (code, followUp) => {
        expect(resolveCalendarEventCommandFailureFollowUp(aRefusal(code))).toBe(
            followUp,
        );
    });
});
