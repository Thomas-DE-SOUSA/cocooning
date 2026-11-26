import type { CalendarEventForm } from '@cocooning/couple-client-business-logic/agenda';
import {
    type CalendarEventSave,
    type CalendarEventVisibilityChange,
    CalendarEventVisibilityChangeEnum,
} from '../view-models/calendar-event-command.view-model';

const DETAIL_FIELDS = [
    'title',
    'description',
    'startsOn',
    'endsOn',
    'startsAt',
    'endsAt',
    'audience',
    'labelId',
] as const satisfies readonly (keyof CalendarEventForm)[];

const presentVisibilityChange = (
    before: CalendarEventForm,
    after: CalendarEventForm,
): CalendarEventVisibilityChange | null => {
    if (before.isPrivate === after.isPrivate) return null;
    return after.isPrivate
        ? CalendarEventVisibilityChangeEnum.MAKE_PRIVATE
        : CalendarEventVisibilityChangeEnum.SHARE;
};

// R8, R9: an edit sends the details only when they changed, the visibility goes through its own command.
export const presentCalendarEventSave = (
    before: CalendarEventForm,
    after: CalendarEventForm,
): CalendarEventSave => ({
    editsDetails: DETAIL_FIELDS.some((field) => before[field] !== after[field]),
    visibilityChange: presentVisibilityChange(before, after),
});

export const isNothingToSave = (save: CalendarEventSave): boolean =>
    !save.editsDetails && save.visibilityChange === null;
