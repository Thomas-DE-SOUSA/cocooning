// A line of a list as the web reads it from the document; checkedBy is the partner who checked it, null while open.
export type ChecklistLine = {
    readonly id: string;
    readonly text: string;
    readonly checked: boolean;
    readonly checkedBy: string | null;
};

// R29: a check keeps who made it; checking a line already checked keeps its first checker.
export const checkLine = (
    line: ChecklistLine,
    viewerId: string,
): ChecklistLine =>
    line.checked ? line : { ...line, checked: true, checkedBy: viewerId };

// R30: an unchecked line goes back up and forgets who checked it.
export const uncheckLine = (line: ChecklistLine): ChecklistLine => ({
    ...line,
    checked: false,
    checkedBy: null,
});
