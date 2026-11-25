'use client';

import type { FolderTemplateForm } from '@cocooning/couple-client-business-logic/notes';
import type { FormEvent } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';
import type { CardTemplateEditor } from '../../view-models/card-template-editor.view-model';
import { CardTemplateFields } from '../components/card-template-fields';
import { SheetHeading } from '../components/sheet-heading';
import { SubmitButton } from '../components/submit-button';

type Props = {
    readonly folderName: string;
    readonly form: UseFormReturn<FolderTemplateForm>;
    readonly editor: CardTemplateEditor;
    readonly isPending: boolean;
    readonly isBusy: boolean;
    readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

// R17, R18, R22: the subject and the fields of a smart folder, corrected by either partner; the cards follow.
export function FolderTemplateSheetView({
    folderName,
    form,
    editor,
    isPending,
    isBusy,
    onSubmit,
}: Props) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    return (
        <>
            <SheetHeading
                title={t('editTemplate.title', { name: folderName })}
                description={t('editTemplate.description')}
            />
            <form
                method="post"
                noValidate
                onSubmit={onSubmit}
                className="flex flex-col gap-4 overflow-y-auto px-5 pt-2 pb-6"
            >
                <CardTemplateFields
                    subject={form.register('subject')}
                    subjectError={
                        form.formState.errors.subject?.message ?? null
                    }
                    editor={editor}
                />
                <SubmitButton
                    label={t('editTemplate.submit')}
                    pendingLabel={t('editTemplate.saving')}
                    isPending={isPending}
                    isBusy={isBusy}
                />
            </form>
        </>
    );
}
