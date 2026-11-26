import 'server-only';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { CalendarLabelListResponse } from '@cocooning/couple-contract/agenda';
import type { Result } from '@cocooning/shared-kernel/utils';
import { agendaModule } from './agenda-module.factory';

// Read by the agenda and "Nous" pages with the session cookie of the request (decision 0036): the labels of the couple.
export function loadCalendarLabels(): Promise<
    Result<CalendarLabelListResponse, ApiError>
> {
    return agendaModule().listCalendarLabels.execute();
}
