import { z } from 'zod';

const MIN_SECRET_LENGTH = 32;
const EXAMPLE_SECRET_PREFIX = 'change-me';

export const authenticationEnvSchema = z.object({
    // The placeholder of infrastructure/compose/.env.example is long enough to pass: a copied file must not start.
    AUTH_JWT_SECRET: z
        .string()
        .min(MIN_SECRET_LENGTH)
        .refine((secret) => !secret.startsWith(EXAMPLE_SECRET_PREFIX), {
            message: 'Replace the example secret: openssl rand -base64 48',
        }),
    AUTH_SESSION_TTL_DAYS: z.coerce.number().int().positive(),
});

export type AuthenticationEnv = z.infer<typeof authenticationEnvSchema>;
