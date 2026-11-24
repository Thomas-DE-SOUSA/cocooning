import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { TogetherPeriods } from './together-periods.vo';

const NOW = new Date('2026-11-23T10:00:00.000Z');
const FIRST = { startedOn: '2020-01-10', endedOn: '2021-03-04' };
const SECOND = { startedOn: '2022-05-01', endedOn: null };

const invalid = expect.objectContaining({
    code: PairingExceptionCodeEnum.PAIRING_TOGETHER_PERIODS_INVALID,
});

describe('Feature: the together periods of a couple', () => {
    describe('Scenario: R9, an ordered list without overlap', () => {
        it('keeps the periods in their order', () => {
            const periods = TogetherPeriods.create([FIRST, SECOND], NOW);
            expect(periods.count).toBe(2);
            expect(periods.toSnapshot()).toEqual([FIRST, SECOND]);
            expect(periods.periods[1]?.isOpen()).toBe(true);
        });

        it('accepts a period that starts the day after the previous one ends', () => {
            const next = { startedOn: '2021-03-05', endedOn: null };
            expect(
                TogetherPeriods.create([FIRST, next], NOW).toSnapshot(),
            ).toEqual([FIRST, next]);
        });

        it('accepts a period that starts today in Paris', () => {
            const today = { startedOn: '2026-11-23', endedOn: null };
            expect(TogetherPeriods.create([today], NOW).count).toBe(1);
        });
    });

    describe('Scenario: R9, a list that breaks a rule', () => {
        it.each([
            ['an empty list', []],
            ['periods out of order', [SECOND, FIRST]],
            [
                'periods that share a day',
                [FIRST, { startedOn: '2021-03-04', endedOn: null }],
            ],
            ['an open period before the last one', [SECOND, SECOND]],
            [
                'a period starting tomorrow',
                [{ startedOn: '2026-11-24', endedOn: null }],
            ],
            [
                'an invalid period',
                [{ startedOn: '2020-01-10', endedOn: '2020-01-01' }],
            ],
        ])('refuses %s', (_label, inputs) => {
            expect(() => TogetherPeriods.create(inputs, NOW)).toThrow(invalid);
        });
    });

    describe('Scenario: storing the list', () => {
        it('starts empty', () => {
            expect(TogetherPeriods.empty().toSnapshot()).toEqual([]);
        });

        it('rebuilds the same list from its snapshot', () => {
            const periods = TogetherPeriods.from([FIRST, SECOND]);
            expect(
                TogetherPeriods.from(periods.toSnapshot()).toSnapshot(),
            ).toEqual([FIRST, SECOND]);
        });
    });
});
