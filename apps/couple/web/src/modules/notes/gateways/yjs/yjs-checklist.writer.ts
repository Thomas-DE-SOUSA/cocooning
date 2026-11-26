import type { ChecklistLine } from '@cocooning/couple-client-business-logic/notes';
import { type Doc, XmlElement, XmlText } from 'yjs';
import {
    EDITOR_FRAGMENT,
    PARAGRAPH,
    TASK_ITEM,
    TASK_LIST,
    type TaskItemAttributes,
    TaskItemAttributeEnum as Attribute,
} from '../../data/checklist-document-schema';
import { findTaskItem, type TaskItemElement } from './yjs-checklist.reader';

export const paragraphOf = (text: string): XmlElement => {
    const paragraph = new XmlElement(PARAGRAPH);
    paragraph.insert(0, [new XmlText(text)]);
    return paragraph;
};

// Yjs types the attributes as strings unless told otherwise; y-prosemirror keeps `checked` a boolean.
const attributesOf = (item: TaskItemElement): XmlElement<TaskItemAttributes> =>
    item as unknown as XmlElement<TaskItemAttributes>;

// y-prosemirror leaves out a null attribute: an open line has no checkedBy.
const writeCheck = (item: TaskItemElement, line: ChecklistLine): void => {
    attributesOf(item).setAttribute(Attribute.CHECKED, line.checked);
    if (line.checkedBy === null) item.removeAttribute(Attribute.CHECKED_BY);
    else item.setAttribute(Attribute.CHECKED_BY, line.checkedBy);
};

const firstTaskListOf = (document: Doc): XmlElement => {
    const fragment = document.getXmlFragment(EDITOR_FRAGMENT);
    const existing = fragment
        .toArray()
        .find(
            (node) => node instanceof XmlElement && node.nodeName === TASK_LIST,
        );
    if (existing instanceof XmlElement) return existing;
    const taskList = new XmlElement(TASK_LIST);
    fragment.push([taskList]);
    return taskList;
};

// A new line goes at the end of the first checklist of the document, unchecked (R30: the order never changes on check).
export function addChecklistLine(document: Doc, line: ChecklistLine): void {
    document.transact(() => {
        const item = new XmlElement(TASK_ITEM);
        item.setAttribute(Attribute.LINE_ID, line.id);
        writeCheck(item, line);
        item.insert(0, [paragraphOf(line.text)]);
        firstTaskListOf(document).push([item]);
    });
}

// R29, R30: a check or an uncheck changes the attributes of the line, never its place.
export function writeChecklistLine(document: Doc, line: ChecklistLine): void {
    const item = findTaskItem(document, line.id);
    if (item === null) return;
    document.transact(() => writeCheck(item, line));
}
