'use client';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { Drawer, DrawerContent } from '@cocooning/design-system';
import { useTranslation } from 'react-i18next';
import { UnavailableNotice } from '@/shared/ui/unavailable-notice';
import { NOTE_LISTS_NAMESPACE } from '../../data/note-lists-i18n-namespaces';
import { useNewListSheet } from '../../hooks/use-new-list-sheet';
import { useNotesRefresh } from '../../hooks/use-notes-refresh';
import { useUnavailableNote } from '../../hooks/use-unavailable-note';
import {
    type NoteListsScreenViewModel,
    NoteListsStepEnum,
} from '../../view-models/note-lists-screen.view-model';
import { AddListButton } from '../components/add-list-button';
import { ListSectionTabs } from '../components/list-section-tabs';
import { NoteListsHomeView } from '../views/note-lists-home.view';
import { NewListSheetContainer } from './new-list-sheet.container';

type Props = { readonly viewModel: NoteListsScreenViewModel };

// R28: the counts are read again when the PWA comes back to the foreground (decision 0036).
export function NoteListsContainer({ viewModel }: Props) {
    useNotesRefresh();
    if (viewModel.step === NoteListsStepEnum.UNAVAILABLE) {
        return (
            <>
                <ListSectionTabs tabs={viewModel.tabs} />
                <NoteListsUnavailableContainer error={viewModel.error} />
            </>
        );
    }
    if (viewModel.step === NoteListsStepEnum.WISHES) {
        return (
            <NoteListsHomeView
                tabs={viewModel.tabs}
                lists={null}
            />
        );
    }
    return <NoteListsSectionContainer viewModel={viewModel} />;
}

function NoteListsSectionContainer({
    viewModel,
}: {
    readonly viewModel: Extract<NoteListsScreenViewModel, { step: 'LISTS' }>;
}) {
    const { t } = useTranslation(NOTE_LISTS_NAMESPACE);
    const sheet = useNewListSheet();
    return (
        <>
            <NoteListsHomeView
                tabs={viewModel.tabs}
                lists={viewModel}
            />
            <AddListButton
                label={t('add.label')}
                onClick={sheet.open}
            />
            <Drawer
                open={sheet.isOpen}
                onOpenChange={(open) => {
                    if (!open) sheet.close();
                }}
            >
                <DrawerContent>
                    <NewListSheetContainer
                        key={sheet.opening}
                        kind={viewModel.kind}
                        onClose={sheet.close}
                    />
                </DrawerContent>
            </Drawer>
        </>
    );
}

function NoteListsUnavailableContainer({
    error,
}: {
    readonly error: ApiError;
}) {
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
