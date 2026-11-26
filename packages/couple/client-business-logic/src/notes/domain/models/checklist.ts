import {
    type ViewerChecker,
    ViewerCheckerEnum,
} from '../enums/viewer-checker.enum';
import type { ChecklistLine } from './checklist-line';

// A checked line from before R29 has no checker: it shows no colour.
export type DoneChecklistLine = ChecklistLine & {
    readonly checkedByViewer: ViewerChecker | null;
};

export type PresentedChecklist = {
    readonly open: readonly ChecklistLine[];
    readonly done: readonly DoneChecklistLine[];
};

const toViewerChecker = (
    checkedBy: string | null,
    viewerId: string,
): ViewerChecker | null => {
    if (checkedBy === null) return null;
    return checkedBy === viewerId
        ? ViewerCheckerEnum.ME
        : ViewerCheckerEnum.YOU;
};

// R29, R30: the lines left to check, then « Fait », each part in the order of the document.
export const presentChecklist = (
    lines: readonly ChecklistLine[],
    viewerId: string,
): PresentedChecklist => ({
    open: lines.filter((line) => !line.checked),
    done: lines
        .filter((line) => line.checked)
        .map((line) => ({
            ...line,
            checkedByViewer: toViewerChecker(line.checkedBy, viewerId),
        })),
});

// R31: « Vider les faits » removes every checked line, for both partners.
export const linesToClear = (
    lines: readonly ChecklistLine[],
): readonly ChecklistLine[] => lines.filter((line) => line.checked);
