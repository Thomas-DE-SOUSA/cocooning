import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { MessageCommandFailureFollowUpEnum as FollowUp } from '../view-models/message-command.view-model';
import { resolveMessageCommandFailureFollowUp } from './message-command-failure.presenter';

const aRefusal = (code: ApiError['code']): ApiError => ({
    code,
    message: 'Refused',
    backendCode: null,
});

describe('Feature: what follows a refused command of the messages', () => {
    it.each([
        [ApiErrorCodeEnum.UNAUTHORIZED, FollowUp.SIGN_IN],
        [ApiErrorCodeEnum.NOT_FOUND, FollowUp.REFRESH],
        [ApiErrorCodeEnum.FORBIDDEN, FollowUp.REFRESH],
        [ApiErrorCodeEnum.CONFLICT, FollowUp.REFRESH],
        [ApiErrorCodeEnum.VALIDATION_ERROR, FollowUp.NONE],
        [ApiErrorCodeEnum.NETWORK_ERROR, FollowUp.NONE],
    ])('answers %s with %s', (code, followUp) => {
        expect(resolveMessageCommandFailureFollowUp(aRefusal(code))).toBe(
            followUp,
        );
    });
});
