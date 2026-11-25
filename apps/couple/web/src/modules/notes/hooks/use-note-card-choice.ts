import type { NoteCardQueryForm } from '@cocooning/couple-client-business-logic/notes';
import { useState } from 'react';
import type { NoteCardCommandGateway } from '../gateways/ports/note-card-command.gateway';
import { useNoteCardCommands } from './use-note-card-commands';
import { useNoteCardFeedback } from './use-note-card-feedback';
import { useNoteCardQueryForm } from './use-note-card-query-form';

// Composition hook of « Lequel ? » (R19): a tap chooses a candidate; « Aucun de ceux-là » opens the precision.
export function useNoteCardChoice(
    gateway: NoteCardCommandGateway,
    noteId: string,
) {
    const [isRefining, setIsRefining] = useState(false);
    const form = useNoteCardQueryForm();
    const { refresh, onFailed } = useNoteCardFeedback();
    const commands = useNoteCardCommands({
        gateway,
        onDone: refresh,
        onFailed,
    });
    return {
        form,
        isRefining,
        pending: commands.pending,
        isBusy: commands.isBusy,
        showRefine: () => setIsRefining(true),
        choose: (candidateIndex: number) =>
            commands.chooseNoteCardCandidate(noteId, candidateIndex),
        refine: (values: NoteCardQueryForm) =>
            commands.refineNoteCard(noteId, values),
    };
}
