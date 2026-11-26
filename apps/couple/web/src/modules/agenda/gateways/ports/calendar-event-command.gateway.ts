import type { CalendarEventForm } from '@cocooning/couple-client-business-logic/agenda';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';

// The writes of the drawer; the page reads the agenda again after each one (decision 0036).
export abstract class CalendarEventCommandGateway {
    abstract createCalendarEvent(
        form: CalendarEventForm,
    ): Promise<Result<null, ApiError>>;
    abstract editCalendarEvent(
        calendarEventId: string,
        form: CalendarEventForm,
        isOwner: boolean,
    ): Promise<Result<null, ApiError>>;
    abstract shareCalendarEvent(
        calendarEventId: string,
    ): Promise<Result<null, ApiError>>;
    abstract makeCalendarEventPrivate(
        calendarEventId: string,
    ): Promise<Result<null, ApiError>>;
    abstract deleteCalendarEvent(
        calendarEventId: string,
    ): Promise<Result<null, ApiError>>;
}
