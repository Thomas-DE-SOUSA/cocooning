import { z } from 'zod';

// Room for the spaces a partner types while dictating the 8 signs: the domain normalizes and decides validity (R3, R6).
const MAX_ENTERED_INVITATION_CODE_LENGTH = 32;

export const JoinCoupleRequestSchema = z.object({
    invitationCode: z
        .string()
        .trim()
        .min(1)
        .max(MAX_ENTERED_INVITATION_CODE_LENGTH),
});

export type JoinCoupleRequest = z.infer<typeof JoinCoupleRequestSchema>;
