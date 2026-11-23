import { z } from 'zod';

// sub is the partner's userId, ver the session version of the account; a token without exp would never expire (decision 0034).
export const SessionTokenPayloadSchema = z.object({
    sub: z.uuid(),
    ver: z.number().int().positive(),
    exp: z.number().int(),
});
