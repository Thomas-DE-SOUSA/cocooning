import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { CalendarEventPreconditionService } from '../../domain/services/calendar-event-precondition.service';
import {
    type CalendarEventView,
    toCalendarEventView,
} from '../mappers/calendar-event-view.mapper';

export type GetCalendarEventCommand = {
    readonly calendarEventId: string;
};

// R7: one event the partner sees; the private event of the other is CALENDAR_EVENT_NOT_FOUND.
export class GetCalendarEventUseCase {
    constructor(
        private readonly calendarEventPreconditionService: CalendarEventPreconditionService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: GetCalendarEventCommand,
    ): Promise<CalendarEventView> {
        const calendarEvent =
            await this.calendarEventPreconditionService.loadVisibleCalendarEvent(
                context,
                command.calendarEventId,
            );
        return toCalendarEventView(calendarEvent, context.userId);
    }
}
