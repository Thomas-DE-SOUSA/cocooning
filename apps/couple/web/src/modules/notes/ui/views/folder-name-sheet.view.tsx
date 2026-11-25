'use client';

import type { FolderNameForm } from '@cocooning/couple-client-business-logic/notes';
import { Field, FieldError, Input, Label } from '@cocooning/design-system';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';
import type { FolderNameSheetLabels } from '../../view-models/note-sheet.view-model';
import { SheetHeading } from '../components/sheet-heading';
import { SubmitButton } from '../components/submit-button';

type Props = {
    readonly form: UseFormReturn<FolderNameForm>;
    readonly labels: FolderNameSheetLabels;
    readonly isPending: boolean;
    readonly isBusy: boolean;
    readonly onSubmit: (form: FolderNameForm) => void;
};

const NAME_ID = 'folder-name';
const NAME_ERROR_ID = 'folder-name-error';

// R13: the name of a folder, from 1 to 60 signs.
export function FolderNameSheetView({
    form,
    labels,
    isPending,
    isBusy,
    onSubmit,
}: Props) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    const { errors } = form.formState;
    return (
        <>
            <SheetHeading
                title={labels.title}
                description={labels.description}
            />
            <form
                method="post"
                noValidate
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4 px-5 pt-2 pb-6"
            >
                <Field>
                    <Label htmlFor={NAME_ID}>{t('form.name.label')}</Label>
                    <Input
                        id={NAME_ID}
                        autoComplete="off"
                        enterKeyHint="done"
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={NAME_ERROR_ID}
                        {...form.register('name')}
                    />
                    <FieldError id={NAME_ERROR_ID}>
                        {errors.name?.message}
                    </FieldError>
                </Field>
                <SubmitButton
                    label={labels.submit}
                    pendingLabel={labels.pending}
                    isPending={isPending}
                    isBusy={isBusy}
                />
            </form>
        </>
    );
}
