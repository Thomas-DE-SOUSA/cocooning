import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { AgendaException } from '../exceptions/agenda.exception';
import type { CalendarEvent } from '../models/calendar-event.aggregate';
import type { CalendarEventRepository } from '../ports/calendar-event.repository';

export class CalendarEventPreconditionService {
    constructor(
        private readonly calendarEventRepository: CalendarEventRepository,
    ) {}

    // R7: unknown, deleted or private to the other partner, the answer is the same.
    async loadVisibleCalendarEvent(
        context: ExecutionContext,
        calendarEventId: string,
    ): Promise<CalendarEvent> {
        const calendarEvent =
            await this.calendarEventRepository.findVisibleById(
                context.coupleId,
                context.userId,
                calendarEventId,
            );
        if (calendarEvent !== null) return calendarEvent;
        throw new AgendaException({
            code: AgendaExceptionCodeEnum.CALENDAR_EVENT_NOT_FOUND,
            message: 'Calendar event not found',
        });
    }
}
