import { fireEvent, render, screen, within } from '@testing-library/react';
import { WithI18n } from '@/testing/with-i18n';
import {
    type AgendaDayItem,
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
    moment: {
        startsOn: '2026-11-24',
        endsOn: null,
        startsAt: '20:00',
        endsAt: '23:00',
    },
    isOwner: false,
    isPrivate: false,
    audience: 'BOTH',
    labelId: '01936b2e-7c4a-7000-8000-0000000000b1',
    labelName: 'Famille',
    tint: 'SLATE',
    pill: 'BOTH',
};
const MY_SURPRISE: AgendaDayItem = {
    calendarEventId: 'event-surprise',
    title: 'Cadeau surprise',
    description: null,
    startsAt: null,
    endsAt: null,
    span: { kind: EventSpanKindEnum.UNTIL, day: '29 novembre' },
    moment: {
        startsOn: '2026-11-24',
        endsOn: '2026-11-29',
        startsAt: null,
        endsAt: null,
    },
    isOwner: true,
    isPrivate: true,
    audience: 'ME',
    labelId: null,
    labelName: null,
    tint: 'NEUTRAL',
    pill: 'PRIVATE',
};

function renderDay(
    day: Partial<AgendaDayViewModel>,
    removedEventId: string | null = null,
) {
    const opened: string[] = [];
    render(
        <WithI18n>
            <AgendaDayView
                day={{
                    label: 'Mardi 24 novembre',
                    isToday: false,
                    items: [],
                    ...day,
                }}
                removedEventId={removedEventId}
                isDeletionBusy={false}
                onOpenEvent={(item) => opened.push(item.calendarEventId)}
                onDeleteEvent={(item) =>
                    opened.push(`delete:${item.calendarEventId}`)
                }
            />
        </WithI18n>,
    );
    return { opened };
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

    it('R11, R13, shows the hours, the description, who it is for and its label in its colour', () => {
        renderDay({ items: [A_DINNER] });

        const dinner = itemOf('Dîner chez Léa');
        expect(dinner.getByText('20:00')).toBeTruthy();
        expect(dinner.getByText('23:00')).toBeTruthy();
        expect(dinner.getByText('Apporter le dessert')).toBeTruthy();
        expect(dinner.getByText('Nous deux').getAttribute('data-pill')).toBe(
            'BOTH',
        );
        expect(dinner.getByText('Famille')).toBeTruthy();
        const tints = [
            ...screen
                .getByRole('heading', { name: 'Dîner chez Léa' })
                .closest('li')!
                .querySelectorAll('[data-tint]'),
        ].map((element) => element.getAttribute('data-tint'));
        expect(tints).toEqual(['SLATE', 'SLATE']);
    });

    it('R7, marks my private event, without a label, and how long my stay lasts', () => {
        renderDay({ items: [MY_SURPRISE] });

        const surprise = itemOf('Cadeau surprise');
        expect(surprise.getByText('Toute la journée')).toBeTruthy();
        expect(surprise.getByText("Jusqu'au 29 novembre")).toBeTruthy();
        expect(
            surprise.getByText('Rien que pour moi').getAttribute('data-pill'),
        ).toBe('PRIVATE');
        expect(surprise.getByText('Sans étiquette')).toBeTruthy();
    });

    it('opens the event that is tapped', () => {
        const { opened } = renderDay({ items: [A_DINNER, MY_SURPRISE] });

        fireEvent.click(
            screen.getByRole('button', { name: 'Cadeau surprise' }),
        );

        expect(opened).toEqual(['event-surprise']);
    });

    it('R9, slides out the event being deleted by a swipe', () => {
        renderDay({ items: [A_DINNER, MY_SURPRISE] }, 'event-surprise');

        const rowOf = (title: string) =>
            screen
                .getByRole('heading', { name: title })
                .closest<HTMLElement>('[data-slot="swipe-to-delete-row"]')!;
        expect(rowOf('Cadeau surprise').style.transform).toBe(
            'translateX(-100%)',
        );
        expect(rowOf('Dîner chez Léa').style.transform).toBe('translateX(0px)');
    });
});
