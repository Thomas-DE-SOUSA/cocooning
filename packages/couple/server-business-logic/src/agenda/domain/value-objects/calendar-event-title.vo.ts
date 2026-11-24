import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { CALENDAR_EVENT_TITLE_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { ValueObject } from '@cocooning/shared-kernel/domain';
import { AgendaException } from '../exceptions/agenda.exception';

type CalendarEventTitleProps = {
    readonly value: string;
};

export class CalendarEventTitle extends ValueObject<CalendarEventTitleProps> {
    private constructor(props: CalendarEventTitleProps) {
        super(props);
        Object.freeze(this);
    }

    // R2: what a partner typed, trimmed, never empty, at most CALENDAR_EVENT_TITLE_MAX_LENGTH signs.
    static create(raw: string): CalendarEventTitle {
        const value = raw.trim();
        if (
            value.length === 0 ||
            value.length > CALENDAR_EVENT_TITLE_MAX_LENGTH
        ) {
            throw new AgendaException({
                code: AgendaExceptionCodeEnum.CALENDAR_EVENT_TITLE_INVALID,
                message: 'Invalid calendar event title',
                context: { min: 1, max: CALENDAR_EVENT_TITLE_MAX_LENGTH },
            });
        }
        return new CalendarEventTitle({ value });
    }

    static from(value: string): CalendarEventTitle {
        return new CalendarEventTitle({ value });
    }

    get value(): string {
        return this.props.value;
    }
}
