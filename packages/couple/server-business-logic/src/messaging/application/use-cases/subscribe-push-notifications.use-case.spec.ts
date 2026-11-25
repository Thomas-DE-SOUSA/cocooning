import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { PUSH_SUBSCRIPTION_ENDPOINT_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { PushSubscription } from '../../domain/models/push-subscription.aggregate';
import { FlashMessageId } from '../../domain/value-objects/flash-message-id.vo';
import { MessagingTestContext } from '../../__tests__/fixtures/messaging-test.context';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    COUPLE_ID,
    FIRST_ID,
    idNumber,
    MILLISECONDS_PER_HOUR,
    NOW,
    OTHER_COUPLE_ID,
    PARTNER_A,
    PARTNER_B,
    STRANGER,
} from '../../__tests__/fixtures/messaging-test.data';
import {
    AUTH,
    P256DH,
    PHONE_OF_A,
    RENEWED_AUTH,
    RENEWED_P256DH,
    TABLET_OF_B,
} from '../../__tests__/fixtures/messaging-test.push-data';

const LATER = new Date(NOW.getTime() + MILLISECONDS_PER_HOUR);
const KEYS = { p256dh: P256DH, auth: AUTH };
const RENEWED_KEYS = { p256dh: RENEWED_P256DH, auth: RENEWED_AUTH };

const stored = (
    id: string,
    coupleId: string,
    ownerId: string,
    endpoint: string,
) => ({
    id,
    coupleId,
    ownerId,
    endpoint,
    p256dh: P256DH,
    auth: AUTH,
    version: 1,
    metadata: {
        createdAt: NOW.toISOString(),
        updatedAt: NOW.toISOString(),
        deletedAt: null,
    },
});

describe('Feature: a phone subscribes to the notifications', () => {
    let ctx: MessagingTestContext;

    beforeEach(() => {
        ctx = new MessagingTestContext();
    });
    afterEach(() => FlashMessageId.resetForTests());

    const subscribe = (
        context: ExecutionContext,
        endpoint = PHONE_OF_A,
        keys = KEYS,
    ) =>
        ctx
            .subscribePushNotificationsUseCase()
            .execute(context, { endpoint, keys });

    describe('Scenario: R11, a new phone', () => {
        it('stores its subscription for the partner and the couple', async () => {
            await subscribe(AS_A);
            expect(ctx.pushSubscriptionRepository.storedSnapshots).toEqual([
                stored(FIRST_ID, COUPLE_ID, PARTNER_A, PHONE_OF_A),
            ]);
        });

        it('keeps one subscription per phone of a partner', async () => {
            await subscribe(AS_B, PHONE_OF_A);
            await subscribe(AS_B, TABLET_OF_B);
            expect(
                ctx.pushSubscriptionRepository.storedSnapshots.map(
                    ({ ownerId, endpoint }) => ({ ownerId, endpoint }),
                ),
            ).toEqual([
                { ownerId: PARTNER_B, endpoint: PHONE_OF_A },
                { ownerId: PARTNER_B, endpoint: TABLET_OF_B },
            ]);
        });
    });

    describe('Scenario: R11, the same phone subscribes again', () => {
        it('renews its keys, never a second subscription', async () => {
            await subscribe(AS_A);
            ctx.advanceHours(1);
            await subscribe(AS_A, PHONE_OF_A, RENEWED_KEYS);
            expect(ctx.pushSubscriptionRepository.storedSnapshots).toEqual([
                {
                    ...stored(FIRST_ID, COUPLE_ID, PARTNER_A, PHONE_OF_A),
                    ...RENEWED_KEYS,
                    version: 2,
                    metadata: {
                        createdAt: NOW.toISOString(),
                        updatedAt: LATER.toISOString(),
                        deletedAt: null,
                    },
                },
            ]);
        });

        it('follows the other partner, now signed in on that phone', async () => {
            await subscribe(AS_A);
            await subscribe(AS_B);
            expect(ctx.pushSubscriptionRepository.storedSnapshots).toEqual([
                {
                    ...stored(FIRST_ID, COUPLE_ID, PARTNER_B, PHONE_OF_A),
                    version: 2,
                },
            ]);
        });

        it('never reaches the subscription of another couple', async () => {
            await subscribe(AS_A);
            await subscribe(AS_STRANGER);
            expect(ctx.pushSubscriptionRepository.storedSnapshots).toEqual([
                stored(FIRST_ID, COUPLE_ID, PARTNER_A, PHONE_OF_A),
                stored(idNumber(2), OTHER_COUPLE_ID, STRANGER, PHONE_OF_A),
            ]);
        });
    });

    describe('Scenario: R11, an invalid subscription', () => {
        it.each([
            ['an endpoint in plain http', 'http://push.example.test/a', KEYS],
            [
                'an endpoint too long',
                `${PHONE_OF_A}/`.padEnd(
                    PUSH_SUBSCRIPTION_ENDPOINT_MAX_LENGTH + 1,
                    'a',
                ),
                KEYS,
            ],
            ['an empty key', PHONE_OF_A, { p256dh: '', auth: AUTH }],
            [
                'a key outside base64url',
                PHONE_OF_A,
                { p256dh: P256DH, auth: 'a+b' },
            ],
            [
                'a key too long',
                PHONE_OF_A,
                { p256dh: 'a'.repeat(129), auth: AUTH },
            ],
        ])('refuses %s and stores nothing', async (_label, endpoint, keys) => {
            await expect(subscribe(AS_A, endpoint, keys)).rejects.toMatchObject(
                {
                    code: MessagingExceptionCodeEnum.PUSH_SUBSCRIPTION_INVALID,
                },
            );
            expect(ctx.pushSubscriptionRepository.storedSnapshots).toEqual([]);
        });
    });

    describe('Scenario: the subscription changed since it was read', () => {
        it('refuses with a version conflict', async () => {
            const subscription = ctx.givenPushSubscriptionOf(AS_A, PHONE_OF_A);
            const concurrent = PushSubscription.fromSnapshot(
                subscription.toSnapshot(),
            );
            concurrent.renewFor(PARTNER_B, subscription.keys, NOW);
            ctx.pushSubscriptionRepository.simulateConcurrentSave(concurrent);
            await expect(subscribe(AS_A)).rejects.toMatchObject({
                code: MessagingExceptionCodeEnum.PUSH_SUBSCRIPTION_VERSION_CONFLICT,
            });
        });
    });
});
