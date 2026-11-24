import { z } from 'zod';

// The VAPID public key the PWA passes to pushManager.subscribe(); the private key never leaves the API.
export const PushPublicKeyResponseSchema = z.object({
    publicKey: z.string(),
});

export type PushPublicKeyResponse = z.infer<typeof PushPublicKeyResponseSchema>;
