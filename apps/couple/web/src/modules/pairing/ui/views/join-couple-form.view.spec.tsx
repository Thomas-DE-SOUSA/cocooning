import type { JoinCoupleForm } from '@cocooning/couple-client-business-logic/pairing';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WithI18n } from '@/testing/with-i18n';
import { useJoinCoupleForm } from '../../hooks/use-join-couple-form';
import { JoinCoupleFormView } from './join-couple-form.view';

function JoinCoupleFormHarness({
    isPending,
    joined,
}: {
    readonly isPending: boolean;
    readonly joined: JoinCoupleForm[];
}) {
    const form = useJoinCoupleForm();
    return (
        <JoinCoupleFormView
            form={form}
            isPending={isPending}
            onJoin={(values) => joined.push(values)}
        />
    );
}

function renderForm(isPending = false) {
    const joined: JoinCoupleForm[] = [];
    render(
        <WithI18n>
            <JoinCoupleFormHarness
                isPending={isPending}
                joined={joined}
            />
        </WithI18n>,
    );
    return { joined, user: userEvent.setup() };
}

const codeField = () => screen.getByLabelText("Code d'invitation");
const joinButton = () => screen.getByRole('button');

describe('Feature: the second partner types the invitation code', () => {
    describe('Scenario: R3, a code dictated in lower case with spaces', () => {
        it('submits it without the surrounding spaces', async () => {
            const { joined, user } = renderForm();

            await user.type(codeField(), ' k7m2 q9xr ');
            await user.click(joinButton());

            await waitFor(() =>
                expect(joined).toEqual([{ invitationCode: 'k7m2 q9xr' }]),
            );
        });
    });

    describe('Scenario: decision 0031, submitted empty', () => {
        it('shows the error under the field and submits nothing', async () => {
            const { joined, user } = renderForm();

            await user.click(joinButton());

            expect((await screen.findByRole('alert')).textContent).toBe(
                "Indiquez le code d'invitation.",
            );
            expect(codeField().getAttribute('aria-invalid')).toBe('true');
            expect(joined).toEqual([]);
        });
    });

    describe('Scenario: a code on the phone keyboard', () => {
        it('offers capitals without autocorrect and posts the form', () => {
            renderForm();

            expect(codeField().getAttribute('autocapitalize')).toBe(
                'characters',
            );
            expect(codeField().getAttribute('autocorrect')).toBe('off');
            expect(codeField().closest('form')?.getAttribute('method')).toBe(
                'post',
            );
        });
    });

    describe('Scenario: R5, joining in progress', () => {
        it('disables the button and announces the wait', () => {
            renderForm(true);

            expect(joinButton().hasAttribute('disabled')).toBe(true);
            expect(
                screen.getByRole('status', {
                    name: 'Entrée dans le couple en cours',
                }),
            ).toBeTruthy();
        });
    });
});
