import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WithI18n } from '@/testing/with-i18n';
import { NotesUnavailableView } from './notes-unavailable.view';

describe('Feature: the notes cannot be read', () => {
    it('explains why and offers to try again', async () => {
        const taps: string[] = [];
        render(
            <WithI18n>
                <NotesUnavailableView
                    description="Cocooning ne répond pas."
                    onRefresh={() => taps.push('refresh')}
                />
            </WithI18n>,
        );

        expect(screen.getByRole('alert').textContent).toContain(
            'Cocooning ne répond pas.',
        );
        await userEvent.click(
            screen.getByRole('button', { name: 'Réessayer' }),
        );
        expect(taps).toEqual(['refresh']);
    });
});
