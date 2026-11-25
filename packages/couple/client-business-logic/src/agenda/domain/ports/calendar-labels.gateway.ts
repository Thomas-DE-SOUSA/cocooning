import type {
    CalendarLabelListResponse,
    CalendarLabelResponse,
    CreateCalendarLabelRequest,
    EditCalendarLabelRequest,
} from '@cocooning/couple-contract/agenda';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';

// The labels of the couple (R12); every call acts for the signed-in partner, the API finds the couple (decision 0041).
export abstract class CalendarLabelsGateway {
    abstract list(): Promise<Result<CalendarLabelListResponse, ApiError>>;
    abstract create(
        request: CreateCalendarLabelRequest,
    ): Promise<Result<CalendarLabelResponse, ApiError>>;
    abstract edit(
        calendarLabelId: string,
        request: EditCalendarLabelRequest,
    ): Promise<Result<CalendarLabelResponse, ApiError>>;
    abstract delete(calendarLabelId: string): Promise<Result<null, ApiError>>;
}
