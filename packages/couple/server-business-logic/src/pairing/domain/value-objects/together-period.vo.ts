import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { ValueObject } from '@cocooning/shared-kernel/domain';
import { PairingException } from '../exceptions/pairing.exception';
import { isCalendarDay } from './calendar-day';

export type TogetherPeriodSnapshot = {
    readonly startedOn: string;
    readonly endedOn: string | null;
};

export const togetherPeriodsInvalid = (message: string): PairingException =>
    new PairingException({
        code: PairingExceptionCodeEnum.PAIRING_TOGETHER_PERIODS_INVALID,
        message,
    });

// Calendar days written YYYY-MM-DD compare as strings; an open period (endedOn null) is still going on.
export class TogetherPeriod extends ValueObject<TogetherPeriodSnapshot> {
    private constructor(props: TogetherPeriodSnapshot) {
        super(props);
        Object.freeze(this);
    }

    // R9: two real days, the end on or after the start.
    static create(input: TogetherPeriodSnapshot): TogetherPeriod {
        const { startedOn, endedOn } = input;
        if (
            !isCalendarDay(startedOn) ||
            (endedOn !== null && !isCalendarDay(endedOn))
        ) {
            throw togetherPeriodsInvalid(
                'Together period day is not a calendar day',
            );
        }
        if (endedOn !== null && endedOn < startedOn) {
            throw togetherPeriodsInvalid(
                'Together period ends before it starts',
            );
        }
        return new TogetherPeriod({ startedOn, endedOn });
    }

    static from(snapshot: TogetherPeriodSnapshot): TogetherPeriod {
        return new TogetherPeriod({ ...snapshot });
    }

    get startedOn(): string {
        return this.props.startedOn;
    }

    get endedOn(): string | null {
        return this.props.endedOn;
    }

    isOpen(): boolean {
        return this.props.endedOn === null;
    }

    toSnapshot(): TogetherPeriodSnapshot {
        return { startedOn: this.props.startedOn, endedOn: this.props.endedOn };
    }
}
