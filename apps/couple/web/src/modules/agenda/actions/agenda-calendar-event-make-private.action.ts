'use server';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { agendaModule } from '../services/agenda-module.factory';
import { actOnCalendarEvent } from '../services/calendar-event-commands.service';

export async function agendaCalendarEventMakePrivateAction(
    calendarEventId: string,
): Promise<Result<null, ApiError>> {
    const { makeCalendarEventPrivate } = agendaModule();
    return actOnCalendarEvent(calendarEventId, (id) =>
        makeCalendarEventPrivate.execute(id),
    );
}
