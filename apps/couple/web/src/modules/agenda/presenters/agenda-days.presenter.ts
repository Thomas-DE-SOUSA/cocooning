import type { CalendarEventResponse } from '@cocooning/couple-contract/agenda';
import type { AgendaDays } from '../view-models/agenda-screen.view-model';
import type { CalendarLabelIndex } from './calendar-labels.presenter';
import { presentDayItems } from './day-items.presenter';
import { presentLongDay } from './day-label.presenter';

export type AgendaDaysInput = {
    readonly events: readonly CalendarEventResponse[];
    readonly days: readonly string[];
    readonly today: string;
    readonly labels: CalendarLabelIndex;
};

// The label and the events of each day, built from the events already read: choosing one of them needs no server.
export function presentAgendaDays({
    events,
    days,
    today,
    labels,
}: AgendaDaysInput): AgendaDays {
    return Object.fromEntries(
        days.map((day) => [
            day,
            {
                label: presentLongDay(day, today),
                isToday: day === today,
                items: presentDayItems(events, day, labels),
            },
        ]),
    );
}
