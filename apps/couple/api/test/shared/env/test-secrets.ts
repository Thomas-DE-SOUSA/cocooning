export const TEST_AUTH_JWT_SECRET =
    'e2e-only-secret-never-used-outside-the-tests';

// Shaped like a VAPID pair, never a real one: the E2E tests send through a fake PushNotificationSender.
export const TEST_VAPID_PUBLIC_KEY = `BE2eOnlyPublicKey${'A'.repeat(70)}`;
export const TEST_VAPID_PRIVATE_KEY = `E2eOnlyPrivateKey${'A'.repeat(26)}`;
