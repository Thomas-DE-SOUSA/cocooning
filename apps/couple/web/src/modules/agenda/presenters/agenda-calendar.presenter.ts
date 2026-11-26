import type {
    CalendarEventListResponse,
    CalendarLabelListResponse,
} from '@cocooning/couple-contract/agenda';
import type { AgendaQuery } from '../view-models/agenda-query.view-model';
import {
    type AgendaCalendarScreen,
    AgendaStepEnum,
} from '../view-models/agenda-screen.view-model';
import { presentAgendaDays } from './agenda-days.presenter';
import {
    AGENDA_FIRST_YEAR,
    presentAgendaLastYear,
} from './agenda-query.presenter';
import {
    indexCalendarLabels,
    presentCalendarLabels,
} from './calendar-labels.presenter';
import { presentDayMarks } from './day-marks.presenter';
import {
    presentMonthGridRange,
    presentRangeDays,
} from './month-grid.presenter';

export type AgendaCalendarInput = {
    readonly events: CalendarEventListResponse;
    readonly dayEvents: CalendarEventListResponse | null;
    readonly labels: CalendarLabelListResponse;
    readonly query: AgendaQuery;
    readonly today: string;
};

// The grid of the month, its dots, every day of it with its events, and the labels of the couple (R13).
export function presentAgendaCalendar({
    events,
    dayEvents,
    labels,
    query,
    today,
}: AgendaCalendarInput): AgendaCalendarScreen {
    const labelItems = presentCalendarLabels(labels);
    const index = indexCalendarLabels(labelItems);
    const grid = presentMonthGridRange(query.month);
    const daysOf = (list: CalendarEventListResponse, days: string[]) =>
        presentAgendaDays({ events: list.items, days, today, labels: index });
    return {
        step: AgendaStepEnum.CALENDAR,
        initialDay: query.day,
        calendar: {
            today,
            month: query.month,
            firstYear: AGENDA_FIRST_YEAR,
            lastYear: presentAgendaLastYear(today),
            marks: presentDayMarks(events.items, index, grid),
        },
        days: {
            ...daysOf(events, presentRangeDays(grid)),
            ...(dayEvents === null ? {} : daysOf(dayEvents, [query.day])),
        },
        labels: labelItems,
    };
}
