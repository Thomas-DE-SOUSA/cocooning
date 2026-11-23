import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WithI18n } from '@/testing/with-i18n';
import { InvitationCodeView } from './invitation-code.view';

type State = {
    readonly isExpired?: boolean;
    readonly isCancelling?: boolean;
    readonly isBusy?: boolean;
};

function renderView(taps: string[], state: State = {}) {
    render(
        <WithI18n>
            <InvitationCodeView
                invitationCode="K7M2Q9XR"
                expiresAt="25 novembre 2026 à 09:00"
                isExpired={state.isExpired ?? false}
                isRenewing={false}
                isCancelling={state.isCancelling ?? false}
                isBusy={state.isBusy ?? false}
                onShare={() => taps.push('share')}
                onRenew={() => taps.push('renew')}
                onCancel={() => taps.push('cancel')}
                onRefresh={() => taps.push('refresh')}
            />
        </WithI18n>,
    );
}

describe('Feature: the pairing screens', () => {
    describe('Scenario: R4, waiting for the second partner', () => {
        it('shows the code, its expiry and its four actions', async () => {
            const taps: string[] = [];
            renderView(taps);

            expect(screen.getByText('K7M2Q9XR')).toBeTruthy();
            expect(
                screen.getByText("Valable jusqu'au 25 novembre 2026 à 09:00"),
            ).toBeTruthy();
            for (const name of [
                'Partager le code',
                'Nouveau code',
                'Actualiser',
                'Annuler ce couple',
            ]) {
                await userEvent.click(screen.getByRole('button', { name }));
            }
            expect(taps).toEqual(['share', 'renew', 'refresh', 'cancel']);
        });
    });

    describe('Scenario: R4, the code has expired', () => {
        it('says so and no longer offers to share it (R7)', () => {
            renderView([], { isExpired: true });

            expect(
                screen.getByText(
                    'Ce code a expiré le 25 novembre 2026 à 09:00. Demandez un nouveau code.',
                ),
            ).toBeTruthy();
            expect(
                screen.queryByRole('button', { name: 'Partager le code' }),
            ).toBeNull();
        });
    });

    describe('Scenario: R8, the cancellation is running', () => {
        it('spins on its button and disables the other commands', () => {
            renderView([], { isCancelling: true, isBusy: true });

            expect(
                screen.getByRole('status', { name: 'Annulation en cours' }),
            ).toBeTruthy();
            expect(
                screen
                    .getByRole('button', { name: 'Nouveau code' })
                    .hasAttribute('disabled'),
            ).toBe(true);
        });
    });
});
