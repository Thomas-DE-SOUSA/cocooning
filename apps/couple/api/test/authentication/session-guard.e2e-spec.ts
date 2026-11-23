import { Controller, Get, type INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import type { PartnerContext } from '@cocooning/shared-kernel/domain';
import { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import { DeterministicDateTimeProvider } from '@cocooning/shared-kernel/testing';
import { CurrentPartner } from '../../src/modules/authentication';
import { closeTestApp, createTestApp } from '../shared/app/create-test-app';
import { signSessionToken } from '../shared/app/session-token';
import { TestClient } from '../shared/app/test-client';
import { TEST_AUTH_JWT_SECRET } from '../shared/env/test-secrets';

const PROBE_ROUTE = '/e2e-probe/partner';
const NOW = new Date('2026-11-23T08:00:00.000Z');
const NOW_SECONDS = NOW.getTime() / 1_000;
const PARTNER_ID = '01936b2e-7c4a-7000-8000-000000000001';

// A test-only route behind the global guard: it echoes the partner the guard attached to the request.
@Controller()
class PartnerProbeController {
    @Get(PROBE_ROUTE)
    handle(@CurrentPartner() partner: PartnerContext): PartnerContext {
        return partner;
    }
}

const refusal = (code: string, message: string) => ({
    status: 401,
    body: { status: 401, code, message, context: null },
});

const SESSION_MISSING = refusal(
    AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_MISSING,
    'Session missing',
);
const SESSION_INVALID = refusal(
    AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_INVALID,
    'Session invalid',
);

describe('Feature: every route needs a session unless it is public (decision 0030)', () => {
    let app: INestApplication;
    let client: TestClient;

    beforeAll(async () => {
        app = await createTestApp({
            controllers: [PartnerProbeController],
            overrides: [
                {
                    provide: DateTimeProvider,
                    useValue: new DeterministicDateTimeProvider(NOW),
                },
            ],
        });
        client = await TestClient.for(app);
    });
    afterAll(async () => {
        await closeTestApp(app);
    });

    const probeWith = (
        claims: Record<string, string | number>,
        secret: string = TEST_AUTH_JWT_SECRET,
    ) =>
        client
            .withSessionToken(signSessionToken(claims, secret))
            .get(PROBE_ROUTE);

    describe('Scenario: a partner with a valid session', () => {
        it('reaches the route and the controller receives the partner', async () => {
            const response = await client
                .asPartner(PARTNER_ID, NOW)
                .get(PROBE_ROUTE);
            expect(response).toEqual({
                status: 200,
                body: { userId: PARTNER_ID },
            });
        });
    });

    describe('Scenario: no session cookie', () => {
        it('refuses with 401', async () => {
            const response = await client.unauthenticated().get(PROBE_ROUTE);
            expect(response).toEqual(SESSION_MISSING);
        });
    });

    describe('Scenario: a token signed with another secret', () => {
        it('refuses with 401', async () => {
            const forged = 'another-secret-of-at-least-thirty-two-chars';
            const response = await probeWith(
                { sub: PARTNER_ID, exp: NOW_SECONDS + 60 },
                forged,
            );
            expect(response).toEqual(SESSION_INVALID);
        });
    });

    describe('Scenario: a token signed with another algorithm', () => {
        it('refuses with 401', async () => {
            const token = new JwtService({ secret: TEST_AUTH_JWT_SECRET }).sign(
                { sub: PARTNER_ID, exp: NOW_SECONDS + 60 },
                { algorithm: 'HS512' },
            );
            const response = await client
                .withSessionToken(token)
                .get(PROBE_ROUTE);
            expect(response).toEqual(SESSION_INVALID);
        });
    });

    describe('Scenario: an expired token', () => {
        it('refuses with 401 at the clock of the API', async () => {
            const response = await probeWith({
                sub: PARTNER_ID,
                exp: NOW_SECONDS - 1,
            });
            expect(response).toEqual(SESSION_INVALID);
        });
    });

    describe('Scenario: a token without expiry', () => {
        it('refuses with 401, since it would never expire', async () => {
            const response = await probeWith({ sub: PARTNER_ID });
            expect(response).toEqual(SESSION_INVALID);
        });
    });

    describe('Scenario: a subject that is not a UUID', () => {
        it('refuses with 401', async () => {
            const response = await probeWith({
                sub: 'partner-1',
                exp: NOW_SECONDS + 60,
            });
            expect(response).toEqual(SESSION_INVALID);
        });
    });

    describe('Scenario: a cookie that is not a JWT', () => {
        it('refuses with 401', async () => {
            const response = await client
                .withSessionToken('not-a-jwt')
                .get(PROBE_ROUTE);
            expect(response).toEqual(SESSION_INVALID);
        });
    });
});
