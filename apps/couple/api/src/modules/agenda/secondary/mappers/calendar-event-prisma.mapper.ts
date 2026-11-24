import type { CalendarEvent } from '@cocooning/couple-prisma/client';
import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import {
    AgendaException,
    type CalendarEventSnapshot,
} from '@cocooning/couple-server-business-logic/agenda';
import { CalendarEventVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import { parseEnum } from '@cocooning/shared-kernel/utils';
import { fromDayColumn, toDayColumn } from './calendar-day-column';

export type CalendarEventRow = CalendarEvent;

export type CalendarEventStateColumns = {
    readonly title: string;
    readonly description: string | null;
    readonly startsOn: Date;
    readonly endsOn: Date | null;
    readonly startsAt: string | null;
    readonly endsAt: string | null;
    readonly visibility: string;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
};

const toVisibility = (raw: string) => {
    try {
        return parseEnum(
            raw,
            CalendarEventVisibilityEnum,
            'CalendarEventVisibility',
        );
    } catch {
        throw new AgendaException({
            code: AgendaExceptionCodeEnum.CALENDAR_EVENT_DATA_CORRUPTED,
            message: 'Unknown calendar event visibility',
        });
    }
};

const toInstant = (iso: string | null): Date | null =>
    iso === null ? null : new Date(iso);

export function toCalendarEventSnapshot(
    raw: CalendarEventRow,
): CalendarEventSnapshot {
    return {
        id: raw.id,
        coupleId: raw.coupleId,
        ownerId: raw.ownerId,
        title: raw.title,
        description: raw.description,
        startsOn: fromDayColumn(raw.startsOn),
        endsOn: raw.endsOn === null ? null : fromDayColumn(raw.endsOn),
        startsAt: raw.startsAt,
        endsAt: raw.endsAt,
        visibility: toVisibility(raw.visibility),
        version: raw.version,
        metadata: {
            createdAt: raw.createdAt.toISOString(),
            updatedAt: raw.updatedAt.toISOString(),
            deletedAt:
                raw.deletedAt === null ? null : raw.deletedAt.toISOString(),
        },
    };
}

// The columns an update may change: never the id, the couple, the author, the creation date or the version.
export function toCalendarEventState(
    snapshot: CalendarEventSnapshot,
): CalendarEventStateColumns {
    const { metadata } = snapshot;
    return {
        title: snapshot.title,
        description: snapshot.description,
        startsOn: toDayColumn(snapshot.startsOn),
        endsOn: snapshot.endsOn === null ? null : toDayColumn(snapshot.endsOn),
        startsAt: snapshot.startsAt,
        endsAt: snapshot.endsAt,
        visibility: snapshot.visibility,
        updatedAt: new Date(metadata.updatedAt),
        deletedAt: toInstant(metadata.deletedAt),
    };
}
