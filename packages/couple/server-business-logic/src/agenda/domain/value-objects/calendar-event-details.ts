import type { CalendarEventAudience } from '@cocooning/couple-shared-kernel/enums';
import { CalendarEventDescription } from './calendar-event-description.vo';
import { CalendarEventMoment } from './calendar-event-moment.vo';
import { CalendarEventTitle } from './calendar-event-title.vo';

// What a partner types in the event form, before validation.
export type CalendarEventDetailsInput = {
    readonly title: string;
    readonly description: string | null;
    readonly startsOn: string;
    readonly endsOn: string | null;
    readonly startsAt: string | null;
    readonly endsAt: string | null;
    readonly audience: CalendarEventAudience;
};

export type CalendarEventDetails = {
    readonly title: CalendarEventTitle;
    readonly description: CalendarEventDescription | null;
    readonly moment: CalendarEventMoment;
    readonly audience: CalendarEventAudience;
};

// R2, R5, R6: the same checks at creation and at each edit; the aggregate checks the audience against the visibility (R11).
export const createCalendarEventDetails = (
    input: CalendarEventDetailsInput,
): CalendarEventDetails => ({
    title: CalendarEventTitle.create(input.title),
    description: CalendarEventDescription.create(input.description),
    moment: CalendarEventMoment.create({
        startsOn: input.startsOn,
        endsOn: input.endsOn,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
    }),
    audience: input.audience,
});
