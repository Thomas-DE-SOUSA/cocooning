import {
    presentAgendaRanges,
    presentMonthGridRange,
} from './month-grid.presenter';

describe('Feature: the visible grid of a month', () => {
    it.each([
        [
            'November 2026, from Sunday the 1st',
            '2026-11',
            '2026-10-26',
            '2026-12-06',
        ],
        [
            'February 2027, from Monday the 1st to Sunday the 28th',
            '2027-02',
            '2027-02-01',
            '2027-02-28',
        ],
        [
            'December 2026, ending in the next year',
            '2026-12',
            '2026-11-30',
            '2027-01-03',
        ],
        [
            'January 2027, starting in the previous year',
            '2027-01',
            '2026-12-28',
            '2027-01-31',
        ],
    ])('runs from Monday to Sunday around %s', (_label, month, from, to) => {
        expect(presentMonthGridRange(month)).toEqual({ from, to });
    });

    it('reads the chosen day with the grid when the grid shows it', () => {
        expect(
            presentAgendaRanges({ day: '2026-12-02', month: '2026-11' }),
        ).toEqual({
            grid: { from: '2026-10-26', to: '2026-12-06' },
            day: null,
        });
    });

    it('reads the chosen day on its own when another month is shown', () => {
        expect(
            presentAgendaRanges({ day: '2026-11-24', month: '2027-03' }).day,
        ).toEqual({ from: '2026-11-24', to: '2026-11-24' });
    });
});
