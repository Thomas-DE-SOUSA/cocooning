import type {
    CalendarEventListResponse,
    CalendarEventQueryRequest,
} from '@cocooning/couple-contract/agenda';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { AgendaGateway } from '../../domain/ports/agenda.gateway';

// R7: the shared events and the partner's own private ones that touch the days from and to, both included.
export class ListCalendarEventsUseCase {
    constructor(private readonly agendaGateway: AgendaGateway) {}

    execute(
        range: CalendarEventQueryRequest,
    ): Promise<Result<CalendarEventListResponse, ApiError>> {
        return this.agendaGateway.listCalendarEvents(range);
    }
}
