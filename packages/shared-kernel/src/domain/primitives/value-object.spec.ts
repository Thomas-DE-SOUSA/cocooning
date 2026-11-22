import { ValueObject } from './value-object';

type PeriodProps = {
    readonly start: Date;
    readonly labels: ReadonlyArray<string>;
};

class Period extends ValueObject<PeriodProps> {
    static of(start: Date, labels: ReadonlyArray<string>): Period {
        return new Period({ start, labels });
    }
}

class OtherPeriod extends ValueObject<PeriodProps> {
    static of(start: Date, labels: ReadonlyArray<string>): OtherPeriod {
        return new OtherPeriod({ start, labels });
    }
}

const START = new Date('2026-11-22T10:00:00.000Z');

describe('Feature: value object equality', () => {
    describe('Scenario: same props', () => {
        it('is equal, comparing dates and arrays by value', () => {
            expect(
                Period.of(START, ['a']).equals(
                    Period.of(new Date(START.getTime()), ['a']),
                ),
            ).toBe(true);
        });
    });

    describe('Scenario: different props', () => {
        it('is not equal when a date differs', () => {
            expect(
                Period.of(START, ['a']).equals(Period.of(new Date(0), ['a'])),
            ).toBe(false);
        });

        it('is not equal when an array differs', () => {
            expect(
                Period.of(START, ['a']).equals(Period.of(START, ['a', 'b'])),
            ).toBe(false);
        });
    });

    describe('Scenario: another class with the same props', () => {
        it('is not equal', () => {
            expect(
                Period.of(START, ['a']).equals(OtherPeriod.of(START, ['a'])),
            ).toBe(false);
        });
    });

    describe('Scenario: null', () => {
        it('is not equal', () => {
            expect(Period.of(START, ['a']).equals(null)).toBe(false);
        });
    });
});
