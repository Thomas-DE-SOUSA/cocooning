import type { CalendarEventResponse } from '@cocooning/couple-contract/agenda';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { AgendaGateway } from '../../domain/ports/agenda.gateway';

// R7: the event opened from the agenda; the private event of the other is NOT_FOUND.
export class GetCalendarEventUseCase {
    constructor(private readonly agendaGateway: AgendaGateway) {}

    execute(
        calendarEventId: string,
    ): Promise<Result<CalendarEventResponse, ApiError>> {
        return this.agendaGateway.getCalendarEvent(calendarEventId);
    }
}
