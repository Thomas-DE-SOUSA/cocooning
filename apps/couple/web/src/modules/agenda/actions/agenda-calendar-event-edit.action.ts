'use server';

import type { CalendarEventFormInput } from '@cocooning/couple-client-business-logic/agenda';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { getServerTranslation } from '@/i18n/server';
import { AGENDA_NAMESPACE } from '../data/agenda-i18n-namespaces';
import { agendaModule } from '../services/agenda-module.factory';
import { editCalendarEvent } from '../services/calendar-event-commands.service';

export async function agendaCalendarEventEditAction(
    calendarEventId: string,
    input: CalendarEventFormInput,
): Promise<Result<null, ApiError>> {
    return editCalendarEvent(calendarEventId, input, {
        t: await getServerTranslation(AGENDA_NAMESPACE),
        editCalendarEvent: agendaModule().editCalendarEvent,
    });
}
