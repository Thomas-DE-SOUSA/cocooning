import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import {
    type CalendarEventAudience,
    CalendarEventAudienceEnum,
    type CalendarEventVisibility,
    CalendarEventVisibilityEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { AgendaException } from '../exceptions/agenda.exception';

export class CalendarEventAudienceValidator {
    // R11: an event kept "rien que pour moi" is for its author only.
    static ensureFits(
        visibility: CalendarEventVisibility,
        audience: CalendarEventAudience,
    ): void {
        if (visibility === CalendarEventVisibilityEnum.SHARED) return;
        if (audience === CalendarEventAudienceEnum.OWNER) return;
        throw new AgendaException({
            code: AgendaExceptionCodeEnum.CALENDAR_EVENT_AUDIENCE_INVALID,
            message: 'A private calendar event is for its author only',
        });
    }
}
