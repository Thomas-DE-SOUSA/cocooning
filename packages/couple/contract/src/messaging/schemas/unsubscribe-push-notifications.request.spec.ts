import { UnsubscribePushNotificationsRequestSchema } from './unsubscribe-push-notifications.request';

const ENDPOINT = 'https://push.example.test/send/abc_DEF-123';

describe('Feature: forget the subscription of a phone (R11)', () => {
    it('accepts the endpoint of the subscription', () => {
        expect(
            UnsubscribePushNotificationsRequestSchema.parse({
                endpoint: ENDPOINT,
            }),
        ).toEqual({ endpoint: ENDPOINT });
    });

    it('rejects an endpoint in plain http', () => {
        expect(
            UnsubscribePushNotificationsRequestSchema.safeParse({
                endpoint: 'http://push.example.test/a',
            }).success,
        ).toBe(false);
    });
});
