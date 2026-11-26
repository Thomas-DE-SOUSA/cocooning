import { useCallback, useState } from 'react';
import {
    type NoteListSheetStep,
    NoteListSheetStepEnum,
} from '../view-models/note-list-sheet.view-model';

// The step stays while the sheet slides down; each opening starts afresh on the actions.
export function useNoteListSheet() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<NoteListSheetStep>(
        NoteListSheetStepEnum.ACTIONS,
    );
    const [opening, setOpening] = useState(0);
    const open = useCallback(() => {
        setStep(NoteListSheetStepEnum.ACTIONS);
        setIsOpen(true);
        setOpening((count) => count + 1);
    }, []);
    const close = useCallback(() => setIsOpen(false), []);
    return { isOpen, step, opening, open, goTo: setStep, close };
}
