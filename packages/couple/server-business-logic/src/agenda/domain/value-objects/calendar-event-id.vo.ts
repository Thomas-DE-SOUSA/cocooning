import { Uuid } from '@cocooning/shared-kernel/domain';

export class CalendarEventId extends Uuid {
    static generate(): CalendarEventId {
        return new CalendarEventId(Uuid.generateValue());
    }

    static from(value: string): CalendarEventId {
        return new CalendarEventId(value);
    }
}
