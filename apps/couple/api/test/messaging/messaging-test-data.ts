import {
    type MessageFeedItemResponse,
    MessageFeedItemResponseSchema,
    type MessageFeedPageResponse,
    MessageFeedPageResponseSchema,
    type TodayPhotoPromptResponse,
    TodayPhotoPromptResponseSchema,
} from '@cocooning/couple-contract/messaging';
import type {
    TestAccount,
    TestCouple,
} from '@cocooning/couple-e2e-shared/fixtures';
import type { TestResponse } from '../shared/app/test-client';

export const NOW = new Date('2026-11-24T10:00:00.000Z');
export const COUPLE_ID = '01936b2e-7c4a-7000-8000-0000000000f1';
export const OTHER_COUPLE_ID = '01936b2e-7c4a-7000-8000-0000000000f2';
export const PARTNER_A = '01936b2e-7c4a-7000-8000-00000000000a';
export const PARTNER_B = '01936b2e-7c4a-7000-8000-00000000000b';
export const STRANGER = '01936b2e-7c4a-7000-8000-00000000000c';
export const ALONE = '01936b2e-7c4a-7000-8000-00000000000d';
export const PARTNERS = [PARTNER_A, PARTNER_B, STRANGER, ALONE] as const;
export const UNKNOWN_ID = '01936b2e-7c4a-7000-8000-0000000000ff';
export const LOVE = "Je t'aime";

// The first bytes of a JPEG and a PNG of a phone camera, enough for R3; a GIF is not accepted.
export const JPEG_PHOTO = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4]);
export const PNG_PHOTO = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4,
]);
export const GIF_IMAGE = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);

// The guard loads the account of every session (decision 0034); the messages never sign in, so the hash is never checked.
export const partnerAccount = (userId: string): TestAccount => ({
    accountId: userId,
    emailAddress: `${userId}@cocooning.test`,
    passwordHash: 'never-checked-by-messaging',
    sessionVersion: 1,
    createdAt: NOW,
    deletedAt: null,
});

// A and B form the couple of the feed, the stranger another one; ALONE has no couple (R4).
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

export const refusal = (
    status: number,
    code: string,
    message: string,
    context: Record<string, number> | null = null,
) => ({
    status,
    body: { status, code, message, context },
});

export const feedItemOf = (response: TestResponse): MessageFeedItemResponse =>
    MessageFeedItemResponseSchema.parse(response.body);

export const feedPageOf = (response: TestResponse): MessageFeedPageResponse =>
    MessageFeedPageResponseSchema.parse(response.body);

// NOW is 11:00 in Paris; the random port answers 600, the minute of 10:00 Paris.
export const SEVEN_AM = new Date('2026-11-24T06:00:00.000Z');
export const TEN_AM_MINUTE = 600;
export const TEN_AM = new Date('2026-11-24T09:00:00.000Z');
export const MIDNIGHT = new Date('2026-11-24T23:00:00.000Z');
export const MILLISECONDS_PER_MINUTE = 60_000;

export const todayPhotoPromptOf = (
    response: TestResponse,
): TodayPhotoPromptResponse =>
    TodayPhotoPromptResponseSchema.parse(response.body);
