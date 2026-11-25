'use client';

import { useNewItemMenu } from '../../hooks/use-new-item-menu';
import { useNoteSheet } from '../../hooks/use-note-sheet';
import type { NoteSpaceContentsScreen } from '../../view-models/note-space-screen.view-model';
import { NoteSheetKindEnum } from '../../view-models/note-sheet.view-model';
import { NewItemMenuView } from '../views/new-item-menu.view';
import { NoteSpaceContentsView } from '../views/note-space-contents.view';
import { NoteSheetDrawerContainer } from './note-sheet-drawer.container';

type Props = { readonly screen: NoteSpaceContentsScreen };

// What a place holds, the « + » that creates in it, and the sheet of every command (decision 0053).
export function NoteSpaceContentsContainer({ screen }: Props) {
    const { menuRef, ...menu } = useNewItemMenu();
    const sheet = useNoteSheet();
    const create = (
        kind:
            | typeof NoteSheetKindEnum.NEW_NOTE
            | typeof NoteSheetKindEnum.NEW_FOLDER,
    ) => {
        menu.close();
        sheet.open({ kind, place: screen.place });
    };
    return (
        <>
            <NoteSpaceContentsView
                folders={screen.folders}
                notes={screen.notes}
                onFolderActions={(folder) =>
                    sheet.open({
                        kind: NoteSheetKindEnum.FOLDER,
                        folder,
                        place: screen.place,
                    })
                }
            />
            <NewItemMenuView
                menuRef={menuRef}
                isOpen={menu.isOpen}
                onToggle={menu.toggle}
                onClose={menu.close}
                onNewNote={() => create(NoteSheetKindEnum.NEW_NOTE)}
                onNewFolder={() => create(NoteSheetKindEnum.NEW_FOLDER)}
            />
            <NoteSheetDrawerContainer
                target={sheet.target}
                isOpen={sheet.isOpen}
                opening={sheet.opening}
                onClose={sheet.close}
            />
        </>
    );
}
