import type { CalendarEventCommand } from '../view-models/calendar-event-command.view-model';

// Keys of the agenda namespace: the short confirmation of each command, and the title of its failure toast.
export const CALENDAR_EVENT_DONE_KEYS: Readonly<
    Record<CalendarEventCommand, string>
> = {
    CREATE_CALENDAR_EVENT: 'toast.created',
    SAVE_CALENDAR_EVENT: 'toast.saved',
    DELETE_CALENDAR_EVENT: 'toast.deleted',
};

export const CALENDAR_EVENT_FAILURE_KEYS: Readonly<
    Record<CalendarEventCommand, string>
> = {
    CREATE_CALENDAR_EVENT: 'toast.createFailed',
    SAVE_CALENDAR_EVENT: 'toast.saveFailed',
    DELETE_CALENDAR_EVENT: 'toast.deleteFailed',
};
