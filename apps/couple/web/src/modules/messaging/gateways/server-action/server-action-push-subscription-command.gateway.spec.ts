import { A_PUSH_SUBSCRIPTION } from '@cocooning/couple-client-business-logic/testing';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { ServerActionPushSubscriptionCommandGateway } from './server-action-push-subscription-command.gateway';

const rejects = () => Promise.reject(new TypeError('Failed to fetch'));
const UNREACHABLE = fail({
    code: 'NETWORK_ERROR',
    message: 'Push subscription server action unreachable',
    backendCode: null,
});

describe('Feature: R11, the subscription of this phone through the server actions', () => {
    it('gives each action its input', async () => {
        const sent: string[] = [];
        const gateway = new ServerActionPushSubscriptionCommandGateway({
            getPushPublicKey: () => Promise.resolve(ok('BPublicKey')),
            subscribe: (subscription) => {
                sent.push(subscription.endpoint);
                return Promise.resolve(ok(null));
            },
            unsubscribe: (endpoint) => {
                sent.push(`forget:${endpoint}`);
                return Promise.resolve(ok(null));
            },
        });

        expect(await gateway.getPushPublicKey()).toEqual(ok('BPublicKey'));
        await gateway.subscribe(A_PUSH_SUBSCRIPTION);
        await gateway.unsubscribe(A_PUSH_SUBSCRIPTION.endpoint);

        expect(sent).toEqual([
            A_PUSH_SUBSCRIPTION.endpoint,
            `forget:${A_PUSH_SUBSCRIPTION.endpoint}`,
        ]);
    });

    it('gives a network error instead of rejecting', async () => {
        const gateway = new ServerActionPushSubscriptionCommandGateway({
            getPushPublicKey: rejects,
            subscribe: rejects,
            unsubscribe: rejects,
        });

        expect(await gateway.getPushPublicKey()).toEqual(UNREACHABLE);
        expect(await gateway.subscribe(A_PUSH_SUBSCRIPTION)).toEqual(
            UNREACHABLE,
        );
        expect(
            await gateway.unsubscribe('https://push.example.test/1'),
        ).toEqual(UNREACHABLE);
    });
});
