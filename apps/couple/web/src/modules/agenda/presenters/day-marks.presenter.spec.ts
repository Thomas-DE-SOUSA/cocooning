import { CalendarEventVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import { anEvent, LABELS, SPORT_ID } from './__tests__/calendar-events';
import { presentDayMarks } from './day-marks.presenter';

const NOVEMBER_GRID = { from: '2026-10-26', to: '2026-12-06' };

const colorsOf = (marks: ReturnType<typeof presentDayMarks>, day: string) =>
    (marks[day] ?? []).map(({ tint, isPrivate }) => ({ tint, isPrivate }));

describe('Feature: the dots under the days of the grid', () => {
    it('R13, paints an event in the colour of its label, neutral without one', () => {
        const marks = presentDayMarks(
            [
                anEvent({
                    startsOn: '2026-11-24',
                    startsAt: '09:00',
                    labelId: SPORT_ID,
                }),
                anEvent({
                    isOwner: false,
                    startsOn: '2026-11-24',
                    startsAt: '20:00',
                    labelId: null,
                }),
            ],
            LABELS,
            NOVEMBER_GRID,
        );

        expect(colorsOf(marks, '2026-11-24')).toEqual([
            { tint: 'SAGE', isPrivate: false },
            { tint: 'NEUTRAL', isPrivate: false },
        ]);
    });

    it('R7, draws a private event of mine as a hollow ring', () => {
        const marks = presentDayMarks(
            [
                anEvent({
                    startsOn: '2026-11-24',
                    visibility: CalendarEventVisibilityEnum.PRIVATE,
                    labelId: SPORT_ID,
                }),
            ],
            LABELS,
            NOVEMBER_GRID,
        );

        expect(colorsOf(marks, '2026-11-24')).toEqual([
            { tint: 'SAGE', isPrivate: true },
        ]);
    });

    it('marks every day a stay covers, inside the grid only', () => {
        const marks = presentDayMarks(
            [anEvent({ startsOn: '2026-12-05', endsOn: '2026-12-09' })],
            LABELS,
            NOVEMBER_GRID,
        );

        expect(Object.keys(marks)).toEqual(['2026-12-05', '2026-12-06']);
    });

    it('marks a stay that began before the grid from its first day', () => {
        const marks = presentDayMarks(
            [anEvent({ startsOn: '2026-10-20', endsOn: '2026-10-27' })],
            LABELS,
            NOVEMBER_GRID,
        );

        expect(Object.keys(marks)).toEqual(['2026-10-26', '2026-10-27']);
    });

    it('draws three dots at most on a busy day, all-day events first', () => {
        const day = { startsOn: '2026-11-24' };
        const marks = presentDayMarks(
            [
                anEvent({ ...day, title: 'D', startsAt: '08:00' }),
                anEvent({ ...day, title: 'C', startsAt: '07:00' }),
                anEvent({
                    ...day,
                    title: 'B',
                    labelId: SPORT_ID,
                    startsAt: null,
                }),
                anEvent({ ...day, title: 'A', startsAt: '06:00' }),
            ],
            LABELS,
            NOVEMBER_GRID,
        );

        expect(colorsOf(marks, '2026-11-24').map(({ tint }) => tint)).toEqual([
            'SAGE',
            'NEUTRAL',
            'NEUTRAL',
        ]);
    });
});
