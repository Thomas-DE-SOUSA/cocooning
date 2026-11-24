import { fail, ok } from '@cocooning/shared-kernel/utils';
import { ApiErrorCodeEnum } from '../../../shared/api-error';
import { FakePushSubscriptionGateway } from '../../../testing/fake-push-subscription.gateway';
import {
    A_PUSH_PUBLIC_KEY,
    A_PUSH_SUBSCRIPTION,
} from '../../../testing/messaging-fixtures';
import { GetPushPublicKeyUseCase } from './get-push-public-key.use-case';
import { SubscribePushNotificationsUseCase } from './subscribe-push-notifications.use-case';
import { UnsubscribePushNotificationsUseCase } from './unsubscribe-push-notifications.use-case';

const UNKNOWN_PHONE = {
    code: ApiErrorCodeEnum.NOT_FOUND,
    message: 'Push subscription not found',
    backendCode: 'PUSH_SUBSCRIPTION_NOT_FOUND',
};

describe('Feature: the notifications of a phone from the PWA (R11)', () => {
    let gateway: FakePushSubscriptionGateway;

    beforeEach(() => {
        gateway = new FakePushSubscriptionGateway();
    });

    it('reads the public key, subscribes then unsubscribes the phone', async () => {
        const { endpoint } = A_PUSH_SUBSCRIPTION;
        await expect(
            new GetPushPublicKeyUseCase(gateway).execute(),
        ).resolves.toEqual(ok(A_PUSH_PUBLIC_KEY));
        await new SubscribePushNotificationsUseCase(gateway).execute(
            A_PUSH_SUBSCRIPTION,
        );
        await expect(
            new UnsubscribePushNotificationsUseCase(gateway).execute({
                endpoint,
            }),
        ).resolves.toEqual(ok(null));
        expect(gateway.calls).toEqual([
            { operation: 'getPushPublicKey' },
            {
                operation: 'subscribePushNotifications',
                request: A_PUSH_SUBSCRIPTION,
            },
            {
                operation: 'unsubscribePushNotifications',
                request: { endpoint },
            },
        ]);
    });

    it('returns the refusal of the API unchanged', async () => {
        gateway.givenRefusal(UNKNOWN_PHONE);
        await expect(
            new UnsubscribePushNotificationsUseCase(gateway).execute({
                endpoint: A_PUSH_SUBSCRIPTION.endpoint,
            }),
        ).resolves.toEqual(fail(UNKNOWN_PHONE));
    });
});
