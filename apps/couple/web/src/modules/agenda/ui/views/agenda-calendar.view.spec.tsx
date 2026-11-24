import { fireEvent, render, screen } from '@testing-library/react';
import { WithI18n } from '@/testing/with-i18n';
import {
    type AgendaCalendarViewModel,
    AuthorColorEnum,
} from '../../view-models/agenda-screen.view-model';
import { AgendaCalendarView } from './agenda-calendar.view';

const NOVEMBER: AgendaCalendarViewModel = {
    today: '2026-11-24',
    month: '2026-11',
    firstYear: 2015,
    lastYear: 2036,
    marks: {
        '2026-11-24': [
            {
                calendarEventId: 'a',
                color: AuthorColorEnum.TERRACOTTA,
                isPrivate: false,
            },
            {
                calendarEventId: 'b',
                color: AuthorColorEnum.SAGE,
                isPrivate: true,
            },
        ],
    },
};

function renderCalendar() {
    const choices: string[] = [];
    render(
        <WithI18n>
            <AgendaCalendarView
                calendar={NOVEMBER}
                selectedDay="2026-11-12"
                onSelectDay={(day) => choices.push(`day:${day}`)}
                onChangeMonth={(month) => choices.push(`month:${month}`)}
            />
        </WithI18n>,
    );
    return { choices };
}

const dayButton = (day: string) =>
    document.querySelector<HTMLButtonElement>(
        `[data-slot="calendar-day-button"][data-day="${day}"]`,
    )!;

describe('Feature: the month grid of the agenda', () => {
    it('draws a dot per event under its day, in the color of its author', () => {
        renderCalendar();

        const dots = dayButton('2026-11-24').querySelectorAll('[data-color]');
        expect(
            [...dots].map((dot) => [
                dot.getAttribute('data-color'),
                dot.getAttribute('data-private'),
            ]),
        ).toEqual([
            ['TERRACOTTA', 'false'],
            ['SAGE', 'true'],
        ]);
        expect(
            dayButton('2026-11-25').querySelectorAll('[data-color]'),
        ).toHaveLength(0);
    });

    it('fills the chosen day', () => {
        renderCalendar();
        expect(dayButton('2026-11-12').firstElementChild!.className).toContain(
            'bg-primary',
        );
    });

    it('chooses the tapped day, even one of the next month', () => {
        const { choices } = renderCalendar();

        fireEvent.click(dayButton('2026-11-24'));
        fireEvent.click(dayButton('2026-12-01'));

        expect(choices).toEqual(['day:2026-11-24', 'day:2026-12-01']);
    });

    it('moves from month to month with the chevrons', () => {
        const { choices } = renderCalendar();

        fireEvent.click(screen.getByRole('button', { name: 'Mois suivant' }));
        fireEvent.click(screen.getByRole('button', { name: 'Mois précédent' }));

        expect(choices).toEqual(['month:2026-12', 'month:2026-10']);
    });

    it('picks the month and the year from the caption', () => {
        const { choices } = renderCalendar();

        fireEvent.change(
            screen.getByRole('combobox', { name: "Choisir l'année" }),
            {
                target: { value: '2027' },
            },
        );

        expect(choices).toEqual(['month:2027-11']);
    });
});
