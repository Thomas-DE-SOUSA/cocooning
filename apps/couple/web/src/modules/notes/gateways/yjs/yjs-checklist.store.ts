import type { ChecklistLine } from '@cocooning/couple-client-business-logic/notes';
import type { Doc } from 'yjs';
import { EDITOR_FRAGMENT } from '../../data/checklist-document-schema';
import { readChecklist } from './yjs-checklist.reader';

// The lines of a list for useSyncExternalStore: read again on every change of the document, local or remote, and the
// same array between two changes.
export class YjsChecklistStore {
    private lines: readonly ChecklistLine[];

    constructor(private readonly document: Doc) {
        this.lines = readChecklist(document);
    }

    readonly read = (): readonly ChecklistLine[] => this.lines;

    readonly subscribe = (onChange: () => void): (() => void) => {
        const fragment = this.document.getXmlFragment(EDITOR_FRAGMENT);
        const update = () => {
            this.lines = readChecklist(this.document);
            onChange();
        };
        fragment.observeDeep(update);
        update();
        return () => fragment.unobserveDeep(update);
    };
}
