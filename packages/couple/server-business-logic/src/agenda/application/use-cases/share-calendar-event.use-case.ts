import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { CalendarEventRepository } from '../../domain/ports/calendar-event.repository';
import type { CalendarEventPreconditionService } from '../../domain/services/calendar-event-precondition.service';
import {
    type CalendarEventView,
    toCalendarEventView,
} from '../mappers/calendar-event-view.mapper';

export type ShareCalendarEventCommand = {
    readonly calendarEventId: string;
};

export class ShareCalendarEventUseCase {
    constructor(
        private readonly calendarEventRepository: CalendarEventRepository,
        private readonly calendarEventPreconditionService: CalendarEventPreconditionService,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: ShareCalendarEventCommand,
    ): Promise<CalendarEventView> {
        const calendarEvent =
            await this.calendarEventPreconditionService.loadVisibleCalendarEvent(
                context,
                command.calendarEventId,
            );
        calendarEvent.share(context.userId, this.dateTimeProvider.now());
        await this.calendarEventRepository.save(calendarEvent);
        await this.eventPublishingService.publishAndClear([calendarEvent]);
        return toCalendarEventView(calendarEvent, context.userId);
    }
}
