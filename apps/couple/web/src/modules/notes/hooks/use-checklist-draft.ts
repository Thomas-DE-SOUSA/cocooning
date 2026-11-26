import { useCallback, useState } from 'react';

// The text typed in « Ajouter » and the line edited in place: state of the screen, never of the document.
export function useChecklistDraft(add: (text: string) => void) {
    const [draft, setDraft] = useState('');
    const [editingLineId, setEditingLineId] = useState<string | null>(null);
    const submitDraft = useCallback(() => {
        add(draft);
        setDraft('');
    }, [add, draft]);
    const stopEditing = useCallback(() => setEditingLineId(null), []);
    return {
        draft,
        setDraft,
        submitDraft,
        editingLineId,
        startEditing: setEditingLineId,
        stopEditing,
    };
}
