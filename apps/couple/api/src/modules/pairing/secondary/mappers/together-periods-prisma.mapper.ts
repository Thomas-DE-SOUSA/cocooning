import type { Prisma } from '@cocooning/couple-prisma/client';
import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import {
    type CoupleSnapshot,
    PairingException,
} from '@cocooning/couple-server-business-logic/pairing';
import { z } from 'zod';

type TogetherPeriodsSnapshot = CoupleSnapshot['togetherPeriods'];

const StoredTogetherPeriodsSchema = z.array(
    z.object({
        startedOn: z.iso.date(),
        endedOn: z.iso.date().nullable(),
    }),
);

// A JSONB column has no shape of its own: an unreadable list is corrupted data, never an empty one (core.md rule 11).
export function toTogetherPeriodsSnapshot(
    column: Prisma.JsonValue,
): TogetherPeriodsSnapshot {
    const parsed = StoredTogetherPeriodsSchema.safeParse(column);
    if (parsed.success) return parsed.data;
    throw new PairingException({
        code: PairingExceptionCodeEnum.PAIRING_COUPLE_DATA_CORRUPTED,
        message: 'Unreadable together periods',
    });
}

export const toTogetherPeriodsColumn = (
    periods: TogetherPeriodsSnapshot,
): Prisma.InputJsonValue =>
    periods.map(({ startedOn, endedOn }) => ({ startedOn, endedOn }));
