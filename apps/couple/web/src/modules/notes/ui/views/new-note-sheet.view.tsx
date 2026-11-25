'use client';

import type { NoteTitleForm } from '@cocooning/couple-client-business-logic/notes';
import { Field, FieldError, Input, Label } from '@cocooning/design-system';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';
import { SheetHeading } from '../components/sheet-heading';
import { SubmitButton } from '../components/submit-button';

type Props = {
    readonly form: UseFormReturn<NoteTitleForm>;
    readonly placeName: string;
    readonly isPending: boolean;
    readonly isBusy: boolean;
    readonly onCreate: (form: NoteTitleForm) => void;
};

const TITLE_ID = 'new-note-title';
const TITLE_ERROR_ID = 'new-note-title-error';

// R8, R13: a note created by its title in the place shown by the screen.
export function NewNoteSheetView({
    form,
    placeName,
    isPending,
    isBusy,
    onCreate,
}: Props) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    const { errors } = form.formState;
    return (
        <>
            <SheetHeading
                title={t('newNote.title')}
                description={t('newNote.in', { place: placeName })}
            />
            <form
                method="post"
                noValidate
                onSubmit={form.handleSubmit(onCreate)}
                className="flex flex-col gap-4 px-5 pt-2 pb-6"
            >
                <Field>
                    <Label htmlFor={TITLE_ID}>{t('form.title.label')}</Label>
                    <Input
                        id={TITLE_ID}
                        autoComplete="off"
                        enterKeyHint="done"
                        aria-invalid={Boolean(errors.title)}
                        aria-describedby={TITLE_ERROR_ID}
                        {...form.register('title')}
                    />
                    <FieldError id={TITLE_ERROR_ID}>
                        {errors.title?.message}
                    </FieldError>
                </Field>
                <SubmitButton
                    label={t('newNote.submit')}
                    pendingLabel={t('newNote.creating')}
                    isPending={isPending}
                    isBusy={isBusy}
                />
            </form>
        </>
    );
}
