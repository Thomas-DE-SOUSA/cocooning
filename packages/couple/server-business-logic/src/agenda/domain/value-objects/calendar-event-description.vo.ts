import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { ValueObject } from '@cocooning/shared-kernel/domain';
import { AgendaException } from '../exceptions/agenda.exception';

type CalendarEventDescriptionProps = {
    readonly value: string;
};

export class CalendarEventDescription extends ValueObject<CalendarEventDescriptionProps> {
    private constructor(props: CalendarEventDescriptionProps) {
        super(props);
        Object.freeze(this);
    }

    // R6: optional plain text, trimmed, at most CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH signs; a blank one is no description.
    static create(raw: string | null): CalendarEventDescription | null {
        const value = raw === null ? '' : raw.trim();
        if (value.length === 0) return null;
        if (value.length > CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH) {
            throw new AgendaException({
                code: AgendaExceptionCodeEnum.CALENDAR_EVENT_DESCRIPTION_INVALID,
                message: 'Invalid calendar event description',
                context: { max: CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH },
            });
        }
        return new CalendarEventDescription({ value });
    }

    static from(value: string): CalendarEventDescription {
        return new CalendarEventDescription({ value });
    }

    get value(): string {
        return this.props.value;
    }
}
