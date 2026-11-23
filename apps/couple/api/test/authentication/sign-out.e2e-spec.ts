import { AuthenticationTestApp } from './authentication-test-app';
import {
    EMAIL_ADDRESS_A,
    EMAIL_ADDRESS_B,
    PARTNER_A,
    PARTNER_B,
    SESSION_INVALID,
    SESSION_MISSING,
    sessionOf,
} from './authentication-test-data';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';

describe('Feature: a partner signs out of every device', () => {
    const auth = new AuthenticationTestApp();

    beforeAll(() => auth.start());
    afterAll(() => auth.stop());
    beforeEach(async () => {
        await auth.reset();
        await auth.givenAccount(PARTNER_A, EMAIL_ADDRESS_A);
        await auth.givenAccount(PARTNER_B, EMAIL_ADDRESS_B);
    });

    const openSession = async (emailAddress: string): Promise<string> =>
        sessionOf(await auth.signIn(emailAddress)).sessionToken;

    describe('Scenario: R5, a partner signed in on two devices', () => {
        it('answers 204 and closes both sessions', async () => {
            const phone = await openSession(EMAIL_ADDRESS_A);
            auth.advanceDays(1);
            const laptop = await openSession(EMAIL_ADDRESS_A);
            await expect(auth.signOut(phone)).resolves.toEqual({
                status: 204,
                body: null,
            });
            await expect(auth.probe(phone)).resolves.toEqual(SESSION_INVALID);
            await expect(auth.probe(laptop)).resolves.toEqual(SESSION_INVALID);
        });

        it('lets the partner sign in again afterwards', async () => {
            await auth.signOut(await openSession(EMAIL_ADDRESS_A));
            const fresh = await openSession(EMAIL_ADDRESS_A);
            await expect(auth.probe(fresh)).resolves.toEqual({
                status: 200,
                body: { userId: PARTNER_A },
            });
        });
    });

    describe('Scenario: R5, the other partner is signed in', () => {
        it('keeps the session of the other partner open', async () => {
            const other = await openSession(EMAIL_ADDRESS_B);
            await auth.signOut(await openSession(EMAIL_ADDRESS_A));
            await expect(auth.probe(other)).resolves.toEqual({
                status: 200,
                body: { userId: PARTNER_B },
            });
        });
    });

    describe('Scenario: a session already closed', () => {
        it('refuses a second sign-out with 401', async () => {
            const token = await openSession(EMAIL_ADDRESS_A);
            await auth.signOut(token);
            await expect(auth.signOut(token)).resolves.toEqual(SESSION_INVALID);
        });
    });

    describe('Scenario: no session cookie', () => {
        it('refuses with 401', async () => {
            const response = await auth
                .unauthenticated()
                .delete(ApiRouterEnum.ACCOUNT_SESSION_CLOSE);
            expect(response).toEqual(SESSION_MISSING);
        });
    });
});
