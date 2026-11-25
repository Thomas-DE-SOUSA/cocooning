import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { Drawer, DrawerContent } from '@cocooning/design-system';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { WithI18n } from '@/testing/with-i18n';
import {
    type MovedItem,
    MovedItemKindEnum,
} from '../../view-models/moved-item.view-model';
import type {
    NoteLocation,
    NotePlace,
} from '../../view-models/note-place.view-model';
import type {
    FolderListItem,
    NotePlaceLevel,
} from '../../view-models/note-space-screen.view-model';
import { MovePickerView } from './move-picker.view';

const SHARED_ROOT: NotePlace = {
    space: NoteSpaceEnum.SHARED,
    folder: null,
    href: '/spaces/SHARED',
};
const MAISON: FolderListItem = {
    folderId: 'f1',
    name: 'Maison',
    href: '/spaces/SHARED?folderId=f1',
    folderCount: 1,
    noteCount: 4,
    isSmart: false,
};
const ROOT_LEVEL: NotePlaceLevel = {
    place: SHARED_ROOT,
    back: null,
    folders: [MAISON],
};
const IN_MAISON: NotePlaceLevel = {
    place: { ...SHARED_ROOT, folder: { folderId: 'f1', name: 'Maison' } },
    back: SHARED_ROOT,
    folders: [],
};
const A_NOTE: MovedItem = {
    kind: MovedItemKindEnum.NOTE,
    id: 'n1',
    name: 'Chez Paul',
    from: { space: NoteSpaceEnum.SHARED, folderId: null },
    spaces: [NoteSpaceEnum.SHARED, NoteSpaceEnum.PRIVATE],
};

function renderPicker(props: Partial<ComponentProps<typeof MovePickerView>>) {
    const shown: NoteLocation[] = [];
    const moves: string[] = [];
    render(
        <WithI18n>
            <Drawer open>
                <DrawerContent>
                    <MovePickerView
                        item={A_NOTE}
                        level={ROOT_LEVEL}
                        folders={ROOT_LEVEL.folders}
                        isWhereItIs={false}
                        isLoading={false}
                        isMoving={false}
                        isBusy={false}
                        onShow={(location) => shown.push(location)}
                        onMoveHere={() => moves.push('here')}
                        {...props}
                    />
                </DrawerContent>
            </Drawer>
        </WithI18n>,
    );
    return { shown, moves };
}

describe('Feature: the move picker (R11, R15)', () => {
    it('R11, lets the owner of a note choose the space, then a folder', () => {
        const { shown } = renderPicker({});

        expect(
            screen.getByRole('dialog', { name: 'Déplacer « Chez Paul »' }),
        ).not.toBeNull();
        expect(
            screen
                .getByRole('button', { name: 'Partagé' })
                .getAttribute('aria-pressed'),
        ).toBe('true');
        fireEvent.click(screen.getByRole('button', { name: 'Privé' }));
        fireEvent.click(screen.getByRole('button', { name: /Maison/ }));
        expect(shown).toEqual([
            { space: NoteSpaceEnum.PRIVATE, folderId: null },
            { space: NoteSpaceEnum.SHARED, folderId: 'f1' },
        ]);
    });

    it('R15, offers no space to a folder or to the note of the other', () => {
        renderPicker({ item: { ...A_NOTE, spaces: [NoteSpaceEnum.SHARED] } });

        expect(screen.queryByRole('group', { name: 'Espace' })).toBeNull();
    });

    it('goes back up from a folder and moves the item there', () => {
        const { shown, moves } = renderPicker({
            item: { ...A_NOTE, spaces: [NoteSpaceEnum.SHARED] },
            level: IN_MAISON,
            folders: [],
        });

        expect(screen.getByText('Aucun dossier ici.')).not.toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Partagé' }));
        fireEvent.click(
            screen.getByRole('button', {
                name: 'Déplacer ici, dans « Maison »',
            }),
        );
        expect(shown).toEqual([
            { space: NoteSpaceEnum.SHARED, folderId: null },
        ]);
        expect(moves).toEqual(['here']);
    });

    it('waits where the item already is', () => {
        renderPicker({ isWhereItIs: true });

        expect(
            screen
                .getByRole('button', { name: 'Déplacer ici, dans « Partagé »' })
                .hasAttribute('disabled'),
        ).toBe(true);
    });

    it('shows skeletons while a place is read, and spins while the item moves', () => {
        renderPicker({ isLoading: true, isMoving: true, isBusy: true });

        expect(screen.queryByRole('button', { name: /Maison/ })).toBeNull();
        expect(screen.getByLabelText('Déplacement en cours')).not.toBeNull();
    });
});
