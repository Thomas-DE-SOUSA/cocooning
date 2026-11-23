import { FakeFetch } from '@cocooning/client-infrastructure/testing';
import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { createCoupleHttpConfig } from '../../couple-http-config';
import { resolveAuthenticationEndpoints } from '../endpoints/authentication.endpoints';
import { ApiAuthenticationGateway } from './api-authentication.gateway';

const API_BASE_URL = 'http://api.test/';
const REQUEST = {
    emailAddress: 'thomas@cocooning.test',
    password: 'correct horse battery staple',
};
const BROWSER = { ipAddress: '100.64.0.7', userAgent: 'Mozilla/5.0 (iPhone)' };
const SESSION = {
    userId: '01936b2e-7c4a-7000-8000-0000000000a1',
    sessionToken: 'session-token-1',
    sessionExpiresAt: '2027-02-21T08:00:00.000Z',
};

describe('Feature: the PWA opens a session through the API', () => {
    let fakeFetch: FakeFetch;
    const gateway = new ApiAuthenticationGateway(
        resolveAuthenticationEndpoints(API_BASE_URL),
        createCoupleHttpConfig(5000),
    );

    beforeEach(() => {
        fakeFetch = new FakeFetch();
        fakeFetch.install();
    });
    afterEach(() => fakeFetch.restore());

    describe('Scenario: the API answers with a session', () => {
        beforeEach(() => fakeFetch.givenResponse(200, JSON.stringify(SESSION)));

        it('returns the session of the contract', async () => {
            await expect(gateway.signIn(REQUEST, BROWSER)).resolves.toEqual(
                ok(SESSION),
            );
        });

        it('posts the credentials with the browser address and User-Agent', async () => {
            await gateway.signIn(REQUEST, BROWSER);
            expect(fakeFetch.calls).toEqual([
                {
                    url: 'http://api.test/authentication/session',
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'x-forwarded-for': '100.64.0.7',
                        'user-agent': 'Mozilla/5.0 (iPhone)',
                    },
                    body: JSON.stringify(REQUEST),
                },
            ]);
        });

        it('sends no client header that Next does not know', async () => {
            await gateway.signIn(REQUEST, { ipAddress: null, userAgent: null });
            expect(fakeFetch.calls[0]?.headers).toEqual({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            });
        });
    });

    describe('Scenario: R3, the API refuses the credentials', () => {
        it('returns UNAUTHORIZED with the backend code', async () => {
            fakeFetch.givenResponse(
                401,
                JSON.stringify({
                    status: 401,
                    code: AuthenticationExceptionCodeEnum.AUTHENTICATION_CREDENTIALS_INVALID,
                    message: 'Invalid credentials',
                    context: null,
                }),
            );
            await expect(gateway.signIn(REQUEST, BROWSER)).resolves.toEqual(
                fail({
                    code: ApiErrorCodeEnum.UNAUTHORIZED,
                    message: 'Invalid credentials',
                    backendCode:
                        AuthenticationExceptionCodeEnum.AUTHENTICATION_CREDENTIALS_INVALID,
                }),
            );
        });
    });

    describe('Scenario: an answer outside the contract', () => {
        it('returns INVALID_RESPONSE for a session without a token', async () => {
            fakeFetch.givenResponse(
                200,
                JSON.stringify({ userId: SESSION.userId }),
            );
            const result = await gateway.signIn(REQUEST, BROWSER);
            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.INVALID_RESPONSE,
            );
        });
    });

    describe('Scenario: a request outside the contract', () => {
        it('refuses an empty password without calling the API', async () => {
            const result = await gateway.signIn(
                { ...REQUEST, password: '' },
                BROWSER,
            );
            expect(result).toEqual(
                fail({
                    code: ApiErrorCodeEnum.VALIDATION_ERROR,
                    message: 'Sign-in request does not match its contract',
                    backendCode: null,
                }),
            );
            expect(fakeFetch.calls).toEqual([]);
        });
    });
});
