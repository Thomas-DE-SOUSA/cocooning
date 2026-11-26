'use client';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { UnavailableNotice } from '@/shared/ui/unavailable-notice';
import { NOTE_LISTS_NAMESPACE } from '../../data/note-lists-i18n-namespaces';
import { useUnavailableNote } from '../../hooks/use-unavailable-note';
import {
    NoteListPageStepEnum,
    type NoteListPageViewModel,
} from '../../view-models/note-list-page.view-model';
import { NoteListContainer } from './note-list.container';

type Props = {
    readonly viewModel: NoteListPageViewModel;
    readonly collaborationUrl: string;
};

export function NoteListPageContainer({ viewModel, collaborationUrl }: Props) {
    if (viewModel.step === NoteListPageStepEnum.UNAVAILABLE) {
        return <NoteListUnavailableContainer error={viewModel.error} />;
    }
    return (
        <NoteListContainer
            list={viewModel.list}
            collaborationUrl={collaborationUrl}
        />
    );
}

function NoteListUnavailableContainer({ error }: { readonly error: ApiError }) {
    const notice = useUnavailableNote(error, NOTE_LISTS_NAMESPACE);
    return (
        <UnavailableNotice
            title={notice.title}
            description={notice.description}
            retryLabel={notice.retryLabel}
            onRetry={notice.retry}
        />
    );
}
