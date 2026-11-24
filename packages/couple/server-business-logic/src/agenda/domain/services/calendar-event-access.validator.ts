import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { AgendaException } from '../exceptions/agenda.exception';

export class CalendarEventAccessValidator {
    // R8: the other partner sees a shared event, so the refusal may say why.
    static ensureOwner(ownerId: string, userId: string): void {
        if (ownerId === userId) return;
        throw new AgendaException({
            code: AgendaExceptionCodeEnum.CALENDAR_EVENT_RESERVED_TO_OWNER,
            message: 'Reserved to the author of the calendar event',
        });
    }
}
