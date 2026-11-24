import {
    AuthorColorEnum,
    EventSpanKindEnum,
} from '../view-models/agenda-screen.view-model';
import {
    anEvent,
    CREATOR_ID,
    MY_PRIVATE_EVENT,
    PARTNER_ID,
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
            CREATOR_ID,
        );

        expect(items.map(({ title }) => title)).toEqual([
            'Anniversaire',
            'Bureau',
            'Apéro',
            'Cinéma',
        ]);
    });

    it('gives an event its hours, its author and its color', () => {
        const [item] = presentDayItems(
            [
                anEvent({
                    ownerId: PARTNER_ID,
                    isOwner: false,
                    description: 'Chez Léa',
                }),
            ],
            '2026-12-05',
            CREATOR_ID,
        );

        expect(item).toMatchObject({
            title: 'Diner chez Lea',
            description: 'Chez Léa',
            startsAt: '20:00',
            endsAt: '23:00',
            span: null,
            isOwner: false,
            isPrivate: false,
            color: AuthorColorEnum.SAGE,
        });
    });

    it('R7, tells my private event apart', () => {
        const [item] = presentDayItems(
            [MY_PRIVATE_EVENT],
            '2026-12-05',
            CREATOR_ID,
        );

        expect(item).toMatchObject({
            isPrivate: true,
            isOwner: true,
            startsAt: null,
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
            CREATOR_ID,
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
            CREATOR_ID,
        );

        expect(item).toMatchObject({
            startsAt: null,
            endsAt: null,
            span: { kind: EventSpanKindEnum.SINCE, day: '30 décembre 2026' },
        });
    });
});
