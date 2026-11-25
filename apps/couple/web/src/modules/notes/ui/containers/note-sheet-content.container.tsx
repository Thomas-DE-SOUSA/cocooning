'use client';

import {
    NoteSheetKindEnum,
    type NoteSheetTarget,
} from '../../view-models/note-sheet.view-model';
import { FolderSheetContainer } from './folder-sheet.container';
import { MovePickerContainer } from './move-picker.container';
import { NewFolderSheetContainer } from './new-folder-sheet.container';
import { NewNoteSheetContainer } from './new-note-sheet.container';
import { NoteSheetContainer } from './note-sheet.container';
import { SmartSubFolderSheetContainer } from './smart-sub-folder-sheet.container';

type Props = {
    readonly target: NoteSheetTarget;
    readonly onClose: () => void;
    readonly onOpen: (target: NoteSheetTarget) => void;
};

// What the sheet shows for its target: a creation, the actions on a folder or a note, or the move picker.
export function NoteSheetContentContainer({ target, onClose, onOpen }: Props) {
    if (target.kind === NoteSheetKindEnum.MOVE) {
        return (
            <MovePickerContainer
                item={target.item}
                level={target.level}
                onClose={onClose}
            />
        );
    }
    if (target.kind === NoteSheetKindEnum.NOTE) {
        return (
            <NoteSheetContainer
                note={target.note}
                level={target.level}
                exitHref={target.exitHref}
                onClose={onClose}
                onOpen={onOpen}
            />
        );
    }
    if (target.kind === NoteSheetKindEnum.FOLDER) {
        return (
            <FolderSheetContainer
                folder={target.folder}
                level={target.level}
                onClose={onClose}
                onOpen={onOpen}
            />
        );
    }
    if (target.kind === NoteSheetKindEnum.NEW_NOTE) {
        return (
            <NewNoteSheetContainer
                place={target.place}
                onClose={onClose}
            />
        );
    }
    if (target.inheritedFrom !== null) {
        return (
            <SmartSubFolderSheetContainer
                place={target.place}
                holderName={target.inheritedFrom}
                onClose={onClose}
            />
        );
    }
    return (
        <NewFolderSheetContainer
            place={target.place}
            onClose={onClose}
        />
    );
}
