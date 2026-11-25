import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { CalendarEventRepository } from '../../domain/ports/calendar-event.repository';
import type { CalendarEventPreconditionService } from '../../domain/services/calendar-event-precondition.service';
import type { CalendarLabelPreconditionService } from '../../domain/services/calendar-label-precondition.service';
import {
    type CalendarEventDetailsInput,
    createCalendarEventDetails,
} from '../../domain/value-objects/calendar-event-details';
import {
    type CalendarEventView,
    toCalendarEventView,
} from '../mappers/calendar-event-view.mapper';

// Every detail is sent again: the form shows them all and returns them all.
export type EditCalendarEventCommand = CalendarEventDetailsInput & {
    readonly calendarEventId: string;
};

export class EditCalendarEventUseCase {
    constructor(
        private readonly calendarEventRepository: CalendarEventRepository,
        private readonly calendarEventPreconditionService: CalendarEventPreconditionService,
        private readonly calendarLabelPreconditionService: CalendarLabelPreconditionService,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: EditCalendarEventCommand,
    ): Promise<CalendarEventView> {
        await this.calendarLabelPreconditionService.ensureLabelUsable(
            context,
            command.labelId,
        );
        const calendarEvent =
            await this.calendarEventPreconditionService.loadVisibleCalendarEvent(
                context,
                command.calendarEventId,
            );
        const details = createCalendarEventDetails(command);
        calendarEvent.edit(
            context.userId,
            details,
            this.dateTimeProvider.now(),
        );
        await this.calendarEventRepository.save(calendarEvent);
        await this.eventPublishingService.publishAndClear([calendarEvent]);
        return toCalendarEventView(calendarEvent, context.userId);
    }
}
