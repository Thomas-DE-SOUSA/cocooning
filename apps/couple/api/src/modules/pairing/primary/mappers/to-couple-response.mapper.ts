import type { CoupleResponse } from '@cocooning/couple-contract/pairing';
import type { CoupleView } from '@cocooning/couple-server-business-logic/pairing';

// Dates cross the wire as ISO strings (contracts.md rule 4).
export const toCoupleResponse = (view: CoupleView): CoupleResponse => ({
    coupleId: view.coupleId,
    pairingStatus: view.pairingStatus,
    partners: view.partners.map(({ userId, joinedAt }) => ({
        userId,
        joinedAt: joinedAt.toISOString(),
    })),
    invitationCode:
        view.invitationCode === null
            ? null
            : {
                  value: view.invitationCode.value,
                  expiresAt: view.invitationCode.expiresAt.toISOString(),
              },
    togetherPeriods: view.togetherPeriods.map(({ startedOn, endedOn }) => ({
        startedOn,
        endedOn,
    })),
});
