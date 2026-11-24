'use client';

import type { NoteTitleForm } from '@cocooning/couple-client-business-logic/notes';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NOTE_NAMESPACE } from '../../data/note-page-i18n-namespaces';
import type { NoteListItem } from '../../view-models/notes-screen.view-model';
import { NoteMeta } from '../components/note-meta';
import { NoteVisibilityBadge } from '../components/note-visibility-badge';
import { RenameNoteFormView } from './rename-note-form.view';

type Props = {
    readonly note: NoteListItem;
    readonly form: UseFormReturn<NoteTitleForm>;
    readonly isRenaming: boolean;
    readonly onRename: (form: NoteTitleForm) => void;
};

export function NotePageView({ note, form, isRenaming, onRename }: Props) {
    const { t } = useTranslation(NOTE_NAMESPACE);
    return (
        <>
            <Link
                href={WebRouterEnum.HOME}
                className="inline-flex min-h-11 items-center gap-1 self-start font-semibold text-primary underline-offset-4 hover:underline"
            >
                <ChevronLeft
                    aria-hidden="true"
                    className="size-5"
                />
                {t('back')}
            </Link>
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
