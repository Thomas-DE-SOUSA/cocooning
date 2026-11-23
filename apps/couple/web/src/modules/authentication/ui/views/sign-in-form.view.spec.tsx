import type { SignInForm } from '@cocooning/couple-client-business-logic/authentication';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WithI18n } from '@/testing/with-i18n';
import { useSignInForm } from '../../hooks/use-sign-in-form';
import { SignInFormView } from './sign-in-form.view';

function SignInFormHarness({
    isPending,
    submitted,
}: {
    readonly isPending: boolean;
    readonly submitted: SignInForm[];
}) {
    const form = useSignInForm();
    return (
        <SignInFormView
            form={form}
            viewModel={{
                isPending,
                onSubmit: (values) => submitted.push(values),
            }}
        />
    );
}

function renderForm(isPending = false) {
    const submitted: SignInForm[] = [];
    render(
        <WithI18n>
            <SignInFormHarness
                isPending={isPending}
                submitted={submitted}
            />
        </WithI18n>,
    );
    return { submitted, user: userEvent.setup() };
}

const emailField = () => screen.getByLabelText('Adresse e-mail');
const passwordField = () => screen.getByLabelText('Mot de passe');
const submitButton = () => screen.getByRole('button');

describe('Feature: the sign-in form', () => {
    describe('Scenario: filled in', () => {
        it('submits the trimmed address and the password', async () => {
            const { submitted, user } = renderForm();

            await user.type(emailField(), ' thomas@cocooning.test ');
            await user.type(passwordField(), 'correct horse battery');
            await user.click(submitButton());

            await waitFor(() =>
                expect(submitted).toEqual([
                    {
                        emailAddress: 'thomas@cocooning.test',
                        password: 'correct horse battery',
                    },
                ]),
            );
        });
    });

    describe('Scenario: submitted empty', () => {
        it('shows each error under its field and submits nothing', async () => {
            const { submitted, user } = renderForm();

            await user.click(submitButton());

            expect(
                (await screen.findAllByRole('alert')).map((e) => e.textContent),
            ).toEqual([
                'Indiquez votre adresse e-mail.',
                'Indiquez votre mot de passe.',
            ]);
            expect(emailField().getAttribute('aria-invalid')).toBe('true');
            expect(submitted).toEqual([]);
        });
    });

    describe('Scenario: autofill on the phone', () => {
        it('marks the fields for the password managers', () => {
            renderForm();

            expect(emailField().getAttribute('autocomplete')).toBe('username');
            expect(emailField().getAttribute('autocapitalize')).toBe('none');
            expect(passwordField().getAttribute('autocomplete')).toBe(
                'current-password',
            );
            expect(emailField().closest('form')?.getAttribute('method')).toBe(
                'post',
            );
        });
    });

    describe('Scenario: a sign-in in progress', () => {
        it('disables the button and announces the wait', () => {
            renderForm(true);

            expect(submitButton().hasAttribute('disabled')).toBe(true);
            expect(
                screen.getByRole('status', { name: 'Connexion en cours' }),
            ).toBeTruthy();
        });
    });
});
