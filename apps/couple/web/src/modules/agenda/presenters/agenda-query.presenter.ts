import type { AgendaQuery } from '../view-models/agenda-query.view-model';
import { AgendaQueryParamsSchema } from './agenda-query.zod';
import { monthOf, yearOf } from './calendar-day.presenter';

export const AGENDA_FIRST_YEAR = 2015;
const AGENDA_YEARS_AHEAD = 10;

export const presentAgendaLastYear = (today: string): number =>
    yearOf(today) + AGENDA_YEARS_AHEAD;

const isWithinYears = (dayOrMonth: string, today: string): boolean =>
    yearOf(dayOrMonth) >= AGENDA_FIRST_YEAR &&
    yearOf(dayOrMonth) <= presentAgendaLastYear(today);

// ?day=YYYY-MM-DD&month=YYYY-MM: the day defaults to today in Paris, the month to the month of the day.
export function presentAgendaQuery(
    params: unknown,
    today: string,
): AgendaQuery {
    const parsed = AgendaQueryParamsSchema.parse(params);
    const day =
        parsed.day !== null && isWithinYears(parsed.day, today)
            ? parsed.day
            : today;
    const month =
        parsed.month !== null && isWithinYears(parsed.month, today)
            ? parsed.month
            : monthOf(day);
    return { day, month };
}
