import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type {
    CalendarEventListResponse,
    CalendarLabelListResponse,
} from '@cocooning/couple-contract/agenda';
import type { CoupleResponse } from '@cocooning/couple-contract/pairing';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { AgendaQuery } from '../view-models/agenda-query.view-model';
import type { AgendaPage } from '../view-models/agenda-screen.view-model';
import { presentAgendaCalendar } from './agenda-calendar.presenter';
import {
    presentAgendaRedirect,
    presentAgendaRefusal,
} from './agenda-refusal.presenter';

export type AgendaPageInput = {
    readonly couple: Result<CoupleResponse | null, ApiError>;
    readonly events: Result<CalendarEventListResponse, ApiError>;
    readonly dayEvents: Result<CalendarEventListResponse, ApiError> | null;
    readonly labels: Result<CalendarLabelListResponse, ApiError>;
    readonly query: AgendaQuery;
    readonly today: string;
};

export function presentAgendaPage({
    couple,
    events,
    dayEvents,
    labels,
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
    if (!labels.success) return presentAgendaRefusal(labels.error);
    return {
        redirectTo: null,
        viewModel: presentAgendaCalendar({
            events: events.value,
            dayEvents: dayEvents === null ? null : dayEvents.value,
            labels: labels.value,
            query,
            today,
        }),
    };
}
