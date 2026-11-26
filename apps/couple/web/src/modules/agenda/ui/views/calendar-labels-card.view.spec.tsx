import { fireEvent, render, screen } from '@testing-library/react';
import { WithI18n } from '@/testing/with-i18n';
import type { CalendarLabelItem } from '../../view-models/calendar-label.view-model';
import { CalendarLabelsCardView } from './calendar-labels-card.view';

const SPORT: CalendarLabelItem = {
    calendarLabelId: '01936b2e-7c4a-7000-8000-0000000000b1',
    name: 'Sport',
    color: 'MINT',
};

function renderCard(labels: readonly CalendarLabelItem[]) {
    const opened: string[] = [];
    render(
        <WithI18n>
            <CalendarLabelsCardView
                labels={labels}
                onOpenLabel={(label) => opened.push(label.name)}
            />
        </WithI18n>,
    );
    return { opened };
}

describe('Feature: the labels card of the "Nous" tab', () => {
    it('R12, lists each label with its colour and opens the one tapped', () => {
        const { opened } = renderCard([SPORT]);

        const sport = screen.getByRole('button', {
            name: "Modifier l'étiquette Sport",
        });
        expect(
            sport.querySelector('[data-tint]')?.getAttribute('data-tint'),
        ).toBe('MINT');
        fireEvent.click(sport);

        expect(opened).toEqual(['Sport']);
    });

    it('says how to create the first label', () => {
        renderCard([]);

        expect(
            screen.getByText(/Aucune étiquette pour l'instant/),
        ).toBeTruthy();
    });
});
