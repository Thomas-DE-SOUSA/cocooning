import type { ChecklistLine } from '@cocooning/couple-client-business-logic/notes';
import { type Doc, XmlElement, XmlText } from 'yjs';
import {
    EDITOR_FRAGMENT,
    PARAGRAPH,
    TASK_ITEM,
    TaskItemAttributeEnum as Attribute,
} from '../../data/checklist-document-schema';

export type TaskItemElement = XmlElement;

// The marks of a text (bold typed in the note editor) are dropped: a line is plain text.
type TextDelta = { readonly insert: unknown };

const isTaskItem = (node: unknown): node is TaskItemElement =>
    node instanceof XmlElement && node.nodeName === TASK_ITEM;

// A line typed before it had an id (in the note editor) is known by its place, like the API counts it (R28).
const lineIdOf = (item: TaskItemElement, position: number): string => {
    const lineId: unknown = item.getAttribute(Attribute.LINE_ID);
    return typeof lineId === 'string' ? lineId : `position-${position}`;
};

const textOf = (item: TaskItemElement): string => {
    const paragraph = item
        .toArray()
        .find(
            (node) => node instanceof XmlElement && node.nodeName === PARAGRAPH,
        );
    if (!(paragraph instanceof XmlElement)) return '';
    return paragraph
        .toArray()
        .filter((node) => node instanceof XmlText)
        .flatMap((text) => text.toDelta() as readonly TextDelta[])
        .map(({ insert }) => (typeof insert === 'string' ? insert : ''))
        .join('');
};

const toLine = (item: TaskItemElement, position: number): ChecklistLine => {
    const checkedBy: unknown = item.getAttribute(Attribute.CHECKED_BY);
    const checked: unknown = item.getAttribute(Attribute.CHECKED);
    return {
        id: lineIdOf(item, position),
        text: textOf(item),
        checked: checked === true,
        checkedBy: typeof checkedBy === 'string' ? checkedBy : null,
    };
};

// Every task item of the document, at any depth and in its order: the same lines the API counts.
export function taskItemsOf(document: Doc): readonly TaskItemElement[] {
    const walker = document
        .getXmlFragment(EDITOR_FRAGMENT)
        .createTreeWalker(isTaskItem);
    return Array.from(walker).filter(isTaskItem);
}

export function readChecklist(document: Doc): readonly ChecklistLine[] {
    return taskItemsOf(document).map(toLine);
}

export function findTaskItem(
    document: Doc,
    lineId: string,
): TaskItemElement | null {
    const items = taskItemsOf(document);
    return (
        items.find((item, position) => lineIdOf(item, position) === lineId) ??
        null
    );
}
