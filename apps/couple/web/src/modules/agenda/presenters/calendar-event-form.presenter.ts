import {
    type CalendarEventForm,
    type CalendarEventFormInput,
    ViewerAudienceEnum,
} from '@cocooning/couple-client-business-logic/agenda';
import type { AgendaDayItem } from '../view-models/agenda-screen.view-model';

const NO_MOMENT_PART = {
    endsOn: null,
    startsAt: null,
    endsAt: null,
} as const;

// R3, R5, R11: a new event lasts all day on the chosen day, is shared, for both and without a label.
export const presentNewCalendarEvent = (day: string): CalendarEventForm => ({
    title: '',
    description: null,
    startsOn: day,
    ...NO_MOMENT_PART,
    isPrivate: false,
    audience: ViewerAudienceEnum.BOTH,
    labelId: null,
});

export const presentCalendarEventOf = (
    item: AgendaDayItem,
): CalendarEventForm => ({
    title: item.title,
    description: item.description,
    ...item.moment,
    isPrivate: item.isPrivate,
    audience: item.audience,
    labelId: item.labelId,
});

const toField = (value: string | null): string => value ?? '';

// What the inputs hold, and what a server action validates again (core-frontend.md rule 14): no value is an empty input.
export const toCalendarEventFormInput = (
    form: CalendarEventForm,
): CalendarEventFormInput => ({
    title: form.title,
    description: toField(form.description),
    startsOn: form.startsOn,
    endsOn: toField(form.endsOn),
    startsAt: toField(form.startsAt),
    endsAt: toField(form.endsAt),
    isPrivate: form.isPrivate,
    audience: form.audience,
    labelId: form.labelId,
});
