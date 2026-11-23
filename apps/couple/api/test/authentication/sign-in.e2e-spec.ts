import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { AuthenticationTestApp } from './authentication-test-app';
import {
    CREDENTIALS_INVALID,
    EMAIL_ADDRESS_A,
    isoAfterDays,
    PARTNER_A,
    SESSION_LIFETIME_IN_DAYS,
    sessionOf,
} from './authentication-test-data';

describe('Feature: a partner signs in with an email address and a password', () => {
    const auth = new AuthenticationTestApp();

    beforeAll(() => auth.start());
    afterAll(() => auth.stop());
    beforeEach(async () => {
        await auth.reset();
        await auth.givenAccount(PARTNER_A, EMAIL_ADDRESS_A);
    });

    describe('Scenario: R3, R4, the right credentials', () => {
        it('answers 200 with a session of 90 days for the account', async () => {
            const response = await auth.signIn(EMAIL_ADDRESS_A);
            expect(response).toEqual({
                status: 200,
                body: {
                    userId: PARTNER_A,
                    sessionToken: expect.any(String) as unknown,
                    sessionExpiresAt: isoAfterDays(SESSION_LIFETIME_IN_DAYS),
                },
            });
        });

        it('opens the private routes to the partner', async () => {
            const { sessionToken } = sessionOf(
                await auth.signIn(EMAIL_ADDRESS_A),
            );
            await expect(auth.probe(sessionToken)).resolves.toEqual({
                status: 200,
                body: { userId: PARTNER_A },
            });
        });

        it('accepts the address typed with capitals and spaces', async () => {
            const response = await auth.signIn('  Thomas@Cocooning.TEST ');
            expect(sessionOf(response).userId).toBe(PARTNER_A);
        });
    });

    describe('Scenario: R3, wrong credentials', () => {
        it('refuses a wrong password with 401', async () => {
            await expect(
                auth.signIn(EMAIL_ADDRESS_A, 'not the password'),
            ).resolves.toEqual(CREDENTIALS_INVALID);
        });

        it('refuses an unknown address with the same answer', async () => {
            await expect(auth.signIn('nobody@cocooning.test')).resolves.toEqual(
                CREDENTIALS_INVALID,
            );
        });
    });

    describe('Scenario: unusable credentials', () => {
        it('refuses a body without password with 422', async () => {
            const response = await auth
                .unauthenticated()
                .post(ApiRouterEnum.ACCOUNT_SESSION_OPEN, {
                    emailAddress: EMAIL_ADDRESS_A,
                });
            expect(response).toEqual({
                status: 422,
                body: {
                    status: 422,
                    code: 'VALIDATION_FAILED',
                    message: 'Validation failed',
                    errors: [
                        {
                            path: 'password',
                            code: 'invalid_type',
                            message:
                                'Invalid input: expected string, received undefined',
                        },
                    ],
                },
            });
        });
    });
});
