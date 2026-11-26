'use client';

import type { NoteListKind } from '@cocooning/couple-shared-kernel/enums';
import { noteListCommandGateway } from '../../gateways';
import { useNewListForm } from '../../hooks/use-new-list-form';
import { useNoteListCommands } from '../../hooks/use-note-list-commands';
import { useNoteListFeedback } from '../../hooks/use-note-list-feedback';
import { NoteListCommandEnum } from '../../view-models/note-list-command.view-model';
import { NewListSheetView } from '../views/new-list-sheet.view';

type Props = { readonly kind: NoteListKind };

// R26: the list is created in the section shown, then opened to add its first lines.
export function NewListSheetContainer({ kind }: Props) {
    const form = useNewListForm(kind);
    const commands = useNoteListCommands({
        gateway: noteListCommandGateway,
        ...useNoteListFeedback(),
    });
    return (
        <NewListSheetView
            form={form}
            isPending={commands.pending === NoteListCommandEnum.CREATE_LIST}
            isBusy={commands.isBusy}
            onCreate={commands.createList}
        />
    );
}
