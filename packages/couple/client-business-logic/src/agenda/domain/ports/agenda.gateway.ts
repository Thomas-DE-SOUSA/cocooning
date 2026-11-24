import type {
    CalendarEventListResponse,
    CalendarEventQueryRequest,
    CalendarEventResponse,
    CreateCalendarEventRequest,
    EditCalendarEventRequest,
} from '@cocooning/couple-contract/agenda';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';

// Every call acts for the signed-in partner: the adapter forwards the session (decision 0036), the API finds the couple (decision 0041).
export abstract class AgendaGateway {
    abstract listCalendarEvents(
        query: CalendarEventQueryRequest,
    ): Promise<Result<CalendarEventListResponse, ApiError>>;
    abstract getCalendarEvent(
        calendarEventId: string,
    ): Promise<Result<CalendarEventResponse, ApiError>>;
    abstract createCalendarEvent(
        request: CreateCalendarEventRequest,
    ): Promise<Result<CalendarEventResponse, ApiError>>;
    abstract editCalendarEvent(
        calendarEventId: string,
        request: EditCalendarEventRequest,
    ): Promise<Result<CalendarEventResponse, ApiError>>;
    abstract shareCalendarEvent(
        calendarEventId: string,
    ): Promise<Result<CalendarEventResponse, ApiError>>;
    abstract makeCalendarEventPrivate(
        calendarEventId: string,
    ): Promise<Result<CalendarEventResponse, ApiError>>;
    abstract deleteCalendarEvent(
        calendarEventId: string,
    ): Promise<Result<null, ApiError>>;
}
