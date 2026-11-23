import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { fail } from '@cocooning/shared-kernel/utils';
import { act, renderHook } from '@testing-library/react';
import { FakeAuthenticationCommandGateway } from '../gateways/fake/fake-authentication-command.gateway';
import { useSignOut } from './use-sign-out';

function renderSignOut(gateway: FakeAuthenticationCommandGateway) {
    const events: string[] = [];
    const { result } = renderHook(() =>
        useSignOut({
            gateway,
            onSignedOut: () => events.push('signedOut'),
            onSignOutFailed: (error) => events.push(`failed:${error.code}`),
        }),
    );
    return { result, events };
}

describe('Feature: a partner signs out', () => {
    it('closes the session once and reports it', async () => {
        const gateway = new FakeAuthenticationCommandGateway();
        const { result, events } = renderSignOut(gateway);

        await act(async () => result.current.signOut());

        expect(gateway.calls).toEqual([{ operation: 'signOut' }]);
        expect(events).toEqual(['signedOut']);
        expect(result.current.isPending).toBe(false);
    });

    it('reports a failure and stays signed in', async () => {
        const failure: ApiError = {
            code: ApiErrorCodeEnum.NETWORK_ERROR,
            message: 'Failed to fetch',
            backendCode: null,
        };
        const gateway = new FakeAuthenticationCommandGateway();
        gateway.givenSignOutOutcome(fail(failure));
        const { result, events } = renderSignOut(gateway);

        await act(async () => result.current.signOut());

        expect(events).toEqual(['failed:NETWORK_ERROR']);
    });
});
