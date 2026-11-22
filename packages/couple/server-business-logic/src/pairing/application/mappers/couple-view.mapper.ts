import type { CouplePairingStatus } from '@cocooning/couple-shared-kernel/enums';
import type { Couple } from '../../domain/models/couple.aggregate';

export type CoupleView = {
    readonly coupleId: string;
    readonly pairingStatus: CouplePairingStatus;
    readonly partners: ReadonlyArray<{
        readonly userId: string;
        readonly joinedAt: Date;
    }>;
    readonly invitationCode: {
        readonly value: string;
        readonly expiresAt: Date;
    } | null;
};

export const toCoupleView = (couple: Couple): CoupleView => ({
    coupleId: couple.id.getValue(),
    pairingStatus: couple.pairingStatus,
    partners: couple.partners.map(({ userId, joinedAt }) => ({
        userId,
        joinedAt,
    })),
    invitationCode:
        couple.invitationCode === null
            ? null
            : {
                  value: couple.invitationCode.value,
                  expiresAt: couple.invitationCode.expiresAt,
              },
});
