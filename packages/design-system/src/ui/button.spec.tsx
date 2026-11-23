import { fireEvent, render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Feature: a button', () => {
    describe('Scenario: no type given', () => {
        it('never submits a form by accident', () => {
            render(<Button>Créer notre couple</Button>);

            expect(
                screen
                    .getByRole('button', { name: 'Créer notre couple' })
                    .getAttribute('type'),
            ).toBe('button');
        });
    });

    describe('Scenario: a destructive action', () => {
        it('uses the destructive colors and keeps the extra classes', () => {
            render(
                <Button
                    variant="destructive"
                    className="w-full"
                >
                    Quitter
                </Button>,
            );

            const button = screen.getByRole('button', { name: 'Quitter' });
            expect(button.className).toContain('bg-destructive');
            expect(button.className).toContain('w-full');
        });
    });

    describe('Scenario: a click', () => {
        it('calls its handler', () => {
            const clicks: string[] = [];
            render(
                <Button onClick={() => clicks.push('clicked')}>
                    Rejoindre
                </Button>,
            );

            fireEvent.click(screen.getByRole('button', { name: 'Rejoindre' }));

            expect(clicks).toEqual(['clicked']);
        });
    });
});
