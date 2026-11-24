import { presentTogetherTime } from './together-time.presenter';

const NOW = new Date('2022-01-31T12:00:00.000Z');

describe('Feature: the time the couple has spent together', () => {
    it('is unknown while no together period is recorded', () => {
        expect(presentTogetherTime([], NOW)).toBeNull();
    });

    it('R9, adds the days of every period, the open one up to today, without the pause', () => {
        const time = presentTogetherTime(
            [
                { startedOn: '2020-01-10', endedOn: '2021-01-09' },
                { startedOn: '2022-01-01', endedOn: null },
            ],
            NOW,
        );

        expect(time).toEqual({ days: '395', years: '1,08' });
    });

    it('counts today in Paris, even late in the evening in UTC', () => {
        const time = presentTogetherTime(
            [{ startedOn: '2022-01-01', endedOn: null }],
            new Date('2022-01-31T23:30:00.000Z'),
        );

        expect(time?.days).toBe('31');
    });

    it('groups the thousands the French way', () => {
        const time = presentTogetherTime(
            [{ startedOn: '2015-01-01', endedOn: '2020-01-01' }],
            NOW,
        );

        expect(time?.days.replace(/\s/u, ' ')).toBe('1 826');
    });
});
