import { fireEvent, render, screen } from '@testing-library/react';
import { Label } from './label';
import { Textarea } from './textarea';

describe('Feature: a text area', () => {
    describe('Scenario: a text area with its label, marked invalid', () => {
        it('is found by its label, keeps a 16 px text and its error color', () => {
            render(
                <>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        aria-invalid
                        className="mt-2"
                    />
                </>,
            );

            const field = screen.getByLabelText('Description');
            expect(field.className).toContain('text-base');
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
                <Textarea
                    aria-label="Description"
                    onChange={(event) => typed.push(event.target.value)}
                />,
            );

            fireEvent.change(screen.getByLabelText('Description'), {
                target: { value: 'Apporter le dessert' },
            });

            expect(typed).toEqual(['Apporter le dessert']);
        });
    });
});
