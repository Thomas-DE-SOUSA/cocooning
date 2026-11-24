import {
    PUSH_SUBSCRIPTION_ENDPOINT_MAX_LENGTH,
    PUSH_SUBSCRIPTION_KEY_MAX_LENGTH,
} from '@cocooning/couple-shared-kernel/limits';
import { SubscribePushNotificationsRequestSchema } from './subscribe-push-notifications.request';

const ENDPOINT = 'https://push.example.test/send/abc_DEF-123';
const P256DH = `B${'a'.repeat(86)}`;
const AUTH = 'abcdefghij_-KLMNOPQRST';
const SUBSCRIPTION = {
    endpoint: ENDPOINT,
    keys: { p256dh: P256DH, auth: AUTH },
};

const withEndpoint = (endpoint: string) => ({ ...SUBSCRIPTION, endpoint });
const withKeys = (p256dh: string, auth: string) => ({
    ...SUBSCRIPTION,
    keys: { p256dh, auth },
});

describe('Feature: the subscription of a phone to the notifications (R11)', () => {
    it('keeps the endpoint and the keys, and drops the other fields of the browser', () => {
        expect(
            SubscribePushNotificationsRequestSchema.parse({
                ...SUBSCRIPTION,
                expirationTime: null,
            }),
        ).toEqual(SUBSCRIPTION);
    });

    it('accepts an endpoint of exactly PUSH_SUBSCRIPTION_ENDPOINT_MAX_LENGTH signs', () => {
        const endpoint = `${ENDPOINT}/`.padEnd(
            PUSH_SUBSCRIPTION_ENDPOINT_MAX_LENGTH,
            'a',
        );
        expect(
            SubscribePushNotificationsRequestSchema.safeParse(
                withEndpoint(endpoint),
            ).success,
        ).toBe(true);
    });

    it.each([
        [
            'an endpoint in plain http',
            withEndpoint('http://push.example.test/a'),
        ],
        ['an endpoint that is no address', withEndpoint('not an address')],
        [
            'an endpoint one sign too long',
            withEndpoint(
                `${ENDPOINT}/`.padEnd(
                    PUSH_SUBSCRIPTION_ENDPOINT_MAX_LENGTH + 1,
                    'a',
                ),
            ),
        ],
        ['an empty key', withKeys('', AUTH)],
        ['a key outside base64url', withKeys(P256DH, 'abc+/def')],
        [
            'a key one sign too long',
            withKeys('a'.repeat(PUSH_SUBSCRIPTION_KEY_MAX_LENGTH + 1), AUTH),
        ],
        ['no keys', { endpoint: ENDPOINT }],
    ])('rejects %s', (_label, body) => {
        expect(
            SubscribePushNotificationsRequestSchema.safeParse(body).success,
        ).toBe(false);
    });
});
