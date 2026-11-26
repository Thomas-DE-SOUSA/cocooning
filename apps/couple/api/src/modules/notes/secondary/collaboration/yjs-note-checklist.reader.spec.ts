import { FakeLoggerAdapter } from '@cocooning/shared-kernel/testing';
import { yjs } from '../../esm-packages';
import { YjsNoteChecklistReader } from './yjs-note-checklist.reader';

const NOTE_ID = '00000000-0000-7000-8000-000000000001';

type Line = { readonly checked: boolean; readonly nested?: Line[] };
const element = (name: string) => new yjs.XmlElement(name);
type Element = ReturnType<typeof element>;

// y-prosemirror stores the boolean attribute of the node as is; Yjs types an attribute as a string by default.
const checkedAttribute = (checked: boolean): string =>
    checked as unknown as string;

const taskList = (lines: ReadonlyArray<Line>): Element => {
    const list = element('taskList');
    list.insert(
        0,
        lines.map(({ checked, nested }) => {
            const item = element('taskItem');
            item.setAttribute('checked', checkedAttribute(checked));
            item.insert(0, [element('paragraph')]);
            if (nested !== undefined) item.insert(1, [taskList(nested)]);
            return item;
        }),
    );
    return list;
};

// A content as the PWA's editor writes it: Tiptap's default fragment.
const contentWith = (...nodes: Element[]) => {
    const document = new yjs.Doc();
    document.getXmlFragment('default').insert(0, nodes);
    return yjs.encodeStateAsUpdate(document);
};

describe('Feature: count the lines left to check in a note (R28)', () => {
    let logger: FakeLoggerAdapter;
    let reader: YjsNoteChecklistReader;

    beforeEach(() => {
        logger = new FakeLoggerAdapter();
        reader = new YjsNoteChecklistReader(logger);
    });

    describe('Scenario: a list with checked and unchecked lines, some nested', () => {
        it('counts the unchecked task items at any depth', () => {
            const content = contentWith(
                taskList([
                    { checked: false },
                    { checked: true, nested: [{ checked: false }] },
                    { checked: true },
                ]),
                element('paragraph'),
                taskList([{ checked: false }]),
            );
            expect(reader.countOpenItems(NOTE_ID, content)).toBe(3);
        });
    });

    describe('Scenario: a note without lines to check', () => {
        it('counts 0 for an empty document or one without task items', () => {
            expect(reader.countOpenItems(NOTE_ID, contentWith())).toBe(0);
            expect(
                reader.countOpenItems(
                    NOTE_ID,
                    contentWith(element('paragraph')),
                ),
            ).toBe(0);
        });
    });

    describe('Scenario: a content Yjs cannot read', () => {
        it('counts 0 and logs one warning by the note id, never the content', () => {
            const content = Uint8Array.from([1, 2, 3, 250, 9]);
            expect(reader.countOpenItems(NOTE_ID, content)).toBe(0);
            expect(logger.entries).toEqual([
                {
                    level: 'warn',
                    message: 'Unreadable note checklist, counted 0',
                    context: { noteId: NOTE_ID, errorType: 'Error' },
                },
            ]);
        });
    });
});
