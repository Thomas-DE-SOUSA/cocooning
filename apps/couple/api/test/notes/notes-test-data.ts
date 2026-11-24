import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import {
    type NoteResponse,
    NoteResponseSchema,
} from '@cocooning/couple-contract/notes';
import type {
    TestAccount,
    TestCouple,
} from '@cocooning/couple-e2e-shared/fixtures';
import type { TestResponse } from '../shared/app/test-client';

export const NOW = new Date('2026-11-23T10:00:00.000Z');
export const COUPLE_ID = '01936b2e-7c4a-7000-8000-0000000000f1';
export const OTHER_COUPLE_ID = '01936b2e-7c4a-7000-8000-0000000000f2';
export const PARTNER_A = '01936b2e-7c4a-7000-8000-00000000000a';
export const PARTNER_B = '01936b2e-7c4a-7000-8000-00000000000b';
export const STRANGER = '01936b2e-7c4a-7000-8000-00000000000c';
export const ALONE = '01936b2e-7c4a-7000-8000-00000000000d';
export const PARTNERS = [PARTNER_A, PARTNER_B, STRANGER, ALONE] as const;
export const UNKNOWN_NOTE_ID = '01936b2e-7c4a-7000-8000-0000000000ff';

// The guard loads the account of every session (decision 0034); notes never sign in, so the hash is never checked.
export const partnerAccount = (userId: string): TestAccount => ({
    accountId: userId,
    emailAddress: `${userId}@cocooning.test`,
    passwordHash: 'never-checked-by-notes',
    sessionVersion: 1,
    createdAt: NOW,
    deletedAt: null,
});

// A and B form the couple of the notes, the stranger another one; ALONE has no couple (R3).
const pairedCouple = (
    coupleId: string,
    partnerUserIds: string[],
): TestCouple => ({
    coupleId,
    partnerUserIds,
    pairingStatus: 'PAIRED',
    invitationCode: null,
    invitationCodeExpiresAt: null,
    createdAt: NOW,
});
export const COUPLES = [
    pairedCouple(COUPLE_ID, [PARTNER_A, PARTNER_B]),
    pairedCouple(OTHER_COUPLE_ID, [STRANGER]),
];

export const refusal = (status: number, code: string, message: string) => ({
    status,
    body: { status, code, message, context: null },
});

export const NOTES_SESSION_MISSING = refusal(
    401,
    AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_MISSING,
    'Session missing',
);

export const noteOf = (response: TestResponse): NoteResponse =>
    NoteResponseSchema.parse(response.body);
