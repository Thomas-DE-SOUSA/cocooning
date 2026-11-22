import { z } from 'zod';

// sub is the partner's userId, a uuid column; a token without exp would never expire (decision 0030).
export const SessionTokenPayloadSchema = z.object({
    sub: z.uuid(),
    exp: z.number().int(),
});
