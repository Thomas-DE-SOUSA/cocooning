'use client';

import type { NoteCardFieldForm } from '@cocooning/couple-client-business-logic/notes';
import { Field, FieldError, Label, Textarea } from '@cocooning/design-system';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NOTE_CARD_NAMESPACE } from '../../data/note-card-i18n-namespaces';
import type { NoteCardField } from '../../view-models/note-card.view-model';
import { SheetHeading } from '../components/sheet-heading';
import { SubmitButton } from '../components/submit-button';

type Props = {
    readonly field: NoteCardField;
    readonly form: UseFormReturn<NoteCardFieldForm>;
    readonly isPending: boolean;
    readonly isBusy: boolean;
    readonly onSubmit: (form: NoteCardFieldForm) => void;
};

const VALUE_ID = 'note-card-value';
const VALUE_ERROR_ID = 'note-card-value-error';

// R22: the couple writes the value of one field by hand; « Mettre à jour » keeps it.
export function NoteCardFieldSheetView({
    field,
    form,
    isPending,
    isBusy,
    onSubmit,
}: Props) {
    const { t } = useTranslation(NOTE_CARD_NAMESPACE);
    const { errors } = form.formState;
    return (
        <>
            <SheetHeading
                title={t('correction.title', { name: field.name })}
                description={t('correction.description')}
            />
            <form
                method="post"
                noValidate
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4 px-5 pt-2 pb-6"
            >
                <Field>
                    <Label htmlFor={VALUE_ID}>{field.name}</Label>
                    <Textarea
                        id={VALUE_ID}
                        rows={3}
                        aria-invalid={Boolean(errors.value)}
                        aria-describedby={VALUE_ERROR_ID}
                        {...form.register('value')}
                    />
                    <FieldError id={VALUE_ERROR_ID}>
                        {errors.value?.message}
                    </FieldError>
                </Field>
                <SubmitButton
                    label={t('correction.submit')}
                    pendingLabel={t('correction.saving')}
                    isPending={isPending}
                    isBusy={isBusy}
                />
            </form>
        </>
    );
}
