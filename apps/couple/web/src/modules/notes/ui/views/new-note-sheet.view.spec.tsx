import type { NoteTitleForm } from '@cocooning/couple-client-business-logic/notes';
import { Drawer, DrawerContent } from '@cocooning/design-system';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WithI18n } from '@/testing/with-i18n';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';
import { useNoteTitleForm } from '../../hooks/use-note-title-form';
import { NewNoteSheetView } from './new-note-sheet.view';

function SheetHarness({
    isPending,
    created,
}: {
    readonly isPending: boolean;
    readonly created: NoteTitleForm[];
}) {
    const form = useNoteTitleForm(NOTE_SPACE_NAMESPACE, '');
    return (
        <Drawer open>
            <DrawerContent>
                <NewNoteSheetView
                    form={form}
                    placeName="Maison"
                    isPending={isPending}
                    isBusy={isPending}
                    onCreate={(values) => created.push(values)}
                />
            </DrawerContent>
        </Drawer>
    );
}

function renderSheet(isPending = false) {
    const created: NoteTitleForm[] = [];
    render(
        <WithI18n>
            <SheetHarness
                isPending={isPending}
                created={created}
            />
        </WithI18n>,
    );
    return { created, user: userEvent.setup() };
}

const createButton = () =>
    screen.getByRole('button', { name: 'Créer la note' });

describe('Feature: a new note where the partner is (R8, R13)', () => {
    it('names the place of the new note', () => {
        renderSheet();

        expect(
            screen.getByRole('dialog', { name: 'Nouvelle note' }),
        ).not.toBeNull();
        expect(screen.getByText('Dans « Maison »')).not.toBeNull();
    });

    it('submits the trimmed title', async () => {
        const { created, user } = renderSheet();

        await user.type(screen.getByLabelText('Titre'), '  Courses ');
        await user.click(createButton());

        await waitFor(() => expect(created).toEqual([{ title: 'Courses' }]));
    });

    it('shows the error under the field and submits nothing', async () => {
        const { created, user } = renderSheet();

        await user.click(createButton());

        expect(
            await screen.findByText('Donne un titre à la note.'),
        ).not.toBeNull();
        expect(created).toEqual([]);
    });

    it('spins while the note is created', () => {
        renderSheet(true);

        expect(screen.getByLabelText('Création en cours')).not.toBeNull();
    });
});
