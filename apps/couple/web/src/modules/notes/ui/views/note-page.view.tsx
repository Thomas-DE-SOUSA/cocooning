'use client';

import type { NoteTitleForm } from '@cocooning/couple-client-business-logic/notes';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NOTE_NAMESPACE } from '../../data/note-page-i18n-namespaces';
import { presentPlaceName } from '../../presenters/place-labels.presenter';
import type { NotePlace } from '../../view-models/note-place.view-model';
import type { NoteListItem } from '../../view-models/notes-screen.view-model';
import { BackLink } from '../components/back-link';
import { NoteMeta } from '../components/note-meta';
import { NoteVisibilityBadge } from '../components/note-visibility-badge';
import { RowActionsButton } from '../components/row-actions-button';
import { RenameNoteFormView } from './rename-note-form.view';

type Props = {
    readonly note: NoteListItem;
    readonly place: NotePlace;
    readonly form: UseFormReturn<NoteTitleForm>;
    readonly isRenaming: boolean;
    readonly onRename: (form: NoteTitleForm) => void;
    readonly onActions: () => void;
};

// The way back to the folder of the note (or the root of its space), its actions, then its title (decision 0053).
export function NotePageView({
    note,
    place,
    form,
    isRenaming,
    onRename,
    onActions,
}: Props) {
    const { t } = useTranslation(NOTE_NAMESPACE);
    return (
        <>
            <div className="flex items-center justify-between gap-2">
                <BackLink
                    href={place.href}
                    label={presentPlaceName(place, t)}
                />
                <RowActionsButton
                    label={t('actions')}
                    onClick={onActions}
                />
            </div>
            <RenameNoteFormView
                form={form}
                isRenaming={isRenaming}
                onRename={onRename}
            />
            <div className="flex flex-wrap items-center gap-2">
                <NoteVisibilityBadge
                    namespace={NOTE_NAMESPACE}
                    isShared={note.isShared}
                />
                <NoteMeta
                    namespace={NOTE_NAMESPACE}
                    note={note}
                />
            </div>
        </>
    );
}
