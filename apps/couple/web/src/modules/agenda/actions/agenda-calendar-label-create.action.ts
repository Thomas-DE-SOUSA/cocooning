'use server';

import type { CalendarLabelFormInput } from '@cocooning/couple-client-business-logic/agenda';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { getServerTranslation } from '@/i18n/server';
import { CALENDAR_LABELS_NAMESPACE } from '../data/calendar-labels-i18n-namespace';
import { agendaModule } from '../services/agenda-module.factory';
import { createCalendarLabel } from '../services/calendar-label-commands.service';
import type { CalendarLabelItem } from '../view-models/calendar-label.view-model';

// R12: the new label comes back, so that the event sheet picks it at once.
export async function agendaCalendarLabelCreateAction(
    input: CalendarLabelFormInput,
): Promise<Result<CalendarLabelItem, ApiError>> {
    return createCalendarLabel(input, {
        t: await getServerTranslation(CALENDAR_LABELS_NAMESPACE),
        createCalendarLabel: agendaModule().createCalendarLabel,
    });
}
