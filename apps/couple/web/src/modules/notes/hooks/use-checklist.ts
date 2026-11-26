import {
    type ChecklistLine,
    checkLine,
    linesToClear,
    presentChecklist,
    uncheckLine,
} from '@cocooning/couple-client-business-logic/notes';
import { useMemo, useSyncExternalStore } from 'react';
import type { Doc } from 'yjs';
import type { LineIdGenerator } from '../gateways/ports/line-id.generator';
import {
    removeChecklistLines,
    writeChecklistText,
} from '../gateways/yjs/yjs-checklist.editor';
import { YjsChecklistStore } from '../gateways/yjs/yjs-checklist.store';
import {
    addChecklistLine,
    writeChecklistLine,
} from '../gateways/yjs/yjs-checklist.writer';

type Options = {
    readonly document: Doc;
    readonly viewerId: string;
    readonly lineIds: LineIdGenerator;
};

// R29 to R31 on the shared document: every change is a Yjs transaction, sent to the other phone at once (R32).
export function useChecklist({ document, viewerId, lineIds }: Options) {
    const store = useMemo(() => new YjsChecklistStore(document), [document]);
    const lines = useSyncExternalStore(store.subscribe, store.read, store.read);
    const checklist = useMemo(
        () => presentChecklist(lines, viewerId),
        [lines, viewerId],
    );
    const remove = (lineId: string) => removeChecklistLines(document, [lineId]);
    return {
        ...checklist,
        add: (text: string) => {
            const trimmed = text.trim();
            if (trimmed === '') return;
            addChecklistLine(document, {
                id: lineIds.next(),
                text: trimmed,
                checked: false,
                checkedBy: null,
            });
        },
        toggle: (line: ChecklistLine) =>
            writeChecklistLine(
                document,
                line.checked ? uncheckLine(line) : checkLine(line, viewerId),
            ),
        rename: (lineId: string, text: string) => {
            const trimmed = text.trim();
            if (trimmed === '') remove(lineId);
            else writeChecklistText(document, lineId, trimmed);
        },
        remove,
        clearDone: () =>
            removeChecklistLines(
                document,
                linesToClear(lines).map(({ id }) => id),
            ),
    };
}
