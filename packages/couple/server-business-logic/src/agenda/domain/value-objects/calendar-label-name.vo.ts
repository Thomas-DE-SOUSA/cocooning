import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { CALENDAR_LABEL_NAME_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { ValueObject } from '@cocooning/shared-kernel/domain';
import { AgendaException } from '../exceptions/agenda.exception';

type CalendarLabelNameProps = {
    readonly value: string;
};

export class CalendarLabelName extends ValueObject<CalendarLabelNameProps> {
    private constructor(props: CalendarLabelNameProps) {
        super(props);
        Object.freeze(this);
    }

    // R12: what a partner typed, trimmed, never empty, at most CALENDAR_LABEL_NAME_MAX_LENGTH signs.
    static create(raw: string): CalendarLabelName {
        const value = raw.trim();
        if (value.length > 0 && value.length <= CALENDAR_LABEL_NAME_MAX_LENGTH)
            return new CalendarLabelName({ value });
        throw new AgendaException({
            code: AgendaExceptionCodeEnum.CALENDAR_LABEL_NAME_INVALID,
            message: 'Invalid calendar label name',
            context: { min: 1, max: CALENDAR_LABEL_NAME_MAX_LENGTH },
        });
    }

    static from(value: string): CalendarLabelName {
        return new CalendarLabelName({ value });
    }

    get value(): string {
        return this.props.value;
    }
}
