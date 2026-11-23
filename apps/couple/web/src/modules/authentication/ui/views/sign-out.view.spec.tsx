import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WithI18n } from '@/testing/with-i18n';
import { SignOutView } from './sign-out.view';

describe('Feature: the sign-out button', () => {
    it('signs out on a tap', async () => {
        const taps: string[] = [];
        render(
            <WithI18n>
                <SignOutView
                    isPending={false}
                    onSignOut={() => taps.push('signOut')}
                />
            </WithI18n>,
        );

        await userEvent.click(
            screen.getByRole('button', { name: 'Se déconnecter' }),
        );

        expect(taps).toEqual(['signOut']);
    });

    it('announces the sign-out in progress', () => {
        render(
            <WithI18n>
                <SignOutView
                    isPending
                    onSignOut={() => undefined}
                />
            </WithI18n>,
        );

        expect(screen.getByRole('button').hasAttribute('disabled')).toBe(true);
        expect(
            screen.getByRole('status', { name: 'Déconnexion en cours' }),
        ).toBeTruthy();
    });
});
