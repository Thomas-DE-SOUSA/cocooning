import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import {
    type CoupleResponse,
    CoupleResponseSchema,
} from '@cocooning/couple-contract/pairing';
import type { TestAccount } from '@cocooning/couple-e2e-shared/fixtures';
import type { TestResponse } from '../shared/app/test-client';

export const NOW = new Date('2026-11-23T10:00:00.000Z');
export const MILLISECONDS_PER_HOUR = 3_600_000;
export const PARTNER_A = '01936b2e-7c4a-7000-8000-00000000000a';
export const PARTNER_B = '01936b2e-7c4a-7000-8000-00000000000b';
export const PARTNER_C = '01936b2e-7c4a-7000-8000-00000000000c';
export const PARTNER_D = '01936b2e-7c4a-7000-8000-00000000000d';
export const PARTNERS = [PARTNER_A, PARTNER_B, PARTNER_C, PARTNER_D] as const;
export const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export const INVITATION_CODE_PATTERN = /^[A-HJ-NP-Z2-9]{8}$/;

export const isoAt = (hoursAfterNow: number): string =>
    new Date(
        NOW.getTime() + hoursAfterNow * MILLISECONDS_PER_HOUR,
    ).toISOString();

// The guard loads the account of every session (decision 0034); pairing never signs in, so the hash is never checked.
export const partnerAccount = (userId: string): TestAccount => ({
    accountId: userId,
    emailAddress: `${userId}@cocooning.test`,
    passwordHash: 'never-checked-by-pairing',
    sessionVersion: 1,
    createdAt: NOW,
    deletedAt: null,
});

export const refusal = (status: number, code: string, message: string) => ({
    status,
    body: { status, code, message, context: null },
});

export const PAIRING_SESSION_MISSING = refusal(
    401,
    AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_MISSING,
    'Session missing',
);

export const coupleOf = (response: TestResponse): CoupleResponse =>
    CoupleResponseSchema.parse(response.body);

export const codeOf = (response: TestResponse): string => {
    const { invitationCode } = coupleOf(response);
    if (invitationCode === null) throw new Error('Expected an invitation code');
    return invitationCode.value;
};
