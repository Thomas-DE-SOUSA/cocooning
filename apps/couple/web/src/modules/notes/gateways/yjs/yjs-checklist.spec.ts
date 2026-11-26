import { Doc, XmlElement, XmlText } from 'yjs';
import {
    EDITOR_FRAGMENT,
    PARAGRAPH,
    TASK_ITEM,
    TASK_LIST,
} from '../../data/checklist-document-schema';
import { readChecklist } from './yjs-checklist.reader';
import { addChecklistLine, writeChecklistLine } from './yjs-checklist.writer';

const BREAD = { id: 'line-1', text: 'Pain', checked: false, checkedBy: null };

const taskItemsOf = (document: Doc): XmlElement[] => {
    const taskList = document.getXmlFragment(EDITOR_FRAGMENT).get(0);
    if (!(taskList instanceof XmlElement)) throw new Error('No task list');
    return taskList.toArray().filter((node) => node instanceof XmlElement);
};

// What Tiptap writes for a checklist typed in the note editor: no line id, a bold word.
function aDocumentTypedInTheEditor(): Doc {
    const document = new Doc();
    const text = new XmlText();
    text.insert(0, 'Tomates ');
    text.insert(8, 'bio', { bold: true });
    const paragraph = new XmlElement(PARAGRAPH);
    paragraph.insert(0, [text]);
    const item = new XmlElement(TASK_ITEM);
    item.setAttribute('checked', false as unknown as string);
    item.insert(0, [paragraph]);
    const taskList = new XmlElement(TASK_LIST);
    taskList.insert(0, [item]);
    document.getXmlFragment(EDITOR_FRAGMENT).insert(0, [taskList]);
    return document;
}

describe('Feature: the lines of a list in the Tiptap document the API counts (R28)', () => {
    it('writes taskList > taskItem > paragraph > text, with a boolean checked', () => {
        const document = new Doc();
        addChecklistLine(document, BREAD);

        const [item] = taskItemsOf(document);
        expect(item?.nodeName).toBe(TASK_ITEM);
        expect(item?.getAttribute('checked')).toBe(false);
        expect(item?.getAttribute('lineId')).toBe('line-1');
        const paragraph = item?.get(0);
        expect(paragraph instanceof XmlElement && paragraph.nodeName).toBe(
            PARAGRAPH,
        );
        expect(paragraph?.toString()).toBe('<paragraph>Pain</paragraph>');
    });

    it('stores who checked a line, and forgets it once unchecked (R29)', () => {
        const document = new Doc();
        addChecklistLine(document, BREAD);

        writeChecklistLine(document, {
            ...BREAD,
            checked: true,
            checkedBy: 'me',
        });
        expect(taskItemsOf(document)[0]?.getAttribute('checked')).toBe(true);
        expect(taskItemsOf(document)[0]?.getAttribute('checkedBy')).toBe('me');

        writeChecklistLine(document, BREAD);
        expect(taskItemsOf(document)[0]?.getAttributes()).toEqual({
            checked: false,
            lineId: 'line-1',
        });
    });

    it('reads a line typed in the note editor by its place, as plain text', () => {
        expect(readChecklist(aDocumentTypedInTheEditor())).toEqual([
            {
                id: 'position-0',
                text: 'Tomates bio',
                checked: false,
                checkedBy: null,
            },
        ]);
    });

    it('adds a line to the checklist already in the document', () => {
        const document = aDocumentTypedInTheEditor();
        addChecklistLine(document, BREAD);

        expect(document.getXmlFragment(EDITOR_FRAGMENT).length).toBe(1);
        expect(readChecklist(document).map(({ text }) => text)).toEqual([
            'Tomates bio',
            'Pain',
        ]);
    });
});
