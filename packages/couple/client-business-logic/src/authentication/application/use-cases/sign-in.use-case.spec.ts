import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { type ApiError, ApiErrorCodeEnum } from '../../../shared/api-error';
import {
    A_SESSION,
    FakeAuthenticationGateway,
} from '../../../testing/fake-authentication.gateway';
import { SignInUseCase } from './sign-in.use-case';

const FORM = {
    emailAddress: 'thomas@cocooning.test',
    password: 'correct horse battery staple',
};
const CLIENT = { ipAddress: '100.64.0.7', userAgent: 'Mozilla/5.0 (iPhone)' };

describe('Feature: a partner signs in from the PWA', () => {
    let gateway: FakeAuthenticationGateway;
    let useCase: SignInUseCase;

    beforeEach(() => {
        gateway = new FakeAuthenticationGateway();
        useCase = new SignInUseCase(gateway);
    });

    describe('Scenario: the API opens a session', () => {
        it('returns the session for the server action to set its cookie', async () => {
            await expect(useCase.execute(FORM, CLIENT)).resolves.toEqual(
                ok(A_SESSION),
            );
        });

        it('sends the credentials and the browser context once', async () => {
            await useCase.execute(FORM, CLIENT);
            expect(gateway.calls).toEqual([
                { operation: 'signIn', request: FORM, client: CLIENT },
            ]);
        });
    });

    describe('Scenario: R3, the API refuses the credentials', () => {
        it('returns the refusal unchanged', async () => {
            const refusal: ApiError = {
                code: ApiErrorCodeEnum.UNAUTHORIZED,
                message: 'Invalid credentials',
                backendCode:
                    AuthenticationExceptionCodeEnum.AUTHENTICATION_CREDENTIALS_INVALID,
            };
            gateway.givenRefusal(refusal);
            await expect(useCase.execute(FORM, CLIENT)).resolves.toEqual(
                fail(refusal),
            );
        });
    });
});
