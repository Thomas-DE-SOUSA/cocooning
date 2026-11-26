import type { CalendarLabelResponse } from '@cocooning/couple-contract/agenda';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { CalendarLabelsGateway } from '../../domain/ports/calendar-labels.gateway';
import type { CalendarLabelForm } from '../schemas/calendar-label-form.zod';

// R12: either partner adds a label; past CALENDAR_LABEL_MAX_COUNT the API answers CONFLICT (CALENDAR_LABEL_LIMIT_REACHED).
export class CreateCalendarLabelUseCase {
    constructor(
        private readonly calendarLabelsGateway: CalendarLabelsGateway,
    ) {}

    execute(
        form: CalendarLabelForm,
    ): Promise<Result<CalendarLabelResponse, ApiError>> {
        return this.calendarLabelsGateway.create(form);
    }
}
