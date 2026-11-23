import type { TestCouple } from '@cocooning/couple-e2e-shared/fixtures';
import {
    Couple,
    InvitationCode,
} from '@cocooning/couple-server-business-logic/pairing';
import { isoAt, NOW, PARTNER_A, PARTNER_C } from './pairing-test-data';

// Two pending couples written as rows, so the adapter is read before it ever wrote.
export const STRANGER = '01936b2e-7c4a-7000-8000-0000000000ee';
export const PENDING = {
    pairingStatus: 'PENDING',
    invitationCodeExpiresAt: new Date(isoAt(48)),
    createdAt: NOW,
} as const;
export const FIRST: TestCouple = {
    ...PENDING,
    coupleId: '01936b2e-7c4a-7000-8000-0000000000f1',
    partnerUserIds: [PARTNER_A],
    invitationCode: 'AAAAAAAA',
};
export const SECOND: TestCouple = {
    ...PENDING,
    coupleId: '01936b2e-7c4a-7000-8000-0000000000f2',
    partnerUserIds: [PARTNER_C],
    invitationCode: 'BBBBBBBB',
};

export const newCoupleWith = (
    creatorUserId: string,
    codeValue: string,
): Couple =>
    Couple.create(
        {
            creatorUserId,
            invitationCode: InvitationCode.from({
                value: codeValue,
                expiresAt: isoAt(48),
            }),
        },
        NOW,
    );

export const found = (couple: Couple | null): Couple => {
    if (couple === null) throw new Error('Expected a stored couple');
    return couple;
};
