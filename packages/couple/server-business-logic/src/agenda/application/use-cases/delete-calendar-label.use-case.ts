import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type {
    DateTimeProvider,
    UnitOfWork,
} from '@cocooning/shared-kernel/ports';
import type { CalendarEventRepository } from '../../domain/ports/calendar-event.repository';
import type { CalendarLabelRepository } from '../../domain/ports/calendar-label.repository';
import type { CalendarLabelPreconditionService } from '../../domain/services/calendar-label-precondition.service';

export type DeleteCalendarLabelCommand = {
    readonly calendarLabelId: string;
};

// R12, R14: either partner deletes a label of the couple, softly; its events stay, without it, in the same transaction.
export class DeleteCalendarLabelUseCase {
    constructor(
        private readonly calendarLabelRepository: CalendarLabelRepository,
        private readonly calendarEventRepository: CalendarEventRepository,
        private readonly calendarLabelPreconditionService: CalendarLabelPreconditionService,
        private readonly unitOfWork: UnitOfWork,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: DeleteCalendarLabelCommand,
    ): Promise<void> {
        const label =
            await this.calendarLabelPreconditionService.loadCalendarLabel(
                context,
                command.calendarLabelId,
            );
        label.delete(context.userId, this.dateTimeProvider.now());
        await this.unitOfWork.run(async () => {
            await this.calendarLabelRepository.save(label);
            await this.calendarEventRepository.clearLabel(label);
        });
        await this.eventPublishingService.publishAndClear([label]);
    }
}
