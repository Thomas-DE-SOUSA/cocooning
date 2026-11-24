import {
    addDays,
    addMonths,
    presentToday,
    weekdayIndexOf,
} from './calendar-day.presenter';
import { fromLocalDate, toLocalDate } from './local-date.presenter';

describe('Feature: the days of the agenda, written YYYY-MM-DD (decision 0047)', () => {
    it('takes today in Paris, even when it is still yesterday in UTC', () => {
        expect(presentToday(new Date('2026-11-24T23:30:00.000Z'))).toBe(
            '2026-11-25',
        );
    });

    it('counts across the end of a month, of a year and a change of hour', () => {
        expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
        expect(addDays('2027-03-28', 1)).toBe('2027-03-29');
        expect(addDays('2026-11-01', -6)).toBe('2026-10-26');
    });

    it('numbers the weekdays from Monday', () => {
        expect(weekdayIndexOf('2026-11-23')).toBe(0);
        expect(weekdayIndexOf('2026-11-29')).toBe(6);
    });

    it('moves from month to month across the years', () => {
        expect(addMonths('2026-12', 1)).toBe('2027-01');
        expect(addMonths('2027-01', -1)).toBe('2026-12');
    });

    it('hands react-day-picker the same day it reads back', () => {
        expect(fromLocalDate(toLocalDate('2026-03-09'))).toBe('2026-03-09');
    });
});
