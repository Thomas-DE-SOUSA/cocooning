'use client';

import type { NoteTitleForm } from '@cocooning/couple-client-business-logic/notes';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import Link from 'next/link';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NOTE_NAMESPACE } from '../../data/note-page-i18n-namespaces';
import type { NoteListItem } from '../../view-models/notes-screen.view-model';
import { NoteMeta } from '../components/note-meta';
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
                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
                {t('back')}
            </Link>
            <RenameNoteFormView
                form={form}
                isRenaming={isRenaming}
                onRename={onRename}
            />
            <NoteMeta
                namespace={NOTE_NAMESPACE}
                note={note}
            />
        </>
    );
}
