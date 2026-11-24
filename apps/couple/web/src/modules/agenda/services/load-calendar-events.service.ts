import 'server-only';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type {
    CalendarEventListResponse,
    CalendarEventQueryRequest,
} from '@cocooning/couple-contract/agenda';
import type { Result } from '@cocooning/shared-kernel/utils';
import { agendaModule } from './agenda-module.factory';

// Read by the agenda page with the session cookie of the request (decision 0036): the days of the visible grid.
export function loadCalendarEvents(
    range: CalendarEventQueryRequest,
): Promise<Result<CalendarEventListResponse, ApiError>> {
    return agendaModule().listCalendarEvents.execute(range);
}
