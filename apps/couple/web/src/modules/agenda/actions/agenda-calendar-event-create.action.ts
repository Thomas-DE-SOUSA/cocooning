'use server';

import type { CalendarEventFormInput } from '@cocooning/couple-client-business-logic/agenda';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { getServerTranslation } from '@/i18n/server';
import { AGENDA_NAMESPACE } from '../data/agenda-i18n-namespaces';
import { agendaModule } from '../services/agenda-module.factory';
import { createCalendarEvent } from '../services/calendar-event-commands.service';

// The page reads the agenda again after router.refresh(): the action only says whether it worked (decision 0036).
export async function agendaCalendarEventCreateAction(
    input: CalendarEventFormInput,
): Promise<Result<null, ApiError>> {
    return createCalendarEvent(input, {
        t: await getServerTranslation(AGENDA_NAMESPACE),
        createCalendarEvent: agendaModule().createCalendarEvent,
    });
}
