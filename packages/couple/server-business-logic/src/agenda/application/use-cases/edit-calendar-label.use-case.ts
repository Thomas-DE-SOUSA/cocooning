import type { CalendarLabelColor } from '@cocooning/couple-shared-kernel/enums';
import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { CalendarLabelRepository } from '../../domain/ports/calendar-label.repository';
import type { CalendarLabelPreconditionService } from '../../domain/services/calendar-label-precondition.service';
import { CalendarLabelName } from '../../domain/value-objects/calendar-label-name.vo';
import {
    type CalendarLabelView,
    toCalendarLabelView,
} from '../mappers/calendar-label-view.mapper';

export type EditCalendarLabelCommand = {
    readonly calendarLabelId: string;
    readonly name: string;
    readonly color: CalendarLabelColor;
};

// R12: either partner renames and recolours a label of the couple.
export class EditCalendarLabelUseCase {
    constructor(
        private readonly calendarLabelRepository: CalendarLabelRepository,
        private readonly calendarLabelPreconditionService: CalendarLabelPreconditionService,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: EditCalendarLabelCommand,
    ): Promise<CalendarLabelView> {
        const label =
            await this.calendarLabelPreconditionService.loadCalendarLabel(
                context,
                command.calendarLabelId,
            );
        const name = CalendarLabelName.create(command.name);
        label.edit(
            context.userId,
            name,
            command.color,
            this.dateTimeProvider.now(),
        );
        await this.calendarLabelRepository.save(label);
        await this.eventPublishingService.publishAndClear([label]);
        return toCalendarLabelView(label);
    }
}
