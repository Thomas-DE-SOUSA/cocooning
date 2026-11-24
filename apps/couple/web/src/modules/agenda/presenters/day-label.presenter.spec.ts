import { presentLongDay, presentShortDay } from './day-label.presenter';

describe('Feature: the days written for the couple', () => {
    it('names the chosen day in full, capitalised, without the current year', () => {
        expect(presentLongDay('2026-11-24', '2026-11-24')).toBe(
            'Mardi 24 novembre',
        );
    });

    it('adds the year to a day of another year', () => {
        expect(presentLongDay('2027-01-01', '2026-11-24')).toBe(
            'Vendredi 1 janvier 2027',
        );
    });

    it('writes the end of a stay short, with its year when it changes', () => {
        expect(presentShortDay('2026-11-29', '2026-11-27')).toBe('29 novembre');
        expect(presentShortDay('2027-01-02', '2026-12-30')).toBe(
            '2 janvier 2027',
        );
    });
});
