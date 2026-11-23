import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UnavailableNotice } from './unavailable-notice';

describe('Feature: a screen whose data cannot be read', () => {
    it('explains why and offers to try again', async () => {
        const taps: string[] = [];
        render(
            <UnavailableNotice
                title="Impossible d'afficher vos notes"
                description="Cocooning ne répond pas."
                retryLabel="Réessayer"
                onRetry={() => taps.push('retry')}
            />,
        );

        expect(screen.getByRole('alert').textContent).toContain(
            'Cocooning ne répond pas.',
        );
        await userEvent.click(
            screen.getByRole('button', { name: 'Réessayer' }),
        );
        expect(taps).toEqual(['retry']);
    });
});
