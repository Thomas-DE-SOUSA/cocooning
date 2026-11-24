import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { ValueObject } from '@cocooning/shared-kernel/domain';
import { isCalendarDay } from '@cocooning/shared-kernel/utils';
import { AgendaException } from '../exceptions/agenda.exception';
import { isClockTime } from './clock-time';

// Days YYYY-MM-DD and hours HH:MM of Paris, never instants (decision 0047); no startsAt means all day.
export type CalendarEventMomentSnapshot = {
    readonly startsOn: string;
    readonly endsOn: string | null;
    readonly startsAt: string | null;
    readonly endsAt: string | null;
};

const isWritten = (moment: CalendarEventMomentSnapshot): boolean =>
    isCalendarDay(moment.startsOn) &&
    (moment.endsOn === null || isCalendarDay(moment.endsOn)) &&
    (moment.startsAt === null || isClockTime(moment.startsAt)) &&
    (moment.endsAt === null || isClockTime(moment.endsAt));

const isInOrder = (moment: CalendarEventMomentSnapshot): boolean => {
    const { startsOn, endsOn, startsAt, endsAt } = moment;
    if (endsOn !== null && endsOn <= startsOn) return false;
    if (endsAt === null) return true;
    if (startsAt === null) return false;
    return endsOn !== null || endsAt > startsAt;
};

export class CalendarEventMoment extends ValueObject<CalendarEventMomentSnapshot> {
    private constructor(props: CalendarEventMomentSnapshot) {
        super(props);
        Object.freeze(this);
    }

    // R5: a last day after the first, an end hour only with a start hour, and after it on a one-day event.
    static create(input: CalendarEventMomentSnapshot): CalendarEventMoment {
        if (!isWritten(input) || !isInOrder(input)) {
            throw new AgendaException({
                code: AgendaExceptionCodeEnum.CALENDAR_EVENT_MOMENT_INVALID,
                message: 'Invalid calendar event moment',
            });
        }
        return new CalendarEventMoment({ ...input });
    }

    static from(snapshot: CalendarEventMomentSnapshot): CalendarEventMoment {
        return new CalendarEventMoment({ ...snapshot });
    }

    toSnapshot(): CalendarEventMomentSnapshot {
        return { ...this.props };
    }
}
