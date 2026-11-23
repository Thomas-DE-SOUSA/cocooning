import { render, screen } from '@testing-library/react';
import { Field, FieldError } from './field';
import { Input } from './input';
import { Label } from './label';

describe('Feature: a form field with its error', () => {
    describe('Scenario: an invalid field', () => {
        it('announces the error and links it to the input', () => {
            render(
                <Field>
                    <Label htmlFor="email">Adresse e-mail</Label>
                    <Input
                        id="email"
                        aria-invalid
                        aria-describedby="email-error"
                    />
                    <FieldError id="email-error">
                        Indiquez votre adresse e-mail
                    </FieldError>
                </Field>,
            );

            expect(screen.getByRole('alert').textContent).toBe(
                'Indiquez votre adresse e-mail',
            );
            expect(
                screen
                    .getByLabelText('Adresse e-mail')
                    .getAttribute('aria-describedby'),
            ).toBe('email-error');
        });
    });

    describe('Scenario: a valid field', () => {
        it('renders no error', () => {
            render(<FieldError id="email-error">{null}</FieldError>);

            expect(screen.queryByRole('alert')).toBeNull();
        });
    });

    describe('Scenario: extra classes', () => {
        it('keeps them on the group', () => {
            render(<Field className="mt-4" />);

            expect(screen.getByRole('group').className).toContain('mt-4');
        });
    });
});
