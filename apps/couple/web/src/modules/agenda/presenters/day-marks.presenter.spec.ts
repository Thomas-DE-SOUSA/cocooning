import { CalendarEventVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import { AuthorColorEnum } from '../view-models/agenda-screen.view-model';
import { anEvent, CREATOR_ID, PARTNER_ID } from './__tests__/calendar-events';
import { presentDayMarks } from './day-marks.presenter';

const NOVEMBER_GRID = { from: '2026-10-26', to: '2026-12-06' };

const colorsOf = (marks: ReturnType<typeof presentDayMarks>, day: string) =>
    (marks[day] ?? []).map(({ color, isPrivate }) => ({ color, isPrivate }));

describe('Feature: the dots under the days of the grid', () => {
    it('R1, paints an event in the color of its author: terracotta for the creator of the couple, sage for the other', () => {
        const marks = presentDayMarks(
            [
                anEvent({
                    ownerId: CREATOR_ID,
                    startsOn: '2026-11-24',
                    startsAt: '09:00',
                }),
                anEvent({
                    ownerId: PARTNER_ID,
                    isOwner: false,
                    startsOn: '2026-11-24',
                    startsAt: '20:00',
                }),
            ],
            CREATOR_ID,
            NOVEMBER_GRID,
        );

        expect(colorsOf(marks, '2026-11-24')).toEqual([
            { color: AuthorColorEnum.TERRACOTTA, isPrivate: false },
            { color: AuthorColorEnum.SAGE, isPrivate: false },
        ]);
    });

    it('R7, draws a private event of mine as a hollow ring', () => {
        const marks = presentDayMarks(
            [
                anEvent({
                    startsOn: '2026-11-24',
                    visibility: CalendarEventVisibilityEnum.PRIVATE,
                }),
            ],
            CREATOR_ID,
            NOVEMBER_GRID,
        );

        expect(colorsOf(marks, '2026-11-24')).toEqual([
            { color: AuthorColorEnum.TERRACOTTA, isPrivate: true },
        ]);
    });

    it('marks every day a stay covers, inside the grid only', () => {
        const marks = presentDayMarks(
            [anEvent({ startsOn: '2026-12-05', endsOn: '2026-12-09' })],
            CREATOR_ID,
            NOVEMBER_GRID,
        );

        expect(Object.keys(marks)).toEqual(['2026-12-05', '2026-12-06']);
    });

    it('marks a stay that began before the grid from its first day', () => {
        const marks = presentDayMarks(
            [anEvent({ startsOn: '2026-10-20', endsOn: '2026-10-27' })],
            CREATOR_ID,
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
                    ownerId: PARTNER_ID,
                    startsAt: null,
                }),
                anEvent({ ...day, title: 'A', startsAt: '06:00' }),
            ],
            CREATOR_ID,
            NOVEMBER_GRID,
        );

        expect(colorsOf(marks, '2026-11-24').map(({ color }) => color)).toEqual(
            [
                AuthorColorEnum.SAGE,
                AuthorColorEnum.TERRACOTTA,
                AuthorColorEnum.TERRACOTTA,
            ],
        );
    });
});
