import type { CalendarLabelListResponse } from '@cocooning/couple-contract/agenda';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { CalendarLabelsGateway } from '../../domain/ports/calendar-labels.gateway';

// R12: the labels of the couple, in creation order.
export class ListCalendarLabelsUseCase {
    constructor(
        private readonly calendarLabelsGateway: CalendarLabelsGateway,
    ) {}

    execute(): Promise<Result<CalendarLabelListResponse, ApiError>> {
        return this.calendarLabelsGateway.list();
    }
}
