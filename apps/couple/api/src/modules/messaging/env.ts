import { z } from 'zod';

// Base64url keys of `npx web-push generate-vapid-keys`: an uncompressed P-256 point (65 bytes), a private scalar (32).
const VAPID_PUBLIC_KEY = /^B[A-Za-z0-9_-]{86}$/;
const VAPID_PRIVATE_KEY = /^[A-Za-z0-9_-]{43}$/;

export const messagingEnvSchema = z.object({
    PHOTO_PROMPT_SCHEDULER_ENABLED: z.stringbool(),
    OUTBOX_RELAY_ENABLED: z.stringbool(),
    WEB_PUSH_VAPID_PUBLIC_KEY: z.string().regex(VAPID_PUBLIC_KEY),
    WEB_PUSH_VAPID_PRIVATE_KEY: z.string().regex(VAPID_PRIVATE_KEY),
    // The push services (Apple's above all) refuse a subject that is neither an https address nor a mailto.
    WEB_PUSH_VAPID_SUBJECT: z.url({ protocol: /^(https|mailto)$/ }),
});

export type MessagingEnv = z.infer<typeof messagingEnvSchema>;
