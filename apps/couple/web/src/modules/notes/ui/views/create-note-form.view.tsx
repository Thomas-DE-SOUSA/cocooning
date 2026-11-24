'use client';

import type { NoteTitleForm } from '@cocooning/couple-client-business-logic/notes';
import {
    Button,
    Field,
    FieldError,
    Input,
    Label,
    Spinner,
} from '@cocooning/design-system';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NOTES_NAMESPACE } from '../../data/notes-i18n-namespaces';

type Props = {
    readonly form: UseFormReturn<NoteTitleForm>;
    readonly isPending: boolean;
    readonly isBusy: boolean;
    readonly onCreate: (form: NoteTitleForm) => void;
};

const TITLE_ERROR_ID = 'create-note-title-error';

export function CreateNoteFormView({
    form,
    isPending,
    isBusy,
    onCreate,
}: Props) {
    const { t } = useTranslation(NOTES_NAMESPACE);
    const { errors } = form.formState;
    return (
        <form
            method="post"
            noValidate
            onSubmit={form.handleSubmit(onCreate)}
            className="w-full"
        >
            <Field>
                <Label htmlFor="title">{t('form.title.label')}</Label>
                <div className="flex gap-2">
                    <Input
                        id="title"
                        autoComplete="off"
                        enterKeyHint="done"
                        aria-invalid={Boolean(errors.title)}
                        aria-describedby={TITLE_ERROR_ID}
                        {...form.register('title')}
                    />
                    <Button
                        type="submit"
                        className="h-12 shrink-0"
                        disabled={isBusy}
                        aria-busy={isPending}
                    >
                        {isPending ? (
                            <Spinner aria-label={t('create.creating')} />
                        ) : (
                            t('create.submit')
                        )}
                    </Button>
                </div>
                <FieldError id={TITLE_ERROR_ID}>
                    {errors.title?.message}
                </FieldError>
            </Field>
        </form>
    );
}
