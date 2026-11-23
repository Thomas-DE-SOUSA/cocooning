import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { CommandFailureFollowUpEnum } from '../view-models/pairing-screen.view-model';
import { resolveCommandFailureFollowUp } from './command-failure.presenter';

const aRefusal = (
    code: (typeof ApiErrorCodeEnum)[keyof typeof ApiErrorCodeEnum],
) => ({ code, message: 'Refused', backendCode: null });

describe('Feature: what follows a refused pairing command', () => {
    it.each([
        [ApiErrorCodeEnum.UNAUTHORIZED, CommandFailureFollowUpEnum.SIGN_IN],
        [ApiErrorCodeEnum.CONFLICT, CommandFailureFollowUpEnum.REFRESH],
        [ApiErrorCodeEnum.NOT_FOUND, CommandFailureFollowUpEnum.REFRESH],
        [ApiErrorCodeEnum.VALIDATION_ERROR, CommandFailureFollowUpEnum.NONE],
        [ApiErrorCodeEnum.NETWORK_ERROR, CommandFailureFollowUpEnum.NONE],
    ])('answers %s with %s', (code, followUp) => {
        expect(resolveCommandFailureFollowUp(aRefusal(code))).toBe(followUp);
    });
});
