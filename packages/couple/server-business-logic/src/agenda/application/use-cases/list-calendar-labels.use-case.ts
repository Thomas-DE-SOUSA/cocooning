import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { CalendarLabelRepository } from '../../domain/ports/calendar-label.repository';
import {
    type CalendarLabelView,
    toCalendarLabelViews,
} from '../mappers/calendar-label-view.mapper';

// R12: the live labels of the couple, in creation order.
export class ListCalendarLabelsUseCase {
    constructor(
        private readonly calendarLabelRepository: CalendarLabelRepository,
    ) {}

    async execute(
        context: ExecutionContext,
    ): Promise<ReadonlyArray<CalendarLabelView>> {
        const labels = await this.calendarLabelRepository.findAll(
            context.coupleId,
        );
        return toCalendarLabelViews(labels);
    }
}
