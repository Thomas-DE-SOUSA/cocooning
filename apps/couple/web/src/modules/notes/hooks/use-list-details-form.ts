import {
    createNoteListDetailsFormSchema,
    type NoteListDetailsForm,
} from '@cocooning/couple-client-business-logic/notes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { type UseFormReturn, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NOTE_LISTS_NAMESPACE } from '../data/note-lists-i18n-namespaces';
import type { ListDetailsInput } from '../view-models/note-list-page.view-model';

// R26: the title and the emoji of a list, from what it has now; an emptied emoji removes it (decision 0031).
export function useListDetailsForm(
    title: string,
    emoji: string | null,
): UseFormReturn<ListDetailsInput, unknown, NoteListDetailsForm> {
    const { t } = useTranslation(NOTE_LISTS_NAMESPACE);
    const schema = useMemo(() => createNoteListDetailsFormSchema(t), [t]);
    return useForm<ListDetailsInput, unknown, NoteListDetailsForm>({
        resolver: zodResolver(schema),
        defaultValues: { title, emoji: emoji ?? '' },
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    });
}
