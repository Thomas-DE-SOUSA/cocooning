import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { CalendarEventRepository } from '../../domain/ports/calendar-event.repository';
import type { CalendarEventPreconditionService } from '../../domain/services/calendar-event-precondition.service';

export type DeleteCalendarEventCommand = {
    readonly calendarEventId: string;
};

export class DeleteCalendarEventUseCase {
    constructor(
        private readonly calendarEventRepository: CalendarEventRepository,
        private readonly calendarEventPreconditionService: CalendarEventPreconditionService,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: DeleteCalendarEventCommand,
    ): Promise<void> {
        const calendarEvent =
            await this.calendarEventPreconditionService.loadVisibleCalendarEvent(
                context,
                command.calendarEventId,
            );
        calendarEvent.delete(context.userId, this.dateTimeProvider.now());
        await this.calendarEventRepository.save(calendarEvent);
        await this.eventPublishingService.publishAndClear([calendarEvent]);
    }
}
