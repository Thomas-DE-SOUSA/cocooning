import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { readPushSubscriptions } from '@cocooning/couple-e2e-shared/fixtures';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { TEST_VAPID_PUBLIC_KEY } from '../shared/env/test-secrets';
import { MessagingTestApp } from './messaging-test-app';
import {
    ALONE,
    COUPLE_ID,
    OTHER_COUPLE_ID,
    PARTNER_A,
    PARTNER_B,
    refusal,
    STRANGER,
} from './messaging-test-data';
import {
    PHONE_OF_A,
    PHONE_OF_B,
    PUSH_KEYS,
    RENEWED_PUSH_KEYS,
} from './push-test-data';

const NO_CONTENT = { status: 204, body: null };
const NOT_FOUND = refusal(
    404,
    MessagingExceptionCodeEnum.PUSH_SUBSCRIPTION_NOT_FOUND,
    'Push subscription not found',
);
const row = (
    coupleId: string,
    ownerId: string,
    endpoint: string,
    version = 1,
    keys = PUSH_KEYS,
) => ({ coupleId, ownerId, endpoint, ...keys, version });

describe('Feature: each phone subscribes to the notifications (R11)', () => {
    const messaging = new MessagingTestApp();

    beforeAll(() => messaging.start());
    afterAll(() => messaging.stop());
    beforeEach(() => messaging.reset());

    const stored = (coupleId = COUPLE_ID) =>
        readPushSubscriptions(messaging.prisma, coupleId);

    describe('Scenario: subscribe a phone', () => {
        it('stores the subscription of the partner, idempotent on the endpoint', async () => {
            expect(await messaging.subscribe(PARTNER_A, PHONE_OF_A)).toEqual(
                NO_CONTENT,
            );
            expect(
                await messaging.subscribe(
                    PARTNER_A,
                    PHONE_OF_A,
                    RENEWED_PUSH_KEYS,
                ),
            ).toEqual(NO_CONTENT);
            expect(await stored()).toEqual([
                row(COUPLE_ID, PARTNER_A, PHONE_OF_A, 2, RENEWED_PUSH_KEYS),
            ]);
        });

        it('moves the phone to the partner who subscribes it again', async () => {
            await messaging.subscribe(PARTNER_A, PHONE_OF_A);
            await messaging.subscribe(PARTNER_B, PHONE_OF_A);
            expect(await stored()).toEqual([
                row(COUPLE_ID, PARTNER_B, PHONE_OF_A, 2),
            ]);
        });

        it('keeps the same phone of another couple apart', async () => {
            await messaging.subscribe(PARTNER_A, PHONE_OF_A);
            await messaging.subscribe(STRANGER, PHONE_OF_A);
            expect(await stored()).toEqual([
                row(COUPLE_ID, PARTNER_A, PHONE_OF_A),
            ]);
            expect(await stored(OTHER_COUPLE_ID)).toEqual([
                row(OTHER_COUPLE_ID, STRANGER, PHONE_OF_A),
            ]);
        });

        it('keeps one subscription when the same phone subscribes twice at once', async () => {
            const statuses = (
                await Promise.all([
                    messaging.subscribe(PARTNER_A, PHONE_OF_A),
                    messaging.subscribe(PARTNER_A, PHONE_OF_A),
                ])
            ).map(({ status }) => status);
            expect(statuses).toContain(204);
            expect([
                [204, 204],
                [204, 409],
                [409, 204],
            ]).toContainEqual(statuses);
            expect(await stored()).toHaveLength(1);
        });

        it('refuses an endpoint in plain http with 422', async () => {
            const response = await messaging.subscribe(
                PARTNER_A,
                'http://push.example.test/a',
            );
            expect(response.status).toBe(422);
            expect(await stored()).toEqual([]);
        });
    });

    describe('Scenario: forget a phone', () => {
        beforeEach(async () => {
            await messaging.subscribe(PARTNER_A, PHONE_OF_A);
            await messaging.subscribe(PARTNER_B, PHONE_OF_B);
        });

        it('forgets my own phone', async () => {
            expect(await messaging.unsubscribe(PARTNER_A, PHONE_OF_A)).toEqual(
                NO_CONTENT,
            );
            expect(await stored()).toEqual([
                row(COUPLE_ID, PARTNER_B, PHONE_OF_B),
            ]);
        });

        it('answers 404 for the phone of the other partner, and of another couple', async () => {
            expect(await messaging.unsubscribe(PARTNER_A, PHONE_OF_B)).toEqual(
                NOT_FOUND,
            );
            expect(await messaging.unsubscribe(STRANGER, PHONE_OF_A)).toEqual(
                NOT_FOUND,
            );
            expect(await stored()).toHaveLength(2);
        });
    });

    describe('Scenario: the public key of the API', () => {
        it('gives the VAPID public key', async () => {
            expect(await messaging.pushPublicKey(PARTNER_A)).toEqual({
                status: 200,
                body: { publicKey: TEST_VAPID_PUBLIC_KEY },
            });
        });
    });

    describe('Scenario: without a session or a couple', () => {
        it('answers 401 without a session', async () => {
            const response = await messaging
                .unauthenticated()
                .get(ApiRouterEnum.PUSH_SUBSCRIPTION_PUBLIC_KEY_GET);
            expect(response).toEqual(
                refusal(
                    401,
                    AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_MISSING,
                    'Session missing',
                ),
            );
        });

        it('answers 404 to a partner without a formed couple (R4)', async () => {
            expect(await messaging.subscribe(ALONE, PHONE_OF_A)).toEqual(
                refusal(
                    404,
                    MessagingExceptionCodeEnum.MESSAGING_COUPLE_NOT_PAIRED,
                    'The messages need a formed couple',
                ),
            );
        });
    });
});
