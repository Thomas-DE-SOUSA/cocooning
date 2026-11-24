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
import { NOTE_NAMESPACE } from '../../data/note-page-i18n-namespaces';

type Props = {
    readonly form: UseFormReturn<NoteTitleForm>;
    readonly isRenaming: boolean;
    readonly onRename: (form: NoteTitleForm) => void;
};

const TITLE_ERROR_ID = 'rename-note-title-error';

// R6: anyone who sees the note renames it; the button waits for a change of the title.
export function RenameNoteFormView({ form, isRenaming, onRename }: Props) {
    const { t } = useTranslation(NOTE_NAMESPACE);
    const { errors, isDirty } = form.formState;
    return (
        <form
            method="post"
            noValidate
            onSubmit={form.handleSubmit(onRename)}
            className="flex w-full items-start gap-2"
        >
            <Field className="flex-1">
                <Label
                    htmlFor="title"
                    className="sr-only"
                >
                    {t('form.title.label')}
                </Label>
                <Input
                    id="title"
                    autoComplete="off"
                    enterKeyHint="done"
                    className="text-lg font-semibold"
                    aria-invalid={Boolean(errors.title)}
                    aria-describedby={TITLE_ERROR_ID}
                    {...form.register('title')}
                />
                <FieldError id={TITLE_ERROR_ID}>
                    {errors.title?.message}
                </FieldError>
            </Field>
            <Button
                type="submit"
                variant="secondary"
                disabled={!isDirty || isRenaming}
                aria-busy={isRenaming}
            >
                {isRenaming ? (
                    <Spinner aria-label={t('rename.renaming')} />
                ) : (
                    t('rename.submit')
                )}
            </Button>
        </form>
    );
}
