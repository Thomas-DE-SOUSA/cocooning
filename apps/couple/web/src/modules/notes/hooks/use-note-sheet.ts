import { useCallback, useState } from 'react';
import type { NoteSheetTarget } from '../view-models/note-sheet.view-model';

// The target stays while the sheet slides down; each opening starts afresh (the drawer keys its content by `opening`).
export function useNoteSheet() {
    const [target, setTarget] = useState<NoteSheetTarget | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [opening, setOpening] = useState(0);
    const open = useCallback((next: NoteSheetTarget) => {
        setTarget(next);
        setIsOpen(true);
        setOpening((count) => count + 1);
    }, []);
    const close = useCallback(() => setIsOpen(false), []);
    return { target, isOpen, opening, open, close };
}
