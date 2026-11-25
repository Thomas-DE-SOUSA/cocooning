'use client';

import { useTranslation } from 'react-i18next';
import { describeApiResultError } from '@/shared/application/api-result/describe-api-result-error';
import { UnavailableNotice } from '@/shared/ui/unavailable-notice';
import { NOTES_NAMESPACE } from '../../data/notes-i18n-namespaces';
import { useNotesRefresh } from '../../hooks/use-notes-refresh';
import {
    type NotesScreenViewModel,
    NotesStepEnum,
} from '../../view-models/notes-screen.view-model';
import { NotesHomeView } from '../views/notes-home.view';

export function NotesContainer({
    viewModel,
}: {
    readonly viewModel: NotesScreenViewModel;
}) {
    const { t } = useTranslation(NOTES_NAMESPACE);
    const refresh = useNotesRefresh();
    if (viewModel.step === NotesStepEnum.UNAVAILABLE) {
        return (
            <UnavailableNotice
                title={t('unavailable.title')}
                description={describeApiResultError(viewModel.error, t)}
                retryLabel={t('unavailable.refresh')}
                onRetry={refresh}
            />
        );
    }
    return (
        <NotesHomeView
            spaces={viewModel.spaces}
            recentNotes={viewModel.recentNotes}
        />
    );
}
