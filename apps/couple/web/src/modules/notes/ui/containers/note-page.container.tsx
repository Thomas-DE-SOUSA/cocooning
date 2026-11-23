'use client';

import { useTranslation } from 'react-i18next';
import { UnavailableNotice } from '@/shared/ui/unavailable-notice';
import { NOTE_NAMESPACE } from '../../data/note-page-i18n-namespaces';
import { noteCommandGateway } from '../../gateways';
import { useNotePageScreen } from '../../hooks/use-note-page-screen';
import {
    NotePageStepEnum,
    type NotePageViewModel,
} from '../../view-models/note-page.view-model';
import { NotePageView } from '../views/note-page.view';

const NO_NOTE = { noteId: '', title: '' };

export function NotePageContainer({
    viewModel,
}: {
    readonly viewModel: NotePageViewModel;
}) {
    const { t } = useTranslation(NOTE_NAMESPACE);
    const note =
        viewModel.step === NotePageStepEnum.NOTE ? viewModel.note : null;
    const screen = useNotePageScreen(noteCommandGateway, note ?? NO_NOTE);
    if (viewModel.step === NotePageStepEnum.UNAVAILABLE) {
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
        <NotePageView
            note={viewModel.note}
            form={screen.titleForm}
            isRenaming={screen.isRenaming}
            onRename={screen.renameNote}
        />
    );
}
