'use server';

import type { CalendarLabelFormInput } from '@cocooning/couple-client-business-logic/agenda';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { getServerTranslation } from '@/i18n/server';
import { CALENDAR_LABELS_NAMESPACE } from '../data/calendar-labels-i18n-namespace';
import { agendaModule } from '../services/agenda-module.factory';
import { editCalendarLabel } from '../services/calendar-label-commands.service';

// R12: either partner renames and recolours a label; the page reads the labels again after router.refresh().
export async function agendaCalendarLabelEditAction(
    calendarLabelId: string,
    input: CalendarLabelFormInput,
): Promise<Result<null, ApiError>> {
    return editCalendarLabel(calendarLabelId, input, {
        t: await getServerTranslation(CALENDAR_LABELS_NAMESPACE),
        editCalendarLabel: agendaModule().editCalendarLabel,
    });
}
