import { couplePrismaEnvSchema } from '@cocooning/couple-prisma/env';
import { z } from 'zod';
import { authenticationEnvSchema } from './modules/authentication/env';

const MAX_PORT = 65_535;

const LOG_LEVELS = [
    'fatal',
    'error',
    'warn',
    'info',
    'debug',
    'trace',
    'silent',
] as const;

const apiEnvSchema = z.object({
    PORT: z.coerce.number().int().min(1).max(MAX_PORT),
    LOG_LEVEL: z.enum(LOG_LEVELS),
    LOG_PRETTY: z.stringbool(),
    DB_TX_TIMEOUT_MS: z.coerce.number().int().positive(),
    DB_TX_MAX_WAIT_MS: z.coerce.number().int().positive(),
});

export const environmentSchema = apiEnvSchema
    .extend(couplePrismaEnvSchema.shape)
    .extend(authenticationEnvSchema.shape);

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnvironment(
    config: Record<string, unknown>,
): Environment {
    return environmentSchema.parse(config);
}
