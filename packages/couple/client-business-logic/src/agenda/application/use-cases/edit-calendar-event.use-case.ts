import type { CalendarEventResponse } from '@cocooning/couple-contract/agenda';
import { toEditCalendarEventRequest } from '../mappers/calendar-event-request.mapper';
import type { CalendarEventForm } from '../schemas/calendar-event-form.zod';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { AgendaGateway } from '../../domain/ports/agenda.gateway';

// R9: either partner edits a shared event with the whole form, only the author a private one.
// R11: isOwner says whether the partner who filled the form is the author, to send the audience relative to the author.
export class EditCalendarEventUseCase {
    constructor(private readonly agendaGateway: AgendaGateway) {}

    execute(
        calendarEventId: string,
        form: CalendarEventForm,
        isOwner: boolean,
    ): Promise<Result<CalendarEventResponse, ApiError>> {
        return this.agendaGateway.editCalendarEvent(
            calendarEventId,
            toEditCalendarEventRequest(form, isOwner),
        );
    }
}
