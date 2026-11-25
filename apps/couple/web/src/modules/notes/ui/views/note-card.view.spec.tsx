import { NoteCardStatusEnum } from '@cocooning/couple-shared-kernel/enums';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { WithI18n } from '@/testing/with-i18n';
import { NoteCardCommandEnum } from '../../view-models/note-card-command.view-model';
import type { NoteCardViewModel } from '../../view-models/note-card.view-model';
import { NoteCardView } from './note-card.view';

const CHEZ_PAUL: NoteCardViewModel = {
    noteId: 'n1',
    status: NoteCardStatusEnum.FILLED,
    fields: [
        { name: 'Adresse', value: '13 rue de Charonne', isManual: false },
        { name: 'Prix', value: '30 €', isManual: true },
        { name: 'Réservation', value: null, isManual: false },
    ],
    choice: null,
    sources: ['https://example.org/chez-paul', 'https://example.org/avis'],
    searchedOn: '25 nov.',
    canRefresh: true,
};

function renderCard(props: Partial<ComponentProps<typeof NoteCardView>>) {
    const events: string[] = [];
    render(
        <WithI18n>
            <NoteCardView
                card={CHEZ_PAUL}
                pending={null}
                isBusy={false}
                onRefresh={() => events.push('refresh')}
                onCorrect={(field) => events.push(`correct:${field.name}`)}
                {...props}
            >
                {null}
            </NoteCardView>
        </WithI18n>,
    );
    return { events };
}

describe('Feature: the card on the page of a note (R20 to R22, R25)', () => {
    it('R21, shows each field, « Non trouvé » for a field not found, and the sources folded', () => {
        renderCard({});

        expect(screen.getByRole('heading', { name: 'Fiche' })).not.toBeNull();
        expect(screen.getByText('13 rue de Charonne')).not.toBeNull();
        expect(screen.getByText('Non trouvé').className).toContain('italic');
        expect(
            screen.getByText('2 sources · recherchée le 25 nov.'),
        ).not.toBeNull();
        const link = screen.getByRole('link', {
            name: 'https://example.org/avis',
        });
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toBe('noopener noreferrer');
        expect(
            screen.getByRole('heading', { name: 'Nos notes' }),
        ).not.toBeNull();
    });

    it('R22, marks a value corrected by hand and corrects a field by a tap', () => {
        const { events } = renderCard({});

        expect(screen.getByText('corrigée')).not.toBeNull();
        fireEvent.click(screen.getByRole('button', { name: /Prix/ }));
        fireEvent.click(screen.getByRole('button', { name: 'Mettre à jour' }));

        expect(events).toEqual(['correct:Prix', 'refresh']);
    });

    it('R25, has no « Mettre à jour » outside a smart folder', () => {
        renderCard({ card: { ...CHEZ_PAUL, canRefresh: false } });

        expect(
            screen.queryByRole('button', { name: 'Mettre à jour' }),
        ).toBeNull();
    });

    it('R20, waits for the search: skeletons, no field, « Mettre à jour » disabled', () => {
        renderCard({
            card: {
                ...CHEZ_PAUL,
                status: NoteCardStatusEnum.PENDING,
                searchedOn: null,
            },
        });

        expect(screen.getByText('en recherche…')).not.toBeNull();
        expect(screen.queryByText('13 rue de Charonne')).toBeNull();
        expect(
            screen
                .getByRole('button', { name: 'Mettre à jour' })
                .hasAttribute('disabled'),
        ).toBe(true);
    });

    it('R20, says when the search failed and offers to retry', () => {
        const { events } = renderCard({
            card: { ...CHEZ_PAUL, status: NoteCardStatusEnum.FAILED },
        });

        expect(screen.getByText("La recherche n'a pas abouti.")).not.toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));

        expect(events).toEqual(['refresh']);
    });

    it('R23, says the limit of the day is reached', () => {
        renderCard({
            card: { ...CHEZ_PAUL, status: NoteCardStatusEnum.LIMIT_REACHED },
        });

        expect(
            screen.getByText('Plafond du jour atteint : réessaie demain.'),
        ).not.toBeNull();
    });

    it('spins on « Mettre à jour » while the update is sent', () => {
        renderCard({ pending: NoteCardCommandEnum.REFRESH, isBusy: true });

        expect(screen.getByLabelText('Mise à jour en cours')).not.toBeNull();
    });
});
