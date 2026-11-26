import type { CalendarLabel } from '../models/calendar-label.aggregate';

// The labels are the couple's (R12): every read is scoped by coupleId and sees only live labels.
export abstract class CalendarLabelRepository {
    abstract save(label: CalendarLabel): Promise<void>;
    abstract findById(
        coupleId: string,
        calendarLabelId: string,
    ): Promise<CalendarLabel | null>;
    // In creation order.
    abstract findAll(coupleId: string): Promise<ReadonlyArray<CalendarLabel>>;
    abstract countLive(coupleId: string): Promise<number>;
}
