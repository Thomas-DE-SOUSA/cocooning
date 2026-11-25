'use client';

import type { NoteCardNameForm } from '@cocooning/couple-client-business-logic/notes';
import {
    Button,
    Field,
    FieldError,
    Input,
    Label,
    Spinner,
} from '@cocooning/design-system';
import { Sparkles } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NOTE_CARD_NAMESPACE } from '../../data/note-card-i18n-namespaces';

type Props = {
    readonly form: UseFormReturn<NoteCardNameForm>;
    readonly isPending: boolean;
    readonly onSubmit: (form: NoteCardNameForm) => void;
};

const NAME_ID = 'note-card-name';
const NAME_ERROR_ID = 'note-card-name-error';

// R19: the couple types a name in a smart folder; the AI completes its card.
export function NoteCardAddView({ form, isPending, onSubmit }: Props) {
    const { t } = useTranslation(NOTE_CARD_NAMESPACE);
    const { errors } = form.formState;
    return (
        <form
            method="post"
            noValidate
            onSubmit={form.handleSubmit(onSubmit)}
        >
            <Field>
                <Label
                    htmlFor={NAME_ID}
                    className="sr-only"
                >
                    {t('add.label')}
                </Label>
                <div className="flex items-center gap-2 rounded-xl border-2 border-primary bg-card py-1 pr-1 pl-3">
                    <Sparkles
                        aria-hidden="true"
                        className="size-5 shrink-0 text-primary"
                    />
                    <Input
                        id={NAME_ID}
                        autoComplete="off"
                        enterKeyHint="send"
                        placeholder={t('add.placeholder')}
                        className="border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={NAME_ERROR_ID}
                        {...form.register('name')}
                    />
                    <Button
                        type="submit"
                        disabled={isPending}
                        aria-busy={isPending}
                    >
                        {isPending ? (
                            <Spinner aria-label={t('add.adding')} />
                        ) : (
                            t('add.submit')
                        )}
                    </Button>
                </div>
                <FieldError id={NAME_ERROR_ID}>
                    {errors.name?.message}
                </FieldError>
            </Field>
        </form>
    );
}
