import { EventSpanKindEnum } from '../view-models/agenda-screen.view-model';
import {
    anEvent,
    LABELS,
    MY_PRIVATE_EVENT,
    SPORT_ID,
} from './__tests__/calendar-events';
import { presentDayItems } from './day-items.presenter';

describe('Feature: the events of the chosen day', () => {
    it('lists all-day events first, then by start hour, then by title', () => {
        const day = { startsOn: '2026-11-24' };
        const items = presentDayItems(
            [
                anEvent({
                    ...day,
                    title: 'Cinéma',
                    startsAt: '20:00',
                    endsAt: null,
                }),
                anEvent({
                    ...day,
                    title: 'Anniversaire',
                    startsAt: null,
                    endsAt: null,
                }),
                anEvent({
                    ...day,
                    title: 'Bureau',
                    startsAt: '09:00',
                    endsAt: null,
                }),
                anEvent({
                    ...day,
                    title: 'Apéro',
                    startsAt: '20:00',
                    endsAt: null,
                }),
                anEvent({ startsOn: '2026-11-25', title: 'Demain' }),
            ],
            '2026-11-24',
            LABELS,
        );

        expect(items.map(({ title }) => title)).toEqual([
            'Anniversaire',
            'Bureau',
            'Apéro',
            'Cinéma',
        ]);
    });

    it('R13, gives an event its hours, its author and the name and colour of its label', () => {
        const [item] = presentDayItems(
            [
                anEvent({
                    isOwner: false,
                    description: 'Chez Léa',
                    labelId: SPORT_ID,
                }),
            ],
            '2026-12-05',
            LABELS,
        );

        expect(item).toMatchObject({
            title: 'Diner chez Lea',
            description: 'Chez Léa',
            startsAt: '20:00',
            endsAt: '23:00',
            span: null,
            isOwner: false,
            isPrivate: false,
            labelId: SPORT_ID,
            labelName: 'Sport',
            tint: 'SAGE',
        });
    });

    it('R13, R14, leaves an event without a label, or with a label deleted since, neutral', () => {
        const items = presentDayItems(
            [
                anEvent({ labelId: null }),
                anEvent({ labelId: '01936b2e-7c4a-7000-8000-0000000000b9' }),
            ],
            '2026-12-05',
            LABELS,
        );

        expect(items.map(({ labelName, tint }) => [labelName, tint])).toEqual([
            [null, 'NEUTRAL'],
            [null, 'NEUTRAL'],
        ]);
    });

    it.each([
        [true, 'ME'],
        [false, 'YOU'],
    ])(
        'R11, tells who an event of its author is for, read by its author %s',
        (isOwner, audience) => {
            const [item] = presentDayItems(
                [anEvent({ isOwner, audience: 'OWNER', labelId: null })],
                '2026-12-05',
                LABELS,
            );

            expect(item).toMatchObject({
                audience,
                pill: audience,
                labelId: null,
            });
        },
    );

    it('R7, tells my private event apart', () => {
        const [item] = presentDayItems(
            [MY_PRIVATE_EVENT],
            '2026-12-05',
            LABELS,
        );

        expect(item).toMatchObject({
            isPrivate: true,
            isOwner: true,
            startsAt: null,
            pill: 'PRIVATE',
        });
    });

    it('says until when a stay lasts on its first day, keeping its start hour', () => {
        const [item] = presentDayItems(
            [
                anEvent({
                    startsOn: '2026-11-28',
                    endsOn: '2026-11-29',
                    startsAt: '18:00',
                    endsAt: '10:00',
                }),
            ],
            '2026-11-28',
            LABELS,
        );

        expect(item).toMatchObject({
            startsAt: '18:00',
            endsAt: null,
            span: { kind: EventSpanKindEnum.UNTIL, day: '29 novembre' },
        });
    });

    it('says since when on a later day of a stay, which then lasts all day', () => {
        const [item] = presentDayItems(
            [
                anEvent({
                    startsOn: '2026-12-30',
                    endsOn: '2027-01-02',
                    startsAt: '18:00',
                }),
            ],
            '2027-01-01',
            LABELS,
        );

        expect(item).toMatchObject({
            startsAt: null,
            endsAt: null,
            span: { kind: EventSpanKindEnum.SINCE, day: '30 décembre 2026' },
        });
    });

    it('keeps the whole moment of the event for the drawer, whatever the day shown', () => {
        const [item] = presentDayItems(
            [
                anEvent({
                    startsOn: '2026-12-30',
                    endsOn: '2027-01-02',
                    startsAt: '18:00',
                    endsAt: '10:00',
                }),
            ],
            '2027-01-01',
            LABELS,
        );

        expect(item?.moment).toEqual({
            startsOn: '2026-12-30',
            endsOn: '2027-01-02',
            startsAt: '18:00',
            endsAt: '10:00',
        });
    });
});
