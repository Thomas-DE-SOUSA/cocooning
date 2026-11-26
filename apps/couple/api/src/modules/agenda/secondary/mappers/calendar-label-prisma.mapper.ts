import type { CalendarLabel } from '@cocooning/couple-prisma/client';
import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import {
    AgendaException,
    type CalendarLabelSnapshot,
} from '@cocooning/couple-server-business-logic/agenda';
import { CalendarLabelColorEnum } from '@cocooning/couple-shared-kernel/enums';
import { parseEnum } from '@cocooning/shared-kernel/utils';

export type CalendarLabelRow = CalendarLabel;

export type CalendarLabelStateColumns = {
    readonly name: string;
    readonly color: string;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
};

const toColor = (raw: string) => {
    try {
        return parseEnum(raw, CalendarLabelColorEnum, 'CalendarLabelColor');
    } catch {
        throw new AgendaException({
            code: AgendaExceptionCodeEnum.CALENDAR_LABEL_DATA_CORRUPTED,
            message: 'Unknown calendar label colour',
        });
    }
};

export function toCalendarLabelSnapshot(
    raw: CalendarLabelRow,
): CalendarLabelSnapshot {
    return {
        id: raw.id,
        coupleId: raw.coupleId,
        ownerId: raw.ownerId,
        name: raw.name,
        color: toColor(raw.color),
        version: raw.version,
        metadata: {
            createdAt: raw.createdAt.toISOString(),
            updatedAt: raw.updatedAt.toISOString(),
            deletedAt:
                raw.deletedAt === null ? null : raw.deletedAt.toISOString(),
        },
    };
}

// The columns an update may change: never the id, the couple, the creator, the creation date or the version.
export function toCalendarLabelState(
    snapshot: CalendarLabelSnapshot,
): CalendarLabelStateColumns {
    const { deletedAt } = snapshot.metadata;
    return {
        name: snapshot.name,
        color: snapshot.color,
        updatedAt: new Date(snapshot.metadata.updatedAt),
        deletedAt: deletedAt === null ? null : new Date(deletedAt),
    };
}
