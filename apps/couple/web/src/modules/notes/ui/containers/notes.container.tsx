'use client';

import { noteCommandGateway } from '../../gateways';
import { useNotesScreen } from '../../hooks/use-notes-screen';
import { NoteCommandEnum } from '../../view-models/note-command.view-model';
import {
    type NotesScreenViewModel,
    NotesStepEnum,
} from '../../view-models/notes-screen.view-model';
import { CreateNoteFormView } from '../views/create-note-form.view';
import { NoteListView } from '../views/note-list.view';
import { NotesUnavailableView } from '../views/notes-unavailable.view';

export function NotesContainer({
    viewModel,
}: {
    readonly viewModel: NotesScreenViewModel;
}) {
    const screen = useNotesScreen(noteCommandGateway);
    if (viewModel.step === NotesStepEnum.UNAVAILABLE) {
        return (
            <NotesUnavailableView
                description={screen.describeError(viewModel.error)}
                onRefresh={screen.refresh}
            />
        );
    }
    return (
        <>
            <CreateNoteFormView
                form={screen.titleForm}
                isPending={
                    screen.pending?.command === NoteCommandEnum.CREATE_NOTE
                }
                isBusy={screen.isBusy}
                onCreate={screen.createNote}
            />
            <NoteListView
                notes={viewModel.notes}
                pending={screen.pending}
                isBusy={screen.isBusy}
                deletionAsked={screen.deletionAsked}
                onShare={screen.shareNote}
                onMakePrivate={screen.makeNotePrivate}
                onAskDeletion={screen.askDeletion}
                onConfirmDeletion={screen.deleteNote}
                onKeep={screen.keepNote}
            />
        </>
    );
}
