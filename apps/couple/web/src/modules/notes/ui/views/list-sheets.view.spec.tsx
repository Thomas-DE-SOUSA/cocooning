import type { NoteListDetailsForm } from '@cocooning/couple-client-business-logic/notes';
import { Drawer, DrawerContent } from '@cocooning/design-system';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { WithI18n } from '@/testing/with-i18n';
import { useListDetailsForm } from '../../hooks/use-list-details-form';
import { ListActionsSheetView } from './list-actions-sheet.view';
import { ListDeletionSheetView } from './list-deletion-sheet.view';
import { ListDetailsSheetView } from './list-details-sheet.view';

const CARREFOUR = {
    noteId: '01936b2e-7c4a-7000-8000-0000000000e1',
    title: 'Carrefour',
    emoji: '🛒',
    kind: 'GROCERIES' as const,
    isShared: true,
    isOwner: true,
    backHref: '/lists?section=GROCERIES',
    viewerId: 'me',
};

const inSheet = (children: ReactNode) =>
    render(
        <WithI18n>
            <Drawer open>
                <DrawerContent>{children}</DrawerContent>
            </Drawer>
        </WithI18n>,
    );

function DetailsHarness({ saved }: { readonly saved: NoteListDetailsForm[] }) {
    const form = useListDetailsForm(CARREFOUR.title, CARREFOUR.emoji);
    return (
        <ListDetailsSheetView
            form={form}
            isPending={false}
            isBusy={false}
            onSave={(values) => saved.push(values)}
        />
    );
}

describe('Feature: the « ⋯ » of a list (R6, R7, R26, decision 0053)', () => {
    it('offers its owner to change the title and emoji, or to delete it', async () => {
        const journal: string[] = [];
        inSheet(
            <ListActionsSheetView
                list={CARREFOUR}
                onEditDetails={() => journal.push('details')}
                onAskDeletion={() => journal.push('deletion')}
            />,
        );
        const user = userEvent.setup();

        await user.click(
            screen.getByRole('button', {
                name: "Modifier le titre et l'emoji",
            }),
        );
        await user.click(
            screen.getByRole('button', { name: 'Supprimer la liste' }),
        );

        expect(journal).toEqual(['details', 'deletion']);
    });

    it('tells the other partner why they cannot delete it', () => {
        inSheet(
            <ListActionsSheetView
                list={{ ...CARREFOUR, isOwner: false }}
                onEditDetails={() => {}}
                onAskDeletion={() => {}}
            />,
        );

        expect(
            screen.queryByRole('button', { name: 'Supprimer la liste' }),
        ).toBeNull();
        expect(
            screen.getByText(
                'Seule sa propriétaire peut supprimer cette liste.',
            ),
        ).toBeTruthy();
    });

    it('starts from the title and the emoji of the list, and removes an emptied emoji', async () => {
        const saved: NoteListDetailsForm[] = [];
        inSheet(<DetailsHarness saved={saved} />);
        const user = userEvent.setup();

        expect(screen.getByLabelText('Titre')).toHaveProperty(
            'value',
            'Carrefour',
        );
        await user.clear(screen.getByLabelText('Titre'));
        await user.type(screen.getByLabelText('Titre'), 'Lidl');
        await user.clear(screen.getByLabelText('Emoji (facultatif)'));
        await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

        await waitFor(() =>
            expect(saved).toEqual([{ title: 'Lidl', emoji: null }]),
        );
    });

    it('asks once more before deleting the list', async () => {
        const journal: string[] = [];
        inSheet(
            <ListDeletionSheetView
                title="Carrefour"
                isPending={false}
                isBusy={false}
                onConfirm={() => journal.push('delete')}
                onKeep={() => journal.push('keep')}
            />,
        );
        const user = userEvent.setup();

        expect(screen.getByText('Supprimer « Carrefour » ?')).toBeTruthy();
        await user.click(
            screen.getByRole('button', { name: 'Supprimer la liste' }),
        );
        await user.click(screen.getByRole('button', { name: 'Garder' }));

        expect(journal).toEqual(['delete', 'keep']);
    });
});
