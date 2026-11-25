'use client';

import { useTranslation } from 'react-i18next';
import { UnavailableNotice } from '@/shared/ui/unavailable-notice';
import { NOTES_NAMESPACE } from '../../data/notes-i18n-namespaces';
import { noteCommandGateway } from '../../gateways';
import { useNotesScreen } from '../../hooks/use-notes-screen';
import { NoteCommandEnum } from '../../view-models/note-command.view-model';
import {
    type NotesScreenViewModel,
    NotesStepEnum,
} from '../../view-models/notes-screen.view-model';
import { CreateNoteFormView } from '../views/create-note-form.view';
import { NoteListView } from '../views/note-list.view';

export function NotesContainer({
    viewModel,
}: {
    readonly viewModel: NotesScreenViewModel;
}) {
    const { t } = useTranslation(NOTES_NAMESPACE);
    const screen = useNotesScreen(noteCommandGateway);
    if (viewModel.step === NotesStepEnum.UNAVAILABLE) {
        return (
            <UnavailableNotice
                title={t('unavailable.title')}
                description={screen.describeError(viewModel.error)}
                retryLabel={t('unavailable.refresh')}
                onRetry={screen.refresh}
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
                onAskDeletion={screen.askDeletion}
                onConfirmDeletion={screen.deleteNote}
                onKeep={screen.keepNote}
            />
        </>
    );
}
