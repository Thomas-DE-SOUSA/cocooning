import { FakeFetch } from '@cocooning/client-infrastructure/testing';
import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import {
    A_PUSH_PUBLIC_KEY,
    A_PUSH_SUBSCRIPTION,
} from '@cocooning/couple-client-business-logic/testing';
import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import {
    ACCEPT,
    aMessagingGateway,
    anApiRefusal,
    JSON_BODY,
    SESSION_COOKIE,
} from './__tests__/messaging-gateway-test.context';
import { ApiPushSubscriptionGateway } from './api-push-subscription.gateway';

const { endpoint } = A_PUSH_SUBSCRIPTION;
const aGateway = () => aMessagingGateway(ApiPushSubscriptionGateway);

describe('Feature: the PWA subscribes a phone to the notifications through the API (R11)', () => {
    let fakeFetch: FakeFetch;

    beforeEach(() => {
        fakeFetch = new FakeFetch();
        fakeFetch.install();
    });
    afterEach(() => fakeFetch.restore());

    it('reads the public key with the session cookie', async () => {
        fakeFetch.givenResponse(200, JSON.stringify(A_PUSH_PUBLIC_KEY));
        await expect(aGateway().getPushPublicKey()).resolves.toEqual(
            ok(A_PUSH_PUBLIC_KEY),
        );
        expect(fakeFetch.calls).toEqual([
            {
                url: 'http://api.test/push-subscriptions/public-key',
                method: 'GET',
                headers: { ...ACCEPT, ...SESSION_COOKIE },
                body: null,
            },
        ]);
    });

    it('subscribes with PUT and unsubscribes with POST, each a 204', async () => {
        fakeFetch.givenResponse(204, '');
        await expect(
            aGateway().subscribePushNotifications(A_PUSH_SUBSCRIPTION),
        ).resolves.toEqual(ok(null));
        await expect(
            aGateway().unsubscribePushNotifications({ endpoint }),
        ).resolves.toEqual(ok(null));
        expect(fakeFetch.calls).toEqual([
            {
                url: 'http://api.test/push-subscriptions',
                method: 'PUT',
                headers: { ...JSON_BODY, ...SESSION_COOKIE },
                body: JSON.stringify(A_PUSH_SUBSCRIPTION),
            },
            {
                url: 'http://api.test/push-subscriptions/unsubscribe',
                method: 'POST',
                headers: { ...JSON_BODY, ...SESSION_COOKIE },
                body: JSON.stringify({ endpoint }),
            },
        ]);
    });

    it.each([
        [
            'an endpoint that is not https',
            () =>
                aGateway().subscribePushNotifications({
                    ...A_PUSH_SUBSCRIPTION,
                    endpoint: 'http://push.example.test/send/phone-1',
                }),
        ],
        [
            'keys that are not base64url',
            () =>
                aGateway().subscribePushNotifications({
                    endpoint,
                    keys: { p256dh: 'not base64!', auth: 'x' },
                }),
        ],
        [
            'an unsubscription without endpoint',
            () => aGateway().unsubscribePushNotifications({ endpoint: '' }),
        ],
    ])('refuses %s without calling the API', async (_label, send) => {
        const result = await send();
        expect(result.success === false && result.error.code).toBe(
            ApiErrorCodeEnum.VALIDATION_ERROR,
        );
        expect(fakeFetch.calls).toEqual([]);
    });

    it('returns NOT_FOUND with the backend code for an unknown phone', async () => {
        const code = MessagingExceptionCodeEnum.PUSH_SUBSCRIPTION_NOT_FOUND;
        fakeFetch.givenResponse(404, anApiRefusal(404, code, 'Not found'));
        await expect(
            aGateway().unsubscribePushNotifications({ endpoint }),
        ).resolves.toEqual(
            fail({
                code: ApiErrorCodeEnum.NOT_FOUND,
                message: 'Not found',
                backendCode: code,
            }),
        );
    });
});
