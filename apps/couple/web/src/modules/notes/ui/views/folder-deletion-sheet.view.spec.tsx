import { Drawer, DrawerContent } from '@cocooning/design-system';
import { fireEvent, render, screen } from '@testing-library/react';
import { WithI18n } from '@/testing/with-i18n';
import type { FolderListItem } from '../../view-models/note-space-screen.view-model';
import { FolderDeletionSheetView } from './folder-deletion-sheet.view';

const MAISON: FolderListItem = {
    folderId: 'f1',
    name: 'Maison',
    href: '/spaces/SHARED?folderId=f1',
    folderCount: 1,
    noteCount: 4,
    isSmart: false,
    template: null,
};

function renderSheet(isPending: boolean) {
    const events: string[] = [];
    render(
        <WithI18n>
            <Drawer open>
                <DrawerContent>
                    <FolderDeletionSheetView
                        folder={MAISON}
                        placeName="Partagé"
                        isPending={isPending}
                        isBusy={isPending}
                        onConfirm={() => events.push('confirm')}
                        onKeep={() => events.push('keep')}
                    />
                </DrawerContent>
            </Drawer>
        </WithI18n>,
    );
    return { events };
}

describe('Feature: deleting a folder (R16)', () => {
    it('says where its content goes, then deletes it or keeps it', () => {
        const { events } = renderSheet(false);

        expect(
            screen.getByRole('dialog', { name: 'Supprimer « Maison » ?' }),
        ).not.toBeNull();
        expect(
            screen.getByText(
                "Ses 4 notes et son dossier remontent dans « Partagé ». Aucune note n'est supprimée.",
            ),
        ).not.toBeNull();
        fireEvent.click(
            screen.getByRole('button', { name: 'Supprimer le dossier' }),
        );
        fireEvent.click(screen.getByRole('button', { name: 'Garder' }));
        expect(events).toEqual(['confirm', 'keep']);
    });

    it('spins on the confirmation while the folder is deleted, every button waiting', () => {
        renderSheet(true);

        expect(screen.getByLabelText('Suppression en cours')).not.toBeNull();
        expect(
            screen
                .getAllByRole('button')
                .every((button) => button.hasAttribute('disabled')),
        ).toBe(true);
    });
});
