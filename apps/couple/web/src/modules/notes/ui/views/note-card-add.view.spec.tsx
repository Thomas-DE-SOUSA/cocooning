import type { NoteCardNameForm } from '@cocooning/couple-client-business-logic/notes';
import { NOTE_TITLE_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WithI18n } from '@/testing/with-i18n';
import { useNoteCardNameForm } from '../../hooks/use-note-card-name-form';
import { NoteCardAddView } from './note-card-add.view';

function AddHarness({
    isPending,
    submitted,
}: {
    readonly isPending: boolean;
    readonly submitted: NoteCardNameForm[];
}) {
    const form = useNoteCardNameForm();
    return (
        <NoteCardAddView
            form={form}
            isPending={isPending}
            onSubmit={(values) => submitted.push(values)}
        />
    );
}

function renderAdd({ isPending = false } = {}) {
    const submitted: NoteCardNameForm[] = [];
    render(
        <WithI18n>
            <AddHarness
                isPending={isPending}
                submitted={submitted}
            />
        </WithI18n>,
    );
    return { submitted, user: userEvent.setup() };
}

describe('Feature: R19, the couple adds an item to a smart folder by its name', () => {
    it('sends the trimmed name', async () => {
        const { submitted, user } = renderAdd();

        await user.type(
            screen.getByLabelText('Ajouter un élément'),
            ' Chez Paul {Enter}',
        );

        await waitFor(() => expect(submitted).toEqual([{ name: 'Chez Paul' }]));
    });

    it.each([
        ['an empty name', '', 'Tape un nom.'],
        [
            'a name above the maximum',
            'a'.repeat(NOTE_TITLE_MAX_LENGTH + 1),
            'Ce nom est trop long : 120 signes au plus.',
        ],
    ])('refuses %s under the field', async (_label, name, message) => {
        const { submitted, user } = renderAdd();

        await user.click(screen.getByLabelText('Ajouter un élément'));
        await user.paste(name);
        await user.click(
            screen.getByRole('button', { name: 'Ajouter au dossier' }),
        );

        expect(await screen.findByText(message)).not.toBeNull();
        expect(submitted).toEqual([]);
    });

    it('says that the field adds one item, completed by the AI', () => {
        renderAdd();

        const field = screen.getByLabelText('Ajouter un élément');
        const hint = document.getElementById(
            field.getAttribute('aria-describedby')?.split(' ')[0] ?? '',
        );
        expect(hint?.textContent).toBe(
            "Un seul nom à la fois : l'IA cherche ses informations et remplit la fiche.",
        );
    });

    it('spins while the item is added', () => {
        renderAdd({ isPending: true });

        const spinner = screen.getByLabelText('Ajout en cours');
        expect(spinner.closest('button')?.hasAttribute('disabled')).toBe(true);
    });
});
