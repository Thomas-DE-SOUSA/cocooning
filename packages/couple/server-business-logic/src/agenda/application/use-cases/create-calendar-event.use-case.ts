import type { CalendarEventVisibility } from '@cocooning/couple-shared-kernel/enums';
import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import { CalendarEvent } from '../../domain/models/calendar-event.aggregate';
import type { CalendarEventRepository } from '../../domain/ports/calendar-event.repository';
import type { CalendarLabelPreconditionService } from '../../domain/services/calendar-label-precondition.service';
import {
    type CalendarEventDetailsInput,
    createCalendarEventDetails,
} from '../../domain/value-objects/calendar-event-details';
import {
    type CalendarEventView,
    toCalendarEventView,
} from '../mappers/calendar-event-view.mapper';

export type CreateCalendarEventCommand = CalendarEventDetailsInput & {
    readonly visibility: CalendarEventVisibility;
};

export class CreateCalendarEventUseCase {
    constructor(
        private readonly calendarEventRepository: CalendarEventRepository,
        private readonly calendarLabelPreconditionService: CalendarLabelPreconditionService,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: CreateCalendarEventCommand,
    ): Promise<CalendarEventView> {
        await this.calendarLabelPreconditionService.ensureLabelUsable(
            context,
            command.labelId,
        );
        const details = createCalendarEventDetails(command);
        const calendarEvent = CalendarEvent.create(
            {
                coupleId: context.coupleId,
                ownerId: context.userId,
                details,
                visibility: command.visibility,
            },
            this.dateTimeProvider.now(),
        );
        await this.calendarEventRepository.save(calendarEvent);
        await this.eventPublishingService.publishAndClear([calendarEvent]);
        return toCalendarEventView(calendarEvent, context.userId);
    }
}
