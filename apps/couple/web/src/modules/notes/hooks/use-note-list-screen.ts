import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useRefreshOnReturn } from '@/shared/application/refresh/use-refresh-on-return';
import type { LineIdGenerator } from '../gateways/ports/line-id.generator';
import type { NoteDocumentGateway } from '../gateways/ports/note-document.gateway';
import type {
    ChecklistActions,
    ChecklistScreen,
} from '../view-models/checklist-screen.view-model';
import type { NoteListViewModel } from '../view-models/note-list-page.view-model';
import { useChecklist } from './use-checklist';
import { useChecklistDraft } from './use-checklist-draft';
import { useListDocument } from './use-list-document';

type Gateways = {
    readonly document: NoteDocumentGateway;
    readonly lineIds: LineIdGenerator;
};

// Composition hook of the page of a list: the shared document, its lines, the field to add one and « Vider les faits ».
// A list withdrawn from this partner is read again, and the page then goes back to its section (R4, R5).
export function useNoteListScreen(gateways: Gateways, list: NoteListViewModel) {
    const router = useRouter();
    const refresh = useCallback(() => router.refresh(), [router]);
    useRefreshOnReturn(refresh);
    const { document, isSynced, isPartnerHere } = useListDocument({
        gateway: gateways.document,
        noteId: list.noteId,
        viewerId: list.viewerId,
        onLost: refresh,
    });
    const checklist = useChecklist({
        document,
        viewerId: list.viewerId,
        lineIds: gateways.lineIds,
    });
    const draft = useChecklistDraft(checklist.add);
    const [isClearing, setIsClearing] = useState(false);
    const screen: ChecklistScreen = {
        isSynced,
        open: checklist.open,
        done: checklist.done,
        draft: draft.draft,
        editingLineId: draft.editingLineId,
    };
    const actions: ChecklistActions = {
        onDraftChange: draft.setDraft,
        onAdd: draft.submitDraft,
        onToggle: checklist.toggle,
        onStartEdit: draft.startEditing,
        onRename: (lineId, text) => {
            checklist.rename(lineId, text);
            draft.stopEditing();
        },
        onStopEdit: draft.stopEditing,
        onRemove: checklist.remove,
        onAskClear: () => setIsClearing(true),
    };
    const clear = {
        isOpen: isClearing,
        count: checklist.done.length,
        confirm: () => {
            checklist.clearDone();
            setIsClearing(false);
        },
        keep: () => setIsClearing(false),
    };
    return { screen, actions, clear, isPartnerHere };
}
