import type { ExecutionContext } from '@cocooning/shared-kernel/domain';

export const NOW = new Date('2026-11-24T10:00:00.000Z');
export const MILLISECONDS_PER_HOUR = 3_600_000;
export const COUPLE_ID = 'c0000000-0000-7000-8000-0000000000c1';
export const OTHER_COUPLE_ID = 'c0000000-0000-7000-8000-0000000000c2';
export const PARTNER_A = 'a0000000-0000-7000-8000-00000000000a';
export const PARTNER_B = 'b0000000-0000-7000-8000-00000000000b';
export const STRANGER = 'd0000000-0000-7000-8000-00000000000d';
export const AS_A: ExecutionContext = {
    coupleId: COUPLE_ID,
    userId: PARTNER_A,
};
export const AS_B: ExecutionContext = {
    coupleId: COUPLE_ID,
    userId: PARTNER_B,
};
export const AS_STRANGER: ExecutionContext = {
    coupleId: OTHER_COUPLE_ID,
    userId: STRANGER,
};

// The UUID v7 the fake generator hands out, in order: aggregates and events share the counter.
export const idNumber = (counter: number): string =>
    `00000000-0000-7000-8000-${String(counter).padStart(12, '0')}`;
export const FIRST_ID = idNumber(1);

export const LOVE = "Je t'aime";

// The first bytes of a JPEG of a phone camera, enough for R3.
export const JPEG_PHOTO = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4]);
export const JPEG = 'image/jpeg';
