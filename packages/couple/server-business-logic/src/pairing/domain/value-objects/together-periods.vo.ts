import { ValueObject } from '@cocooning/shared-kernel/domain';
import { coupleCalendarDayAt } from './calendar-day';
import {
    TogetherPeriod,
    type TogetherPeriodSnapshot,
    togetherPeriodsInvalid,
} from './together-period.vo';

type TogetherPeriodsProps = {
    readonly periods: ReadonlyArray<TogetherPeriod>;
};

// R9: a period starts after the previous one has ended, so only the last one may be open.
const ensureFollows = (
    previous: TogetherPeriod,
    next: TogetherPeriod,
): void => {
    if (previous.endedOn === null) {
        throw togetherPeriodsInvalid(
            'Only the last together period may be open',
        );
    }
    if (next.startedOn <= previous.endedOn) {
        throw togetherPeriodsInvalid(
            'Together periods overlap or are out of order',
        );
    }
};

export class TogetherPeriods extends ValueObject<TogetherPeriodsProps> {
    private constructor(props: TogetherPeriodsProps) {
        super(props);
        Object.freeze(this);
    }

    static empty(): TogetherPeriods {
        return new TogetherPeriods({ periods: [] });
    }

    // R9: at least one period, ordered, without overlap, none starting after today in Paris.
    static create(
        inputs: ReadonlyArray<TogetherPeriodSnapshot>,
        now: Date,
    ): TogetherPeriods {
        const periods = inputs.map((input) => TogetherPeriod.create(input));
        if (periods.length === 0) {
            throw togetherPeriodsInvalid('At least one together period');
        }
        periods.reduce((previous, next) => {
            ensureFollows(previous, next);
            return next;
        });
        const today = coupleCalendarDayAt(now);
        if (periods.some(({ startedOn }) => startedOn > today)) {
            throw togetherPeriodsInvalid('Together period starts after today');
        }
        return new TogetherPeriods({ periods });
    }

    static from(
        snapshots: ReadonlyArray<TogetherPeriodSnapshot>,
    ): TogetherPeriods {
        return new TogetherPeriods({
            periods: snapshots.map((snapshot) => TogetherPeriod.from(snapshot)),
        });
    }

    get periods(): ReadonlyArray<TogetherPeriod> {
        return this.props.periods;
    }

    get count(): number {
        return this.props.periods.length;
    }

    toSnapshot(): ReadonlyArray<TogetherPeriodSnapshot> {
        return this.props.periods.map((period) => period.toSnapshot());
    }
}
