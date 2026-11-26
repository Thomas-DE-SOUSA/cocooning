import type {
    ChecklistLine,
    DoneChecklistLine,
    ViewerChecker,
} from '@cocooning/couple-client-business-logic/notes';

// A line and who checked it, seen by the reader (null while open).
export type ChecklistRow = {
    readonly line: ChecklistLine;
    readonly checker: ViewerChecker | null;
};

// What the page of a list hands to its checklist: the lines, the field to add one, the line edited in place.
export type ChecklistScreen = {
    readonly isSynced: boolean;
    readonly open: readonly ChecklistLine[];
    readonly done: readonly DoneChecklistLine[];
    readonly draft: string;
    readonly editingLineId: string | null;
};

export type ChecklistActions = {
    readonly onDraftChange: (draft: string) => void;
    readonly onAdd: () => void;
    readonly onToggle: (line: ChecklistLine) => void;
    readonly onStartEdit: (lineId: string) => void;
    readonly onRename: (lineId: string, text: string) => void;
    readonly onStopEdit: () => void;
    readonly onRemove: (lineId: string) => void;
    readonly onAskClear: () => void;
};
