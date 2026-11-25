import type { SubscribePushNotificationsRequest } from '@cocooning/couple-contract/messaging';

const BASE64_BLOCK = 4;

// pushManager.subscribe() takes the VAPID public key as bytes; the API gives it in base64url.
export function applicationServerKeyOf(
    publicKey: string,
): Uint8Array<ArrayBuffer> {
    const base64 = publicKey.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(
        Math.ceil(base64.length / BASE64_BLOCK) * BASE64_BLOCK,
        '=',
    );
    return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

// The JSON of a PushSubscription types every field as optional: a subscription without its keys cannot be sent.
export function subscriptionRequestOf(
    json: PushSubscriptionJSON,
): SubscribePushNotificationsRequest | null {
    const p256dh = json.keys?.['p256dh'];
    const auth = json.keys?.['auth'];
    if (!json.endpoint || !p256dh || !auth) return null;
    return { endpoint: json.endpoint, keys: { p256dh, auth } };
}
