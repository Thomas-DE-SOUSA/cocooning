import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WithI18n } from '@/testing/with-i18n';
import type { PushNotificationsStatus } from '../../view-models/push-notifications.view-model';
import { PushNotificationsView } from './push-notifications.view';

function renderCard(status: PushNotificationsStatus, isPending = false) {
    const taps: string[] = [];
    render(
        <WithI18n>
            <PushNotificationsView
                status={status}
                isPending={isPending}
                onTurnOn={() => taps.push('turnOn')}
                onTurnOff={() => taps.push('turnOff')}
            />
        </WithI18n>,
    );
    return taps;
}

describe('Feature: R11, the notifications card of the "Nous" tab', () => {
    it('shows a skeleton while the phone is read', () => {
        renderCard('CHECKING');

        expect(
            screen.getByRole('status', {
                name: 'Lecture des réglages du téléphone',
            }),
        ).not.toBeNull();
        expect(screen.queryByRole('button')).toBeNull();
    });

    it.each([
        [
            'UNSUPPORTED',
            "Installe Cocooning sur l'écran d'accueil pour recevoir les notifications.",
        ],
        [
            'BLOCKED',
            'Les notifications sont bloquées dans les réglages du téléphone.',
        ],
    ] as const)('explains %s without a button', (status, text) => {
        renderCard(status);

        expect(screen.getByText(text)).not.toBeNull();
        expect(screen.queryByRole('button')).toBeNull();
    });

    it('turns the notifications on with a tap', async () => {
        const taps = renderCard('OFF');

        await userEvent.click(
            screen.getByRole('button', { name: 'Activer les notifications' }),
        );

        expect(taps).toEqual(['turnOn']);
    });

    it('says they are on and turns them off with a tap', async () => {
        const taps = renderCard('ON');

        expect(
            screen.getByText(
                'Les notifications sont activées sur ce téléphone.',
            ),
        ).not.toBeNull();
        await userEvent.click(
            screen.getByRole('button', { name: 'Désactiver' }),
        );

        expect(taps).toEqual(['turnOff']);
    });

    it('announces the change in progress on a disabled button', () => {
        renderCard('OFF', true);

        expect(screen.getByRole('button').hasAttribute('disabled')).toBe(true);
        expect(
            screen.getByRole('status', { name: 'Activation en cours' }),
        ).not.toBeNull();
    });
});
