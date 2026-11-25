import { Drawer, DrawerContent } from '@cocooning/design-system';
import { fireEvent, render, screen } from '@testing-library/react';
import { WithI18n } from '@/testing/with-i18n';
import type { FolderListItem } from '../../view-models/note-space-screen.view-model';
import { FolderActionsSheetView } from './folder-actions-sheet.view';

const MAISON: FolderListItem = {
    folderId: 'f1',
    name: 'Maison',
    href: '/spaces/SHARED?folderId=f1',
    folderCount: 1,
    noteCount: 4,
    isSmart: false,
    template: null,
};

describe('Feature: the actions on a folder (R14)', () => {
    it('is named after the folder and offers to rename, move or delete it', () => {
        const events: string[] = [];
        render(
            <WithI18n>
                <Drawer open>
                    <DrawerContent>
                        <FolderActionsSheetView
                            folder={MAISON}
                            onRename={() => events.push('rename')}
                            onEditTemplate={null}
                            onMove={() => events.push('move')}
                            onAskDeletion={() => events.push('delete')}
                        />
                    </DrawerContent>
                </Drawer>
            </WithI18n>,
        );

        expect(screen.getByRole('dialog', { name: 'Maison' })).not.toBeNull();
        expect(screen.getByText('1 dossier · 4 notes')).not.toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Renommer' }));
        fireEvent.click(screen.getByRole('button', { name: 'Déplacer' }));
        fireEvent.click(
            screen.getByRole('button', { name: 'Supprimer le dossier' }),
        );
        expect(events).toEqual(['rename', 'move', 'delete']);
    });

    it('R17, offers « Modifier la fiche » on a smart folder', () => {
        const events: string[] = [];
        render(
            <WithI18n>
                <Drawer open>
                    <DrawerContent>
                        <FolderActionsSheetView
                            folder={{ ...MAISON, isSmart: true }}
                            onRename={() => events.push('rename')}
                            onEditTemplate={() => events.push('template')}
                            onMove={() => events.push('move')}
                            onAskDeletion={() => events.push('delete')}
                        />
                    </DrawerContent>
                </Drawer>
            </WithI18n>,
        );

        fireEvent.click(
            screen.getByRole('button', { name: 'Modifier la fiche' }),
        );
        expect(events).toEqual(['template']);
    });
});
