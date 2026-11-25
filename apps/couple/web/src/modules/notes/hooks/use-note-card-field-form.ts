import {
    createNoteCardFieldFormSchema,
    type NoteCardFieldForm,
} from '@cocooning/couple-client-business-logic/notes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { type UseFormReturn, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NOTE_CARD_NAMESPACE } from '../data/note-card-i18n-namespaces';

// R22: the value of a field written by hand, with the messages of the cards (decision 0031).
export function useNoteCardFieldForm(): UseFormReturn<NoteCardFieldForm> {
    const { t } = useTranslation(NOTE_CARD_NAMESPACE);
    const schema = useMemo(() => createNoteCardFieldFormSchema(t), [t]);
    return useForm<NoteCardFieldForm>({
        resolver: zodResolver(schema),
        defaultValues: { value: '' },
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    });
}
