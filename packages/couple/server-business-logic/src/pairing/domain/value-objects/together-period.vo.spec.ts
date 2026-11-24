import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { TogetherPeriod } from './together-period.vo';

const invalid = expect.objectContaining({
    code: PairingExceptionCodeEnum.PAIRING_TOGETHER_PERIODS_INVALID,
});

describe('Feature: a together period', () => {
    describe('Scenario: R9, a period with two real days', () => {
        it('keeps a closed period, the end on the start day included', () => {
            const period = TogetherPeriod.create({
                startedOn: '2020-01-10',
                endedOn: '2020-01-10',
            });
            expect(period.toSnapshot()).toEqual({
                startedOn: '2020-01-10',
                endedOn: '2020-01-10',
            });
            expect(period.isOpen()).toBe(false);
        });

        it('keeps an open period, still going on', () => {
            const period = TogetherPeriod.create({
                startedOn: '2020-02-29',
                endedOn: null,
            });
            expect(period.startedOn).toBe('2020-02-29');
            expect(period.endedOn).toBeNull();
            expect(period.isOpen()).toBe(true);
        });
    });

    describe('Scenario: R9, a period that breaks a rule', () => {
        it.each([
            ['a start that is not a day', '10/01/2020', null],
            ['a month that does not exist', '2020-13-01', null],
            ['a day that does not exist', '2021-02-29', null],
            ['an end that is not a day', '2020-01-10', '2021-02-30'],
            ['an end before the start', '2020-01-10', '2020-01-09'],
        ])('refuses %s', (_label, startedOn, endedOn) => {
            expect(() => TogetherPeriod.create({ startedOn, endedOn })).toThrow(
                invalid,
            );
        });
    });

    describe('Scenario: storing a period', () => {
        it('rebuilds the same period from its snapshot, without checking it', () => {
            const snapshot = { startedOn: '2020-01-10', endedOn: '2019-01-01' };
            const period = TogetherPeriod.from(snapshot);
            expect(period.toSnapshot()).toEqual(snapshot);
            expect(
                period.equals(TogetherPeriod.from(period.toSnapshot())),
            ).toBe(true);
        });
    });
});
