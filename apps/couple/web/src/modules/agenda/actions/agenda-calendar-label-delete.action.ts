'use server';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { agendaModule } from '../services/agenda-module.factory';
import { actOnCalendarLabel } from '../services/calendar-label-commands.service';

// R14: the label goes, its events stay without a label.
export async function agendaCalendarLabelDeleteAction(
    calendarLabelId: string,
): Promise<Result<null, ApiError>> {
    const { deleteCalendarLabel } = agendaModule();
    return actOnCalendarLabel(calendarLabelId, (id) =>
        deleteCalendarLabel.execute(id),
    );
}
