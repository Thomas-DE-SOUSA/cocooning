import type {
    CreateCalendarEventRequest,
    EditCalendarEventRequest,
} from '@cocooning/couple-contract/agenda';
import {
    CalendarEventAudienceEnum,
    CalendarEventVisibilityEnum,
} from '@cocooning/couple-shared-kernel/enums';
import type { CalendarEventForm } from '../schemas/calendar-event-form.zod';

// R11: until the form asks who the event is for, a private event is for its author and a shared one for both.
export const toEditCalendarEventRequest = (
    form: CalendarEventForm,
): EditCalendarEventRequest => ({
    title: form.title,
    description: form.description,
    startsOn: form.startsOn,
    endsOn: form.endsOn,
    startsAt: form.startsAt,
    endsAt: form.endsAt,
    audience: form.isPrivate
        ? CalendarEventAudienceEnum.OWNER
        : CalendarEventAudienceEnum.BOTH,
});

// R3: shared unless the author ticks "rien que pour moi".
export const toCreateCalendarEventRequest = (
    form: CalendarEventForm,
): CreateCalendarEventRequest => ({
    ...toEditCalendarEventRequest(form),
    visibility: form.isPrivate
        ? CalendarEventVisibilityEnum.PRIVATE
        : CalendarEventVisibilityEnum.SHARED,
});
