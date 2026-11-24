import { render, screen, within } from '@testing-library/react';
import { WithI18n } from '@/testing/with-i18n';
import {
    type AgendaDayItem,
    AuthorColorEnum,
    type AgendaDayViewModel,
    EventSpanKindEnum,
} from '../../view-models/agenda-screen.view-model';
import { AgendaDayView } from './agenda-day.view';

const A_DINNER: AgendaDayItem = {
    calendarEventId: 'event-dinner',
    title: 'Dîner chez Léa',
    description: 'Apporter le dessert',
    startsAt: '20:00',
    endsAt: '23:00',
    span: null,
    isOwner: false,
    isPrivate: false,
    color: AuthorColorEnum.SAGE,
};
const MY_SURPRISE: AgendaDayItem = {
    calendarEventId: 'event-surprise',
    title: 'Cadeau surprise',
    description: null,
    startsAt: null,
    endsAt: null,
    span: { kind: EventSpanKindEnum.UNTIL, day: '29 novembre' },
    isOwner: true,
    isPrivate: true,
    color: AuthorColorEnum.TERRACOTTA,
};

function renderDay(day: Partial<AgendaDayViewModel>) {
    render(
        <WithI18n>
            <AgendaDayView
                day={{
                    label: 'Mardi 24 novembre',
                    isToday: false,
                    items: [],
                    ...day,
                }}
            />
        </WithI18n>,
    );
}

const itemOf = (title: string) =>
    within(screen.getByRole('heading', { name: title }).closest('li')!);

describe('Feature: the events of the chosen day', () => {
    it('says when nothing is planned that day', () => {
        renderDay({});
        expect(
            screen.getByRole('heading', { name: 'Mardi 24 novembre' }),
        ).toBeTruthy();
        expect(screen.getByText('Rien de prévu ce jour-là.')).toBeTruthy();
        expect(screen.queryByText("Aujourd'hui")).toBeNull();
    });

    it('tells that the chosen day is today', () => {
        renderDay({ isToday: true });
        expect(screen.getByText("Aujourd'hui")).toBeTruthy();
    });

    it('shows the hours one above the other, the description and the author', () => {
        renderDay({ items: [A_DINNER] });

        const dinner = itemOf('Dîner chez Léa');
        expect(dinner.getByText('20:00')).toBeTruthy();
        expect(dinner.getByText('23:00')).toBeTruthy();
        expect(dinner.getByText('Apporter le dessert')).toBeTruthy();
        expect(dinner.getByText('Mon âme sœur')).toBeTruthy();
        expect(dinner.queryByText('Rien que pour moi')).toBeNull();
    });

    it('R7, marks my private event and how long my stay lasts', () => {
        renderDay({ items: [MY_SURPRISE] });

        const surprise = itemOf('Cadeau surprise');
        expect(surprise.getByText('Toute la journée')).toBeTruthy();
        expect(surprise.getByText("Jusqu'au 29 novembre")).toBeTruthy();
        expect(surprise.getByText('Moi')).toBeTruthy();
        expect(surprise.getByText('Rien que pour moi')).toBeTruthy();
    });
});
