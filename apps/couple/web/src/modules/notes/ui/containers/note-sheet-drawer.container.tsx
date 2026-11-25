'use client';

import { Drawer, DrawerContent } from '@cocooning/design-system';
import {
    NoteSheetKindEnum,
    type NoteSheetTarget,
} from '../../view-models/note-sheet.view-model';
import { NewFolderSheetContainer } from './new-folder-sheet.container';
import { NewNoteSheetContainer } from './new-note-sheet.container';

type Props = {
    readonly target: NoteSheetTarget | null;
    readonly isOpen: boolean;
    readonly opening: number;
    readonly onClose: () => void;
};

function NoteSheetContent({
    target,
    onClose,
}: {
    readonly target: NoteSheetTarget;
    readonly onClose: () => void;
}) {
    if (target.kind === NoteSheetKindEnum.NEW_NOTE) {
        return (
            <NewNoteSheetContainer
                place={target.place}
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

// One bottom sheet for the notes: it keeps its target while it slides down, and each opening starts afresh.
export function NoteSheetDrawerContainer({
    target,
    isOpen,
    opening,
    onClose,
}: Props) {
    return (
        <Drawer
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DrawerContent>
                {target === null ? null : (
                    <NoteSheetContent
                        key={opening}
                        target={target}
                        onClose={onClose}
                    />
                )}
            </DrawerContent>
        </Drawer>
    );
}
