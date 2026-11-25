import type { FlashMessageForm } from '@cocooning/couple-client-business-logic/messaging';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WithI18n } from '@/testing/with-i18n';
import { useFlashMessageForm } from '../../hooks/use-flash-message-form';
import { MessageComposerView } from './message-composer.view';

function ComposerHarness({
    events,
    isSending,
}: {
    readonly events: string[];
    readonly isSending: boolean;
}) {
    const form = useFlashMessageForm();
    return (
        <MessageComposerView
            form={form}
            isSending={isSending}
            isBusy={isSending}
            onSubmit={(sent: FlashMessageForm) =>
                events.push(`send:${sent.text}`)
            }
            onReadyWord={(text) => events.push(`ready:${text}`)}
            onTakePhoto={() => events.push('camera')}
        />
    );
}

function renderComposer(isSending = false) {
    const events: string[] = [];
    render(
        <WithI18n>
            <ComposerHarness
                events={events}
                isSending={isSending}
            />
        </WithI18n>,
    );
    return { events };
}

const field = () => screen.getByRole('textbox', { name: 'Un petit mot' });

describe('Feature: the composer of the messages screen', () => {
    it('sends a ready-made word in one tap, and opens the camera', () => {
        const { events } = renderComposer();

        fireEvent.click(screen.getByRole('button', { name: "Je t'aime" }));
        fireEvent.click(screen.getByRole('button', { name: "J'arrive" }));
        fireEvent.click(
            screen.getByRole('button', { name: 'Prendre une photo' }),
        );

        expect(events).toEqual(["ready:Je t'aime", "ready:J'arrive", 'camera']);
    });

    it('R2, sends the typed word trimmed, in a 16 px field that iOS does not zoom', async () => {
        const { events } = renderComposer();

        expect(field().className).toContain('text-base');
        fireEvent.change(field(), { target: { value: '  Coucou toi ' } });
        fireEvent.click(screen.getByRole('button', { name: 'Envoyer' }));

        await waitFor(() => expect(events).toEqual(['send:Coucou toi']));
    });

    it('R2, says under the field that an empty word cannot leave', async () => {
        const { events } = renderComposer();

        fireEvent.click(screen.getByRole('button', { name: 'Envoyer' }));

        expect(
            await screen.findByText("Écris un mot avant de l'envoyer."),
        ).toBeTruthy();
        expect(events).toEqual([]);
    });

    it('spins on the send button while the word leaves, every button waiting', () => {
        renderComposer(true);

        expect(screen.getByLabelText('Envoi en cours')).toBeTruthy();
        expect(
            screen
                .getByRole('button', { name: 'Bisous' })
                .hasAttribute('disabled'),
        ).toBe(true);
    });
});
