import type { NoteCardNameForm } from '@cocooning/couple-client-business-logic/notes';
import { useCallback } from 'react';
import type { NoteCardCommandGateway } from '../gateways/ports/note-card-command.gateway';
import { NoteCardCommandEnum } from '../view-models/note-card-command.view-model';
import { useNoteCardCommands } from './use-note-card-commands';
import { useNoteCardFeedback } from './use-note-card-feedback';
import { useNoteCardNameForm } from './use-note-card-name-form';

// Composition hook of the add box of a smart folder (R19): the field empties once the note exists, « en recherche ».
export function useAddNoteCard(
    gateway: NoteCardCommandGateway,
    folderId: string,
) {
    const form = useNoteCardNameForm();
    const { refresh, onFailed } = useNoteCardFeedback();
    const onDone = useCallback(() => {
        form.reset();
        refresh();
    }, [form, refresh]);
    const commands = useNoteCardCommands({ gateway, onDone, onFailed });
    return {
        form,
        isPending: commands.pending === NoteCardCommandEnum.ADD,
        add: (values: NoteCardNameForm) =>
            commands.addNoteCard(folderId, values),
    };
}
