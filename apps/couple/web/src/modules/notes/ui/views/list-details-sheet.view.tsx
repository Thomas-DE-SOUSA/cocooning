'use client';

import type { NoteListDetailsForm } from '@cocooning/couple-client-business-logic/notes';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NOTE_LISTS_NAMESPACE } from '../../data/note-lists-i18n-namespaces';
import type { ListDetailsInput } from '../../view-models/note-list-page.view-model';
import { ListDetailsFields } from '../components/list-details-fields';
import { SheetHeading } from '../components/sheet-heading';
import { SubmitButton } from '../components/submit-button';

type Props = {
    readonly form: UseFormReturn<
        ListDetailsInput,
        unknown,
        NoteListDetailsForm
    >;
    readonly isPending: boolean;
    readonly isBusy: boolean;
    readonly onSave: (form: NoteListDetailsForm) => void;
};

// R26: the title and the emoji change together; an emptied emoji is removed.
export function ListDetailsSheetView({
    form,
    isPending,
    isBusy,
    onSave,
}: Props) {
    const { t } = useTranslation(NOTE_LISTS_NAMESPACE);
    const { errors } = form.formState;
    return (
        <>
            <SheetHeading
                title={t('listDetails.title')}
                description={t('listDetails.description')}
            />
            <form
                method="post"
                noValidate
                onSubmit={form.handleSubmit(onSave)}
                className="flex flex-col gap-4 px-5 pt-2 pb-6"
            >
                <ListDetailsFields
                    idPrefix="list-details"
                    title={form.register('title')}
                    titleError={errors.title?.message ?? null}
                    emoji={form.register('emoji')}
                    emojiError={errors.emoji?.message ?? null}
                />
                <SubmitButton
                    label={t('listDetails.submit')}
                    pendingLabel={t('listDetails.saving')}
                    isPending={isPending}
                    isBusy={isBusy}
                />
            </form>
        </>
    );
}
