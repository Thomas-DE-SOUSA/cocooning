import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { CalendarEventListResponse } from '@cocooning/couple-contract/agenda';
import type { CoupleResponse } from '@cocooning/couple-contract/pairing';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { AgendaQuery } from '../view-models/agenda-query.view-model';
import {
    type AgendaPage,
    AgendaStepEnum,
} from '../view-models/agenda-screen.view-model';
import { presentAgendaDays } from './agenda-days.presenter';
import {
    AGENDA_FIRST_YEAR,
    presentAgendaLastYear,
} from './agenda-query.presenter';
import {
    presentAgendaRedirect,
    presentAgendaRefusal,
} from './agenda-refusal.presenter';
import { presentCoupleCreatorId } from './author-color.presenter';
import { presentDayMarks } from './day-marks.presenter';
import {
    presentMonthGridRange,
    presentRangeDays,
} from './month-grid.presenter';

export type AgendaPageInput = {
    readonly couple: Result<CoupleResponse | null, ApiError>;
    readonly events: Result<CalendarEventListResponse, ApiError>;
    readonly dayEvents: Result<CalendarEventListResponse, ApiError> | null;
    readonly query: AgendaQuery;
    readonly today: string;
};

export function presentAgendaPage({
    couple,
    events,
    dayEvents,
    query,
    today,
}: AgendaPageInput): AgendaPage {
    if (!couple.success || couple.value === null) {
        return presentAgendaRedirect(WebRouterEnum.COUPLE_PAIRING);
    }
    if (!events.success) return presentAgendaRefusal(events.error);
    if (dayEvents !== null && !dayEvents.success) {
        return presentAgendaRefusal(dayEvents.error);
    }
    const creatorId = presentCoupleCreatorId(couple.value.partners);
    const grid = presentMonthGridRange(query.month);
    const gridDays = presentAgendaDays({
        events: events.value.items,
        days: presentRangeDays(grid),
        today,
        creatorId,
    });
    const outsideDay =
        dayEvents === null
            ? {}
            : presentAgendaDays({
                  events: dayEvents.value.items,
                  days: [query.day],
                  today,
                  creatorId,
              });
    return {
        redirectTo: null,
        viewModel: {
            step: AgendaStepEnum.CALENDAR,
            initialDay: query.day,
            calendar: {
                today,
                month: query.month,
                firstYear: AGENDA_FIRST_YEAR,
                lastYear: presentAgendaLastYear(today),
                marks: presentDayMarks(events.value.items, creatorId, grid),
            },
            days: { ...gridDays, ...outsideDay },
        },
    };
}
