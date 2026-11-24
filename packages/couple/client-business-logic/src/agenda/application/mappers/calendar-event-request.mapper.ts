import type {
    CreateCalendarEventRequest,
    EditCalendarEventRequest,
} from '@cocooning/couple-contract/agenda';
import { CalendarEventVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import type {
    CalendarEventDetailsForm,
    CalendarEventForm,
} from '../schemas/calendar-event-form.zod';

export const toEditCalendarEventRequest = (
    form: CalendarEventDetailsForm,
): EditCalendarEventRequest => ({
    title: form.title,
    description: form.description,
    startsOn: form.startsOn,
    endsOn: form.endsOn,
    startsAt: form.startsAt,
    endsAt: form.endsAt,
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
