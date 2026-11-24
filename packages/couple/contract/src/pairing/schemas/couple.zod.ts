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

// Calendar days YYYY-MM-DD; endedOn null while the period goes on (R9).
const TogetherPeriodResponseSchema = z.object({
    startedOn: z.string(),
    endedOn: z.string().nullable(),
});

// The body of every pairing action (create, join, renew, get): the CoupleView of the use cases.
export const CoupleResponseSchema = z.object({
    coupleId: z.string(),
    pairingStatus: z.enum(Object.values(CouplePairingStatusEnum)),
    partners: z.array(CouplePartnerResponseSchema),
    invitationCode: InvitationCodeResponseSchema.nullable(),
    togetherPeriods: z.array(TogetherPeriodResponseSchema),
});

export type CoupleResponse = z.infer<typeof CoupleResponseSchema>;
