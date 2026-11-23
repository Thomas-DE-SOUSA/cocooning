import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { type ApiError, ApiErrorCodeEnum } from '../../../shared/api-error';
import { FakeAuthenticationGateway } from '../../../testing/fake-authentication.gateway';
import { SignOutUseCase } from './sign-out.use-case';

describe('Feature: a partner signs out from the PWA', () => {
    let gateway: FakeAuthenticationGateway;
    let useCase: SignOutUseCase;

    beforeEach(() => {
        gateway = new FakeAuthenticationGateway();
        useCase = new SignOutUseCase(gateway);
    });

    describe('Scenario: decision 0034, the API closes the sessions of every device', () => {
        it('returns a success once the API answered', async () => {
            await expect(useCase.execute()).resolves.toEqual(ok(null));
            expect(gateway.calls).toEqual([{ operation: 'signOut' }]);
        });
    });

    describe('Scenario: the API already refuses the session', () => {
        it('counts the session as closed', async () => {
            gateway.givenSignOutRefusal({
                code: ApiErrorCodeEnum.UNAUTHORIZED,
                message: 'Session invalid',
                backendCode:
                    AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_INVALID,
            });

            await expect(useCase.execute()).resolves.toEqual(ok(null));
        });
    });

    describe('Scenario: the API cannot be reached', () => {
        it('returns the failure: the other devices are still signed in', async () => {
            const failure: ApiError = {
                code: ApiErrorCodeEnum.NETWORK_ERROR,
                message: 'Failed to fetch',
                backendCode: null,
            };
            gateway.givenSignOutRefusal(failure);

            await expect(useCase.execute()).resolves.toEqual(fail(failure));
        });
    });
});
