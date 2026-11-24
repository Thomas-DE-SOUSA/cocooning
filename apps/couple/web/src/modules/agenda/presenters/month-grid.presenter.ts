import type { CalendarEventQueryRequest } from '@cocooning/couple-contract/agenda';
import type { AgendaQuery } from '../view-models/agenda-query.view-model';
import {
    addDays,
    addMonths,
    firstDayOf,
    weekdayIndexOf,
} from './calendar-day.presenter';

const SUNDAY_INDEX = 6;

// The visible grid of a month: from the Monday on or before the 1st to the Sunday on or after its last day (42 days at most).
export function presentMonthGridRange(
    month: string,
): CalendarEventQueryRequest {
    const first = firstDayOf(month);
    const last = addDays(firstDayOf(addMonths(month, 1)), -1);
    return {
        from: addDays(first, -weekdayIndexOf(first)),
        to: addDays(last, SUNDAY_INDEX - weekdayIndexOf(last)),
    };
}

export type AgendaRanges = {
    readonly grid: CalendarEventQueryRequest;
    readonly day: CalendarEventQueryRequest | null;
};

// The day chosen at load may lie outside the month shown: it is then read on its own.
export function presentAgendaRanges(query: AgendaQuery): AgendaRanges {
    const grid = presentMonthGridRange(query.month);
    const isInGrid = grid.from <= query.day && query.day <= grid.to;
    return {
        grid,
        day: isInGrid ? null : { from: query.day, to: query.day },
    };
}

// The days of a range, both included, in calendar order.
export function presentRangeDays(range: CalendarEventQueryRequest): string[] {
    const days: string[] = [];
    for (let day = range.from; day <= range.to; day = addDays(day, 1)) {
        days.push(day);
    }
    return days;
}
