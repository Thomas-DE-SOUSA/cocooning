import type {
    CreateCalendarEventRequest,
    EditCalendarEventRequest,
} from '@cocooning/couple-contract/agenda';
import { CalendarEventVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import { toEventAudience } from '../../domain/models/viewer-audience';
import type { CalendarEventForm } from '../schemas/calendar-event-form.zod';

const AUTHOR = true;

// R11, R13: the audience picked by the partner who fills the form goes to the API relative to the author.
export const toEditCalendarEventRequest = (
    form: CalendarEventForm,
    isOwner: boolean,
): EditCalendarEventRequest => ({
    title: form.title,
    description: form.description,
    startsOn: form.startsOn,
    endsOn: form.endsOn,
    startsAt: form.startsAt,
    endsAt: form.endsAt,
    audience: toEventAudience(form.audience, isOwner),
    labelId: form.labelId,
});

// R1, R3: the partner who creates the event is its author; shared unless they tick "rien que pour moi".
export const toCreateCalendarEventRequest = (
    form: CalendarEventForm,
): CreateCalendarEventRequest => ({
    ...toEditCalendarEventRequest(form, AUTHOR),
    visibility: form.isPrivate
        ? CalendarEventVisibilityEnum.PRIVATE
        : CalendarEventVisibilityEnum.SHARED,
});
