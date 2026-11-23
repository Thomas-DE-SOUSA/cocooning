import { JwtService } from '@nestjs/jwt';
import { signSessionToken } from '../shared/app/session-token';
import { TEST_AUTH_JWT_SECRET } from '../shared/env/test-secrets';
import { AuthenticationTestApp } from './authentication-test-app';
import {
    EMAIL_ADDRESS_A,
    NOW_SECONDS,
    PARTNER_A,
    SESSION_INVALID,
    SESSION_LIFETIME_IN_DAYS,
    SESSION_MISSING,
    sessionOf,
    UNKNOWN_PARTNER,
} from './authentication-test-data';
import { PROBE_ROUTE } from './partner-probe.controller';

const LIVE = { sub: PARTNER_A, ver: 1, exp: NOW_SECONDS + 60 };
const REVOKED_SESSION_VERSION = 2;

describe('Feature: every route needs a live session unless it is public (decision 0034)', () => {
    const auth = new AuthenticationTestApp();

    beforeAll(() => auth.start());
    afterAll(() => auth.stop());
    beforeEach(async () => {
        await auth.reset();
        await auth.givenAccount(PARTNER_A, EMAIL_ADDRESS_A);
    });

    const probeWith = (
        claims: Record<string, string | number>,
        secret: string = TEST_AUTH_JWT_SECRET,
    ) => auth.probe(signSessionToken(claims, secret));

    describe('Scenario: a partner with a live session', () => {
        it('reaches the route and the controller receives the partner', async () => {
            await expect(probeWith(LIVE)).resolves.toEqual({
                status: 200,
                body: { userId: PARTNER_A },
            });
        });
    });

    describe('Scenario: no session cookie', () => {
        it('refuses with 401', async () => {
            const response = await auth.unauthenticated().get(PROBE_ROUTE);
            expect(response).toEqual(SESSION_MISSING);
        });
    });

    describe('Scenario: R5, a token issued before the last sign-out', () => {
        it('refuses with 401', async () => {
            await auth.reset();
            await auth.givenAccount(
                PARTNER_A,
                EMAIL_ADDRESS_A,
                REVOKED_SESSION_VERSION,
            );
            await expect(probeWith(LIVE)).resolves.toEqual(SESSION_INVALID);
        });
    });

    describe('Scenario: a token of an account that does not exist', () => {
        it('refuses with 401', async () => {
            await expect(
                probeWith({ ...LIVE, sub: UNKNOWN_PARTNER }),
            ).resolves.toEqual(SESSION_INVALID);
        });
    });

    describe('Scenario: R4, a session past its deadline', () => {
        it('refuses with 401 at the clock of the API', async () => {
            const { sessionToken } = sessionOf(
                await auth.signIn(EMAIL_ADDRESS_A),
            );
            auth.advanceDays(SESSION_LIFETIME_IN_DAYS);
            await expect(auth.probe(sessionToken)).resolves.toEqual(
                SESSION_INVALID,
            );
        });
    });

    describe('Scenario: a token the API did not sign as it signs', () => {
        it.each([
            ['without a session version', { sub: PARTNER_A, exp: LIVE.exp }],
            ['without expiry', { sub: PARTNER_A, ver: 1 }],
            [
                'with a subject that is not a UUID',
                { ...LIVE, sub: 'partner-1' },
            ],
            ['already expired', { ...LIVE, exp: NOW_SECONDS - 1 }],
        ])('refuses a token %s with 401', async (_label, claims) => {
            await expect(probeWith(claims)).resolves.toEqual(SESSION_INVALID);
        });

        it('refuses a token signed with another secret with 401', async () => {
            const forged = 'another-secret-of-at-least-thirty-two-chars';
            await expect(probeWith(LIVE, forged)).resolves.toEqual(
                SESSION_INVALID,
            );
        });

        it('refuses a token signed with another algorithm with 401', async () => {
            const token = new JwtService({ secret: TEST_AUTH_JWT_SECRET }).sign(
                LIVE,
                { algorithm: 'HS512' },
            );
            await expect(auth.probe(token)).resolves.toEqual(SESSION_INVALID);
        });

        it('refuses a cookie that is not a JWT with 401', async () => {
            await expect(auth.probe('not-a-jwt')).resolves.toEqual(
                SESSION_INVALID,
            );
        });
    });
});
