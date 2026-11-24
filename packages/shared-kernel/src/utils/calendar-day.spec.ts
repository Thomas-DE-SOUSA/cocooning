import { isCalendarDay } from './calendar-day';

describe('Feature: a day of the calendar', () => {
    describe('Scenario: a real day written YYYY-MM-DD', () => {
        it.each([['2020-02-29'], ['2026-12-31']])('accepts %s', (value) => {
            expect(isCalendarDay(value)).toBe(true);
        });
    });

    describe('Scenario: anything else', () => {
        it.each([
            ['another format', '10/01/2020'],
            ['a month that does not exist', '2020-13-01'],
            ['a day that does not exist', '2021-02-29'],
            ['a day out of every month', '2021-01-32'],
            ['an instant', '2021-01-10T00:00:00.000Z'],
        ])('refuses %s', (_label, value) => {
            expect(isCalendarDay(value)).toBe(false);
        });
    });
});
