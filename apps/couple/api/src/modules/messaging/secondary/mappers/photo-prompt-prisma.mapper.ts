import type { PhotoPrompt } from '@cocooning/couple-prisma/client';
import type { PhotoPromptSnapshot } from '@cocooning/couple-server-business-logic/messaging';

export type PhotoPromptRow = PhotoPrompt;

const ISO_DAY_LENGTH = 'YYYY-MM-DD'.length;

// A DATE column crosses Prisma as a Date at midnight UTC: the day is its UTC date, never a Paris instant (decision 0047).
export const toDayColumn = (day: string): Date =>
    new Date(`${day}T00:00:00.000Z`);

const fromDayColumn = (column: Date): string =>
    column.toISOString().slice(0, ISO_DAY_LENGTH);

export function toPhotoPromptSnapshot(
    raw: PhotoPromptRow,
): PhotoPromptSnapshot {
    return {
        id: raw.id,
        coupleId: raw.coupleId,
        day: fromDayColumn(raw.day),
        scheduledAt: raw.scheduledAt.toISOString(),
        issuedAt: raw.issuedAt === null ? null : raw.issuedAt.toISOString(),
        version: raw.version,
        metadata: {
            createdAt: raw.createdAt.toISOString(),
            updatedAt: raw.updatedAt.toISOString(),
            deletedAt: null,
        },
    };
}
