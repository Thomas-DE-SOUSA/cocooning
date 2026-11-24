import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { CalendarEventRepository } from '../../domain/ports/calendar-event.repository';
import { CalendarEventRangeValidator } from '../../domain/services/calendar-event-range.validator';
import {
    type CalendarEventView,
    toCalendarEventViews,
} from '../mappers/calendar-event-view.mapper';

export type ListCalendarEventsCommand = {
    readonly from: string;
    readonly to: string;
};

export class ListCalendarEventsUseCase {
    constructor(
        private readonly calendarEventRepository: CalendarEventRepository,
    ) {}

    // R7: the shared events of the couple and the partner's own private events, over a range of days.
    async execute(
        context: ExecutionContext,
        command: ListCalendarEventsCommand,
    ): Promise<ReadonlyArray<CalendarEventView>> {
        CalendarEventRangeValidator.ensureReadable(command.from, command.to);
        const calendarEvents =
            await this.calendarEventRepository.findVisibleOverlapping(
                context.coupleId,
                context.userId,
                command.from,
                command.to,
            );
        return toCalendarEventViews(calendarEvents, context.userId);
    }
}
