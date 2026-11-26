import type { CalendarLabelCommand } from '../view-models/calendar-label-command.view-model';

// Keys of the labels namespace: the short confirmation of each command, and the title of its failure toast.
export const CALENDAR_LABEL_DONE_KEYS: Readonly<
    Record<CalendarLabelCommand, string>
> = {
    CREATE_CALENDAR_LABEL: 'toast.created',
    EDIT_CALENDAR_LABEL: 'toast.saved',
    DELETE_CALENDAR_LABEL: 'toast.deleted',
};

export const CALENDAR_LABEL_FAILURE_KEYS: Readonly<
    Record<CalendarLabelCommand, string>
> = {
    CREATE_CALENDAR_LABEL: 'toast.createFailed',
    EDIT_CALENDAR_LABEL: 'toast.saveFailed',
    DELETE_CALENDAR_LABEL: 'toast.deleteFailed',
};
