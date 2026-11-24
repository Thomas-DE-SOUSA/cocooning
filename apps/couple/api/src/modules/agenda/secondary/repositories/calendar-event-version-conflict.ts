import { violatedUniqueConstraint } from '@cocooning/couple-prisma/errors';
import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { AgendaException } from '@cocooning/couple-server-business-logic/agenda';

// Two saves read the same version: the second outbox row collides on (aggregate_id, version).
const EVENT_VERSION_CONSTRAINT = 'agenda_event_aggregate_id_version_key';

export const calendarEventVersionConflict = (): AgendaException =>
    new AgendaException({
        code: AgendaExceptionCodeEnum.CALENDAR_EVENT_VERSION_CONFLICT,
        message: 'Calendar event changed since it was read',
    });

export function toCalendarEventVersionConflict(
    error: unknown,
): AgendaException | null {
    if (violatedUniqueConstraint(error) !== EVENT_VERSION_CONSTRAINT)
        return null;
    return calendarEventVersionConflict();
}
