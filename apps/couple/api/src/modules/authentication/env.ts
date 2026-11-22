import { z } from 'zod';

const MIN_SECRET_LENGTH = 32;

export const authenticationEnvSchema = z.object({
    AUTH_JWT_SECRET: z.string().min(MIN_SECRET_LENGTH),
});

export type AuthenticationEnv = z.infer<typeof authenticationEnvSchema>;
