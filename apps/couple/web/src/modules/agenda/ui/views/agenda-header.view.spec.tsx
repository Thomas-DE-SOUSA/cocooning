import { fireEvent, render, screen } from '@testing-library/react';
import { WithI18n } from '@/testing/with-i18n';
import { AgendaHeaderView } from './agenda-header.view';

describe('Feature: the header of the agenda', () => {
    describe('Scenario: the grid is shown', () => {
        it('brings the grid back to today on a tap of "Aujourd\'hui"', () => {
            const taps: string[] = [];
            render(
                <WithI18n>
                    <AgendaHeaderView onShowToday={() => taps.push('today')} />
                </WithI18n>,
            );

            fireEvent.click(
                screen.getByRole('button', { name: "Aujourd'hui" }),
            );

            expect(
                screen.getByRole('heading', { level: 1, name: 'Agenda' }),
            ).not.toBeNull();
            expect(taps).toEqual(['today']);
        });
    });

    describe('Scenario: the agenda cannot be read', () => {
        it('shows the title alone', () => {
            render(
                <WithI18n>
                    <AgendaHeaderView onShowToday={null} />
                </WithI18n>,
            );

            expect(
                screen.getByRole('heading', { level: 1, name: 'Agenda' }),
            ).not.toBeNull();
            expect(screen.queryByRole('button')).toBeNull();
        });
    });
});
