import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { CALENDAR_EVENT_RANGE_MAX_DAYS } from '@cocooning/couple-shared-kernel/limits';
import { isCalendarDay } from '@cocooning/shared-kernel/utils';
import { AgendaException } from '../exceptions/agenda.exception';

const MILLISECONDS_PER_DAY = 86_400_000;

const dayCount = (from: string, to: string): number =>
    (Date.parse(to) - Date.parse(from)) / MILLISECONDS_PER_DAY + 1;

export class CalendarEventRangeValidator {
    // Two real days, in order, at most CALENDAR_EVENT_RANGE_MAX_DAYS days both included.
    static ensureReadable(from: string, to: string): void {
        if (
            isCalendarDay(from) &&
            isCalendarDay(to) &&
            from <= to &&
            dayCount(from, to) <= CALENDAR_EVENT_RANGE_MAX_DAYS
        ) {
            return;
        }
        throw new AgendaException({
            code: AgendaExceptionCodeEnum.CALENDAR_EVENT_RANGE_INVALID,
            message: 'Invalid calendar event day range',
            context: { max: CALENDAR_EVENT_RANGE_MAX_DAYS },
        });
    }
}
