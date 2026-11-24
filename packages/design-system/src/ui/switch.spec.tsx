import { fireEvent, render, screen } from '@testing-library/react';
import { Label } from './label';
import { Switch } from './switch';

describe('Feature: an on/off switch', () => {
    describe('Scenario: a switch with its label', () => {
        it('is found by its label and says whether it is on', () => {
            render(
                <>
                    <Label htmlFor="all-day">Toute la journée</Label>
                    <Switch
                        id="all-day"
                        checked
                        className="ml-auto"
                    />
                </>,
            );

            const toggle = screen.getByRole('switch', {
                name: 'Toute la journée',
            });
            expect(toggle.getAttribute('aria-checked')).toBe('true');
            expect(toggle.className).toContain('ml-auto');
        });
    });

    describe('Scenario: a tap', () => {
        it('reports the new state to its handler', () => {
            const changes: boolean[] = [];
            render(
                <Switch
                    aria-label="Rien que pour moi"
                    checked={false}
                    onCheckedChange={(checked) => changes.push(checked)}
                />,
            );

            fireEvent.click(screen.getByRole('switch'));

            expect(changes).toEqual([true]);
        });
    });
});
