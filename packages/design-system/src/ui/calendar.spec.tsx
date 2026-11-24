import { fireEvent, render, screen } from '@testing-library/react';
import type { CustomComponents, DayButtonProps } from 'react-day-picker';
import { fr } from 'react-day-picker/locale';
import { Calendar } from './calendar';
import { CalendarDayButton } from './calendar-day-button';

const NOVEMBER_2026 = new Date(2026, 10, 1);
const THE_24TH = new Date(2026, 10, 24);

function renderNovember(components: Partial<CustomComponents> = {}) {
    const picks: string[] = [];
    render(
        <Calendar
            mode="single"
            required
            locale={fr}
            weekStartsOn={1}
            month={NOVEMBER_2026}
            today={THE_24TH}
            selected={new Date(2026, 10, 12)}
            onSelect={(day) => picks.push(day.toDateString())}
            labels={{
                labelPrevious: () => 'Mois précédent',
                labelNext: () => 'Mois suivant',
            }}
            components={components}
        />,
    );
    return { picks };
}

const dayButton = (isoDate: string) =>
    document.querySelector<HTMLButtonElement>(
        `[data-slot="calendar-day-button"][data-day="${isoDate}"]`,
    )!;

describe('Feature: the month calendar', () => {
    it('heads the weeks from Monday with one letter per day, in the given locale', () => {
        renderNovember();

        const weekdays = [...document.querySelectorAll('th')].map(
            (header) => header.textContent,
        );
        expect(weekdays).toEqual(['L', 'M', 'M', 'J', 'V', 'S', 'D']);
    });

    it('names the month and its navigation buttons with the labels it receives', () => {
        renderNovember();

        expect(
            screen.getByRole('grid', { name: /novembre 2026/ }),
        ).toBeTruthy();
        expect(
            screen.getByRole('button', { name: 'Mois précédent' }),
        ).toBeTruthy();
        expect(
            screen.getByRole('button', { name: 'Mois suivant' }),
        ).toBeTruthy();
    });

    it('fills the selected day, marks today in the accent and mutes the days of other months', () => {
        renderNovember();

        expect(dayButton('2026-11-12').firstElementChild!.className).toContain(
            'bg-primary',
        );
        expect(dayButton('2026-11-24').firstElementChild!.className).toContain(
            'text-primary',
        );
        expect(dayButton('2026-12-01').firstElementChild!.className).toContain(
            'text-muted-foreground',
        );
    });

    it('hands the tapped day to its owner', () => {
        const { picks } = renderNovember();

        fireEvent.click(dayButton('2026-11-24'));

        expect(picks).toEqual([THE_24TH.toDateString()]);
    });

    it('lets the app draw its own marks under each day', () => {
        renderNovember({
            DayButton: (props: DayButtonProps) => (
                <CalendarDayButton
                    {...props}
                    marks={<span data-testid={`mark-${props.day.isoDate}`} />}
                />
            ),
        });

        expect(screen.getByTestId('mark-2026-11-24')).toBeTruthy();
        expect(dayButton('2026-11-24').className).toContain('h-12');
    });
});
