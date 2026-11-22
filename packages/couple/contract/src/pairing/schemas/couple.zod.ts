import { CouplePairingStatusEnum } from '@cocooning/couple-shared-kernel/enums';
import { z } from 'zod';

const CouplePartnerResponseSchema = z.object({
    userId: z.string(),
    joinedAt: z.string(),
});

const InvitationCodeResponseSchema = z.object({
    value: z.string(),
    expiresAt: z.string(),
});

// The body of every pairing action (create, join, renew, get): the CoupleView of the use cases.
export const CoupleResponseSchema = z.object({
    coupleId: z.string(),
    pairingStatus: z.enum(Object.values(CouplePairingStatusEnum)),
    partners: z.array(CouplePartnerResponseSchema),
    invitationCode: InvitationCodeResponseSchema.nullable(),
});

export type CoupleResponse = z.infer<typeof CoupleResponseSchema>;
