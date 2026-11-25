import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { CALENDAR_LABEL_MAX_COUNT } from '@cocooning/couple-shared-kernel/limits';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { AgendaException } from '../exceptions/agenda.exception';
import type { CalendarLabel } from '../models/calendar-label.aggregate';
import type { CalendarLabelRepository } from '../ports/calendar-label.repository';

export class CalendarLabelPreconditionService {
    constructor(
        private readonly calendarLabelRepository: CalendarLabelRepository,
    ) {}

    // R13: unknown, deleted or of another couple, the answer is the same.
    async loadCalendarLabel(
        context: ExecutionContext,
        calendarLabelId: string,
    ): Promise<CalendarLabel> {
        const label = await this.calendarLabelRepository.findById(
            context.coupleId,
            calendarLabelId,
        );
        if (label !== null) return label;
        throw new AgendaException({
            code: AgendaExceptionCodeEnum.CALENDAR_LABEL_NOT_FOUND,
            message: 'Calendar label not found',
        });
    }

    // R12: at most CALENDAR_LABEL_MAX_COUNT live labels; two creations at the same instant may pass it, a known limit.
    async ensureLabelRoomLeft(context: ExecutionContext): Promise<void> {
        const count = await this.calendarLabelRepository.countLive(
            context.coupleId,
        );
        if (count < CALENDAR_LABEL_MAX_COUNT) return;
        throw new AgendaException({
            code: AgendaExceptionCodeEnum.CALENDAR_LABEL_LIMIT_REACHED,
            message: 'The couple has as many calendar labels as allowed',
            context: { max: CALENDAR_LABEL_MAX_COUNT },
        });
    }
}
