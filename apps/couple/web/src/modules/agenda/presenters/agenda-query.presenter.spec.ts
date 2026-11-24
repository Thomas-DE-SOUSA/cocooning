import { presentAgendaQuery } from './agenda-query.presenter';
import { resolveAgendaHref } from './agenda-href.presenter';

const TODAY = '2026-11-24';

describe('Feature: the day and the month read from the address of the agenda', () => {
    it('opens on today and its month without parameters', () => {
        expect(presentAgendaQuery({}, TODAY)).toEqual({
            day: TODAY,
            month: '2026-11',
        });
    });

    it('shows the month of the chosen day when no month is given', () => {
        expect(presentAgendaQuery({ day: '2027-02-14' }, TODAY)).toEqual({
            day: '2027-02-14',
            month: '2027-02',
        });
    });

    it('keeps the month browsed apart from the chosen day', () => {
        expect(
            presentAgendaQuery({ day: '2026-11-24', month: '2027-03' }, TODAY),
        ).toEqual({ day: '2026-11-24', month: '2027-03' });
    });

    it.each([
        ['a day that does not exist', { day: '2026-02-30', month: '2026-13' }],
        ['repeated parameters', { day: ['2026-11-01', '2026-11-02'] }],
        ['a year before 2015', { day: '2014-12-31', month: '2014-12' }],
        [
            'a year after the tenth one ahead',
            { day: '2037-01-01', month: '2037-01' },
        ],
    ])('falls back to today on %s', (_label, params) => {
        expect(presentAgendaQuery(params, TODAY)).toEqual({
            day: TODAY,
            month: '2026-11',
        });
    });

    it('writes a day and a month back into the address', () => {
        expect(resolveAgendaHref({ day: '2026-11-24', month: '2027-03' })).toBe(
            '/agenda?day=2026-11-24&month=2027-03',
        );
    });
});
