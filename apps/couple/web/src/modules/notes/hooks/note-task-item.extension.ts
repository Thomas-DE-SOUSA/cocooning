import { TaskItem } from '@tiptap/extension-list';
import { TaskItemAttributeEnum } from '../data/checklist-document-schema';

const KEPT_IN_DOCUMENT = {
    default: null,
    keepOnSplit: false,
    rendered: false,
} as const;

// R29: who checked a line and its stable id belong to the node, or y-prosemirror would drop them when a note is edited.
export const NoteTaskItem = TaskItem.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            [TaskItemAttributeEnum.CHECKED_BY]: KEPT_IN_DOCUMENT,
            [TaskItemAttributeEnum.LINE_ID]: KEPT_IN_DOCUMENT,
        };
    },
});
