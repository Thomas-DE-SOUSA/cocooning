'use client';

import { useNewItemMenu } from '../../hooks/use-new-item-menu';
import { useNoteSheet } from '../../hooks/use-note-sheet';
import type { NoteSpaceContentsScreen } from '../../view-models/note-space-screen.view-model';
import {
    NoteSheetKindEnum,
    type NoteSheetTarget,
} from '../../view-models/note-sheet.view-model';
import { NewItemMenuView } from '../views/new-item-menu.view';
import { NoteSpaceContentsView } from '../views/note-space-contents.view';
import { NoteSheetDrawerContainer } from './note-sheet-drawer.container';

type Props = { readonly screen: NoteSpaceContentsScreen };

// What a place holds, the « + » that creates in it, and the sheet of every command (decision 0053).
export function NoteSpaceContentsContainer({ screen }: Props) {
    const { menuRef, ...menu } = useNewItemMenu();
    const sheet = useNoteSheet();
    const level = {
        place: screen.place,
        back: screen.back,
        folders: screen.folders,
    };
    const create = (target: NoteSheetTarget) => {
        menu.close();
        sheet.open(target);
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
                        level,
                    })
                }
                onNoteActions={(note) =>
                    sheet.open({
                        kind: NoteSheetKindEnum.NOTE,
                        note,
                        level,
                        exitHref: null,
                    })
                }
            />
            <NewItemMenuView
                menuRef={menuRef}
                isOpen={menu.isOpen}
                onToggle={menu.toggle}
                onClose={menu.close}
                onNewNote={() =>
                    create({
                        kind: NoteSheetKindEnum.NEW_NOTE,
                        place: screen.place,
                    })
                }
                onNewFolder={() =>
                    create({
                        kind: NoteSheetKindEnum.NEW_FOLDER,
                        place: screen.place,
                        inheritedFrom: screen.cardContext?.holderName ?? null,
                    })
                }
            />
            <NoteSheetDrawerContainer
                target={sheet.target}
                isOpen={sheet.isOpen}
                opening={sheet.opening}
                onClose={sheet.close}
                onOpen={sheet.open}
            />
        </>
    );
}
