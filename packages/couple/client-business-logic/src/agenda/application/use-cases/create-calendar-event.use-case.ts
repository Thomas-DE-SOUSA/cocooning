import type { CalendarEventResponse } from '@cocooning/couple-contract/agenda';
import { toCreateCalendarEventRequest } from '../mappers/calendar-event-request.mapper';
import type { CalendarEventForm } from '../schemas/calendar-event-form.zod';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { AgendaGateway } from '../../domain/ports/agenda.gateway';

// R1, R3: a new event of the couple, owned by its author, shared unless private.
export class CreateCalendarEventUseCase {
    constructor(private readonly agendaGateway: AgendaGateway) {}

    execute(
        form: CalendarEventForm,
    ): Promise<Result<CalendarEventResponse, ApiError>> {
        return this.agendaGateway.createCalendarEvent(
            toCreateCalendarEventRequest(form),
        );
    }
}
