import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { AgendaGateway } from '../../domain/ports/agenda.gateway';

// R9: either partner deletes a shared event, only the author a private one.
export class DeleteCalendarEventUseCase {
    constructor(private readonly agendaGateway: AgendaGateway) {}

    execute(calendarEventId: string): Promise<Result<null, ApiError>> {
        return this.agendaGateway.deleteCalendarEvent(calendarEventId);
    }
}
