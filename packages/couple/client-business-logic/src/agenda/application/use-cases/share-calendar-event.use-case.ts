import type { CalendarEventResponse } from '@cocooning/couple-contract/agenda';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { AgendaGateway } from '../../domain/ports/agenda.gateway';

// R8: the author shares an event.
export class ShareCalendarEventUseCase {
    constructor(private readonly agendaGateway: AgendaGateway) {}

    execute(
        calendarEventId: string,
    ): Promise<Result<CalendarEventResponse, ApiError>> {
        return this.agendaGateway.shareCalendarEvent(calendarEventId);
    }
}
