import { z } from 'zod';

export const pairingEnvSchema = z.object({
    PAIRING_INVITATION_CODE_TTL_HOURS: z.coerce.number().int().positive(),
});

export type PairingEnv = z.infer<typeof pairingEnvSchema>;
