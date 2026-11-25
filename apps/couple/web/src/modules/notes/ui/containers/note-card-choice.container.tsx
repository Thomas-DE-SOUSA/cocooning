'use client';

import { noteCardCommandGateway } from '../../gateways';
import { useNoteCardChoice } from '../../hooks/use-note-card-choice';
import { NoteCardCommandEnum } from '../../view-models/note-card-command.view-model';
import type { NoteCardChoice } from '../../view-models/note-card-choice.view-model';
import { NoteCardChoiceView } from '../views/note-card-choice.view';

type Props = { readonly choice: NoteCardChoice };

// R19: the couple chooses the right candidate, or says which one with a precision.
export function NoteCardChoiceContainer({ choice }: Props) {
    const sheet = useNoteCardChoice(noteCardCommandGateway, choice.noteId);
    return (
        <NoteCardChoiceView
            choice={choice}
            form={sheet.form}
            isRefining={sheet.isRefining}
            isChoosing={sheet.pending === NoteCardCommandEnum.CHOOSE}
            isSearching={sheet.pending === NoteCardCommandEnum.REFINE}
            isBusy={sheet.isBusy}
            onChoose={sheet.choose}
            onShowRefine={sheet.showRefine}
            onRefine={sheet.refine}
        />
    );
}
