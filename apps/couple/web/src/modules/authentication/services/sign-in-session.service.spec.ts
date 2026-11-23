import { SignInUseCase } from '@cocooning/couple-client-business-logic/authentication';
import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import {
    A_SESSION,
    FakeAuthenticationGateway,
} from '@cocooning/couple-client-business-logic/testing';
import { SESSION_COOKIE_NAME } from '@cocooning/couple-contract/authentication';
import {
    openSignInSession,
    type SignInSessionContext,
} from './sign-in-session.service';

const CREDENTIALS = {
    emailAddress: ' thomas@cocooning.test ',
    password: 'correct horse battery',
};
const CLIENT = { ipAddress: '100.64.0.7', userAgent: 'Mozilla/5.0 (iPhone)' };
const REFUSAL = {
    code: ApiErrorCodeEnum.UNAUTHORIZED,
    message: 'Invalid credentials',
    backendCode: 'AUTHENTICATION_CREDENTIALS_INVALID',
};

describe('Feature: opening a session from the sign-in form', () => {
    let gateway: FakeAuthenticationGateway;
    let context: SignInSessionContext;

    beforeEach(() => {
        gateway = new FakeAuthenticationGateway();
        context = {
            t: (key) => key,
            signIn: new SignInUseCase(gateway),
            client: CLIENT,
            secure: true,
        };
    });

    describe('Scenario: the API accepts the credentials', () => {
        it('sends the trimmed form with the browser context', async () => {
            await openSignInSession(CREDENTIALS, context);

            expect(gateway.calls).toEqual([
                {
                    operation: 'signIn',
                    request: {
                        emailAddress: 'thomas@cocooning.test',
                        password: CREDENTIALS.password,
                    },
                    client: CLIENT,
                },
            ]);
        });

        it('gives an HttpOnly cookie that expires with the session', async () => {
            expect(await openSignInSession(CREDENTIALS, context)).toEqual({
                success: true,
                value: {
                    name: SESSION_COOKIE_NAME,
                    value: A_SESSION.sessionToken,
                    options: {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'lax',
                        path: '/',
                        expires: new Date(A_SESSION.sessionExpiresAt),
                    },
                },
            });
        });
    });

    describe('Scenario: an input that skipped the form', () => {
        it.each([
            ['a missing password', { emailAddress: 'thomas@cocooning.test' }],
            ['not an object', 'thomas'],
        ])('refuses %s without calling the API', async (_, input) => {
            const result = await openSignInSession(input, context);

            expect(result).toEqual({
                success: false,
                error: expect.objectContaining({
                    code: ApiErrorCodeEnum.VALIDATION_ERROR,
                }),
            });
            expect(gateway.calls).toEqual([]);
        });
    });

    describe('Scenario: the API refuses the credentials', () => {
        it('gives the refusal unchanged', async () => {
            gateway.givenRefusal(REFUSAL);

            expect(await openSignInSession(CREDENTIALS, context)).toEqual({
                success: false,
                error: REFUSAL,
            });
        });
    });

    describe('Scenario: the API sends an unreadable expiry', () => {
        it('refuses to set a cookie', async () => {
            gateway.givenSession({ ...A_SESSION, sessionExpiresAt: 'soon' });

            expect(await openSignInSession(CREDENTIALS, context)).toEqual({
                success: false,
                error: expect.objectContaining({
                    code: ApiErrorCodeEnum.INVALID_RESPONSE,
                }),
            });
        });
    });
});
