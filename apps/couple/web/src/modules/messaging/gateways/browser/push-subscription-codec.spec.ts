import {
    applicationServerKeyOf,
    subscriptionRequestOf,
} from './push-subscription-codec';

describe('Feature: the VAPID public key given to the phone', () => {
    it.each([
        ['without padding', 'AQID_-8', [1, 2, 3, 255, 239]],
        ['of a whole block', 'AQID', [1, 2, 3]],
    ])('turns a base64url key %s into bytes', (_label, key, bytes) => {
        expect([...applicationServerKeyOf(key)]).toEqual(bytes);
    });
});

describe('Feature: the subscription of the phone sent to the API', () => {
    const KEYS = { p256dh: 'BNcRdreALRFX', auth: 'tBHItJI5svbp' };

    it('keeps the endpoint and the keys only', () => {
        expect(
            subscriptionRequestOf({
                endpoint: 'https://push.example.test/send/phone-1',
                expirationTime: null,
                keys: KEYS,
            }),
        ).toEqual({
            endpoint: 'https://push.example.test/send/phone-1',
            keys: KEYS,
        });
    });

    it.each([
        ['without endpoint', { keys: KEYS }],
        ['without keys', { endpoint: 'https://push.example.test/send/1' }],
        [
            'without auth key',
            {
                endpoint: 'https://push.example.test/send/1',
                keys: { p256dh: KEYS.p256dh },
            },
        ],
    ])('refuses a subscription %s', (_label, json) => {
        expect(subscriptionRequestOf(json)).toBeNull();
    });
});
