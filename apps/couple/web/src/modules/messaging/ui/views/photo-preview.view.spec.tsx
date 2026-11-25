import { fireEvent, render, screen } from '@testing-library/react';
import { WithI18n } from '@/testing/with-i18n';
import { PhotoPreviewView } from './photo-preview.view';

function renderPreview(promptIssuedAt: string | null, isSending = false) {
    const events: string[] = [];
    render(
        <WithI18n>
            <PhotoPreviewView
                previewUrl="blob:photo"
                promptIssuedAt={promptIssuedAt}
                isSending={isSending}
                onCancel={() => events.push('cancel')}
                onRetake={() => events.push('retake')}
                onSend={() => events.push('send')}
            />
        </WithI18n>,
    );
    return { events };
}

describe('Feature: the preview of the photo taken (R3)', () => {
    it('shows the photo full screen, then cancels, retakes or sends it', () => {
        const { events } = renderPreview(null);

        expect(
            screen.getByRole('dialog', { name: 'Pour ton âme sœur' }),
        ).toBeTruthy();
        expect(
            screen
                .getByRole('img', { name: 'Aperçu de la photo prise' })
                .getAttribute('src'),
        ).toBe('blob:photo');
        fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));
        fireEvent.click(screen.getByRole('button', { name: 'Reprendre' }));
        fireEvent.click(screen.getByRole('button', { name: 'Envoyer' }));

        expect(events).toEqual(['cancel', 'retake', 'send']);
        expect(screen.queryByText(/invitation de/)).toBeNull();
    });

    it('R8, names the prompt a photo of the day answers', () => {
        renderPreview('14:32');

        expect(
            screen.getByText('Photo du jour, invitation de 14:32'),
        ).toBeTruthy();
    });

    it('spins while the photo leaves, every button waiting', () => {
        renderPreview(null, true);

        expect(screen.getByLabelText('Envoi en cours')).toBeTruthy();
        expect(
            screen
                .getByRole('button', { name: 'Reprendre' })
                .hasAttribute('disabled'),
        ).toBe(true);
    });
});
