import type { NoteCardFieldForm } from '@cocooning/couple-client-business-logic/notes';
import { NoteCardStatusEnum } from '@cocooning/couple-shared-kernel/enums';
import { useCallback, useState } from 'react';
import type { NoteCardCommandGateway } from '../gateways/ports/note-card-command.gateway';
import type {
    NoteCardField,
    NoteCardViewModel,
} from '../view-models/note-card.view-model';
import {
    type NoteCardCommand,
    NoteCardCommandEnum,
} from '../view-models/note-card-command.view-model';
import { useNoteCardCommands } from './use-note-card-commands';
import { useNoteCardFeedback } from './use-note-card-feedback';
import { useNoteCardFieldForm } from './use-note-card-field-form';
import { usePollWhilePending } from './use-poll-while-pending';

// Composition hook of the card of a note (R20, R22): « Mettre à jour », the correction of a field in a sheet that keeps
// its field while it slides down, and the reading again while the card is « en recherche ».
export function useNoteCardPanel(
    gateway: NoteCardCommandGateway,
    card: NoteCardViewModel,
) {
    const { refresh, onFailed } = useNoteCardFeedback();
    usePollWhilePending(card.status === NoteCardStatusEnum.PENDING, refresh);
    const [correcting, setCorrecting] = useState<NoteCardField | null>(null);
    const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
    const form = useNoteCardFieldForm();
    const closeCorrection = useCallback(() => setIsCorrectionOpen(false), []);
    const onDone = useCallback(
        (command: NoteCardCommand) => {
            if (command === NoteCardCommandEnum.CORRECT) closeCorrection();
            refresh();
        },
        [closeCorrection, refresh],
    );
    const commands = useNoteCardCommands({ gateway, onDone, onFailed });
    return {
        pending: commands.pending,
        isBusy: commands.isBusy,
        refreshCard: () => commands.refreshNoteCard(card.noteId),
        correcting,
        isCorrectionOpen,
        form,
        openCorrection: (field: NoteCardField) => {
            form.reset({ value: field.value ?? '' });
            setCorrecting(field);
            setIsCorrectionOpen(true);
        },
        closeCorrection,
        correct: (values: NoteCardFieldForm) => {
            if (correcting === null) return;
            commands.correctNoteCardField(card.noteId, correcting.name, values);
        },
    };
}
