import { Uuid } from '@cocooning/shared-kernel/domain';

export class CalendarLabelId extends Uuid {
    static generate(): CalendarLabelId {
        return new CalendarLabelId(Uuid.generateValue());
    }

    static from(value: string): CalendarLabelId {
        return new CalendarLabelId(value);
    }
}
