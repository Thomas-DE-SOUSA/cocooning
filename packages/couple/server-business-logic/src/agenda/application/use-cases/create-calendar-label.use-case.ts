import type { CalendarLabelColor } from '@cocooning/couple-shared-kernel/enums';
import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import { CalendarLabel } from '../../domain/models/calendar-label.aggregate';
import type { CalendarLabelRepository } from '../../domain/ports/calendar-label.repository';
import type { CalendarLabelPreconditionService } from '../../domain/services/calendar-label-precondition.service';
import { CalendarLabelName } from '../../domain/value-objects/calendar-label-name.vo';
import {
    type CalendarLabelView,
    toCalendarLabelView,
} from '../mappers/calendar-label-view.mapper';

export type CreateCalendarLabelCommand = {
    readonly name: string;
    readonly color: CalendarLabelColor;
};

// R12: either partner adds a label to the couple's list, within CALENDAR_LABEL_MAX_COUNT.
export class CreateCalendarLabelUseCase {
    constructor(
        private readonly calendarLabelRepository: CalendarLabelRepository,
        private readonly calendarLabelPreconditionService: CalendarLabelPreconditionService,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: CreateCalendarLabelCommand,
    ): Promise<CalendarLabelView> {
        await this.calendarLabelPreconditionService.ensureLabelRoomLeft(
            context,
        );
        const label = CalendarLabel.create(
            {
                coupleId: context.coupleId,
                ownerId: context.userId,
                name: CalendarLabelName.create(command.name),
                color: command.color,
            },
            this.dateTimeProvider.now(),
        );
        await this.calendarLabelRepository.save(label);
        await this.eventPublishingService.publishAndClear([label]);
        return toCalendarLabelView(label);
    }
}
