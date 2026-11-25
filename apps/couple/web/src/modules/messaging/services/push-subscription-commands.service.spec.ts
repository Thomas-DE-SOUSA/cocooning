import {
    GetPushPublicKeyUseCase,
    SubscribePushNotificationsUseCase,
    UnsubscribePushNotificationsUseCase,
} from '@cocooning/couple-client-business-logic/messaging';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    A_PUSH_PUBLIC_KEY,
    A_PUSH_SUBSCRIPTION,
    FakePushSubscriptionGateway,
} from '@cocooning/couple-client-business-logic/testing';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import {
    readPushPublicKey,
    subscribePushNotifications,
    unsubscribePushNotifications,
} from './push-subscription-commands.service';

const REFUSAL: ApiError = {
    code: ApiErrorCodeEnum.VALIDATION_ERROR,
    message: 'Invalid subscription',
    backendCode: 'PUSH_SUBSCRIPTION_INVALID',
};

const isValidationError = (result: { success: boolean; error?: ApiError }) =>
    result.success === false &&
    result.error?.code === ApiErrorCodeEnum.VALIDATION_ERROR;

describe('Feature: R11, the subscription commands of the server actions', () => {
    let gateway: FakePushSubscriptionGateway;

    beforeEach(() => {
        gateway = new FakePushSubscriptionGateway();
    });

    it('gives the public key alone', async () => {
        expect(
            await readPushPublicKey(new GetPushPublicKeyUseCase(gateway)),
        ).toEqual(ok(A_PUSH_PUBLIC_KEY.publicKey));
    });

    it('subscribes the phone with its endpoint and keys only', async () => {
        const subscribe = new SubscribePushNotificationsUseCase(gateway);

        expect(
            await subscribePushNotifications(
                { ...A_PUSH_SUBSCRIPTION, expirationTime: null },
                subscribe,
            ),
        ).toEqual(ok(null));
        expect(gateway.calls).toEqual([
            {
                operation: 'subscribePushNotifications',
                request: A_PUSH_SUBSCRIPTION,
            },
        ]);
    });

    it.each([
        [
            'an endpoint over http',
            { ...A_PUSH_SUBSCRIPTION, endpoint: 'http://push.test/1' },
        ],
        [
            'keys outside base64url',
            { ...A_PUSH_SUBSCRIPTION, keys: { p256dh: 'a b', auth: 'c' } },
        ],
        ['no keys', { endpoint: A_PUSH_SUBSCRIPTION.endpoint }],
    ])(
        'refuses %s without calling the API (rule 14)',
        async (_label, input) => {
            const subscribe = new SubscribePushNotificationsUseCase(gateway);

            expect(
                isValidationError(
                    await subscribePushNotifications(input, subscribe),
                ),
            ).toBe(true);
            expect(gateway.calls).toEqual([]);
        },
    );

    it('forgets the phone named by its endpoint', async () => {
        const unsubscribe = new UnsubscribePushNotificationsUseCase(gateway);

        expect(
            await unsubscribePushNotifications(
                A_PUSH_SUBSCRIPTION.endpoint,
                unsubscribe,
            ),
        ).toEqual(ok(null));
        expect(gateway.calls).toEqual([
            {
                operation: 'unsubscribePushNotifications',
                request: { endpoint: A_PUSH_SUBSCRIPTION.endpoint },
            },
        ]);
    });

    it('refuses an endpoint that is not an https address (rule 14)', async () => {
        const unsubscribe = new UnsubscribePushNotificationsUseCase(gateway);

        expect(
            isValidationError(
                await unsubscribePushNotifications(42, unsubscribe),
            ),
        ).toBe(true);
        expect(gateway.calls).toEqual([]);
    });

    it('passes the refusal of the API on', async () => {
        gateway.givenRefusal(REFUSAL);

        expect(
            await subscribePushNotifications(
                A_PUSH_SUBSCRIPTION,
                new SubscribePushNotificationsUseCase(gateway),
            ),
        ).toEqual(fail(REFUSAL));
    });
});
