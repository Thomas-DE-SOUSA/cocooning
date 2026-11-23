import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WithI18n } from '@/testing/with-i18n';
import { InvitationCodeView } from './invitation-code.view';

describe('Feature: the pairing screens', () => {
    describe('Scenario: R4, waiting for the second partner', () => {
        it('shows the code, its expiry and its three actions', async () => {
            const taps: string[] = [];
            render(
                <WithI18n>
                    <InvitationCodeView
                        invitationCode="K7M2Q9XR"
                        expiresAt="25 novembre 2026 à 09:00"
                        isPending={false}
                        onShare={() => taps.push('share')}
                        onRenew={() => taps.push('renew')}
                        onRefresh={() => taps.push('refresh')}
                    />
                </WithI18n>,
            );

            expect(screen.getByText('K7M2Q9XR')).toBeTruthy();
            expect(
                screen.getByText("Valable jusqu'au 25 novembre 2026 à 09:00"),
            ).toBeTruthy();
            for (const name of [
                'Partager le code',
                'Nouveau code',
                'Actualiser',
            ]) {
                await userEvent.click(screen.getByRole('button', { name }));
            }
            expect(taps).toEqual(['share', 'renew', 'refresh']);
        });
    });
});
