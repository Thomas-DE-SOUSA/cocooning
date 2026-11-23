import { INVITATION_CODE_ENTRY_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';

export const JoinCoupleRequestSchema = z.object({
    invitationCode: z
        .string()
        .trim()
        .min(1)
        .max(INVITATION_CODE_ENTRY_MAX_LENGTH),
});

export type JoinCoupleRequest = z.infer<typeof JoinCoupleRequestSchema>;
