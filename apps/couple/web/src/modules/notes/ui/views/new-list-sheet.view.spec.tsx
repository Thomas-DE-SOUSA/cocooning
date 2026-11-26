import type { NoteListForm } from '@cocooning/couple-client-business-logic/notes';
import { Drawer, DrawerContent } from '@cocooning/design-system';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WithI18n } from '@/testing/with-i18n';
import { useNewListForm } from '../../hooks/use-new-list-form';
import { NewListSheetView } from './new-list-sheet.view';

function SheetHarness({ created }: { readonly created: NoteListForm[] }) {
    const form = useNewListForm('TASKS');
    return (
        <Drawer open>
            <DrawerContent>
                <NewListSheetView
                    form={form}
                    isPending={false}
                    isBusy={false}
                    onCreate={(values) => created.push(values)}
                />
            </DrawerContent>
        </Drawer>
    );
}

function renderSheet() {
    const created: NoteListForm[] = [];
    render(
        <WithI18n>
            <SheetHarness created={created} />
        </WithI18n>,
    );
    return { created, user: userEvent.setup() };
}

describe('Feature: a new list in the section shown (R26)', () => {
    it('names the section of the new list', () => {
        renderSheet();

        expect(screen.getByText('Dans « Tâches »')).toBeTruthy();
    });

    it('creates a list rien que pour moi with its emoji', async () => {
        const { created, user } = renderSheet();

        await user.type(screen.getByLabelText('Titre'), 'Noël');
        await user.type(screen.getByLabelText('Emoji (facultatif)'), '🎄');
        await user.click(
            screen.getByRole('button', { name: 'Rien que pour moi' }),
        );
        await user.click(
            screen.getByRole('button', { name: 'Créer la liste' }),
        );

        await waitFor(() =>
            expect(created).toEqual([
                { kind: 'TASKS', space: 'PRIVATE', title: 'Noël', emoji: '🎄' },
            ]),
        );
        expect(
            screen
                .getByRole('button', { name: 'Rien que pour moi' })
                .getAttribute('aria-pressed'),
        ).toBe('true');
    });

    it('asks for a title, a common list by default', async () => {
        const { created, user } = renderSheet();

        expect(
            screen
                .getByRole('button', { name: 'Commune' })
                .getAttribute('aria-pressed'),
        ).toBe('true');
        await user.click(
            screen.getByRole('button', { name: 'Créer la liste' }),
        );

        expect(
            await screen.findByText('Donne un titre à la liste.'),
        ).toBeTruthy();
        expect(created).toEqual([]);
    });
});
