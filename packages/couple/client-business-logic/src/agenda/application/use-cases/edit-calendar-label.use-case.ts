import type { CalendarLabelResponse } from '@cocooning/couple-contract/agenda';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { CalendarLabelsGateway } from '../../domain/ports/calendar-labels.gateway';
import type { CalendarLabelForm } from '../schemas/calendar-label-form.zod';

// R12: either partner renames and recolours a label in one edit; an unknown one is NOT_FOUND (CALENDAR_LABEL_NOT_FOUND).
export class EditCalendarLabelUseCase {
    constructor(
        private readonly calendarLabelsGateway: CalendarLabelsGateway,
    ) {}

    execute(
        calendarLabelId: string,
        form: CalendarLabelForm,
    ): Promise<Result<CalendarLabelResponse, ApiError>> {
        return this.calendarLabelsGateway.edit(calendarLabelId, form);
    }
}
