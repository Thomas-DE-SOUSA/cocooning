import { fireEvent, render, screen } from '@testing-library/react';
import { Input } from './input';
import { Label } from './label';

describe('Feature: a text field', () => {
    describe('Scenario: a field with its label', () => {
        it('is found by its label and defaults to text', () => {
            render(
                <>
                    <Label htmlFor="email">Adresse e-mail</Label>
                    <Input id="email" />
                </>,
            );

            expect(
                screen.getByLabelText('Adresse e-mail').getAttribute('type'),
            ).toBe('text');
        });
    });

    describe('Scenario: a password field marked invalid', () => {
        it('keeps its type, its error color and the extra classes', () => {
            render(
                <Input
                    aria-label="Mot de passe"
                    type="password"
                    aria-invalid
                    className="mt-2"
                />,
            );

            const field = screen.getByLabelText('Mot de passe');
            expect(field.getAttribute('type')).toBe('password');
            expect(field.className).toContain(
                'aria-invalid:border-destructive',
            );
            expect(field.className).toContain('mt-2');
        });
    });

    describe('Scenario: typing', () => {
        it('reports each change to its handler', () => {
            const typed: string[] = [];
            render(
                <Input
                    aria-label="Adresse e-mail"
                    onChange={(event) => typed.push(event.target.value)}
                />,
            );

            fireEvent.change(screen.getByLabelText('Adresse e-mail'), {
                target: { value: 'thomas@cocooning.test' },
            });

            expect(typed).toEqual(['thomas@cocooning.test']);
        });
    });
});
