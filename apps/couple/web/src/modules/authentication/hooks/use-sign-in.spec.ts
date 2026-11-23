import {
    ApiErrorCodeEnum,
    type ApiError,
} from '@cocooning/couple-client-business-logic/shared';
import { fail } from '@cocooning/shared-kernel/utils';
import { act, renderHook } from '@testing-library/react';
import { FakeAuthenticationCommandGateway } from '../gateways/fake/fake-authentication-command.gateway';
import { useSignIn } from './use-sign-in';

const FORM = {
    emailAddress: 'thomas@cocooning.test',
    password: 'correct horse battery',
};
const REFUSAL: ApiError = {
    code: ApiErrorCodeEnum.UNAUTHORIZED,
    message: 'Invalid credentials',
    backendCode: 'AUTHENTICATION_CREDENTIALS_INVALID',
};

function renderSignIn(gateway: FakeAuthenticationCommandGateway) {
    const events: string[] = [];
    const failures: ApiError[] = [];
    const { result } = renderHook(() =>
        useSignIn({
            gateway,
            onSignedIn: () => events.push('signedIn'),
            onSignInFailed: (error) => failures.push(error),
        }),
    );
    return { result, events, failures };
}

describe('Feature: signing in from the form', () => {
    describe('Scenario: the credentials are accepted', () => {
        it('sends the form once and reports the success', async () => {
            const gateway = new FakeAuthenticationCommandGateway();
            const { result, events, failures } = renderSignIn(gateway);

            await act(async () => result.current.signIn(FORM));

            expect(gateway.calls).toEqual([
                { operation: 'signIn', form: FORM },
            ]);
            expect(events).toEqual(['signedIn']);
            expect(failures).toEqual([]);
            expect(result.current.isPending).toBe(false);
        });
    });

    describe('Scenario: the credentials are refused', () => {
        it('reports the refusal without signing in', async () => {
            const gateway = new FakeAuthenticationCommandGateway();
            gateway.givenSignInOutcome(fail(REFUSAL));
            const { result, events, failures } = renderSignIn(gateway);

            await act(async () => result.current.signIn(FORM));

            expect(failures).toEqual([REFUSAL]);
            expect(events).toEqual([]);
        });
    });
});
