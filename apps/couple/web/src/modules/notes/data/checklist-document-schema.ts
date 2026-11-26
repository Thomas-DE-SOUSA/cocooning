// The shape of a checklist in the Yjs document, as Tiptap writes it (`use-note-editor.ts`) and as the API counts it
// (R28, `YjsNoteChecklistReader`): taskList > taskItem[checked, checkedBy, lineId] > paragraph > text.
export const EDITOR_FRAGMENT = 'default';
export const TASK_LIST = 'taskList';
export const TASK_ITEM = 'taskItem';
export const PARAGRAPH = 'paragraph';

export const TaskItemAttributeEnum = {
    CHECKED: 'checked',
    CHECKED_BY: 'checkedBy',
    LINE_ID: 'lineId',
} as const;

// y-prosemirror stores a boolean attribute as a boolean: the API counts a line open while `checked` is not true.
export type TaskItemAttributes = {
    checked: boolean;
    checkedBy: string;
    lineId: string;
};
