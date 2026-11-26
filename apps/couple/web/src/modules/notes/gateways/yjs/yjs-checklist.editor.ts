import { type Doc, XmlElement, XmlFragment } from 'yjs';
import { PARAGRAPH } from '../../data/checklist-document-schema';
import { findTaskItem, type TaskItemElement } from './yjs-checklist.reader';
import { paragraphOf } from './yjs-checklist.writer';

// A line edited in place keeps its sub-items: only its paragraph is replaced.
export function writeChecklistText(
    document: Doc,
    lineId: string,
    text: string,
): void {
    const item = findTaskItem(document, lineId);
    if (item === null) return;
    const at = item
        .toArray()
        .findIndex(
            (node) => node instanceof XmlElement && node.nodeName === PARAGRAPH,
        );
    document.transact(() => {
        if (at !== -1) item.delete(at, 1);
        item.insert(Math.max(at, 0), [paragraphOf(text)]);
    });
}

const removeFromParent = (item: TaskItemElement): void => {
    const parent = item.parent;
    if (!(parent instanceof XmlElement || parent instanceof XmlFragment))
        return;
    const at = parent.toArray().indexOf(item);
    if (at !== -1) parent.delete(at, 1);
};

// R31: the lines go in one transaction, so the other phone sees them vanish at once.
export function removeChecklistLines(
    document: Doc,
    lineIds: readonly string[],
): void {
    const items = lineIds
        .map((lineId) => findTaskItem(document, lineId))
        .filter((item) => item !== null);
    document.transact(() => items.forEach(removeFromParent));
}
