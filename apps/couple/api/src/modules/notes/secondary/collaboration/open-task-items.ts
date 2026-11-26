import { yjs } from '../../esm-packages';

// The PWA's editor (Tiptap, `use-note-editor.ts`) writes its content in the default fragment of the Yjs document;
// a line to check is a `taskItem` element, checked when its `checked` attribute is true, at any depth.
const EDITOR_FRAGMENT = 'default';
const TASK_ITEM = 'taskItem';

type YjsNode = Parameters<
    Parameters<InstanceType<typeof yjs.XmlFragment>['createTreeWalker']>[0]
>[0];

// y-prosemirror stores the boolean attribute of the node as is, though Yjs types attributes as strings.
const isOpenTaskItem = (node: YjsNode): boolean => {
    if (!(node instanceof yjs.XmlElement) || node.nodeName !== TASK_ITEM)
        return false;
    const checked: unknown = node.getAttribute('checked');
    return checked !== true;
};

// Throws on a content Yjs cannot read.
export function countOpenTaskItems(content: Uint8Array): number {
    const document = new yjs.Doc();
    try {
        yjs.applyUpdate(document, content);
        const walker = document
            .getXmlFragment(EDITOR_FRAGMENT)
            .createTreeWalker(isOpenTaskItem);
        return Array.from(walker).length;
    } finally {
        document.destroy();
    }
}
