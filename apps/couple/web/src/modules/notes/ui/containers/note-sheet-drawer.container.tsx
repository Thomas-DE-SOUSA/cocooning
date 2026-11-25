'use client';

import { Drawer, DrawerContent } from '@cocooning/design-system';
import type { NoteSheetTarget } from '../../view-models/note-sheet.view-model';
import { NoteSheetContentContainer } from './note-sheet-content.container';

type Props = {
    readonly target: NoteSheetTarget | null;
    readonly isOpen: boolean;
    readonly opening: number;
    readonly onClose: () => void;
    readonly onOpen: (target: NoteSheetTarget) => void;
};

// One bottom sheet for the notes: it keeps its target while it slides down, and each opening starts afresh.
export function NoteSheetDrawerContainer({
    target,
    isOpen,
    opening,
    onClose,
    onOpen,
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
                    <NoteSheetContentContainer
                        key={opening}
                        target={target}
                        onClose={onClose}
                        onOpen={onOpen}
                    />
                )}
            </DrawerContent>
        </Drawer>
    );
}
