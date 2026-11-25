import { violatedUniqueConstraint } from '@cocooning/couple-prisma/errors';
import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { AgendaException } from '@cocooning/couple-server-business-logic/agenda';

// Two saves read the same version: the second outbox row collides on (aggregate_id, version).
const EVENT_VERSION_CONSTRAINT = 'agenda_event_aggregate_id_version_key';
// A stale save of a label deleted in between finds no live row and tries to create it again.
const LABEL_PRIMARY_KEY = 'calendar_label_pkey';

export const calendarLabelVersionConflict = (): AgendaException =>
    new AgendaException({
        code: AgendaExceptionCodeEnum.CALENDAR_LABEL_VERSION_CONFLICT,
        message: 'Calendar label changed since it was read',
    });

export function toCalendarLabelVersionConflict(
    error: unknown,
): AgendaException | null {
    const constraint = violatedUniqueConstraint(error);
    if (
        constraint !== EVENT_VERSION_CONSTRAINT &&
        constraint !== LABEL_PRIMARY_KEY
    )
        return null;
    return calendarLabelVersionConflict();
}
