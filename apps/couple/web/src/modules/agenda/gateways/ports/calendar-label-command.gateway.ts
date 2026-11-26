import type { CalendarLabelForm } from '@cocooning/couple-client-business-logic/agenda';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { CalendarLabelItem } from '../../view-models/calendar-label.view-model';

// The writes of the label sheet (R12, R14); a created label comes back, to be picked on the event at once.
export abstract class CalendarLabelCommandGateway {
    abstract createCalendarLabel(
        form: CalendarLabelForm,
    ): Promise<Result<CalendarLabelItem, ApiError>>;
    abstract editCalendarLabel(
        calendarLabelId: string,
        form: CalendarLabelForm,
    ): Promise<Result<null, ApiError>>;
    abstract deleteCalendarLabel(
        calendarLabelId: string,
    ): Promise<Result<null, ApiError>>;
}
