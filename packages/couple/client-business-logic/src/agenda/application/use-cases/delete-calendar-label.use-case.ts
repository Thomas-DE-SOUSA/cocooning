import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { CalendarLabelsGateway } from '../../domain/ports/calendar-labels.gateway';

// R14: either partner deletes a label; its events stay, without a label.
export class DeleteCalendarLabelUseCase {
    constructor(
        private readonly calendarLabelsGateway: CalendarLabelsGateway,
    ) {}

    execute(calendarLabelId: string): Promise<Result<null, ApiError>> {
        return this.calendarLabelsGateway.delete(calendarLabelId);
    }
}
