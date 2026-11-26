'use client';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { UnavailableNotice } from '@/shared/ui/unavailable-notice';
import { NOTE_NAMESPACE } from '../../data/note-page-i18n-namespaces';
import { useUnavailableNote } from '../../hooks/use-unavailable-note';
import {
    NotePageStepEnum,
    type NotePageViewModel,
} from '../../view-models/note-page.view-model';
import { NoteContainer } from './note.container';

type Props = {
    readonly viewModel: NotePageViewModel;
    readonly collaborationUrl: string;
};

export function NotePageContainer({ viewModel, collaborationUrl }: Props) {
    if (viewModel.step === NotePageStepEnum.UNAVAILABLE) {
        return <NoteUnavailableContainer error={viewModel.error} />;
    }
    return (
        <NoteContainer
            note={viewModel.note}
            level={viewModel.level}
            card={viewModel.card}
            collaborationUrl={collaborationUrl}
        />
    );
}

function NoteUnavailableContainer({ error }: { readonly error: ApiError }) {
    const notice = useUnavailableNote(error, NOTE_NAMESPACE);
    return (
        <UnavailableNotice
            title={notice.title}
            description={notice.description}
            retryLabel={notice.retryLabel}
            onRetry={notice.retry}
        />
    );
}
