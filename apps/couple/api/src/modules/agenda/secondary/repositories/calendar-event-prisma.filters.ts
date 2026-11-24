import type { Prisma } from '@cocooning/couple-prisma/client';
import { CalendarEventVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import { toDayColumn } from '../mappers';

// R7: the shared events of the couple and the partner's own private events, in the query (core-backend.md rule 12).
export const visibleTo = (
    coupleId: string,
    userId: string,
): Prisma.CalendarEventWhereInput => ({
    coupleId,
    OR: [
        { visibility: CalendarEventVisibilityEnum.SHARED },
        { ownerId: userId },
    ],
});

// An event touches the range when it starts by `to` and its last day, endsOn or else startsOn, comes on or after `from`.
export const overlapping = (
    from: string,
    to: string,
): Prisma.CalendarEventWhereInput => ({
    startsOn: { lte: toDayColumn(to) },
    OR: [
        { endsOn: { gte: toDayColumn(from) } },
        { endsOn: null, startsOn: { gte: toDayColumn(from) } },
    ],
});

// Day order: the first day, then all day before the hours, then the hour.
export const DAY_ORDER: Prisma.CalendarEventOrderByWithRelationInput[] = [
    { startsOn: 'asc' },
    { startsAt: { sort: 'asc', nulls: 'first' } },
    { id: 'asc' },
];
