import type { NoteTitleForm } from '@cocooning/couple-client-business-logic/notes';
import { NOTE_TITLE_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WithI18n } from '@/testing/with-i18n';
import { useNoteTitleForm } from '../../hooks/use-note-title-form';
import { CreateNoteFormView } from './create-note-form.view';

function CreateNoteFormHarness({
    isPending,
    created,
}: {
    readonly isPending: boolean;
    readonly created: NoteTitleForm[];
}) {
    const form = useNoteTitleForm();
    return (
        <CreateNoteFormView
            form={form}
            isPending={isPending}
            isBusy={isPending}
            onCreate={(values) => created.push(values)}
        />
    );
}

function renderForm(isPending = false) {
    const created: NoteTitleForm[] = [];
    render(
        <WithI18n>
            <CreateNoteFormHarness
                isPending={isPending}
                created={created}
            />
        </WithI18n>,
    );
    return { created, user: userEvent.setup() };
}

const titleField = () => screen.getByLabelText('Titre de la nouvelle note');
const createButton = () => screen.getByRole('button');

describe('Feature: a partner creates a note from the list', () => {
    describe('Scenario: R8, a title with spaces around it', () => {
        it('submits the trimmed title', async () => {
            const { created, user } = renderForm();

            await user.type(titleField(), '  Courses ');
            await user.click(createButton());

            await waitFor(() =>
                expect(created).toEqual([{ title: 'Courses' }]),
            );
        });
    });

    describe('Scenario: R8, an empty or too long title', () => {
        it('shows the error under the field and submits nothing', async () => {
            const { created, user } = renderForm();

            await user.click(createButton());

            expect(
                await screen.findByText('Donnez un titre à la note.'),
            ).toBeTruthy();
            expect(created).toEqual([]);
        });

        it('refuses a title above the maximum', async () => {
            const { created, user } = renderForm();

            await user.click(titleField());
            await user.paste('a'.repeat(NOTE_TITLE_MAX_LENGTH + 1));
            await user.click(createButton());

            expect(
                await screen.findByText('Ce titre est trop long.'),
            ).toBeTruthy();
            expect(created).toEqual([]);
        });
    });

    describe('Scenario: the creation is running', () => {
        it('disables the button and announces it', () => {
            renderForm(true);

            expect(createButton().hasAttribute('disabled')).toBe(true);
            expect(screen.getByLabelText('Création en cours')).toBeTruthy();
        });
    });
});
