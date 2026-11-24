'use server';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { agendaModule } from '../services/agenda-module.factory';
import { actOnCalendarEvent } from '../services/calendar-event-commands.service';

export async function agendaCalendarEventShareAction(
    calendarEventId: string,
): Promise<Result<null, ApiError>> {
    const { shareCalendarEvent } = agendaModule();
    return actOnCalendarEvent(calendarEventId, (id) =>
        shareCalendarEvent.execute(id),
    );
}
