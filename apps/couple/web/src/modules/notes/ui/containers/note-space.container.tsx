'use client';

import { useTranslation } from 'react-i18next';
import { describeApiResultError } from '@/shared/application/api-result/describe-api-result-error';
import { UnavailableNotice } from '@/shared/ui/unavailable-notice';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';
import { useNotesRefresh } from '../../hooks/use-notes-refresh';
import {
    type NoteSpaceScreenViewModel,
    NoteSpaceStepEnum,
} from '../../view-models/note-space-screen.view-model';
import { NoteSpaceHeaderView } from '../views/note-space-header.view';
import { NoteSpaceContentsContainer } from './note-space-contents.container';

export function NoteSpaceContainer({
    viewModel,
}: {
    readonly viewModel: NoteSpaceScreenViewModel;
}) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    const refresh = useNotesRefresh();
    return (
        <>
            <NoteSpaceHeaderView
                place={viewModel.place}
                back={viewModel.back}
                cardContext={
                    viewModel.step === NoteSpaceStepEnum.CONTENTS
                        ? viewModel.cardContext
                        : null
                }
            />
            {viewModel.step === NoteSpaceStepEnum.UNAVAILABLE ? (
                <UnavailableNotice
                    title={t('unavailable.title')}
                    description={describeApiResultError(viewModel.error, t)}
                    retryLabel={t('unavailable.refresh')}
                    onRetry={refresh}
                />
            ) : (
                <NoteSpaceContentsContainer screen={viewModel} />
            )}
        </>
    );
}
