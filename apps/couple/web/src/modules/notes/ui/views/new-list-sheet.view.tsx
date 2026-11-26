'use client';

import type {
    NoteListForm,
    NoteListFormInput,
} from '@cocooning/couple-client-business-logic/notes';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NOTE_LISTS_NAMESPACE } from '../../data/note-lists-i18n-namespaces';
import { ListDetailsFields } from '../components/list-details-fields';
import { ListSpaceChoice } from '../components/list-space-choice';
import { SheetHeading } from '../components/sheet-heading';
import { SubmitButton } from '../components/submit-button';

type Props = {
    readonly form: UseFormReturn<NoteListFormInput, unknown, NoteListForm>;
    readonly isPending: boolean;
    readonly isBusy: boolean;
    readonly onCreate: (form: NoteListForm) => void;
};

// R26: a list of the section shown, by its title, an optional emoji, and for whom.
export function NewListSheetView({ form, isPending, isBusy, onCreate }: Props) {
    const { t } = useTranslation(NOTE_LISTS_NAMESPACE);
    const kind = form.getValues('kind');
    const space = form.watch('space');
    const { errors } = form.formState;
    return (
        <>
            <SheetHeading
                title={t('newList.title')}
                description={t('newList.in', {
                    section: t(`sections.${kind}`),
                })}
            />
            <form
                method="post"
                noValidate
                onSubmit={form.handleSubmit(onCreate)}
                className="flex flex-col gap-4 px-5 pt-2 pb-6"
            >
                <ListDetailsFields
                    idPrefix="new-list"
                    title={form.register('title')}
                    titleError={errors.title?.message ?? null}
                    emoji={form.register('emoji')}
                    emojiError={errors.emoji?.message ?? null}
                />
                <ListSpaceChoice
                    current={space}
                    disabled={isBusy}
                    onChoose={(chosen) => form.setValue('space', chosen)}
                />
                <SubmitButton
                    label={t('newList.submit')}
                    pendingLabel={t('newList.creating')}
                    isPending={isPending}
                    isBusy={isBusy}
                />
            </form>
        </>
    );
}
