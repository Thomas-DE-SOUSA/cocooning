import type { NoteCardQueryForm } from '@cocooning/couple-client-business-logic/notes';
import { A_CHOOSING_NOTE_CARD } from '@cocooning/couple-client-business-logic/testing';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { WithI18n } from '@/testing/with-i18n';
import { useNoteCardQueryForm } from '../../hooks/use-note-card-query-form';
import type { NoteCardChoice } from '../../view-models/note-card-choice.view-model';
import { NoteCardChoiceView } from './note-card-choice.view';

const CHOICE: NoteCardChoice = {
    noteId: A_CHOOSING_NOTE_CARD.noteId,
    title: 'Café des Arts',
    candidates: A_CHOOSING_NOTE_CARD.candidates,
};

type Journal = {
    readonly events: string[];
    readonly refined: NoteCardQueryForm[];
};

function ChoiceHarness({
    journal,
    isBusy,
}: {
    readonly journal: Journal;
    readonly isBusy: boolean;
}) {
    const form = useNoteCardQueryForm();
    const [isRefining, setIsRefining] = useState(false);
    return (
        <NoteCardChoiceView
            choice={CHOICE}
            form={form}
            isRefining={isRefining}
            isChoosing={isBusy}
            isSearching={false}
            isBusy={isBusy}
            onChoose={(index) => journal.events.push(`choose:${index}`)}
            onShowRefine={() => setIsRefining(true)}
            onRefine={(values) => journal.refined.push(values)}
        />
    );
}

function renderChoice({ isBusy = false } = {}) {
    const journal: Journal = { events: [], refined: [] };
    render(
        <WithI18n>
            <ChoiceHarness
                journal={journal}
                isBusy={isBusy}
            />
        </WithI18n>,
    );
    return { journal, user: userEvent.setup() };
}

describe('Feature: R19, « Lequel ? », the couple chooses among the candidates', () => {
    it('shows each candidate with what tells it apart, and chooses one by a tap', async () => {
        const { journal, user } = renderChoice();

        expect(
            screen.getByRole('heading', {
                name: 'Lequel, pour « Café des Arts » ?',
            }),
        ).not.toBeNull();
        await user.click(
            screen.getByRole('button', { name: /Paris 11e, bar à vin/ }),
        );

        expect(journal.events).toEqual(['choose:1']);
    });

    it('asks for a precision after « Aucun de ceux-là », then searches again', async () => {
        const { journal, user } = renderChoice();

        await user.click(
            screen.getByRole('button', { name: 'Aucun de ceux-là' }),
        );
        await user.type(
            screen.getByLabelText('Précise (ville, quartier…)'),
            ' Lyon 1er ',
        );
        await user.click(screen.getByRole('button', { name: 'Chercher' }));

        await waitFor(() =>
            expect(journal.refined).toEqual([{ query: 'Lyon 1er' }]),
        );
    });

    it('refuses an empty precision under the field', async () => {
        const { journal, user } = renderChoice();

        await user.click(
            screen.getByRole('button', { name: 'Aucun de ceux-là' }),
        );
        await user.click(screen.getByRole('button', { name: 'Chercher' }));

        expect(
            await screen.findByText('Précise ce que tu cherches.'),
        ).not.toBeNull();
        expect(journal.refined).toEqual([]);
    });

    it('waits while a choice is sent', () => {
        renderChoice({ isBusy: true });

        expect(screen.getByLabelText('Choix en cours')).not.toBeNull();
        expect(
            screen
                .getByRole('button', { name: /Lyon 1er, brasserie/ })
                .hasAttribute('disabled'),
        ).toBe(true);
    });
});
