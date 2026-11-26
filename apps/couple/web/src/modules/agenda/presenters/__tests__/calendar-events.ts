import {
    A_CALENDAR_LABEL_LIST,
    A_PRIVATE_CALENDAR_EVENT,
    A_SHARED_CALENDAR_EVENT,
} from '@cocooning/couple-client-business-logic/testing';
import type { CalendarEventResponse } from '@cocooning/couple-contract/agenda';
import {
    indexCalendarLabels,
    presentCalendarLabels,
} from '../calendar-labels.presenter';

// "Sport" in sage and "Famille" in rose, the labels of the couple in the shared fake.
export const LABELS = indexCalendarLabels(
    presentCalendarLabels(A_CALENDAR_LABEL_LIST),
);
export const SPORT_ID = '01936b2e-7c4a-7000-8000-0000000000b1';

let nextId = 0;

// An event of the agenda built from the shared fake, with only what a scenario needs.
export const anEvent = (
    overrides: Partial<CalendarEventResponse>,
): CalendarEventResponse => ({
    ...A_SHARED_CALENDAR_EVENT,
    calendarEventId: `event-${++nextId}`,
    ...overrides,
});

export const MY_PRIVATE_EVENT = A_PRIVATE_CALENDAR_EVENT;
